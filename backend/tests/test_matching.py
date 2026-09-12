import pytest
from app.services.matching_engine import MatchingEngine
from app.services.normalization import NormalizationService
from app.services.attribute_extractor import AttributeExtractor
from app.models.enums import RelationshipType

def test_abbreviation_normalization():
    text1 = "VLV BALL 2IN 150 LB WCB FLG RF"
    norm = NormalizationService.normalize_text(text1)
    assert "VALVE" in norm
    assert "FLANGE" in norm

def test_critical_contradiction_blocking():
    rec1 = {
        "cpse_id": "ONGC",
        "source_description": "BALL VALVE 2IN 150# CS WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "150#",
            "material_grade": "CARBON STEEL"
        }
    }
    rec2 = {
        "cpse_id": "GAIL",
        "source_description": "BALL VALVE 2IN 600# CS WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "600#",
            "material_grade": "CARBON STEEL"
        }
    }
    result = MatchingEngine.match_records(rec1, rec2)
    assert result["has_critical_conflict"] is True
    assert result["relationship_type"] != RelationshipType.IDENTICAL
    assert any("CRITICAL CONFLICT in pressure_rating" in c for c in result["conflicts"])

def test_identical_matching():
    rec1 = {
        "cpse_id": "ONGC",
        "source_description": "BALL VALVE 2IN 150# CS WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "150#",
            "material_grade": "CARBON STEEL"
        }
    }
    rec2 = {
        "cpse_id": "IOCL",
        "source_description": "BALL VALVE 2IN 150# CS WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "150#",
            "material_grade": "CARBON STEEL"
        }
    }
    result = MatchingEngine.match_records(rec1, rec2)
    assert result["has_critical_conflict"] is False
    assert result["relationship_type"] == RelationshipType.IDENTICAL

def test_grade_alias_matching_without_false_conflict():
    attr1 = AttributeExtractor.extract_attributes("VLV BALL 2IN 150# ASTM A216 WCB")
    attr2 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150 LB WCB")
    
    assert attr1["pressure_rating"] == "150#"
    assert attr2["pressure_rating"] == "150#"
    
    rec1 = {
        "cpse_id": "ONGC",
        "source_description": "VLV BALL 2IN 150# ASTM A216 WCB",
        "source_uom": "EA",
        "attributes": attr1
    }
    rec2 = {
        "cpse_id": "IOCL",
        "source_description": "BALL VALVE 2\" 150 LB WCB",
        "source_uom": "EA",
        "attributes": attr2
    }
    result = MatchingEngine.match_records(rec1, rec2)
    assert result["has_critical_conflict"] is False
    assert result["confidence_score"] >= 0.70
    assert result["relationship_type"] in [RelationshipType.IDENTICAL, RelationshipType.NEAR_DUPLICATE]
    assert any("material_grade" in m for m in result["matches"])

def test_grade_contradiction_blocking():
    rec1 = {
        "cpse_id": "ONGC",
        "source_description": "BALL VALVE 2IN 150# ASTM A216 WCB",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "150#",
            "material_grade": "ASTM A216 WCB"
        }
    }
    rec2 = {
        "cpse_id": "IOCL",
        "source_description": "BALL VALVE 2IN 150# SS 316",
        "source_uom": "EA",
        "attributes": {
            "noun": "BALL VALVE",
            "pressure_rating": "150#",
            "material_grade": "SS 316"
        }
    }
    result = MatchingEngine.match_records(rec1, rec2)
    assert result["has_critical_conflict"] is True
    assert any("CRITICAL CONFLICT in material_grade" in c for c in result["conflicts"])

def test_attribute_extractor_hash_pressure_rating():
    attrs = AttributeExtractor.extract_attributes("VLV BL 2IN 150# CS")
    assert attrs["pressure_rating"] == "150#"
    assert "2 INCH" in attrs["dimensions"]

def test_explainer_case_study_ongc_vs_iocl_safe_merge():
    """
    Direct verification of Case Study in Explainer PDF (Page 1 & 5):
    ONGC: VLV BL 2IN 150# RF A105
    IOCL: BALL VALVE 2" 150 LB WCB CS
    Metallurgy: A105 == WCB (Compatible Carbon Steel) -> PASS
    """
    attr1 = AttributeExtractor.extract_attributes("VLV BL 2IN 150# RF A105")
    attr2 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150 LB WCB CS")

    assert attr1["unspsc_code"] == "40141607"
    assert attr2["unspsc_code"] == "40141607"
    assert attr1["pressure_rating"] == "150#"
    assert attr2["pressure_rating"] == "150#"

    rec1 = {
        "cpse_id": "ONGC",
        "source_description": "VLV BL 2IN 150# RF A105",
        "source_uom": "EA",
        "attributes": attr1
    }
    rec2 = {
        "cpse_id": "IOCL",
        "source_description": "BALL VALVE 2\" 150 LB WCB CS",
        "source_uom": "EA",
        "attributes": attr2
    }

    result = MatchingEngine.match_records(rec1, rec2)
    assert result["has_critical_conflict"] is False
    assert result["deterministic_safety_hazard"] is False
    assert result["confidence_score"] >= 0.85
    assert any("Compatible Metallurgy" in m or "material_grade" in m for m in result["matches"])

def test_8_digit_unspsc_mapping():
    ball_attrs = AttributeExtractor.extract_attributes("VALVE BALL 2IN 150# A105")
    gate_attrs = AttributeExtractor.extract_attributes("VALVE GATE 4IN 300# WCB")
    flange_attrs = AttributeExtractor.extract_attributes("FLANGE WELD NECK 3IN 150# A105")
    pipe_attrs = AttributeExtractor.extract_attributes("SEAMLESS PIPE 6IN SCH 40 ASTM A106")

    assert ball_attrs["unspsc_code"] == "40141607"
    assert gate_attrs["unspsc_code"] == "40141604"
    assert flange_attrs["unspsc_code"] == "40141753"
    assert pipe_attrs["unspsc_code"] == "40142115"


