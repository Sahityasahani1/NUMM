import pytest
from app.services.graph_clustering import GraphClusteringService

def test_graph_clustering_medoid_anchor():
    materials = [
        {"id": "m1", "source_description": "BALL VALVE 2IN 150# RF CS WCB", "cpse_id": "ONGC"},
        {"id": "m2", "source_description": "BALL VALVE 2\" 150 LB WCB FLANGE RAISED FACE", "cpse_id": "IOCL"},
        {"id": "m3", "source_description": "VLV BALL 2IN 150# CS WCB FLG RF", "cpse_id": "GAIL"},
        {"id": "other_pipe", "source_description": "SEAMLESS PIPE 4IN SCH 40 A106", "cpse_id": "BPCL"}
    ]

    # m2 has edges to both m1 and m3, making m2 the highest degree centrality node (Medoid)
    pairwise_matches = [
        {"id_a": "m1", "id_b": "m2", "confidence_score": 0.88, "has_critical_conflict": False, "matches": ["noun: BALL VALVE"], "conflicts": []},
        {"id_a": "m2", "id_b": "m3", "confidence_score": 0.86, "has_critical_conflict": False, "matches": ["noun: BALL VALVE"], "conflicts": []},
        {"id_a": "m1", "id_b": "m3", "confidence_score": 0.82, "has_critical_conflict": False, "matches": ["noun: BALL VALVE"], "conflicts": []},
        {"id_a": "m1", "id_b": "other_pipe", "confidence_score": 0.30, "has_critical_conflict": True, "matches": [], "conflicts": ["CRITICAL CONFLICT in noun"]}
    ]

    clusters = GraphClusteringService.cluster_materials(materials, pairwise_matches, threshold=0.65)
    
    assert len(clusters) == 1
    c = clusters[0]
    assert len(c["members"]) == 3
    # m2 is connected to all other valve members with highest degree and descriptive length
    assert c["anchor_id"] in ["m1", "m2", "m3"]
    assert "other_pipe" not in c["member_ids"]
    assert c["relationship_type"] == "IDENTICAL"

def test_graph_clustering_conflict_isolation():
    materials = [
        {"id": "v150", "source_description": "BALL VALVE 2IN 150# WCB", "cpse_id": "ONGC"},
        {"id": "v600", "source_description": "BALL VALVE 2IN 600# WCB", "cpse_id": "IOCL"}
    ]
    # Edge has critical conflict
    pairwise_matches = [
        {"id_a": "v150", "id_b": "v600", "confidence_score": 0.55, "has_critical_conflict": True, "matches": [], "conflicts": ["CRITICAL CONFLICT in pressure_rating"]}
    ]
    clusters = GraphClusteringService.cluster_materials(materials, pairwise_matches, threshold=0.65)
    # Since there are no non-conflicting edges >= threshold, no cluster is created
    assert len(clusters) == 0
