import pytest
from app.services.explainability_service import ExplainabilityService

def test_explainability_pressure_conflict():
    rec1 = {"attributes": {"noun": "BALL VALVE", "pressure_rating": "150#", "dimensions": "2 INCH (DN50)"}}
    rec2 = {"attributes": {"noun": "BALL VALVE", "pressure_rating": "600#", "dimensions": "2 INCH (DN50)"}}
    match_result = {
        "has_critical_conflict": True,
        "confidence_score": 0.45,
        "conflicts": ["CRITICAL CONFLICT in pressure_rating: '150#' vs '600#'"],
        "matches": ["noun: BALL VALVE", "dimensions: 2 INCH (DN50)"],
        "relationship_type": "RELATED"
    }
    explanation = ExplainabilityService.generate_explanation(rec1, rec2, match_result)
    assert explanation["risk_level"] == "CRITICAL_SAFETY_HAZARD"
    assert "ASME B16.34" in explanation["applicable_standards"]
    assert "rupture" in explanation["technical_rationale"].lower()

def test_explainability_sour_service_conflict():
    rec1 = {"attributes": {"noun": "BALL VALVE", "sour_service": "NACE MR0175"}}
    rec2 = {"attributes": {"noun": "BALL VALVE", "sour_service": "NON-SOUR"}}
    match_result = {
        "has_critical_conflict": True,
        "confidence_score": 0.40,
        "conflicts": ["CRITICAL CONFLICT in sour_service: 'NACE MR0175' vs 'NON-SOUR'"],
        "matches": ["noun: BALL VALVE"],
        "relationship_type": "RELATED"
    }
    explanation = ExplainabilityService.generate_explanation(rec1, rec2, match_result)
    assert "NACE MR0175" in explanation["applicable_standards"]
    assert "sulfide stress cracking" in explanation["technical_rationale"].lower()

def test_explainability_verified_match_with_asme_metallurgy():
    rec1 = {"attributes": {"noun": "GATE VALVE", "dimensions": "2 INCH (DN50)", "pressure_rating": "150#", "material_grade": "ASTM A105"}}
    rec2 = {"attributes": {"noun": "GATE VALVE", "dimensions": "2 INCH (DN50)", "pressure_rating": "150#", "material_grade": "ASTM A216 WCB"}}
    match_result = {
        "has_critical_conflict": False,
        "confidence_score": 0.92,
        "conflicts": [],
        "matches": ["noun: GATE VALVE", "dimensions: 2 INCH (DN50)", "pressure_rating: 150#", "material_grade: ASTM A105"],
        "relationship_type": "IDENTICAL"
    }
    explanation = ExplainabilityService.generate_explanation(rec1, rec2, match_result)
    assert explanation["risk_level"] == "LOW_RISK_VERIFIED"
    assert "ASME B16.34" in explanation["applicable_standards"]
    assert "forged" in explanation["technical_rationale"].lower() or "cast" in explanation["technical_rationale"].lower()
