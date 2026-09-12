import os
import csv
import uuid
import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cpse import CPSE
from app.models.cpse_material import CPSEMaterial
from app.services.normalization import NormalizationService
from app.services.attribute_extractor import AttributeExtractor
from app.services.vector_search import VectorSearchService
from app.services.governance_service import GovernanceService
from app.services.dataset_generator import IndustrialMROBenchmarkGenerator

router = APIRouter(prefix="/dataset", tags=["Dataset & Benchmark Strategy"])

@router.post("/benchmark/load-500", status_code=status.HTTP_201_CREATED)
def load_industrial_benchmark_500(db: Session = Depends(get_db)):
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "sample_data", "industrial_mro_500.csv"))
    if not os.path.exists(csv_path):
        # Fallback check relative to cwd
        alt_path = os.path.abspath("backend/sample_data/industrial_mro_500.csv")
        if os.path.exists(alt_path):
            csv_path = alt_path
        else:
            raise HTTPException(status_code=404, detail="industrial_mro_500.csv not found on server")

    # Ensure all CPSEs exist in database
    cpses = {
        "ONGC": "Oil and Natural Gas Corporation",
        "IOCL": "Indian Oil Corporation Limited",
        "GAIL": "GAIL (India) Limited",
        "BPCL": "Bharat Petroleum Corporation Limited",
        "HPCL": "Hindustan Petroleum Corporation Limited"
    }
    for cpse_id, name in cpses.items():
        existing = db.query(CPSE).filter(CPSE.id == cpse_id).first()
        if not existing:
            cpse = CPSE(id=cpse_id, name=name, code=cpse_id)
            db.add(cpse)
    db.commit()

    batch_id = str(uuid.uuid4())
    created_materials = []
    vector_items = []

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mat_code = row["source_material_code"]
            cpse_prefix = mat_code.split("-")[0]
            cpse_id = cpse_prefix if cpse_prefix in cpses else "ONGC"

            # Check if this code already exists for this CPSE
            existing_mat = db.query(CPSEMaterial).filter(
                CPSEMaterial.cpse_id == cpse_id,
                CPSEMaterial.source_material_code == mat_code
            ).first()
            if existing_mat:
                continue

            desc = row["description"]
            uom = row["uom"]
            specs = row.get("specifications")

            norm_desc = NormalizationService.normalize_text(desc)
            norm_uom = NormalizationService.normalize_uom(uom)
            extracted = AttributeExtractor.extract_attributes(desc, specs)

            mat = CPSEMaterial(
                id=str(uuid.uuid4()),
                cpse_id=cpse_id,
                source_system=row.get("source_system", f"SAP_{cpse_id}"),
                source_material_code=mat_code,
                source_description=desc,
                source_specifications=specs,
                source_uom=uom,
                raw_payload=json.dumps(row),
                batch_id=batch_id,
                normalized_description=norm_desc,
                normalized_uom=norm_uom,
                material_noun=extracted.get("noun"),
                material_modifier=extracted.get("modifier"),
                dimensions=extracted.get("dimensions"),
                material_grade=extracted.get("material_grade"),
                pressure_rating=extracted.get("pressure_rating"),
                standard=extracted.get("standard"),
                extracted_attributes=json.dumps(extracted),
                standardized_description=extracted.get("canonical_description")
            )
            db.add(mat)
            created_materials.append(mat)
            vector_items.append({"id": mat.id, "text": norm_desc})

    db.commit()

    # Index into FAISS Vector Search
    if vector_items:
        vector_svc = VectorSearchService.get_instance()
        vector_svc.index_materials(vector_items)

        GovernanceService.record_audit(
            db=db,
            actor="SYSTEM_BENCHMARK_LOADER",
            action="LOAD_500_MRO_BENCHMARK",
            object_type="DATASET",
            object_id=batch_id,
            details={"rows_loaded": len(created_materials), "source": "industrial_mro_500.csv"}
        )
        db.commit()

    # Automatically execute cross-catalog matching engine and establish canonical masters
    from app.api.routers.matching import run_candidate_matching
    from app.models.equivalence_group import EquivalenceGroup
    from app.models.enums import GroupStatus, RationalizationAction

    match_report = run_candidate_matching(db=db)
    created_groups = match_report.get("groups_created", 0)

    # Auto-approve high-confidence groups (>= 85%) into Canonical Masters
    proposed_groups = db.query(EquivalenceGroup).filter(EquivalenceGroup.status == GroupStatus.PROPOSED).all()
    approved_canonical_count = 0
    for g in proposed_groups:
        if g.confidence_score >= 0.85:
            try:
                GovernanceService.review_equivalence_group(
                    db=db,
                    group_id=g.id,
                    actor="SYSTEM_AUTO_HARMONIZER",
                    action=RationalizationAction.MERGE,
                    reason="Automated benchmark high-confidence equivalence merge"
                )
                approved_canonical_count += 1
            except Exception:
                pass
    db.commit()

    total_in_db = db.query(CPSEMaterial).count()

    return {
        "message": f"Successfully loaded {total_in_db} materials, created {created_groups} equivalence groups, and published {approved_canonical_count} canonical masters.",
        "batch_id": batch_id,
        "rows_loaded": len(created_materials) or total_in_db,
        "total_materials_in_db": total_in_db,
        "groups_created": created_groups,
        "canonical_masters_created": approved_canonical_count,
        "total_faiss_indexed": VectorSearchService.get_instance().get_status()["total_indexed_vectors"]
    }

