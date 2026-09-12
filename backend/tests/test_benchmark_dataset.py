import pytest
from app.services.dataset_generator import IndustrialMROBenchmarkGenerator
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dataset_generator_500():
    records = IndustrialMROBenchmarkGenerator.generate_benchmark_records(500)
    assert len(records) == 500
    
    cpses = {r["cpse_id"] for r in records}
    assert cpses == {"ONGC", "IOCL", "GAIL", "BPCL", "HPCL"}
    
    for r in records:
        assert "source_material_code" in r
        assert "description" in r
        assert "uom" in r
        assert len(r["description"]) > 5

def test_benchmark_stats_endpoint():
    res = client.get("/api/dataset/benchmark/stats")
    assert res.status_code == 200
    data = res.json()
    assert "dataset_name" in data
    assert "model_name" in data["vector_engine_status"] and data["vector_engine_status"]["model_name"]

def test_vector_index_status_endpoint():
    res = client.get("/api/matching/vector-index-status")
    assert res.status_code == 200
    data = res.json()
    assert data["dimension"] == 384
    assert data["index_type"] in ["faiss.IndexFlatIP", "faiss.IndexHNSWFlat"]
