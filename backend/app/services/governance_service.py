import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.enums import (
    RationalizationAction,
    GroupStatus,
    MappingStatus,
    CNMCLifecycleStatus,
    MigrationStatus
)
from app.models.canonical_material import CanonicalMaterial
from app.models.equivalence_group import EquivalenceGroup, EquivalenceGroupMember
from app.models.mapping import CPSEMapping, MigrationRecord
from app.models.audit import AuditEvent, ReviewDecision
from app.models.cpse_material import CPSEMaterial
from app.models.active_learning import TrainingTriplet
from app.services.cnmc_generator import CNMCGenerator
from app.services.taxonomy_service import TaxonomyService
from app.core.config import settings

class GovernanceService:
    @classmethod
    def record_audit(
        cls,
        db: Session,
        actor: str,
        action: str,
        object_type: str,
        object_id: str,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        event = AuditEvent(
            actor=actor,
            action=action,
            object_type=object_type,
            object_id=object_id,
            rule_version=settings.RULE_VERSION,
            model_version=settings.MODEL_VERSION,
            details=json.dumps(details) if details else None,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event)
        return event

    @classmethod
    def review_equivalence_group(
        cls,
        db: Session,
        group_id: str,
        actor: str,
        action: RationalizationAction,
        reason: str,
        custom_cnmc: Optional[str] = None
    ) -> Dict[str, Any]:
        group = db.query(EquivalenceGroup).filter(EquivalenceGroup.id == group_id).first()
        if not group:
            raise ValueError(f"Equivalence group {group_id} not found")

        before_state = {
            "status": group.status.value,
            "canonical_material_id": group.canonical_material_id,
            "proposed_cnmc": group.proposed_cnmc
        }

        canonical = None

        if action in [RationalizationAction.MAP, RationalizationAction.MERGE]:
            cnmc_code = custom_cnmc or group.proposed_cnmc
            
            anchor_member = db.query(EquivalenceGroupMember).filter(
                EquivalenceGroupMember.equivalence_group_id == group_id
            ).first()
            
            sample_material = db.query(CPSEMaterial).filter(
                CPSEMaterial.id == anchor_member.cpse_material_id
            ).first() if anchor_member else None
            
            if not cnmc_code:
                noun = sample_material.material_noun if sample_material else None
                cnmc_code = CNMCGenerator.allocate_cnmc(db, noun=noun)
                group.proposed_cnmc = cnmc_code

            canonical = db.query(CanonicalMaterial).filter(CanonicalMaterial.cnmc == cnmc_code).first()
            if not canonical:
                noun = sample_material.material_noun if sample_material else "MATERIAL"
                unspsc, cat_label = TaxonomyService.classify(noun)
                canonical_desc = (
                    sample_material.standardized_description or 
                    sample_material.source_description if sample_material 
                    else f"Canonical Material {cnmc_code}"
                )
                canonical = CanonicalMaterial(
                    id=str(uuid.uuid4()),
                    cnmc=cnmc_code,
                    canonical_description=canonical_desc,
                    canonical_attributes=sample_material.extracted_attributes if sample_material else "{}",
                    category_code=unspsc[:4],
                    unspsc_code=unspsc,
                    status=CNMCLifecycleStatus.APPROVED,
                    approved_by=actor,
                    approved_at=datetime.now(timezone.utc)
                )
                db.add(canonical)
                db.flush()

            group.canonical_material_id = canonical.id
            group.status = GroupStatus.APPROVED

            for member in group.members:
                cpse_mat = member.cpse_material
                existing_map = db.query(CPSEMapping).filter(
                    CPSEMapping.cpse_material_id == cpse_mat.id
                ).first()
                if not existing_map:
                    existing_map = CPSEMapping(
                        id=str(uuid.uuid4()),
                        cpse_material_id=cpse_mat.id,
                        canonical_material_id=canonical.id,
                        equivalence_group_id=group.id,
                        mapping_status=MappingStatus.APPROVED,
                        rationalization_action=action
                    )
                    db.add(existing_map)
                else:
                    existing_map.canonical_material_id = canonical.id
                    existing_map.equivalence_group_id = group.id
                    existing_map.mapping_status = MappingStatus.APPROVED
                    existing_map.rationalization_action = action
                db.flush()

                mig_rec = MigrationRecord(
                    id=str(uuid.uuid4()),
                    mapping_id=existing_map.id,
                    source_material_code=cpse_mat.source_material_code,
                    target_cnmc=canonical.cnmc,
                    action=action,
                    sap_payload=json.dumps({
                        "CPSE_ID": cpse_mat.cpse_id,
                        "SOURCE_MATERIAL_CODE": cpse_mat.source_material_code,
                        "TARGET_CNMC": canonical.cnmc,
                        "ACTION": action.value
                    }),
                    validation_status="VALIDATED",
                    migration_status=MigrationStatus.PENDING
                )
                db.add(mig_rec)

        elif action == RationalizationAction.RETAIN:
            group.status = GroupStatus.REJECTED
            for member in group.members:
                existing_map = db.query(CPSEMapping).filter(
                    CPSEMapping.cpse_material_id == member.cpse_material_id
                ).first()
                if existing_map:
                    existing_map.rationalization_action = RationalizationAction.RETAIN
                    existing_map.mapping_status = MappingStatus.REJECTED

        elif action == RationalizationAction.RETIRE:
            group.status = GroupStatus.APPROVED
            for member in group.members:
                existing_map = db.query(CPSEMapping).filter(
                    CPSEMapping.cpse_material_id == member.cpse_material_id
                ).first()
                if existing_map:
                    existing_map.rationalization_action = RationalizationAction.RETIRE

        elif action == RationalizationAction.SPLIT:
            group.status = GroupStatus.SPLIT

        elif action == RationalizationAction.REVIEW:
            group.status = GroupStatus.UNDER_REVIEW

        after_state = {
            "status": group.status.value,
            "canonical_material_id": group.canonical_material_id,
            "proposed_cnmc": group.proposed_cnmc
        }

        decision = ReviewDecision(
            object_type="EQUIVALENCE_GROUP",
            object_id=group.id,
            actor=actor,
            action=action.value,
            reason=reason,
            before_json=json.dumps(before_state),
            after_json=json.dumps(after_state),
            timestamp=datetime.now(timezone.utc)
        )
        db.add(decision)

        cls.record_audit(
            db=db,
            actor=actor,
            action=f"GROUP_REVIEW_{action.value}",
            object_type="EQUIVALENCE_GROUP",
            object_id=group.id,
            details={"reason": reason, "action": action.value, "cnmc": group.proposed_cnmc}
        )

        # Active Learning Loop: Emit labeled training triplet (Anchor, Positive, Hard Negative)
        cls.emit_active_learning_triplet(
            db=db,
            group=group,
            action=action,
            actor=actor
        )

        db.commit()
        db.refresh(group)
        return {
            "group_id": group.id,
            "status": group.status.value,
            "action": action.value,
            "cnmc": canonical.cnmc if canonical else group.proposed_cnmc,
            "decision_id": decision.id
        }

    @classmethod
    def emit_active_learning_triplet(
        cls,
        db: Session,
        group: EquivalenceGroup,
        action: RationalizationAction,
        actor: str
    ) -> Optional[TrainingTriplet]:
        members = group.members
        if not members:
            return None

        anchor_member = next((m for m in members if m.is_anchor == 1), members[0])
        m_anchor = anchor_member.cpse_material
        if not m_anchor:
            return None

        anchor_desc = m_anchor.source_description

        if action in [RationalizationAction.MAP, RationalizationAction.MERGE]:
            # Peer candidate is a non-anchor member
            peer_member = next((m for m in members if m.id != anchor_member.id and m.cpse_material), None)
            if peer_member and peer_member.cpse_material:
                positive_desc = peer_member.cpse_material.source_description
            else:
                positive_desc = m_anchor.standardized_description or anchor_desc

            # Identify a hard negative (same noun but contradictory rating or metallurgy)
            hard_neg = db.query(CPSEMaterial).filter(
                CPSEMaterial.id != m_anchor.id,
                CPSEMaterial.material_noun == m_anchor.material_noun,
                CPSEMaterial.pressure_rating != m_anchor.pressure_rating
            ).first()

            if not hard_neg:
                hard_neg = db.query(CPSEMaterial).filter(
                    CPSEMaterial.id != m_anchor.id
                ).first()

            if hard_neg:
                neg_desc = hard_neg.source_description
            else:
                # Synthetic hard negative with contradictory pressure rating
                neg_desc = anchor_desc.replace("150#", "600#").replace("150 LB", "600 LB").replace("CS", "SS 316")
                if neg_desc == anchor_desc:
                    neg_desc = f"{anchor_desc} CLASS 2500#"

            triplet = TrainingTriplet(
                id=str(uuid.uuid4()),
                anchor_description=anchor_desc,
                positive_description=positive_desc,
                negative_description=neg_desc,
                source_action=action.value,
                actor=actor,
                confidence_score=group.confidence_score
            )
            db.add(triplet)
            return triplet

        elif action in [RationalizationAction.SPLIT, RationalizationAction.RETAIN]:
            if len(members) > 1 and members[1].cpse_material:
                neg_desc = members[1].cpse_material.source_description
                positive_desc = m_anchor.standardized_description or anchor_desc
                triplet = TrainingTriplet(
                    id=str(uuid.uuid4()),
                    anchor_description=anchor_desc,
                    positive_description=positive_desc,
                    negative_description=neg_desc,
                    source_action=action.value,
                    actor=actor,
                    confidence_score=group.confidence_score
                )
                db.add(triplet)
                return triplet

        return None
