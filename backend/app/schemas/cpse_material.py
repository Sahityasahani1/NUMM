from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.enums import (
    RelationshipType,
    CNMCLifecycleStatus,
    GroupStatus,
    MappingStatus,
    RationalizationAction,
    MigrationStatus
)

class RowValidationError(BaseModel):
    row_number: int
    field: str
    message: str

class IngestionReport(BaseModel):
    batch_id: str
    cpse_id: str
    total_rows: int
    successful_rows: int
    failed_rows: int
    errors: List[RowValidationError]
    ingested_material_ids: List[str]

class CPSECreate(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

class CPSEResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CPSEConnectorResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    fullName: str
    sector: str
    sourceSystem: str
    totalRecords: int
    mappedRecords: int
    pendingRecords: int
    coveragePercentage: float
    status: str
    lastSync: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CPSEMappingSummaryResponse(BaseModel):
    cpse: str
    localCode: str
    localDescription: str
    relationship: str
    status: str
    lastUpdated: str
    mappedBy: Optional[str] = None

class CPSEMaterialResponse(BaseModel):
    id: str
    cpse_id: str
    source_system: str
    source_material_code: str
    source_description: str
    source_specifications: Optional[str] = None
    source_uom: str
    normalized_description: Optional[str] = None
    normalized_uom: Optional[str] = None
    material_noun: Optional[str] = None
    material_modifier: Optional[str] = None
    dimensions: Optional[str] = None
    material_grade: Optional[str] = None
    pressure_rating: Optional[str] = None
    standard: Optional[str] = None
    standardized_description: Optional[str] = None
    batch_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CanonicalMaterialResponse(BaseModel):
    id: str
    cnmc: str
    canonical_description: str
    canonical_attributes: Optional[Dict[str, Any]] = None
    category_code: Optional[str] = None
    unspsc_code: Optional[str] = None
    status: CNMCLifecycleStatus
    version: int
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    mappings: List[CPSEMappingSummaryResponse] = []

    model_config = ConfigDict(from_attributes=True)

class MemberDetailResponse(BaseModel):
    id: str
    cpse_material_id: str
    cpse_id: str
    source_material_code: str
    source_description: str
    source_uom: str
    material_noun: Optional[str] = None
    material_modifier: Optional[str] = None
    dimensions: Optional[str] = None
    material_grade: Optional[str] = None
    pressure_rating: Optional[str] = None
    standard: Optional[str] = None
    is_anchor: int

class EquivalenceGroupResponse(BaseModel):
    id: str
    relationship_type: RelationshipType
    confidence_score: float
    lexical_score: Optional[float] = None
    semantic_score: Optional[float] = None
    attribute_score: Optional[float] = None
    evidence_payload: Optional[Dict[str, Any]] = None
    status: GroupStatus
    proposed_cnmc: Optional[str] = None
    canonical_material_id: Optional[str] = None
    members: List[MemberDetailResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MappingReviewRequest(BaseModel):
    actor: str = "NATIONAL_MASTER_STEWARD"
    action: RationalizationAction
    reason: str
    custom_cnmc: Optional[str] = None

class EquivalenceReviewRequest(BaseModel):
    actor: str = "NATIONAL_MASTER_STEWARD"
    action: RationalizationAction
    reason: str
    custom_cnmc: Optional[str] = None
    target_relationship: Optional[RelationshipType] = None

class BulkEquivalenceReviewRequest(BaseModel):
    group_ids: List[str]
    actor: str = "NATIONAL_MASTER_STEWARD"
    action: RationalizationAction = RationalizationAction.MERGE
    reason: str = "Bulk approved via Review Queue"

class BulkEquivalenceReviewResponse(BaseModel):
    approved_count: int
    processed_group_ids: List[str]
    message: str

class SAPMigrationRow(BaseModel):
    CPSE_ID: str
    SOURCE_SYSTEM: str
    SOURCE_MATERIAL_CODE: str
    CNMC: str
    CANONICAL_DESCRIPTION: str
    ATTRIBUTES: str
    CLASSIFICATION: str
    MAPPING_STATUS: str
    RATIONALIZATION_ACTION: str
    VERSION: int
    EFFECTIVE_DATE: str

class AuditEventResponse(BaseModel):
    id: str
    actor: str
    action: str
    object_type: str
    object_id: str
    rule_version: Optional[str] = None
    model_version: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class NationalAnalyticsSummary(BaseModel):
    total_cpse_count: int
    total_source_materials: int
    total_canonical_cnmcs: int
    deduplication_ratio_pct: float
    total_equivalence_groups: int
    pending_reviews_count: int
    approved_mappings_count: int
    actions_breakdown: Dict[str, int]
    cpse_breakdown: Dict[str, int]
    total_spend_aggregated: float
    spend_coverage_currency: str
    estimated_synergy_savings: float = 0.0
    confidence_bands_breakdown: Dict[str, int] = {}

class LiveHarmonizeRequest(BaseModel):
    description: Optional[str] = None
    raw_description: Optional[str] = None
    specifications: Optional[str] = None
    uom: Optional[str] = "EA"

class LiveHarmonizeResponse(BaseModel):
    source_description: str
    normalized_description: str
    source_uom: str
    normalized_uom: str
    extracted_attributes: Dict[str, Any]
    standardized_description: str
    unspsc_code: str
    category_name: str
    vector_dimension: int
    vector_sample: List[float]

class LiveCompareRequest(BaseModel):
    text1: Optional[str] = None
    uom1: Optional[str] = "EA"
    text2: Optional[str] = None
    uom2: Optional[str] = "EA"
    record_a: Optional[Dict[str, Any]] = None
    record_b: Optional[Dict[str, Any]] = None

class LiveCompareResponse(BaseModel):
    text1: str
    text2: str
    tokens1: List[str]
    tokens2: List[str]
    lexical_jaccard_score: float
    semantic_vector_cosine_score: float
    attribute_match_score: float
    uom_compatibility_score: Optional[float] = 1.0
    raw_composite_score: Optional[float] = None
    composite_confidence_score: float
    relationship_type: RelationshipType
    has_critical_conflict: bool
    deterministic_safety_hazard: bool = False
    agreed_attributes: List[str]
    conflicts: List[str]
    explanation: str
    engineering_rationale: Optional[str] = None
    calibrated_probability: Optional[float] = None
    epistemic_uncertainty: Optional[float] = None
    steward_action_recommendation: Optional[str] = None

