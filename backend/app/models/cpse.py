from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.common import get_utc_now

class CPSE(Base):
    __tablename__ = "cpse"

    id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    materials = relationship("CPSEMaterial", back_populates="cpse", cascade="all, delete-orphan")
    procurement_records = relationship("ProcurementRecord", back_populates="cpse", cascade="all, delete-orphan")
