import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cpse_material import CPSEMaterial
from app.models.equivalence_group import EquivalenceGroup, EquivalenceGroupMember
from app.models.enums import GroupStatus, RelationshipType
from app.schemas.equivalence import EquivalenceGroupResponse, MemberDetailResponse
from app.schemas.cpse_material import LiveCompareRequest, LiveCompareResponse
from app.services.matching_engine import MatchingEngine
from app.services.cnmc_generator import CNMCGenerator
from app.services.vector_search import VectorSearchService
from app.core.config import settings

router = APIRouter(prefix="/matching", tags=["AI Matching & Equivalence"])

@router.get("/vector-index-status")
def get_vector_index_status():
    return VectorSearchService.get_instance().get_status()

@router.post("/compare-live", response_model=LiveCompareResponse)
def compare_materials_live(payload: LiveCompareRequest):
    raw1 = payload.text1 or (payload.record_a.get("source_description") if payload.record_a else "") or ""
    raw2 = payload.text2 or (payload.record_b.get("source_description") if payload.record_b else "") or ""
    text1 = raw1.strip()
    text2 = raw2.strip()
    uom1 = payload.uom1 or (payload.record_a.get("source_uom") if payload.record_a else "EA") or "EA"
    uom2 = payload.uom2 or (payload.record_b.get("source_uom") if payload.record_b else "EA") or "EA"
    
    from app.services.normalization import NormalizationService
    from app.services.attribute_extractor import AttributeExtractor

    norm1 = NormalizationService.normalize_text(text1)
    norm2 = NormalizationService.normalize_text(text2)
    attr1 = AttributeExtractor.extract_attributes(text1)
    attr2 = AttributeExtractor.extract_attributes(text2)

    rec1 = {
        "source_description": text1,
        "normalized_description": norm1,
        "source_uom": uom1,
        "attributes": attr1,
        "cpse_id": "CPSE_A"
    }
    rec2 = {
        "source_description": text2,
        "normalized_description": norm2,
        "source_uom": uom2,
        "attributes": attr2,
        "cpse_id": "CPSE_B"
    }

    match_result = MatchingEngine.match_records(rec1, rec2)
    tokens1 = MatchingEngine.tokenize(norm1)
    tokens2 = MatchingEngine.tokenize(norm2)

    from app.services.match_arbiter import MatchArbiter
    from app.services.explainability_service import ExplainabilityService

    arbiter_res = MatchArbiter.arbitrate_pair(rec1, rec2, match_result)
    xai_res = ExplainabilityService.generate_engineering_rationale(rec1, rec2, match_result, arbiter_res)

    explanation = []
    if match_result["has_critical_conflict"]:
        explanation.append("CRITICAL SAFETY HAZARD DETECTED: Discrepancy in safety-critical engineering parameters (pressure rating, metallurgy, or dimensions) triggered the Deterministic Physics Safety Bouncer. Confidence was slashed by 25% and hard-capped at <= 0.60 to prevent catastrophic pipeline blowout or rupture.")
    elif match_result["confidence_score"] >= settings.IDENTICAL_THRESHOLD:
        explanation.append("IDENTICAL / DUPLICATE: High semantic vector cosine and verified agreement across all critical technical attributes.")
    elif match_result["confidence_score"] >= settings.NEAR_DUPLICATE_THRESHOLD:
        explanation.append("NEAR-DUPLICATE: High overall similarity with minor variation in non-critical specifications or formatting; routed to human steward review.")
    else:
        explanation.append("RELATED: Low to moderate similarity; items cannot be grouped under a single national identity.")

    return LiveCompareResponse(
        text1=text1,
        text2=text2,
        tokens1=tokens1,
        tokens2=tokens2,
        lexical_jaccard_score=match_result["lexical_score"],
        semantic_vector_cosine_score=match_result["semantic_score"],
        attribute_match_score=match_result["attribute_score"],
        uom_compatibility_score=match_result.get("uom_score", 1.0),
        raw_composite_score=match_result.get("raw_composite_score", match_result["confidence_score"]),
        composite_confidence_score=match_result["confidence_score"],
        relationship_type=match_result["relationship_type"],
        has_critical_conflict=match_result["has_critical_conflict"],
        deterministic_safety_hazard=match_result.get("deterministic_safety_hazard", match_result["has_critical_conflict"]),
        agreed_attributes=match_result["matches"],
        conflicts=match_result["conflicts"],
        explanation=" ".join(explanation),
        engineering_rationale=xai_res["formal_rationale"],
        calibrated_probability=arbiter_res["calibrated_probability"],
        epistemic_uncertainty=arbiter_res["epistemic_uncertainty"],
        steward_action_recommendation=xai_res["steward_action_recommendation"]
    )


