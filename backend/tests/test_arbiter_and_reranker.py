"""
Unit tests for MatchArbiter (Pillar 6) and CrossEncoderReranker (Pillar 2).
Validates 10-feature extraction, calibrated probability, epistemic uncertainty,
and cross-encoder reranking.
"""

import pytest
from app.services.match_arbiter import MatchArbiter
from app.services.cross_encoder import CrossEncoderReranker

def test_feature_vector_extraction_and_arbitration_identical():
    rec_a = {
        "source_description": "BALL VALVE 2 INCH 150# RF A216 WCB",
        "normalized_description": "BALL VALVE 2 INCH 150# RF A216 WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "dimension_mm": 50.0,
            "pressure_rating": "150#",
            "pressure_bar": 19.6,
            "material_grade": "A216 WCB",
            "unspsc_code": "40141607"
        }
    }
    rec_b = {
        "source_description": "VLV BL 2IN 150# RF WCB",
        "normalized_description": "BALL VALVE 2 INCH 150# RF A216 WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "dimension_mm": 50.0,
            "pressure_rating": "150#",
            "pressure_bar": 19.6,
            "material_grade": "WCB",
            "unspsc_code": "40141607"
        }
    }
    match_result = {
        "semantic_score": 0.95,
        "lexical_score": 0.88,
        "attribute_score": 1.0,
        "confidence_score": 0.94,
        "has_critical_conflict": False,
        "matches": ["dimensions", "pressure_rating", "material_grade"],
        "conflicts": []
    }

    arb = MatchArbiter.arbitrate_pair(rec_a, rec_b, match_result)
    assert arb["calibrated_probability"] >= 0.85
    assert arb["epistemic_uncertainty"] <= 0.35
    assert arb["recommendation"] == "AUTO_MERGE_RECOMMENDED"
    assert len(arb["feature_vector"]) == 10
    assert arb["feature_vector"]["critical_conflict"] == 0.0

def test_feature_vector_arbitration_critical_conflict():
    rec_a = {
        "source_description": "BALL VALVE 2 INCH 150# RF A216 WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "dimension_mm": 50.0,
            "pressure_rating": "150#",
            "pressure_bar": 19.6,
            "material_grade": "A216 WCB"
        }
    }
    rec_b = {
        "source_description": "BALL VALVE 2 INCH 600# RF A216 WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "dimensions": "2 INCH",
            "dimension_mm": 50.0,
            "pressure_rating": "600#",
            "pressure_bar": 99.3,
            "material_grade": "A216 WCB"
        }
    }
    match_result = {
        "semantic_score": 0.92,
        "lexical_score": 0.85,
        "attribute_score": 0.60,
        "confidence_score": 0.60,
        "has_critical_conflict": True,
        "matches": ["noun", "dimensions", "material_grade"],
        "conflicts": ["CRITICAL CONFLICT in pressure_rating: '150#' vs '600#'"]
    }

    arb = MatchArbiter.arbitrate_pair(rec_a, rec_b, match_result)
    assert arb["recommendation"] == "REJECT"
    assert "Physical parameter contradiction" in arb["reason"]
    assert arb["feature_vector"]["critical_conflict"] == 1.0

def test_cross_encoder_reranker():
    reranker = CrossEncoderReranker.get_instance()
    query = {"normalized_description": "GATE VALVE 4 INCH 300# RF ASTM A105"}
    candidates = [
        {"id": "C1", "normalized_description": "BALL VALVE 2 INCH 150# RF WCB", "score": 0.65},
        {"id": "C2", "normalized_description": "GATE VALVE 4 INCH 300# RF A105", "score": 0.72}
    ]

    reranked = reranker.rerank_candidates(query, candidates, boundary_only=True)
    assert len(reranked) == 2
    # C2 has much closer token alignment with query (GATE VALVE 4 INCH 300#)
    assert reranked[0]["id"] == "C2"
    assert "cross_encoder_score" in reranked[0]
    assert "final_rerank_score" in reranked[0]
