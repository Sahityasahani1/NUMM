"""
National Unified Material Master (NUMM) · Two-Stage Hybrid Retrieval & RRF Tests
Validates:
1. BM25 accuracy on exact part numbers & imperial fractions
2. Dense semantic similarity on synonyms
3. Reciprocal Rank Fusion (RRF) combining dense & lexical rankings
4. FAISS index disk serialization & reload
"""

import os
import shutil
import tempfile
import pytest
from app.services.vector_search import VectorSearchService, BM25Okapi

def test_bm25_okapi_alphanumeric_precision():
    bm25 = BM25Okapi()
    corpus = [
        "BALL VALVE 2\" CLASS 150 FLANGED RF CS BODY",
        "BALL VALVE 1/2\" CLASS 150 FLANGED RF CS BODY",
        "WELD NECK FLANGE 2\" 150# A105 SCH 40",
        "CENTRIFUGAL WATER PUMP 25M3/HR MOTOR DRIVEN 415V"
    ]
    bm25.fit(corpus)
    
    # Query with exact fraction "1/2\""
    results = bm25.search("1/2\"", top_k=2)
    assert len(results) > 0
    top_doc_idx = results[0][0]
    assert "1/2\"" in corpus[top_doc_idx]

def test_hybrid_rrf_candidate_retrieval():
    svc = VectorSearchService.get_instance()
    svc.clear_index()
    materials = [
        {"id": "MAT-001", "text": "BALL VALVE 2 INCH CLASS 150 WCB RF"},
        {"id": "MAT-002", "text": "VLV BL 2IN 150# CS BODY ASTM A216"},
        {"id": "MAT-003", "text": "GATE VALVE 4 INCH 600# CS BODY"},
        {"id": "MAT-004", "text": "STUD BOLT B7 M20X150 WITH 2 NUTS 2H"}
    ]
    svc.index_materials(materials, persist=False)
    
    # Query with synonymous abbreviation dialect
    candidates = svc.retrieve_candidates("BALL VALVE 2\" 150#", k=3)
    assert len(candidates) > 0
    candidate_ids = [c[0] for c in candidates]
    # MAT-001 or MAT-002 must rank at the top
    assert candidate_ids[0] in ["MAT-001", "MAT-002"]

def test_vector_search_disk_serialization():
    temp_dir = tempfile.mkdtemp()
    try:
        svc = VectorSearchService.get_instance()
        test_items = [
            {"id": "PERSIST-1", "text": "HIGH PRESSURE SOUR GAS VALVE 10000 PSI"},
            {"id": "PERSIST-2", "text": "DUPLEX 2205 SEAMLESS PIPE 6 INCH SCH 80"}
        ]
        svc.index_materials(test_items, persist=False)
        svc.save_index(temp_dir)
        
        # Verify saved files
        assert os.path.exists(os.path.join(temp_dir, "vectors_meta.json"))
        
        # Clear index in memory
        svc.clear_index()
        assert svc.get_status()["total_indexed_vectors"] == 0
        
        # Reload from disk
        loaded = svc.load_index(temp_dir)
        assert loaded is True
        assert svc.get_status()["total_indexed_vectors"] >= 2
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
