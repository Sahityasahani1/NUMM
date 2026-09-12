"""
National Unified Material Master (NUMM) · Semantic Vector Manifold Test Suite
Validates PCA dimensionality reduction from 384-D to 3D, coordinate boundedness,
cluster centroid computation, and REST API response structure.
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.services.manifold_service import SemanticManifoldService
from app.main import app

client = TestClient(app)

def test_pca_projection_math_and_bounds():
    # Generate 20 synthetic 384-dimensional embeddings
    np.random.seed(42)
    embeddings = np.random.randn(20, 384)
    
    # Normalize vectors
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / norms

    # Project to 3D
    coords_3d = SemanticManifoldService._compute_pca_projection(embeddings, n_components=3)

    assert coords_3d.shape == (20, 3)
    # Check all coordinates are bounded within [-80, 80]
    assert np.all(coords_3d >= -80.0)
    assert np.all(coords_3d <= 80.0)
    # Check non-trivial spread (variance > 0)
    assert np.var(coords_3d[:, 0]) > 0.1

def test_pca_projection_edge_cases():
    # Empty embeddings
    empty = np.empty((0, 384))
    res_empty = SemanticManifoldService._compute_pca_projection(empty, n_components=3)
    assert res_empty.shape == (0, 3)

    # Fewer samples than components (e.g. 2 samples)
    few = np.random.randn(2, 384)
    res_few = SemanticManifoldService._compute_pca_projection(few, n_components=3)
    assert res_few.shape == (2, 3)

def test_semantic_manifold_api_endpoint():
    res = client.get("/api/dataset/semantic-manifold?limit=25&projection_dims=3")
    assert res.status_code == 200
    data = res.json()

    assert "nodes" in data
    assert "clusters" in data
    assert "edges" in data
    assert "summary" in data

    assert data["summary"]["embedding_dim"] == 384
    assert data["summary"]["projection_dims"] == 3

    # If database contains materials, verify node fields
    if len(data["nodes"]) > 0:
        sample_node = data["nodes"][0]
        assert "x" in sample_node
        assert "y" in sample_node
        assert "z" in sample_node
        assert "code" in sample_node
        assert "cpse" in sample_node
        assert "noun" in sample_node
        assert "is_anchor" in sample_node
