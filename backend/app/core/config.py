import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "National Unified Material Master Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./national_material_master.db")
    
    CNMC_PREFIX: str = "CNMC"
    CNMC_SEQUENCE_PADDING: int = 5
    
    MATCHING_SEMANTIC_WEIGHT: float = 0.35
    MATCHING_LEXICAL_WEIGHT: float = 0.25
    MATCHING_ATTRIBUTE_WEIGHT: float = 0.30
    MATCHING_UOM_WEIGHT: float = 0.10
    
    IDENTICAL_THRESHOLD: float = 0.85
    NEAR_DUPLICATE_THRESHOLD: float = 0.65
    RELATED_THRESHOLD: float = 0.40
    
    RULE_VERSION: str = "v4.0.0"
    MODEL_VERSION: str = "all-MiniLM-L6-v2-faiss-v2.0"
    
    # Vector Search & Semantic Embedding Configuration
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    FAISS_TOP_K_CANDIDATES: int = 10
    ENABLE_FAISS_KNN: bool = True

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
