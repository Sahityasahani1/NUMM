import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base
from app.models.common import get_utc_now

class AuditEvent(Base):
    __tablename__ = "audit_event"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor = Column(String(100), nullable=False, default="DATA_STEWARD")
    action = Column(String(100), nullable=False)
    object_type = Column(String(50), nullable=False)
    object_id = Column(String(50), nullable=False)
    rule_version = Column(String(50), nullable=True)
    model_version = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)

class ReviewDecision(Base):
    __tablename__ = "review_decision"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    object_type = Column(String(50), nullable=False)
    object_id = Column(String(50), nullable=False)
    actor = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    before_json = Column(Text, nullable=True)
    after_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)
