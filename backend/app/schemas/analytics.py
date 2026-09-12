from typing import List, Dict, Optional
from pydantic import BaseModel
from app.schemas.cpse_material import NationalAnalyticsSummary

class TimeSeriesPoint(BaseModel):
    month: str
    standardized: int
    source_ingested: int

class TimeSeriesResponse(BaseModel):
    points: List[TimeSeriesPoint]
    total_months: int
