from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.canonical_material import CanonicalMaterial
from app.core.config import settings

class CNMCGenerator:
    CATEGORY_PREFIXES = {
        "VALVE": "VAL",
        "BALL VALVE": "VAL",
        "GATE VALVE": "VAL",
        "GLOBE VALVE": "VAL",
        "CHECK VALVE": "VAL",
        "FLANGE": "FLG",
        "PIPE": "PIP",
        "GASKET": "GSK",
        "PUMP": "PMP",
        "BOLT": "FST",
        "FASTENER": "FST"
    }

    @classmethod
    def allocate_cnmc(cls, db: Session, noun: str = None) -> str:
        cat = "GEN"
        if noun:
            noun_clean = noun.upper().strip()
            for key, pfx in cls.CATEGORY_PREFIXES.items():
                if key in noun_clean:
                    cat = pfx
                    break
        
        year = datetime.now(timezone.utc).year
        base_prefix = f"{settings.CNMC_PREFIX}-{cat}-{year}-"
        
        existing = db.query(CanonicalMaterial.cnmc).filter(
            CanonicalMaterial.cnmc.like(f"{base_prefix}%")
        ).all()
        
        seq = 1
        if existing:
            extracted_seqs = []
            for (cnmc_val,) in existing:
                try:
                    num_part = int(cnmc_val.split("-")[-1])
                    extracted_seqs.append(num_part)
                except Exception:
                    continue
            if extracted_seqs:
                seq = max(extracted_seqs) + 1
                
        candidate = f"{base_prefix}{seq:05d}"
        
        while db.query(CanonicalMaterial).filter(CanonicalMaterial.cnmc == candidate).first():
            seq += 1
            candidate = f"{base_prefix}{seq:05d}"
            
        return candidate
