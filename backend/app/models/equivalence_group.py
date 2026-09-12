import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import RelationshipType, GroupStatus
from app.models.common import get_utc_now

class EquivalenceGroup(Base):
    __tablename__ = "equivalence_group"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canonical_material_id = Column(String(36), ForeignKey("canonical_material.id"), nullable=True)
    relationship_type = Column(SQLEnum(RelationshipType), default=RelationshipType.NEAR_DUPLICATE, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.0)
    lexical_score = Column(Float, nullable=True)
    semantic_score = Column(Float, nullable=True)
    attribute_score = Column(Float, nullable=True)
    evidence_payload = Column(Text, nullable=True)
    status = Column(SQLEnum(GroupStatus), default=GroupStatus.PROPOSED, nullable=False)
    proposed_cnmc = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    canonical_material = relationship("CanonicalMaterial", back_populates="equivalence_groups")
    members = relationship("EquivalenceGroupMember", back_populates="equivalence_group", cascade="all, delete-orphan")
    mappings = relationship("CPSEMapping", back_populates="equivalence_group")

class EquivalenceGroupMember(Base):
    __tablename__ = "equivalence_group_member"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equivalence_group_id = Column(String(36), ForeignKey("equivalence_group.id"), nullable=False)
    cpse_material_id = Column(String(36), ForeignKey("cpse_material.id"), nullable=False)
    is_anchor = Column(Integer, default=0, nullable=False)
    evidence_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    equivalence_group = relationship("EquivalenceGroup", back_populates="members")
    cpse_material = relationship("CPSEMaterial", back_populates="group_memberships")
