import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import MappingStatus, RationalizationAction, MigrationStatus
from app.models.common import get_utc_now

class CPSEMapping(Base):
    __tablename__ = "cpse_mapping"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cpse_material_id = Column(String(36), ForeignKey("cpse_material.id"), nullable=False)
    canonical_material_id = Column(String(36), ForeignKey("canonical_material.id"), nullable=True)
    equivalence_group_id = Column(String(36), ForeignKey("equivalence_group.id"), nullable=True)
    mapping_status = Column(SQLEnum(MappingStatus), default=MappingStatus.PROPOSED, nullable=False)
    rationalization_action = Column(SQLEnum(RationalizationAction), default=RationalizationAction.MAP, nullable=False)
    effective_from = Column(DateTime, default=get_utc_now, nullable=False)
    effective_to = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    cpse_material = relationship("CPSEMaterial", back_populates="mappings")
    canonical_material = relationship("CanonicalMaterial", back_populates="mappings")
    equivalence_group = relationship("EquivalenceGroup", back_populates="mappings")
    migration_records = relationship("MigrationRecord", back_populates="mapping", cascade="all, delete-orphan")

class MigrationRecord(Base):
    __tablename__ = "migration_record"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mapping_id = Column(String(36), ForeignKey("cpse_mapping.id"), nullable=False)
    source_material_code = Column(String(100), nullable=False)
    target_cnmc = Column(String(50), nullable=False)
    action = Column(SQLEnum(RationalizationAction), nullable=False)
    sap_payload = Column(Text, nullable=False)
    validation_status = Column(String(50), default="VALIDATED", nullable=False)
    migration_status = Column(SQLEnum(MigrationStatus), default=MigrationStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    mapping = relationship("CPSEMapping", back_populates="migration_records")
