import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from app.core.database import Base
from app.models.common import get_utc_now

class TrainingTriplet(Base):
    __tablename__ = "training_triplets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    anchor_description = Column(Text, nullable=False)
    positive_description = Column(Text, nullable=False)
    negative_description = Column(Text, nullable=False)
    source_action = Column(String(50), nullable=False)
    actor = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=True)
    is_used_in_training = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
