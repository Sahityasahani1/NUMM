import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.common import get_utc_now

class ProcurementRecord(Base):
    __tablename__ = "procurement_record"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cpse_id = Column(String(50), ForeignKey("cpse.id"), nullable=False)
    cpse_material_id = Column(String(36), ForeignKey("cpse_material.id"), nullable=False)
    source_material_code = Column(String(100), nullable=False)
    fiscal_year = Column(String(20), nullable=False)
    purchase_order_number = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False, default=0.0)
    uom = Column(String(30), nullable=False)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_spend = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="INR", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    cpse = relationship("CPSE", back_populates="procurement_records")
    cpse_material = relationship("CPSEMaterial", back_populates="procurement_records")