@router.post("/run", status_code=status.HTTP_200_OK)
def run_candidate_matching(
    db: Session = Depends(get_db)
):
    materials = db.query(CPSEMaterial).all()
    if len(materials) < 2:
        return {"message": "Need at least 2 materials to perform cross-catalog matching", "groups_created": 0}

    mat_dicts = []
    index_payload = []
    for m in materials:
        desc_text = m.normalized_description or m.source_description or ""
        mat_dicts.append({
            "id": m.id,
            "cpse_id": m.cpse_id,
            "source_material_code": m.source_material_code,
            "source_description": m.source_description,
            "normalized_description": m.normalized_description,
            "source_uom": m.source_uom,
            "attributes": {
                "noun": m.material_noun,
                "modifier": m.material_modifier,
                "dimensions": m.dimensions,
                "material_grade": m.material_grade,
                "pressure_rating": m.pressure_rating,
                "standard": m.standard
            }
        })
        index_payload.append({"id": m.id, "text": desc_text})

    # Ensure FAISS index has all materials
    vector_svc = VectorSearchService.get_instance()
    vector_svc.index_materials(index_payload)

    from app.services.graph_clustering import GraphClusteringService

    existing_members = db.query(EquivalenceGroupMember.cpse_material_id).all()
    grouped_ids = {m_id for (m_id,) in existing_members}
    mat_by_id = {m["id"]: m for m in mat_dicts}

    ungrouped_mats = [m for m in mat_dicts if m["id"] not in grouped_ids]
    pairwise_edges = []
    pair_results = {}
    top_k = settings.FAISS_TOP_K_CANDIDATES

    for rec_i in ungrouped_mats:
        query_text = rec_i["normalized_description"] or rec_i["source_description"]
        candidates = vector_svc.retrieve_candidates(query_text, k=top_k)

        for c_id, sim in candidates:
            if c_id == rec_i["id"] or c_id in grouped_ids:
                continue

            rec_j = mat_by_id.get(c_id)
            if not rec_j:
                continue

            pair_key = tuple(sorted([rec_i["id"], rec_j["id"]]))
            if pair_key in pair_results:
                continue

            match_result = MatchingEngine.match_records(rec_i, rec_j)
            pair_results[pair_key] = match_result
            score = match_result["confidence_score"]
            has_conflict = match_result.get("has_critical_conflict", False)

            if score >= 0.50 and not has_conflict:
                pairwise_edges.append({
                    "source_id": rec_i["id"],
                    "target_id": rec_j["id"],
                    "weight": score,
                    "has_critical_conflict": has_conflict
                })

    clustering_svc = GraphClusteringService(min_similarity_threshold=0.50)
    clusters = clustering_svc.cluster_materials(ungrouped_mats, pairwise_edges)

    created_groups_count = 0
    for clust in clusters:
        members = clust["members"]
        if len(members) <= 1:
            continue

        anchor_id = clust["anchor_id"]
        anchor_rec = mat_by_id.get(anchor_id)
        if not anchor_rec:
            continue

        member_ids = [m["id"] for m in members]
        cluster_conflicts = []
        cluster_matches = []
        highest_score = 0.0
        best_lexical = 0.8
        best_semantic = 0.8
        best_attribute = 0.85
        best_rel_type = RelationshipType.NEAR_DUPLICATE

        for mid in member_ids:
            if mid == anchor_id:
                continue
            pk = tuple(sorted([anchor_id, mid]))
            res = pair_results.get(pk)
            if not res:
                m_other = mat_by_id.get(mid)
                if m_other:
                    res = MatchingEngine.match_records(anchor_rec, m_other)
                    pair_results[pk] = res

            if res:
                sc = res["confidence_score"]
                if sc > highest_score:
                    highest_score = sc
                    best_rel_type = res["relationship_type"]
                    best_lexical = res.get("lexical_score", 0.8)
                    best_semantic = res.get("semantic_score", 0.8)
                    best_attribute = res.get("attribute_score", 0.85)
                cluster_conflicts.extend(res.get("conflicts", []))
                cluster_matches.extend(res.get("matches", []))

        if highest_score < 0.50:
            highest_score = clust.get("cohesion_score", 0.75)

        proposed_cnmc = CNMCGenerator.allocate_cnmc(
            db, noun=anchor_rec["attributes"].get("noun")
        )

        # Select the most prominent non-anchor member for group-level arbitration & explainability
        representative_other = None
        for mid in member_ids:
            if mid != anchor_id:
                representative_other = mat_by_id.get(mid)
                break

        arb_res = None
        xai_res = None
        if representative_other:
            pk = tuple(sorted([anchor_id, representative_other["id"]]))
            pair_res = pair_results.get(pk) or MatchingEngine.match_records(anchor_rec, representative_other)
            from app.services.match_arbiter import MatchArbiter
            from app.services.explainability_service import ExplainabilityService
            arb_res = MatchArbiter.arbitrate_pair(anchor_rec, representative_other, pair_res)
            xai_res = ExplainabilityService.generate_engineering_rationale(anchor_rec, representative_other, pair_res, arb_res)

        calibrated_p = arb_res["calibrated_probability"] if arb_res else highest_score
        epistemic_u = arb_res["epistemic_uncertainty"] if arb_res else round(1.0 - 2.0 * abs(highest_score - 0.5), 4)
        steward_rec = arb_res["recommendation"] if arb_res else "AUTO_MERGE_RECOMMENDED"
        engineering_xai = xai_res["formal_rationale"] if xai_res else "Multi-CPSE technical specifications align across all active safety dimensions."

        evidence_payload = {
            "highest_confidence": highest_score,
            "calibrated_probability": calibrated_p,
            "epistemic_uncertainty": epistemic_u,
            "steward_action_recommendation": steward_rec,
            "engineering_rationale": engineering_xai,
            "cohesion_score": clust.get("cohesion_score", 0.0),
            "cluster_size": len(members),
            "agreed_attributes": list(set(cluster_matches)),
            "conflicts": list(set(cluster_conflicts)),
            "comparison_count": len(members) - 1
        }

        group = EquivalenceGroup(
            id=str(uuid.uuid4()),
            relationship_type=best_rel_type,
            confidence_score=highest_score,
            lexical_score=best_lexical,
            semantic_score=best_semantic,
            attribute_score=best_attribute,
            evidence_payload=json.dumps(evidence_payload),
            status=GroupStatus.PROPOSED,
            proposed_cnmc=proposed_cnmc
        )
        db.add(group)
        db.flush()

        for m_info in members:
            mid = m_info["id"]
            is_anchor = 1 if mid == anchor_id else 0
            member = EquivalenceGroupMember(
                id=str(uuid.uuid4()),
                equivalence_group_id=group.id,
                cpse_material_id=mid,
                is_anchor=is_anchor
            )
            db.add(member)
            grouped_ids.add(mid)

        created_groups_count += 1

    db.commit()
    return {
        "message": f"Matching completed. Created {created_groups_count} equivalence groups.",
        "groups_created": created_groups_count
    }

