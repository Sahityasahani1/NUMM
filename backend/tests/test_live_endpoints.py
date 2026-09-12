import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_live_harmonize_endpoint():
    payload = {
        "raw_description": "VLV BALL 2IN 150# ASTM A216 WCB RF"
    }
    response = client.post("/api/cpse/materials/harmonize-live", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "VALVE" in data["normalized_description"]
    assert data["extracted_attributes"]["noun"] == "BALL VALVE"
    assert data["extracted_attributes"]["pressure_rating"] == "150#"
    assert "2 INCH" in data["extracted_attributes"]["dimensions"]
    assert "ASTM A216 WCB" in data["extracted_attributes"]["material_grade"]
    assert data["unspsc_code"] == "40141607"

def test_live_compare_identical_records():
    payload = {
        "record_a": {
            "source_description": "BALL VALVE 2IN 150# CS WCB",
            "source_uom": "EA"
        },
        "record_b": {
            "source_description": "BALL VALVE 2IN 150# CS WCB",
            "source_uom": "EA"
        }
    }
    response = client.post("/api/matching/compare-live", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_critical_conflict"] is False
    assert data["relationship_type"] == "IDENTICAL"
    assert data["composite_confidence_score"] >= 0.85
    assert len(data["agreed_attributes"]) > 0

def test_live_compare_critical_contradiction():
    payload = {
        "record_a": {
            "source_description": "GATE VALVE 4IN 150# WCB",
            "source_uom": "EA"
        },
        "record_b": {
            "source_description": "GATE VALVE 4IN 600# WCB",
            "source_uom": "EA"
        }
    }
    response = client.post("/api/matching/compare-live", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["has_critical_conflict"] is True
    assert data["relationship_type"] != "IDENTICAL"
    assert any("CRITICAL CONFLICT in pressure_rating" in c for c in data["conflicts"])
    assert data["composite_confidence_score"] <= 0.60
