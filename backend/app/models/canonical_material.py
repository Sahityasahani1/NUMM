import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import CNMCLifecycleStatus
from app.models.common import get_utc_now

class CanonicalMaterial(Base):
    __tablename__ = "canonical_material"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cnmc = Column(String(50), unique=True, nullable=False, index=True)
    canonical_description = Column(Text, nullable=False)
    canonical_attributes = Column(Text, nullable=True)
    category_code = Column(String(50), nullable=True, index=True)
    unspsc_code = Column(String(50), nullable=True, index=True)
    status = Column(SQLEnum(CNMCLifecycleStatus), default=CNMCLifecycleStatus.PROPOSED, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    equivalence_groups = relationship("EquivalenceGroup", back_populates="canonical_material")
    mappings = relationship("CPSEMapping", back_populates="canonical_material")