@router.get("/groups", response_model=List[EquivalenceGroupResponse])
def list_equivalence_groups(
    status_filter: Optional[GroupStatus] = None,
    sort_by_uncertainty: bool = Query(False, description="Sort proposed groups by epistemic uncertainty descending for active learning human review priority"),
    db: Session = Depends(get_db)
):
    query = db.query(EquivalenceGroup)
    if status_filter:
        query = query.filter(EquivalenceGroup.status == status_filter)
    
    groups = query.order_by(EquivalenceGroup.created_at.desc()).all()
    results = []
    
    for g in groups:
        member_details = []
        for m in g.members:
            cpse_mat = m.cpse_material
            if cpse_mat:
                member_details.append(
                    MemberDetailResponse(
                        id=m.id,
                        cpse_material_id=cpse_mat.id,
                        cpse_id=cpse_mat.cpse_id,
                        source_material_code=cpse_mat.source_material_code,
                        source_description=cpse_mat.source_description,
                        source_uom=cpse_mat.source_uom,
                        material_noun=cpse_mat.material_noun,
                        material_modifier=cpse_mat.material_modifier,
                        dimensions=cpse_mat.dimensions,
                        material_grade=cpse_mat.material_grade,
                        pressure_rating=cpse_mat.pressure_rating,
                        standard=cpse_mat.standard,
                        is_anchor=m.is_anchor
                    )
                )

        evidence_dict = None
        if g.evidence_payload:
            try:
                evidence_dict = json.loads(g.evidence_payload)
            except Exception:
                evidence_dict = {"raw": g.evidence_payload}

        results.append(
            EquivalenceGroupResponse(
                id=g.id,
                relationship_type=g.relationship_type,
                confidence_score=g.confidence_score,
                lexical_score=g.lexical_score,
                semantic_score=g.semantic_score,
                attribute_score=g.attribute_score,
                evidence_payload=evidence_dict,
                status=g.status,
                proposed_cnmc=g.proposed_cnmc,
                canonical_material_id=g.canonical_material_id,
                members=member_details,
                created_at=g.created_at,
                updated_at=g.updated_at
            )
        )
    
    if sort_by_uncertainty:
        # Sort by epistemic uncertainty descending (Active Learning priority sampling)
        results.sort(
            key=lambda item: (item.evidence_payload.get("epistemic_uncertainty", 0.0) if item.evidence_payload else 0.0),
            reverse=True
        )

    return results

