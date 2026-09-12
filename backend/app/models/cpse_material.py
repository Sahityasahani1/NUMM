import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.common import get_utc_now

class CPSEMaterial(Base):
    __tablename__ = "cpse_material"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cpse_id = Column(String(50), ForeignKey("cpse.id"), nullable=False)
    source_system = Column(String(50), nullable=False, default="SAP_ECC")
    source_material_code = Column(String(100), nullable=False, index=True)
    source_description = Column(Text, nullable=False)
    source_specifications = Column(Text, nullable=True)
    source_uom = Column(String(30), nullable=False)
    raw_payload = Column(Text, nullable=False)
    batch_id = Column(String(36), nullable=False, index=True)
    
    normalized_description = Column(Text, nullable=True)
    normalized_uom = Column(String(30), nullable=True)
    material_noun = Column(String(100), nullable=True, index=True)
    material_modifier = Column(String(100), nullable=True)
    dimensions = Column(String(100), nullable=True)
    material_grade = Column(String(100), nullable=True)
    pressure_rating = Column(String(100), nullable=True)
    standard = Column(String(100), nullable=True)
    extracted_attributes = Column(Text, nullable=True)
    standardized_description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    cpse = relationship("CPSE", back_populates="materials")
    group_memberships = relationship("EquivalenceGroupMember", back_populates="cpse_material", cascade="all, delete-orphan")
    mappings = relationship("CPSEMapping", back_populates="cpse_material", cascade="all, delete-orphan")
    procurement_records = relationship("ProcurementRecord", back_populates="cpse_material", cascade="all, delete-orphan")
