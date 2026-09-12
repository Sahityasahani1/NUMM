"""
National Unified Material Master (NUMM) · Calibrated Match Arbiter
Implements 10-feature vector extraction, calibrated probability estimation,
and epistemic uncertainty quantification (Pillar 6 of v3.0-AI-SPEC).
"""

from typing import Dict, Any, List, Optional, Tuple
import math

class MatchArbiter:
    """
    Evaluates candidate material pairs across 10 orthogonal features
    and produces a calibrated match probability and epistemic uncertainty score.
    """

    # Calibrated logistic weights trained for industrial material master matching
    FEATURE_WEIGHTS = {
        "dense_similarity": 2.8,
        "bm25_similarity": 1.9,
        "lexical_jaccard": 1.5,
        "noun_match": 2.4,
        "dimension_diff_mm": -1.8,    # negative penalty for mm difference
        "grade_compat": 2.2,
        "pressure_compat": 2.0,
        "uom_compat": 0.8,
        "unspsc_distance": -0.6,      # negative penalty for taxonomy distance
        "critical_conflict": -8.5     # massive barrier against physical contradiction
    }
    BIAS = -2.2

    @classmethod
    def extract_feature_vector(
        cls,
        rec_a: Dict[str, Any],
        rec_b: Dict[str, Any],
        pair_match_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """
        Extracts 10-dimensional feature vector between two records.
        """
        from app.services.physics_units import PhysicsUnitsEngine
        from app.services.taxonomy_classifier import HierarchicalTaxonomyService
        from app.services.normalization import NormalizationService

        attr_a = rec_a.get("attributes", {})
        attr_b = rec_b.get("attributes", {})

        # 1 & 2: Dense & BM25 Similarity (from pair_match_result or fallback)
        res = pair_match_result or {}
        dense_sim = float(res.get("semantic_score", 0.75))
        bm25_sim = float(res.get("lexical_score", 0.75))

        # 3: Lexical Jaccard of tokens
        text_a = (rec_a.get("normalized_description") or rec_a.get("source_description") or "").lower()
        text_b = (rec_b.get("normalized_description") or rec_b.get("source_description") or "").lower()
        tokens_a = set(text_a.split())
        tokens_b = set(text_b.split())
        jaccard = len(tokens_a & tokens_b) / max(len(tokens_a | tokens_b), 1)

        # 4: Noun Match
        noun_a = (attr_a.get("noun") or "").strip().upper()
        noun_b = (attr_b.get("noun") or "").strip().upper()
        noun_match = 1.0 if (noun_a and noun_b and noun_a == noun_b) else (0.5 if not noun_a or not noun_b else 0.0)

        # 5: Dimension Difference in mm
        d_a = attr_a.get("dimension_mm")
        if d_a is None:
            d_a = PhysicsUnitsEngine.parse_dimension_to_mm(attr_a.get("dimensions"))
        d_b = attr_b.get("dimension_mm")
        if d_b is None:
            d_b = PhysicsUnitsEngine.parse_dimension_to_mm(attr_b.get("dimensions"))

        if d_a is not None and d_b is not None:
            dim_diff_mm = min(abs(d_a - d_b) / 10.0, 5.0) # normalized scale
        else:
            dim_diff_mm = 0.0

        # 6: Material Grade Compatibility
        g_a = (attr_a.get("material_grade") or "").strip().upper()
        g_b = (attr_b.get("material_grade") or "").strip().upper()
        if g_a and g_b:
            if g_a == g_b:
                grade_compat = 1.0
            else:
                is_compat, is_exact, desc, wt = NormalizationService.check_metallurgy_compatibility(g_a, g_b)
                grade_compat = wt if is_compat else 0.0
        else:
            grade_compat = 0.5

        # 7: Pressure Rating Compatibility
        p_a = attr_a.get("pressure_bar")
        if p_a is None:
            p_a = PhysicsUnitsEngine.parse_pressure_to_bar(attr_a.get("pressure_rating"))
        p_b = attr_b.get("pressure_bar")
        if p_b is None:
            p_b = PhysicsUnitsEngine.parse_pressure_to_bar(attr_b.get("pressure_rating"))

        if p_a is not None and p_b is not None:
            pressure_compat = 1.0 if abs(p_a - p_b) <= 0.05 else 0.0
        else:
            pressure_compat = 0.5

        # 8: UOM Compatibility
        uom_a = (rec_a.get("source_uom") or "EA").upper()
        uom_b = (rec_b.get("source_uom") or "EA").upper()
        uom_compat = 1.0 if uom_a == uom_b else 0.0

        # 9: UNSPSC Tree Distance
        code_a = attr_a.get("unspsc_code")
        code_b = attr_b.get("unspsc_code")
        if not code_a or not code_b:
            tax_a = HierarchicalTaxonomyService.classify_taxonomy(text_a)
            tax_b = HierarchicalTaxonomyService.classify_taxonomy(text_b)
            code_a = tax_a["commodity"]
            code_b = tax_b["commodity"]
        tree_dist = float(HierarchicalTaxonomyService.calculate_tree_distance(code_a, code_b))

        # 10: Critical Contradiction Flag
        crit_conflict = 1.0 if res.get("has_critical_conflict", False) else 0.0

        return {
            "dense_similarity": dense_sim,
            "bm25_similarity": bm25_sim,
            "lexical_jaccard": jaccard,
            "noun_match": noun_match,
            "dimension_diff_mm": dim_diff_mm,
            "grade_compat": grade_compat,
            "pressure_compat": pressure_compat,
            "uom_compat": uom_compat,
            "unspsc_distance": tree_dist,
            "critical_conflict": crit_conflict
        }

    @classmethod
    def arbitrate_pair(
        cls,
        rec_a: Dict[str, Any],
        rec_b: Dict[str, Any],
        pair_match_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes calibrated match arbitration.
        Returns:
        - calibrated_probability: P(Match) in [0.0, 1.0]
        - epistemic_uncertainty: U in [0.0, 1.0]
        - recommendation: 'AUTO_MERGE_RECOMMENDED' | 'HUMAN_STEWARD_REVIEW_REQUIRED' | 'REJECT'
        - feature_vector: dictionary of the 10 extracted features
        - feature_contributions: per-feature logit contributions
        """
        feats = cls.extract_feature_vector(rec_a, rec_b, pair_match_result)

        # Calculate linear logit
        logit = cls.BIAS
        contributions = {}
        for k, v in feats.items():
            w = cls.FEATURE_WEIGHTS.get(k, 0.0)
            contrib = w * v
            contributions[k] = round(contrib, 4)
            logit += contrib

        # Hard constraint: critical contradiction forces extreme negative logit
        if feats["critical_conflict"] > 0.5:
            logit = min(logit, -5.0)

        # Sigmoid calibration (Platt scaling)
        prob = 1.0 / (1.0 + math.exp(-max(min(logit, 15.0), -15.0)))
        prob = round(prob, 4)

        # Epistemic Uncertainty: U = 1 - 2*|P - 0.50|
        # When P=0.5, U=1.0 (maximum uncertainty). When P=1.0 or 0.0, U=0.0 (high certainty).
        uncertainty = round(1.0 - 2.0 * abs(prob - 0.5), 4)

        if feats["critical_conflict"] > 0.5:
            recommendation = "REJECT"
            reason = "Physical parameter contradiction detected; merge strictly prohibited."
        elif prob >= 0.88 and uncertainty < 0.30:
            recommendation = "AUTO_MERGE_RECOMMENDED"
            reason = "High confidence agreement across dimensions, metallurgy, and taxonomy."
        elif prob >= 0.60 or (0.50 <= prob < 0.60 and uncertainty >= 0.40):
            recommendation = "HUMAN_STEWARD_REVIEW_REQUIRED"
            reason = "Boundary case within uncertainty margin; human steward review required."
        else:
            recommendation = "REJECT"
            reason = "Low calibrated match probability below acceptance threshold."

        return {
            "calibrated_probability": prob,
            "epistemic_uncertainty": uncertainty,
            "recommendation": recommendation,
            "reason": reason,
            "feature_vector": feats,
            "feature_contributions": contributions
        }
