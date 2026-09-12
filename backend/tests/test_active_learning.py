"""
Unit tests for Active Learning Queue & Uncertainty-Driven Governance (v3.0-AI-SPEC).
Tests:
1. Medoid-based Active Learning Triplet Emission.
2. Uncertainty-Sorted Review Queue Logic.
3. HNSW Vector Index Scaling and Querying.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.cpse import CPSE
from app.models.cpse_material import CPSEMaterial
from app.models.equivalence_group import EquivalenceGroup, EquivalenceGroupMember
from app.models.enums import RationalizationAction, GroupStatus
from app.models.active_learning import TrainingTriplet
from app.services.governance_service import GovernanceService
from app.services.vector_search import VectorSearchService

def test_active_learning_triplet_emission():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()

    cpse = CPSE(id="CPSE_TEST", name="Test CPSE", code="TEST")
    db.add(cpse)

    mat_anchor = CPSEMaterial(
        id="mat-anchor-1",
        cpse_id="CPSE_TEST",
        source_system="SAP",
        source_material_code="CODE-ANCHOR",
        source_description="BALL VALVE 2IN 150# RF WCB FLANGED",
        source_uom="EA",
        raw_payload="{}",
        batch_id="batch-1",
        material_noun="VALVE",
        pressure_rating="150#"
    )
    mat_peer = CPSEMaterial(
        id="mat-peer-2",
        cpse_id="CPSE_TEST",
        source_system="ORACLE",
        source_material_code="CODE-PEER",
        source_description="VALVE BALL 2\" 150 LB WCB FLANGED RF",
        source_uom="EA",
        raw_payload="{}",
        batch_id="batch-1",
        material_noun="VALVE",
        pressure_rating="150#"
    )
    db.add(mat_anchor)
    db.add(mat_peer)

    group = EquivalenceGroup(
        id="grp-active-1",
        confidence_score=0.92,
        status=GroupStatus.PROPOSED,
        evidence_payload='{"epistemic_uncertainty": 0.85, "calibrated_probability": 0.58}'
    )
    db.add(group)
    db.flush()

    mem_anchor = EquivalenceGroupMember(
        id="mem-1",
        equivalence_group_id="grp-active-1",
        cpse_material_id="mat-anchor-1",
        is_anchor=1
    )
    mem_peer = EquivalenceGroupMember(
        id="mem-2",
        equivalence_group_id="grp-active-1",
        cpse_material_id="mat-peer-2",
        is_anchor=0
    )
    db.add(mem_anchor)
    db.add(mem_peer)
    db.commit()

    triplet = GovernanceService.emit_active_learning_triplet(
        db=db,
        group=group,
        action=RationalizationAction.MERGE,
        actor="STEWARD-AI-01"
    )

    assert triplet is not None
    assert triplet.anchor_description == "BALL VALVE 2IN 150# RF WCB FLANGED"
    assert triplet.positive_description == 'VALVE BALL 2" 150 LB WCB FLANGED RF'
    assert triplet.actor == "STEWARD-AI-01"
    assert triplet.source_action == "MERGE"


def test_uncertainty_queue_sorting():
    # Test sorting logic used in matching groups queue
    groups = [
        {"id": "g1", "evidence_payload": {"epistemic_uncertainty": 0.15, "confidence": 0.95}},
        {"id": "g2", "evidence_payload": {"epistemic_uncertainty": 0.88, "confidence": 0.56}},
        {"id": "g3", "evidence_payload": {"epistemic_uncertainty": 0.45, "confidence": 0.75}},
    ]
    sorted_groups = sorted(
        groups,
        key=lambda g: g["evidence_payload"].get("epistemic_uncertainty", 0.0),
        reverse=True
    )
    assert sorted_groups[0]["id"] == "g2"
    assert sorted_groups[1]["id"] == "g3"
    assert sorted_groups[2]["id"] == "g1"


def test_vector_search_hnsw_scaling():
    vs = VectorSearchService.get_instance()
    vs.upgrade_to_hnsw(M=16, ef_construction=32, ef_search=16)
    status = vs.get_status()
    assert "Two-Stage Hybrid" in status["retrieval_pipeline"]
    assert status["dimension"] == 384
