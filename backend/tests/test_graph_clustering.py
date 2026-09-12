"""
Unit tests for GraphClusteringService (Pillar 4 of v3.0-AI-SPEC).
Validates community detection, medoid anchor selection, and contradiction-based edge pruning.
"""

import pytest
from app.services.graph_clustering import GraphClusteringService

def test_isolated_nodes():
    svc = GraphClusteringService(min_similarity_threshold=0.60)
    materials = [
        {"id": "M1", "name": "Pipe 1"},
        {"id": "M2", "name": "Valve 2"}
    ]
    edges = []
    clusters = svc.cluster_materials(materials, edges)
    assert len(clusters) == 2
    assert all(c["size"] == 1 for c in clusters)
    assert clusters[0]["members"][0]["is_anchor"] is True

def test_medoid_anchor_selection():
    """
    In a triangle graph where:
    M1 <-> M2 (0.95)
    M1 <-> M3 (0.90)
    M2 <-> M3 (0.70)
    M1 has total weight: 1.0 (self) + 0.95 + 0.90 = 2.85
    M2 has total weight: 1.0 + 0.95 + 0.70 = 2.65
    M3 has total weight: 1.0 + 0.90 + 0.70 = 2.60
    Therefore, M1 MUST be selected as the medoid anchor!
    """
    svc = GraphClusteringService(min_similarity_threshold=0.60)
    materials = [
        {"id": "M1", "name": "Flange A"},
        {"id": "M2", "name": "Flange B"},
        {"id": "M3", "name": "Flange C"}
    ]
    edges = [
        {"source_id": "M1", "target_id": "M2", "weight": 0.95, "has_critical_conflict": False},
        {"source_id": "M1", "target_id": "M3", "weight": 0.90, "has_critical_conflict": False},
        {"source_id": "M2", "target_id": "M3", "weight": 0.70, "has_critical_conflict": False}
    ]

    clusters = svc.cluster_materials(materials, edges)
    assert len(clusters) == 1
    c = clusters[0]
    assert c["size"] == 3
    assert c["anchor_id"] == "M1"

    anchor_members = [m for m in c["members"] if m["is_anchor"]]
    assert len(anchor_members) == 1
    assert anchor_members[0]["id"] == "M1"

def test_critical_conflict_edge_pruning():
    """
    Even if similarity is 0.99, an edge with has_critical_conflict=True must be pruned.
    """
    svc = GraphClusteringService(min_similarity_threshold=0.60)
    materials = [
        {"id": "M1", "name": "Valve 150#"},
        {"id": "M2", "name": "Valve 600#"}
    ]
    edges = [
        {"source_id": "M1", "target_id": "M2", "weight": 0.99, "has_critical_conflict": True}
    ]
    clusters = svc.cluster_materials(materials, edges)
    # They should NOT be clustered together!
    assert len(clusters) == 2
    assert clusters[0]["size"] == 1
    assert clusters[1]["size"] == 1

def test_below_threshold_edge_pruning():
    svc = GraphClusteringService(min_similarity_threshold=0.70)
    materials = [
        {"id": "M1", "name": "Item A"},
        {"id": "M2", "name": "Item B"}
    ]
    edges = [
        {"source_id": "M1", "target_id": "M2", "weight": 0.65, "has_critical_conflict": False}
    ]
    clusters = svc.cluster_materials(materials, edges)
    assert len(clusters) == 2
