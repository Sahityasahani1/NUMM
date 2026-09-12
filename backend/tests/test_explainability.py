"""
Unit tests for ExplainabilityService (Pillar 8 of v3.0-AI-SPEC).
Validates 2-sentence engineering rationale generation, audit status, and steward action recommendation.
"""

import pytest
from app.services.explainability_service import ExplainabilityService

def test_explainability_safe_merge_rationale():
    rec_a = {
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH (DN50)",
            "pressure_rating": "150# (19.6 BAR)",
            "material_grade": "ASTM A216 WCB"
        }
    }
    rec_b = {
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH (DN50)",
            "pressure_rating": "150# (19.6 BAR)",
            "material_grade": "WCB"
        }
    }
    match_result = {
        "confidence_score": 0.95,
        "has_critical_conflict": False,
        "matches": ["dimensions", "pressure_rating", "material_grade"],
        "conflicts": []
    }
    arbiter_result = {
        "calibrated_probability": 0.96,
        "recommendation": "AUTO_MERGE_RECOMMENDED"
    }

    xai = ExplainabilityService.generate_engineering_rationale(rec_a, rec_b, match_result, arbiter_result)
    assert xai["safety_audit_status"] == "PASS"
    assert xai["steward_action_recommendation"] == "APPROVE_MERGE"
    assert "BALL VALVE" in xai["sentence_1_physical"]
    assert "96.0%" in xai["sentence_2_decision"]
    assert "automated merge recommended" in xai["sentence_2_decision"]

def test_explainability_critical_hazard_rationale():
    rec_a = {
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "pressure_rating": "150#"
        }
    }
    rec_b = {
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "pressure_rating": "600#"
        }
    }
    match_result = {
        "confidence_score": 0.60,
        "has_critical_conflict": True,
        "matches": ["noun", "dimensions"],
        "conflicts": ["CRITICAL CONFLICT in pressure_rating: '150#' vs '600#'"]
    }
    arbiter_result = {
        "calibrated_probability": 0.05,
        "recommendation": "REJECT"
    }

    xai = ExplainabilityService.generate_engineering_rationale(rec_a, rec_b, match_result, arbiter_result)
    assert xai["safety_audit_status"] == "FAIL_CRITICAL_HAZARD"
    assert xai["steward_action_recommendation"] == "REJECT_INCOMPATIBLE"
    assert "Critical safety contradiction detected" in xai["sentence_1_physical"]
    assert "strictly prohibited" in xai["sentence_2_decision"]

def test_explainability_token_saliency_attribution():
    rec_a = {
        "description": "BALL VALVE 2 INCH 150# RF A216 WCB",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "pressure_rating": "150#",
            "material_grade": "WCB"
        }
    }
    rec_b = {
        "description": "BALL VALVE 2 INCH 600# RF A216 WCB",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "pressure_rating": "600#",
            "material_grade": "WCB"
        }
    }
    match_result = {
        "confidence_score": 0.55,
        "has_critical_conflict": True,
        "matches": ["noun", "dimensions", "material_grade"],
        "conflicts": ["CRITICAL CONFLICT in pressure_rating: '150#' vs '600#'"]
    }
    arbiter_result = {
        "calibrated_probability": 0.05,
        "recommendation": "REJECT"
    }

    xai = ExplainabilityService.generate_engineering_rationale(rec_a, rec_b, match_result, arbiter_result)
    saliency = xai.get("token_saliency", {})
    assert "text_a_tokens" in saliency
    assert "text_b_tokens" in saliency

    # Check that 150# or 600# has negative polarity
    tok_b = {item["token"]: item for item in saliency["text_b_tokens"]}
    assert "600#" in tok_b
    assert tok_b["600#"]["polarity"] == "NEGATIVE"
    assert tok_b["600#"]["saliency"] < 0.0

    # Check that matching noun/grade has positive polarity
    tok_a = {item["token"]: item for item in saliency["text_a_tokens"]}
    assert tok_a["BALL"]["polarity"] == "POSITIVE"

    # Check top negative features
    top_neg = xai.get("top_negative_features", [])
    assert len(top_neg) > 0
    assert any("CRITICAL CONFLICT" in item["feature"] for item in top_neg)
