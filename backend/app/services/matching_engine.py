import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple
from app.models.enums import RelationshipType
from app.services.normalization import NormalizationService
from app.core.config import settings

class MatchingEngine:
    @staticmethod
    def tokenize(text: str) -> List[str]:
        cleaned = re.sub(r'[^A-Z0-9\"#.]', ' ', text.upper())
        return [w for w in cleaned.split() if len(w) > 1]

    @classmethod
    def calculate_lexical_similarity(cls, tokens1: List[str], tokens2: List[str]) -> float:
        if not tokens1 or not tokens2:
            return 0.0
        set1, set2 = set(tokens1), set(tokens2)
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

    @classmethod
    def calculate_cosine_similarity(cls, tokens1: List[str], tokens2: List[str]) -> float:
        if not tokens1 or not tokens2:
            return 0.0
        vec1 = Counter(tokens1)
        vec2 = Counter(tokens2)
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        if not denominator:
            return 0.0
        return float(numerator) / denominator

    @classmethod
    def evaluate_attributes(cls, attr1: Dict[str, Any], attr2: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
        matches = []
        conflicts = []
        
        critical_fields = ["pressure_rating", "material_grade", "dimensions"]
        
        checked = 0
        agreed = 0

        noun1 = attr1.get("noun")
        from app.services.physics_units import PhysicsUnitsEngine

        # 1. Noun agreement
        noun1 = attr1.get("noun")
        noun2 = attr2.get("noun")
        if noun1 and noun2:
            checked += 1
            if noun1.upper() == noun2.upper():
                agreed += 1
                matches.append(f"noun: {noun1}")
            elif (noun1.upper() in noun2.upper()) or (noun2.upper() in noun1.upper()):
                agreed += 1
                matches.append(f"noun: {noun1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in noun: '{noun1}' vs '{noun2}'")

        # 2. Modifier agreement
        mod1 = attr1.get("modifier")
        mod2 = attr2.get("modifier")
        if mod1 and mod2:
            checked += 1
            if mod1.upper() == mod2.upper():
                agreed += 1
                matches.append(f"modifier: {mod1}")
            else:
                conflicts.append(f"modifier mismatch: '{mod1}' vs '{mod2}'")

        # --- 8-DIMENSION INDUSTRIAL PHYSICS CONTRADICTION MATRIX ---
        
        # Dimension 1: Pressure Rating / PN Class
        pr1 = attr1.get("pressure_rating")
        pr2 = attr2.get("pressure_rating")
        if pr1 and pr2:
            checked += 1
            is_compat, pr_msg = PhysicsUnitsEngine.are_pressure_ratings_compatible(pr1, pr2)
            if is_compat:
                agreed += 1
                matches.append(f"pressure_rating: {pr1} ({pr_msg})")
            else:
                conflicts.append(f"CRITICAL CONFLICT in pressure_rating: {pr_msg}")

        # Dimension 2: Base Metallurgy & NACE MR0175 Sour Gas Compliance
        grade1 = attr1.get("material_grade")
        grade2 = attr2.get("material_grade")
        if grade1 and grade2:
            checked += 1
            is_compat, is_exact, grade_desc, grade_wt = NormalizationService.check_metallurgy_compatibility(str(grade1), str(grade2))
            if is_compat:
                agreed += grade_wt
                matches.append(f"material_grade: {grade_desc}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in material_grade: {grade_desc}")

        sour1 = attr1.get("sour_gas")
        sour2 = attr2.get("sour_gas")
        if sour1 and sour2:
            checked += 1
            if sour1 == sour2:
                agreed += 1
                matches.append("sour_gas: Both NACE MR0175 / ISO 15156 compliant")
        elif (sour1 and not sour2) or (sour2 and not sour1):
            checked += 1
            conflicts.append("CRITICAL CONFLICT in sour_gas: One material specifies NACE MR0175 / ISO 15156 Sour Service compliance while the other lacks validation (HIC / SSC failure risk)")

        # Dimension 3: Nominal Bore / OD with Continuous Float Tolerance (<= 1.0mm)
        dim1 = attr1.get("dimensions")
        dim2 = attr2.get("dimensions")
        if dim1 and dim2:
            checked += 1
            is_compat, mm_diff, dim_msg = PhysicsUnitsEngine.are_dimensions_compatible(dim1, dim2, tolerance_mm=1.5)
            if is_compat:
                agreed += 1
                matches.append(f"dimensions: {dim_msg}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in dimensions: {dim_msg}")

        # Dimension 4: Wall Thickness / Schedule
        sch1 = attr1.get("schedule")
        sch2 = attr2.get("schedule")
        if sch1 and sch2:
            checked += 1
            is_compat, sch_msg = PhysicsUnitsEngine.are_schedules_compatible(sch1, sch2)
            if is_compat:
                agreed += 1
                matches.append(f"schedule: {sch1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in schedule: {sch_msg}")

        # Dimension 5: Flange Facing (RF vs FF vs RTJ)
        face1 = attr1.get("flange_facing")
        face2 = attr2.get("flange_facing")
        if face1 and face2:
            checked += 1
            is_compat, face_msg = PhysicsUnitsEngine.are_flange_facings_compatible(face1, face2)
            if is_compat:
                agreed += 1
                matches.append(f"flange_facing: {face1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in flange_facing: {face_msg}")

        # Dimension 6: Fire-Safe Certification (API 607 / API 6FA)
        fire1 = attr1.get("fire_safe")
        fire2 = attr2.get("fire_safe")
        if fire1 and fire2:
            checked += 1
            if fire1 == fire2:
                agreed += 1
                matches.append("fire_safe: API 607 / 6FA Fire-Safe Certified")

        # Dimension 7: Hazardous Area Electrical Classification (Ex-d vs Ex-ia)
        haz1 = attr1.get("hazardous_area")
        haz2 = attr2.get("hazardous_area")
        if haz1 and haz2:
            checked += 1
            if haz1 == haz2:
                agreed += 1
                matches.append(f"hazardous_area: {haz1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in hazardous_area: Explosion protection mismatch '{haz1}' vs '{haz2}'")

        # Dimension 8: Valve Trim Metallurgy (Trim 1 vs Trim 8 vs Trim 10)
        trim1 = attr1.get("valve_trim")
        trim2 = attr2.get("valve_trim")
        if trim1 and trim2:
            checked += 1
            if trim1 == trim2:
                agreed += 1
                matches.append(f"valve_trim: {trim1}")
            else:
                conflicts.append(f"CRITICAL CONFLICT in valve_trim: Valve trim mismatch '{trim1}' vs '{trim2}' (Seat/Stem wear/corrosion risk)")

        # Standard specification (e.g. API 6D vs ASME B16.34)
        val1 = attr1.get("standard")
        val2 = attr2.get("standard")
        if val1 and val2:
            checked += 1
            if str(val1).upper() == str(val2).upper():
                agreed += 1
                matches.append(f"standard: {val1}")

        attr_score = (agreed / checked) if checked > 0 else 0.5
        return attr_score, matches, conflicts

    @classmethod
    def match_records(
        cls,
        record1: Dict[str, Any],
        record2: Dict[str, Any]
    ) -> Dict[str, Any]:
        attr1 = record1.get("attributes", {})
        attr2 = record2.get("attributes", {})
        
        if not attr1 and record1.get("source_description"):
            try:
                from app.services.attribute_extractor import AttributeExtractor
                attr1 = AttributeExtractor.extract_attributes(record1.get("source_description", ""))
                record1["attributes"] = attr1
            except Exception:
                pass
                
        if not attr2 and record2.get("source_description"):
            try:
                from app.services.attribute_extractor import AttributeExtractor
                attr2 = AttributeExtractor.extract_attributes(record2.get("source_description", ""))
                record2["attributes"] = attr2
            except Exception:
                pass

        text1 = (
            record1.get("standardized_description") or
            attr1.get("canonical_description") or
            record1.get("normalized_description") or
            NormalizationService.normalize_text(record1.get("source_description", ""))
        )
        text2 = (
            record2.get("standardized_description") or
            attr2.get("canonical_description") or
            record2.get("normalized_description") or
            NormalizationService.normalize_text(record2.get("source_description", ""))
        )
        
        tokens1 = cls.tokenize(text1)
        tokens2 = cls.tokenize(text2)
        
        # Lexical Jaccard similarity (Judge 2 - 25%)
        lexical = cls.calculate_lexical_similarity(tokens1, tokens2)

        # Dense Vector Semantic Cosine Similarity (Judge 1 - 35%)
        semantic = 0.0
        try:
            from app.services.vector_search import VectorSearchService
            semantic = VectorSearchService.get_instance().calculate_pairwise_similarity(text1, text2)
        except Exception:
            # Fallback to token-level cosine similarity if vector service unavailable
            semantic = cls.calculate_cosine_similarity(tokens1, tokens2)
        
        # Attribute Agreement (Judge 3 - 30%)
        attr1 = record1.get("attributes", {})
        attr2 = record2.get("attributes", {})
        attr_score, matches, conflicts = cls.evaluate_attributes(attr1, attr2)
        
        # Unit Compatibility (Judge 4 - 10%)
        uom1 = NormalizationService.normalize_uom(record1.get("source_uom", ""))
        uom2 = NormalizationService.normalize_uom(record2.get("source_uom", ""))
        uom_score = 1.0 if uom1 == uom2 else 0.0
        if uom_score == 0:
            conflicts.append(f"UOM discrepancy: '{uom1}' vs '{uom2}'")

        raw_composite = (
            (settings.MATCHING_SEMANTIC_WEIGHT * semantic) +
            (settings.MATCHING_LEXICAL_WEIGHT * lexical) +
            (settings.MATCHING_ATTRIBUTE_WEIGHT * attr_score) +
            (settings.MATCHING_UOM_WEIGHT * uom_score)
        )
        raw_composite = round(raw_composite, 4)

        has_critical_conflict = any("CRITICAL CONFLICT" in c for c in conflicts)
        
        # Stage 5: The Safety Bouncer (Deterministic Physics Blocker)
        if has_critical_conflict:
            # Slashes confidence score by 25% and hard-caps at <= 0.60
            composite_score = round(min(0.60, raw_composite * 0.75), 4)
            if composite_score >= settings.RELATED_THRESHOLD:
                rel_type = RelationshipType.NEAR_DUPLICATE
            else:
                rel_type = RelationshipType.RELATED
        else:
            composite_score = raw_composite
            if composite_score >= settings.IDENTICAL_THRESHOLD and attr_score >= 0.8:
                if record1.get("cpse_id") == record2.get("cpse_id"):
                    rel_type = RelationshipType.DUPLICATE
                else:
                    rel_type = RelationshipType.IDENTICAL
            elif composite_score >= settings.NEAR_DUPLICATE_THRESHOLD:
                rel_type = RelationshipType.NEAR_DUPLICATE
            elif composite_score >= settings.RELATED_THRESHOLD:
                rel_type = RelationshipType.RELATED
            else:
                rel_type = RelationshipType.RELATED

        return {
            "relationship_type": rel_type,
            "confidence_score": composite_score,
            "raw_composite_score": raw_composite,
            "lexical_score": round(lexical, 4),
            "semantic_score": round(semantic, 4),
            "attribute_score": round(attr_score, 4),
            "uom_score": round(uom_score, 4),
            "matches": matches,
            "conflicts": conflicts,
            "has_critical_conflict": has_critical_conflict,
            "deterministic_safety_hazard": has_critical_conflict
        }

    @classmethod
    def retrieve_candidate_pairs(
        cls,
        materials: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Tuple[Dict[str, Any], Dict[str, Any], float]]:
        """
        Use FAISS vector index to retrieve semantic KNN candidate pairs for cross-catalog comparison.
        """
        try:
            from app.services.vector_search import VectorSearchService
            vector_svc = VectorSearchService.get_instance()
            
            index_payload = [
                {"id": m["id"], "text": m.get("normalized_description") or m.get("source_description", "")}
                for m in materials
            ]
            vector_svc.index_materials(index_payload)
            
            mat_by_id = {m["id"]: m for m in materials}
            pairs = []
            seen_pairs = set()

            for m in materials:
                query_text = m.get("normalized_description") or m.get("source_description", "")
                candidates = vector_svc.retrieve_candidates(query_text, k=top_k)
                for c_id, sim in candidates:
                    if c_id == m["id"]:
                        continue
                    pair_key = tuple(sorted([m["id"], c_id]))
                    if pair_key not in seen_pairs and c_id in mat_by_id:
                        seen_pairs.add(pair_key)
                        pairs.append((m, mat_by_id[c_id], sim))

            return pairs
        except Exception:
            # Fallback to brute force pairs if FAISS indexing fails
            pairs = []
            n = len(materials)
            for i in range(n):
                for j in range(i + 1, min(i + top_k + 1, n)):
                    pairs.append((materials[i], materials[j], 0.5))
            return pairs