@router.get("/groups/{group_id}", response_model=EquivalenceGroupResponse)
def get_equivalence_group(group_id: str, db: Session = Depends(get_db)):
    g = db.query(EquivalenceGroup).filter(EquivalenceGroup.id == group_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Group not found")
    
    member_details = []
    for m in g.members:
        cpse_mat = m.cpse_material
        if cpse_mat:
            member_details.append(
                MemberDetailResponse(
                    id=m.id,
                    cpse_material_id=cpse_mat.id,
                    cpse_id=cpse_mat.cpse_id,
                    source_material_code=cpse_mat.source_material_code,
                    source_description=cpse_mat.source_description,
                    source_uom=cpse_mat.source_uom,
                    material_noun=cpse_mat.material_noun,
                    material_modifier=cpse_mat.material_modifier,
                    dimensions=cpse_mat.dimensions,
                    material_grade=cpse_mat.material_grade,
                    pressure_rating=cpse_mat.pressure_rating,
                    standard=cpse_mat.standard,
                    is_anchor=m.is_anchor
                )
            )

    evidence_dict = None
    if g.evidence_payload:
        try:
            evidence_dict = json.loads(g.evidence_payload)
        except Exception:
            evidence_dict = {}

    return EquivalenceGroupResponse(
        id=g.id,
        relationship_type=g.relationship_type,
        confidence_score=g.confidence_score,
        lexical_score=g.lexical_score,
        semantic_score=g.semantic_score,
        attribute_score=g.attribute_score,
        evidence_payload=evidence_dict,
        status=g.status,
        proposed_cnmc=g.proposed_cnmc,
        canonical_material_id=g.canonical_material_id,
        members=member_details,
        created_at=g.created_at,
        updated_at=g.updated_at
    )