@router.get("/benchmark/stats")
def get_benchmark_stats(db: Session = Depends(get_db)):
    vector_status = VectorSearchService.get_instance().get_status()
    total_db_materials = db.query(CPSEMaterial).count()
    
    cpse_counts = {}
    cpses = db.query(CPSE).all()
    for c in cpses:
        count = db.query(CPSEMaterial).filter(CPSEMaterial.cpse_id == c.id).count()
        cpse_counts[c.id] = count

    return {
        "dataset_name": "Industrial MRO Benchmark (SIH26099 v2)",
        "recommended_sample_size": "738 rows across 5 CPSEs",
        "total_materials_in_db": total_db_materials,
        "cpse_distribution": cpse_counts,
        "vector_engine_status": vector_status
    }

@router.post("/benchmark/load-738", status_code=status.HTTP_201_CREATED)
def load_industrial_benchmark_738(db: Session = Depends(get_db)):
    """
    Loads the official 738-item cross-CPSE benchmark across ONGC, IOCL, GAIL, HPCL, and BPCL,
    structured across 145 active clusters as specified in the NUMM AI Explainer.
    """
    cpses = {
        "ONGC": "Oil and Natural Gas Corporation",
        "IOCL": "Indian Oil Corporation Limited",
        "GAIL": "GAIL (India) Limited",
        "BPCL": "Bharat Petroleum Corporation Limited",
        "HPCL": "Hindustan Petroleum Corporation Limited"
    }
    for cpse_id, name in cpses.items():
        existing = db.query(CPSE).filter(CPSE.id == cpse_id).first()
        if not existing:
            cpse = CPSE(id=cpse_id, name=name, code=cpse_id)
            db.add(cpse)
    db.commit()

    records = IndustrialMROBenchmarkGenerator.generate_benchmark_records(count=738, cluster_count=145)
    batch_id = str(uuid.uuid4())
    created_materials = []
    vector_items = []

    for row in records:
        mat_code = row["source_material_code"]
        cpse_id = row.get("cpse_id", "ONGC")

        existing_mat = db.query(CPSEMaterial).filter(
            CPSEMaterial.cpse_id == cpse_id,
            CPSEMaterial.source_material_code == mat_code
        ).first()
        if existing_mat:
            continue

        desc = row["description"]
        uom = row["uom"]
        specs = row.get("specifications")

        norm_desc = NormalizationService.normalize_text(desc)
        norm_uom = NormalizationService.normalize_uom(uom)
        extracted = AttributeExtractor.extract_attributes(desc, specs)

        mat = CPSEMaterial(
            id=str(uuid.uuid4()),
            cpse_id=cpse_id,
            source_system=row.get("source_system", f"SAP_{cpse_id}"),
            source_material_code=mat_code,
            source_description=desc,
            source_specifications=specs,
            source_uom=uom,
            raw_payload=json.dumps(row),
            batch_id=batch_id,
            normalized_description=norm_desc,
            normalized_uom=norm_uom,
            material_noun=extracted.get("noun"),
            material_modifier=extracted.get("modifier"),
            dimensions=extracted.get("dimensions"),
            material_grade=extracted.get("material_grade"),
            pressure_rating=extracted.get("pressure_rating"),
            standard=extracted.get("standard"),
            extracted_attributes=json.dumps(extracted),
            standardized_description=extracted.get("canonical_description")
        )
        db.add(mat)
        created_materials.append(mat)
        vector_items.append({"id": mat.id, "text": norm_desc})

    db.commit()

    if vector_items:
        vector_svc = VectorSearchService.get_instance()
        vector_svc.index_materials(vector_items)

        GovernanceService.record_audit(
            db=db,
            actor="SYSTEM_BENCHMARK_LOADER",
            action="LOAD_738_MRO_BENCHMARK",
            object_type="DATASET",
            object_id=batch_id,
            details={"rows_loaded": len(created_materials), "clusters": 145}
        )

    total_in_db = db.query(CPSEMaterial).count()
    return {
        "message": f"Successfully loaded 738 industrial benchmark records across 145 clusters.",
        "batch_id": batch_id,
        "rows_loaded": len(created_materials),
        "total_materials_in_db": total_in_db,
        "clusters_targeted": 145,
        "total_faiss_indexed": VectorSearchService.get_instance().get_status()["total_indexed_vectors"]
    }

@router.get("/semantic-manifold", tags=["AI Vector Space Visualizer"])
def get_semantic_manifold(
    limit: int = 150,
    projection_dims: int = 3,
    db: Session = Depends(get_db)
):
    """
    Returns 3D/2D PCA coordinates, cluster groupings with medoid anchors,
    and semantic graph edges for the 384-dimensional FAISS embeddings.
    """
    from app.services.manifold_service import SemanticManifoldService
    return SemanticManifoldService.get_semantic_manifold_data(
        db=db,
        limit=min(300, max(10, limit)),
        projection_dims=projection_dims
    )


