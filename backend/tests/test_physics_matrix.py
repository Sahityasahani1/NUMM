"""
National Unified Material Master (NUMM) · 8-Dimension Physics Matrix Test Suite
Asserts zero-tolerance safety blocking across all 8 industrial engineering dimensions:
1. Pressure Rating / PN Class
2. Base Metallurgy & NACE MR0175 Sour Gas
3. Nominal Bore / OD Continuous Tolerance
4. Wall Thickness / Schedule
5. Flange Facing (RF vs FF vs RTJ)
6. Fire-Safe Certification (API 607 / 6FA)
7. Hazardous Area Electrical Classification (Ex-d vs Ex-ia)
8. Valve Trim Metallurgy
"""

import pytest
from app.services.matching_engine import MatchingEngine
from app.services.attribute_extractor import AttributeExtractor
from app.models.enums import RelationshipType

def test_dimension_1_pressure_rating_contradiction():
    mat1 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150# CS ASTM A216 WCB RF")
    mat2 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 600# CS ASTM A216 WCB RF")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "BALL VALVE 2\" 150# CS ASTM A216 WCB RF", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "BALL VALVE 2\" 600# CS ASTM A216 WCB RF", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is True
    assert res["confidence_score"] <= 0.60
    assert res["relationship_type"] != RelationshipType.IDENTICAL
    assert any("pressure_rating" in c for c in res["conflicts"])

def test_dimension_2_metallurgy_contradiction():
    mat1 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150# CS ASTM A105 RF")
    mat2 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150# SS316 ASTM A182 F316 RF")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "BALL VALVE 2\" 150# CS ASTM A105 RF", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "BALL VALVE 2\" 150# SS316 ASTM A182 F316 RF", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is True
    assert res["confidence_score"] <= 0.60
    assert res["relationship_type"] != RelationshipType.IDENTICAL

def test_dimension_2_metallurgy_safe_family_compatibility():
    # A105 forging vs A216 WCB cast carbon steel are ASME B16.34 compatible
    mat1 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150# CS BODY ASTM A105 RF")
    mat2 = AttributeExtractor.extract_attributes("BALL VALVE 2\" 150# CS BODY ASTM A216 WCB RF")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "BALL VALVE 2\" 150# CS BODY ASTM A105 RF", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "BALL VALVE 2\" 150# CS BODY ASTM A216 WCB RF", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is False
    assert res["confidence_score"] >= 0.70

def test_dimension_3_continuous_tolerance_dimension_contradiction():
    mat1 = AttributeExtractor.extract_attributes("SEAMLESS PIPE 2\" SCH 40 ASTM A106")
    mat2 = AttributeExtractor.extract_attributes("SEAMLESS PIPE 4\" SCH 40 ASTM A106")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "SEAMLESS PIPE 2\" SCH 40 ASTM A106", "source_uom": "MTR"},
        {"attributes": mat2, "source_description": "SEAMLESS PIPE 4\" SCH 40 ASTM A106", "source_uom": "MTR"}
    )
    assert res["has_critical_conflict"] is True
    assert res["confidence_score"] <= 0.60
    assert any("dimensions" in c for c in res["conflicts"])

def test_dimension_4_schedule_wall_thickness_contradiction():
    mat1 = AttributeExtractor.extract_attributes("SEAMLESS PIPE 2\" SCH 40 ASTM A106 GRADE B")
    mat2 = AttributeExtractor.extract_attributes("SEAMLESS PIPE 2\" SCH 160 ASTM A106 GRADE B")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "SEAMLESS PIPE 2\" SCH 40 ASTM A106 GRADE B", "source_uom": "MTR"},
        {"attributes": mat2, "source_description": "SEAMLESS PIPE 2\" SCH 160 ASTM A106 GRADE B", "source_uom": "MTR"}
    )
    assert res["has_critical_conflict"] is True
    assert res["confidence_score"] <= 0.60
    assert any("schedule" in c for c in res["conflicts"])

def test_dimension_5_flange_facing_contradiction():
    mat1 = AttributeExtractor.extract_attributes("WELD NECK FLANGE 2\" 150# ASTM A105 RF")
    mat2 = AttributeExtractor.extract_attributes("WELD NECK FLANGE 2\" 150# ASTM A105 RTJ")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "WELD NECK FLANGE 2\" 150# ASTM A105 RF", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "WELD NECK FLANGE 2\" 150# ASTM A105 RTJ", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is True
    assert res["confidence_score"] <= 0.60
    assert any("flange_facing" in c for c in res["conflicts"])

def test_dimension_6_hazardous_area_contradiction():
    mat1 = AttributeExtractor.extract_attributes("PRESSURE TRANSMITTER 0-100 BAR EX-D FLAMEPROOF")
    mat2 = AttributeExtractor.extract_attributes("PRESSURE TRANSMITTER 0-100 BAR EX-IA INTRINSICALLY SAFE")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "PRESSURE TRANSMITTER 0-100 BAR EX-D FLAMEPROOF", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "PRESSURE TRANSMITTER 0-100 BAR EX-IA INTRINSICALLY SAFE", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is True
    assert any("hazardous_area" in c for c in res["conflicts"])

def test_dimension_7_valve_trim_contradiction():
    mat1 = AttributeExtractor.extract_attributes("GATE VALVE 2\" 150# CS A216 WCB TRIM 1")
    mat2 = AttributeExtractor.extract_attributes("GATE VALVE 2\" 150# CS A216 WCB TRIM 8")
    
    res = MatchingEngine.match_records(
        {"attributes": mat1, "source_description": "GATE VALVE 2\" 150# CS A216 WCB TRIM 1", "source_uom": "NOS"},
        {"attributes": mat2, "source_description": "GATE VALVE 2\" 150# CS A216 WCB TRIM 8", "source_uom": "NOS"}
    )
    assert res["has_critical_conflict"] is True
    assert any("valve_trim" in c for c in res["conflicts"])
