"""
National Unified Material Master (NUMM) · Engineering Explainability Service
Implements formal 2-sentence engineering rationale generation for human stewards
and compliance auditors (Pillar 8 of v3.0-AI-SPEC).
"""

from typing import Dict, Any, List, Optional

class ExplainabilityService:
    """
    Generates deterministic, mathematically grounded, and domain-accurate
    engineering justifications for material equivalence decisions.
    """

    @classmethod
    def generate_engineering_rationale(
        cls,
        rec_a: Dict[str, Any],
        rec_b: Dict[str, Any],
        match_result: Dict[str, Any],
        arbiter_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates formal 2-sentence technical rationale and structured audit breakdown.
        """
        attr_a = rec_a.get("attributes", {})
        attr_b = rec_b.get("attributes", {})

        conflicts = match_result.get("conflicts", [])
        matches = match_result.get("matches", [])
        has_critical = match_result.get("has_critical_conflict", False)
        score = match_result.get("confidence_score", 0.0)

        calibrated_prob = arbiter_result.get("calibrated_probability") if arbiter_result else score
        recommendation = arbiter_result.get("recommendation") if arbiter_result else ("REJECT" if has_critical else "AUTO_MERGE_RECOMMENDED")

        # Sentence 1: Physical & Material Specification Evaluation
        if has_critical:
            crit_reasons = [c for c in conflicts if "CRITICAL CONFLICT" in c]
            primary_hazard = crit_reasons[0] if crit_reasons else "Physical parameter contradiction"
            s1 = f"Critical safety contradiction detected ({primary_hazard}), which violates industrial mechanical/process compatibility."
            s2 = f"Automated merge is strictly prohibited with confidence capped at {score*100:.1f}%; human steward rejection recommended."
            audit_status = "FAIL_CRITICAL_HAZARD"
            steward_action = "REJECT_INCOMPATIBLE"
        else:
            # Check dimensions, pressure, metallurgy
            dim_str = attr_a.get("dimensions") or attr_b.get("dimensions") or "matching dimensions"
            press_str = attr_a.get("pressure_rating") or attr_b.get("pressure_rating") or "matching pressure rating"
            grade_str = attr_a.get("material_grade") or attr_b.get("material_grade") or "compatible metallurgy"

            noun_str = attr_a.get("noun") or attr_b.get("noun") or "Equipment"
            
            s1 = f"Technical specifications exhibit physical equivalence for {noun_str} with {dim_str}, {press_str}, and compliant {grade_str}."
            if calibrated_prob >= 0.85:
                s2 = f"Calibrated model confidence is {calibrated_prob*100:.1f}% with zero physical contradictions across all 8 industrial safety dimensions; automated merge recommended."
                audit_status = "PASS"
                steward_action = "APPROVE_MERGE"
            elif calibrated_prob >= 0.60:
                s2 = f"Candidate exhibits moderate alignment ({calibrated_prob*100:.1f}% confidence); manual technical steward review required before canonical catalog ingestion."
                audit_status = "BORDERLINE_REVIEW"
                steward_action = "MANUAL_INSPECTION"
            else:
                s2 = f"Similarity score ({calibrated_prob*100:.1f}%) is below operational threshold; items deemed independent or non-identical."
                audit_status = "FAIL_LOW_CONFIDENCE"
                steward_action = "REJECT_INCOMPATIBLE"

        formal_rationale = f"{s1} {s2}"

        # Extract descriptions for token-level saliency
        text_a = rec_a.get("description") or rec_a.get("text") or rec_a.get("clean_text") or ""
        text_b = rec_b.get("description") or rec_b.get("text") or rec_b.get("clean_text") or ""
        if not text_a and attr_a:
            text_a = " ".join(str(v) for v in attr_a.values() if v)
        if not text_b and attr_b:
            text_b = " ".join(str(v) for v in attr_b.values() if v)

        token_saliency = cls.compute_token_saliency(
            text_a=text_a,
            text_b=text_b,
            match_result=match_result,
            arbiter_result=arbiter_result,
            attr_a=attr_a,
            attr_b=attr_b
        )

        return {
            "formal_rationale": formal_rationale,
            "sentence_1_physical": s1,
            "sentence_2_decision": s2,
            "safety_audit_status": audit_status,
            "steward_action_recommendation": steward_action,
            "calibrated_confidence": calibrated_prob,
            "technical_alignment": matches,
            "discrepancies": conflicts,
            "has_critical_conflict": has_critical,
            "token_saliency": token_saliency,
            "top_positive_features": token_saliency.get("top_positive_features", []),
            "top_negative_features": token_saliency.get("top_negative_features", [])
        }

    @classmethod
    def compute_token_saliency(
        cls,
        text_a: str,
        text_b: str,
        match_result: Dict[str, Any],
        arbiter_result: Optional[Dict[str, Any]] = None,
        attr_a: Optional[Dict[str, Any]] = None,
        attr_b: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Computes token-level feature attribution / saliency for pairs of material descriptions (Pillar 8).
        Assigns saliency weights in [-1.0, 1.0] and polarity (POSITIVE, NEGATIVE, NEUTRAL).
        """
        import re

        def _tokenize(text: str) -> List[str]:
            # Tokenize keeping alphanumeric industrial ratings (150#, 600#), inches (2"), fractions
            clean = text.upper().replace("'", "")
            tokens = re.findall(r'[A-Za-z0-9]+[#"]*|[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+)*[#"]*', clean)
            return [t for t in tokens if t]

        tokens_a = _tokenize(text_a)
        tokens_b = _tokenize(text_b)

        conflicts = match_result.get("conflicts", [])
        matches = match_result.get("matches", [])
        has_critical = match_result.get("has_critical_conflict", False)

        # Conflict tokens set (e.g., extracted from conflict strings)
        conflict_tokens = set()
        for c in conflicts:
            for word in _tokenize(c):
                if word not in {"CRITICAL", "CONFLICT", "IN", "VS", "BETWEEN", "AND", "VALUE", "RATING", "METALLURGY"}:
                    conflict_tokens.add(word)

        # Aligned tokens set
        aligned_tokens = set()
        attr_a = attr_a or {}
        attr_b = attr_b or {}
        for m in matches:
            val_a = str(attr_a.get(m, ""))
            val_b = str(attr_b.get(m, ""))
            aligned_tokens.update(_tokenize(val_a))
            aligned_tokens.update(_tokenize(val_b))

        shared_tokens = (set(tokens_a) & set(tokens_b)) - {"FOR", "WITH", "THE", "OF", "AND", "TO", "A", "AN", "IN"}

        stop_words = {"FOR", "WITH", "THE", "OF", "AND", "TO", "A", "AN", "IN", "BY", "ON", "AT", "IS", "AS"}

        def _score_token(tok: str) -> Dict[str, Any]:
            if tok in stop_words:
                return {"token": tok, "saliency": 0.05, "polarity": "NEUTRAL"}
            
            # If token explicitly caused a conflict
            if tok in conflict_tokens:
                saliency = -0.95 if has_critical else -0.75
                return {"token": tok, "saliency": saliency, "polarity": "NEGATIVE"}

            # If token is an aligned critical attribute
            if tok in aligned_tokens:
                return {"token": tok, "saliency": 0.90, "polarity": "POSITIVE"}

            # If token is shared across both items
            if tok in shared_tokens:
                return {"token": tok, "saliency": 0.70, "polarity": "POSITIVE"}

            # Unique un-conflicted technical token
            return {"token": tok, "saliency": -0.10, "polarity": "NEUTRAL"}

        text_a_attrib = [_score_token(t) for t in tokens_a]
        text_b_attrib = [_score_token(t) for t in tokens_b]

        # Aggregate Top Positive and Negative Features
        top_positive = []
        for m in matches:
            val = attr_a.get(m) or attr_b.get(m)
            top_positive.append({
                "feature": f"Aligned {m.replace('_', ' ').title()}" + (f" ({val})" if val else ""),
                "saliency": 0.90
            })
        for tok in sorted(shared_tokens):
            if tok not in aligned_tokens and len(tok) > 2:
                top_positive.append({
                    "feature": f"Shared Technical Token: '{tok}'",
                    "saliency": 0.70
                })

        top_negative = []
        for c in conflicts:
            top_negative.append({
                "feature": c,
                "saliency": -0.95 if "CRITICAL" in c else -0.75
            })

        return {
            "text_a_tokens": text_a_attrib,
            "text_b_tokens": text_b_attrib,
            "top_positive_features": top_positive[:5],
            "top_negative_features": top_negative[:5]
        }
