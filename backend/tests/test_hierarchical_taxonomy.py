import pytest
from app.services.taxonomy_service import TaxonomyService

def test_legacy_classify_backward_compat():
    code, label = TaxonomyService.classify("BALL VALVE")
    assert code in ("40141600", "40141607")
    assert "Valves" in label

    code, label = TaxonomyService.classify("UNKNOWN RANDOM ITEM")
    assert code == "23150000"

def test_hierarchical_classify_ball_valve():
    result = TaxonomyService.classify_hierarchical("VLV BALL 2IN 150# WCB FLG RF")
    assert result["segment_code"] == "40000000"
    assert result["family_code"] == "40140000"
    assert result["class_code"] == "40141600"
    assert result["commodity_code"] == "40141604"
    assert result["commodity_title"] == "Ball valves"
    assert "pressure_rating" in result["required_attributes"]
    assert "flange_facing" in result["required_attributes"]

def test_hierarchical_classify_bearing():
    result = TaxonomyService.classify_hierarchical("DEEP GROOVE BALL BEARING 6205-2RS SKF")
    assert result["segment_code"] == "31000000"
    assert result["commodity_code"] == "31171504"
    assert result["commodity_title"] == "Ball bearings"
    assert "part_number" in result["required_attributes"]
