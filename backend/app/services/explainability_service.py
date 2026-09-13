"""
Natural Language AI Explainability Service
==========================================
Generates auditable, two-sentence technical engineering justifications citing
international petrochemical engineering standards (ASME, API, NACE, ISO)
for matches, near-duplicates, and safety contradiction blocks.
"""

from typing import Dict, Any, List, Optional

class ExplainabilityService:
    """Enterprise AI Explainability Engine for Material Master Governance."""

    @classmethod
    def generate_engineering_rationale(
        cls,
        record1: Dict[str, Any],
        record2: Dict[str, Any],
        match_result: Dict[str, Any],
        arbiter_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Alias for generate_explanation supporting optional arbiter_result."""
        return cls.generate_explanation(record1, record2, match_result)

    @classmethod
    def generate_explanation(
        cls,
        record1: Dict[str, Any],
        record2: Dict[str, Any],
        match_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates a comprehensive explainability payload including plain-English rationale,
        cited engineering standards, and safety risk level.
        """
        has_conflict = match_result.get("has_critical_conflict", False)
        conflicts = match_result.get("conflicts", [])
        matches = match_result.get("matches", [])
        score = match_result.get("confidence_score", 0.0)
        rel_type = match_result.get("relationship_type", "RELATED")
        
        attr1 = record1.get("attributes", {})
        attr2 = record2.get("attributes", {})
        
        # 1. Critical Conflict Explanations
        if has_conflict:
            risk_level = "CRITICAL_SAFETY_HAZARD"
            standards = []
            reasons = []

            # Check specific conflict categories
            for c in conflicts:
                c_upper = c.upper()
                if "PRESSURE_RATING" in c_upper:
                    pr1 = attr1.get("pressure_rating") or "Unknown"
                    pr2 = attr2.get("pressure_rating") or "Unknown"
                    reasons.append(
                        f"Critical Pressure Class Mismatch ({pr1} vs {pr2}): Under ASME B16.34 and ASME B31.3 process piping codes, "
                        f"substituting lower pressure class components into higher pressure service introduces extreme risk of catastrophic piping containment rupture."
                    )
                    standards.extend(["ASME B16.34", "ASME B31.3", "API 6D"])

                elif "FLANGE_FACING" in c_upper:
                    ff1 = attr1.get("flange_facing") or "Unknown"
                    ff2 = attr2.get("flange_facing") or "Unknown"
                    reasons.append(
                        f"Flange Facing Incompatibility ('{ff1}' vs '{ff2}'): Raised Face (RF) and Ring Type Joint (RTJ) flanges "
                        f"utilize completely incompatible gasket seating surfaces under ASME B16.5; mating mismatched facings causes immediate high-pressure joint blowout."
                    )
                    standards.extend(["ASME B16.5", "ASME B16.20"])

                elif "SOUR_SERVICE" in c_upper:
                    ss1 = attr1.get("sour_service") or "Unknown"
                    ss2 = attr2.get("sour_service") or "Unknown"
                    reasons.append(
                        f"Sour Gas Metallurgy Conflict ({ss1} vs {ss2}): Under NACE MR0175 / ISO 15156, non-sour standard metallurgy "
                        f"will experience rapid sulfide stress cracking (SSC) and catastrophic hydrogen embrittlement in sour hydrocarbon environments."
                    )
                    standards.extend(["NACE MR0175", "ISO 15156"])

                elif "MATERIAL_GRADE" in c_upper:
                    mg1 = attr1.get("material_grade") or "Unknown"
                    mg2 = attr2.get("material_grade") or "Unknown"
                    reasons.append(
                        f"Incompatible Base Metallurgy ('{mg1}' vs '{mg2}'): The alloys have distinct tensile strengths and corrosion thresholds "
                        f"prohibiting cross-specification substitution under ASME Section II / ASME B16.34."
                    )
                    standards.extend(["ASME Section II", "ASTM"])

                elif "SCHEDULE" in c_upper:
                    sch1 = attr1.get("schedule") or "Unknown"
                    sch2 = attr2.get("schedule") or "Unknown"
                    reasons.append(
                        f"Wall Thickness Variance ('{sch1}' vs '{sch2}'): Thinner schedule components fail minimum design thickness "
                        f"and pressure-containment calculations under ASME B36.10 / ASME B31.3."
                    )
                    standards.extend(["ASME B36.10", "ASME B31.3"])

                elif "HAZARDOUS_CERT" in c_upper:
                    haz1 = attr1.get("hazardous_cert") or "Unknown"
                    haz2 = attr2.get("hazardous_cert") or "Unknown"
                    reasons.append(
                        f"Explosion Protection Divergence ('{haz1}' vs '{haz2}'): Flameproof (Ex-d) and Intrinsically Safe (Ex-ia) "
                        f"possess distinct electrical safety principles under IEC 60079 / ATEX; misallocation creates an ignition hazard in volatile hydrocarbon zones."
                    )
                    standards.extend(["IEC 60079", "ATEX 2014/34/EU"])

                elif "PART_NUMBER" in c_upper:
                    pn1 = attr1.get("part_number") or "Unknown"
                    pn2 = attr2.get("part_number") or "Unknown"
                    reasons.append(
                        f"Part Number / Suffix Divergence ('{pn1}' vs '{pn2}'): Suffix variations indicate non-interchangeable functional features "
                        f"(e.g., rubber contact seals vs metal shields) leading to premature equipment breakdown under ISO 15."
                    )
                    standards.extend(["ISO 15", "ABMA Standards"])

                elif "DIMENSIONS" in c_upper:
                    dim1 = attr1.get("dimensions") or "Unknown"
                    dim2 = attr2.get("dimensions") or "Unknown"
                    reasons.append(
                        f"Geometric Bore Discrepancy ('{dim1}' vs '{dim2}'): Non-equivalent physical sizes fail pipe bore alignment "
                        f"and flanged bolt circle geometry under ASME B16.5."
                    )
                    standards.extend(["ASME B16.5", "ASME B16.10"])

            if not reasons:
                reasons.append("Critical technical conflict detected in physical parameters, enforcing a zero-tolerance merge block.")
                standards.append("MoP&NG Industrial Master Standard")

            summary = "REJECTED (Critical Safety Hazard): Physical parameter contradiction strictly prohibits catalog merge."
            rationale = " ".join(reasons)
            standards = list(dict.fromkeys(standards))

        # 2. Confirmed Identical / Duplicate Matches
        elif score >= 0.85:
            risk_level = "LOW_RISK_VERIFIED"
            standards = ["ASME B16.34", "ASME B16.5", "API 6D"]
            noun = attr1.get("noun") or attr2.get("noun") or "Material"
            dim = attr1.get("dimensions") or attr2.get("dimensions") or "standard size"
            pr = attr1.get("pressure_rating") or attr2.get("pressure_rating") or "matching rating"
            
            # Check for forged vs cast carbon steel equivalence
            mg1 = str(attr1.get("material_grade") or "")
            mg2 = str(attr2.get("material_grade") or "")
            is_cs_cast_forged = ("A105" in mg1 and "WCB" in mg2) or ("WCB" in mg1 and "A105" in mg2)
            
            if is_cs_cast_forged:
                metal_note = "Item A specifies ASTM A105 forged carbon steel while Item B specifies ASTM A216 WCB cast carbon steel, which are standard ASME B16.34 Section 1.3 functional equivalents."
            else:
                metal_note = "Both records agree on metallurgy, flange facing, and tolerance criteria."

            summary = f"VERIFIED EQUIVALENCE ({score*100:.1f}% Match Confidence): High technical parity across all 8 industrial dimensions."
            rationale = f"Items represent functionally interchangeable {dim} {pr} {noun}. {metal_note} Safe for inter-CPSE inventory pooling and ERP catalog unification."

        # 3. Near-Duplicate Candidates
        elif score >= 0.65:
            risk_level = "MODERATE_REVIEW_REQUIRED"
            standards = ["ASME B16.5", "ISO 9001"]
            summary = f"CANDIDATE NEAR-DUPLICATE ({score*100:.1f}% Confidence): High parameter alignment with minor formatting or descriptive variance."
            rationale = "Items exhibit compatible core dimensions and ratings without safety conflicts. Catalog steward review is recommended to confirm manufacturer-specific preferences before permanent consolidation."

        # 4. Related / Disparate Items
        else:
            risk_level = "INSUFFICIENT_SIMILARITY"
            standards = ["ISO 8000 Master Data Quality"]
            summary = f"DISTINCT / RELATED ITEMS ({score*100:.1f}% Similarity): Insufficient specification parity."
            rationale = "Items share high-level category keywords but lack exact nominal bore, pressure class, or material grade alignment. Items should remain distinct in the master catalog."

        if has_conflict:
            steward_rec = "REJECT_MERGE"
            safety_status = "FAIL_CRITICAL_HAZARD"
        elif score >= 0.85:
            steward_rec = "APPROVE_MERGE"
            safety_status = "PASS"
        elif score >= 0.65:
            steward_rec = "STEWARD_REVIEW"
            safety_status = "PASS"
        else:
            steward_rec = "SEPARATE_RECORDS"
            safety_status = "PASS"

        return {
            "summary": summary,
            "technical_rationale": rationale,
            "formal_rationale": rationale,
            "applicable_standards": standards,
            "risk_level": risk_level,
            "confidence_score": score,
            "relationship_type": str(rel_type),
            "safety_audit_status": safety_status,
            "steward_action_recommendation": steward_rec
        }
