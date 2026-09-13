"""
scripts/generate_training_dataset.py
------------------------------------
Generates high-quality training datasets for fine-tuning embedding models,
rerankers, and classifiers for the National Unified Material Master (NUMM).

Outputs:
1. data/training/material_triplets.jsonl: (anchor, positive, hard_negative)
   Used with MultipleNegativesRankingLoss or TripletLoss.
2. data/training/material_pairs.csv: (text_a, text_b, label)
   Used for pair classification / CosineSimilarityLoss / Cross-Encoders.
3. data/training/governance_feedback.jsonl: Labeled pairs exported directly
   from real human steward reviews stored in SQLite.
"""

import os
import sys
import json
import csv
import random
from typing import List, Dict, Any

# Ensure backend can be imported
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.dataset_generator import IndustrialMROBenchmarkGenerator
from app.core.database import SessionLocal
from app.models.cpse_material import CPSEMaterial
from app.models.canonical_material import CanonicalMaterial
from app.models.mapping import CPSEMapping
from app.models.equivalence_group import EquivalenceGroup, EquivalenceGroupMember


def extract_governance_feedback_pairs() -> List[Dict[str, Any]]:
    """
    Extracts ground truth pairs from human steward approvals and rejections in SQLite.
    """
    db = SessionLocal()
    labeled_pairs = []
    try:
        # 1. Approved mappings (Positive Pairs: Local Source -> Canonical)
        mappings = db.query(CPSEMapping).all()
        for m in mappings:
            source = db.query(CPSEMaterial).filter(CPSEMaterial.id == m.cpse_material_id).first()
            canonical = db.query(CanonicalMaterial).filter(CanonicalMaterial.id == m.canonical_material_id).first()
            if source and canonical:
                labeled_pairs.append({
                    "text_a": source.source_description,
                    "text_b": canonical.canonical_description,
                    "label": 1.0,
                    "source": "HUMAN_STEWARD_APPROVED"
                })

        # 2. Split or Rejected Equivalence Groups (Hard Negative Pairs)
        rejected_groups = db.query(EquivalenceGroup).filter(EquivalenceGroup.status == "REJECTED").all()
        for g in rejected_groups:
            members = db.query(EquivalenceGroupMember).filter(EquivalenceGroupMember.group_id == g.id).all()
            if len(members) >= 2:
                m1 = db.query(CPSEMaterial).filter(CPSEMaterial.id == members[0].cpse_material_id).first()
                m2 = db.query(CPSEMaterial).filter(CPSEMaterial.id == members[1].cpse_material_id).first()
                if m1 and m2:
                    labeled_pairs.append({
                        "text_a": m1.source_description,
                        "text_b": m2.source_description,
                        "label": 0.0,
                        "source": "HUMAN_STEWARD_REJECTED"
                    })
    except Exception as e:
        print(f"[!] Warning: Could not query database for feedback pairs: {e}")
    finally:
        db.close()

    return labeled_pairs


def generate_synthetic_triplets(count: int = 5000) -> List[Dict[str, str]]:
    """
    Generates triplets (anchor, positive, hard_negative) based on industrial rules.
    - Anchor: Noisy CPSE ERP text (e.g. ONGC abbreviation).
    - Positive: Equivalent material text with alternative abbreviations / formatting.
    - Hard Negative: Material differing in a critical safety parameter (Pressure Rating or Material Grade).
    """
    categories = IndustrialMROBenchmarkGenerator.NOUN_CATEGORIES
    noise_map = IndustrialMROBenchmarkGenerator.ABBREVIATION_NOISE
    triplets = []

    for _ in range(count):
        cat = random.choice(categories)
        noun = cat["noun"]
        mod = random.choice(cat["modifiers"])
        size = random.choice(cat["sizes"])
        rating = random.choice(cat["ratings"])
        material = random.choice(cat["materials"])
        std = random.choice(cat["standards"])

        # Helper to apply noise
        def apply_noise(n, s, r, m):
            noisy_n = random.choice(noise_map.get(n, [n])) if random.random() < 0.7 else n
            noisy_s = random.choice(noise_map.get(s, [s])) if random.random() < 0.7 else s
            noisy_r = random.choice(noise_map.get(r, [r])) if random.random() < 0.7 else r
            noisy_m = m
            for k, opts in noise_map.items():
                if k in noisy_m and random.random() < 0.6:
                    noisy_m = noisy_m.replace(k, random.choice(opts))
            return noisy_n, noisy_s, noisy_r, noisy_m

        # 1. Anchor (Noisy style 1)
        an, asz, ar, am = apply_noise(noun, size, rating, material)
        anchor = f"{an} {asz} {ar} {am} {mod}".strip().upper()

        # 2. Positive (Equivalent concept, alternative phrasing style)
        pn, psz, pr, pm = apply_noise(noun, size, rating, material)
        patterns = [
            f"{pm} {pn}, {psz}, {pr}, {mod}, STD: {std}",
            f"{psz} {pn} {mod} {pr} {pm}",
            f"{pn} {mod} RATING: {pr} SIZE: {psz} MAT: {pm}"
        ]
        positive = random.choice(patterns).strip().upper()

        # 3. Hard Negative (Looks 90% similar, but has a CRITICAL conflict)
        if random.random() < 0.5 and len(cat["ratings"]) > 1:
            diff_ratings = [r for r in cat["ratings"] if r != rating]
            conflict_rating = random.choice(diff_ratings) if diff_ratings else "900#"
            hn, hsz, hr, hm = apply_noise(noun, size, conflict_rating, material)
            hard_neg = f"{hn} {hsz} {hr} {hm} {mod}".strip().upper()
        else:
            diff_mats = [m for m in cat["materials"] if m != material]
            conflict_mat = random.choice(diff_mats) if diff_mats else "SS 316"
            hn, hsz, hr, hm = apply_noise(noun, size, rating, conflict_mat)
            hard_neg = f"{hn} {hsz} {hr} {hm} {mod}".strip().upper()

        triplets.append({
            "anchor": anchor,
            "positive": positive,
            "negative": hard_neg
        })

    return triplets


def main():
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "training"))
    os.makedirs(output_dir, exist_ok=True)

    print("==================================================================")
    print("      NUMM Industrial Training Dataset Generator                  ")
    print("==================================================================")

    # 1. Generate Triplets
    triplet_count = 5000
    print(f"[*] Generating {triplet_count} (Anchor, Positive, Hard Negative) industrial triplets...")
    triplets = generate_synthetic_triplets(count=triplet_count)

    triplet_path = os.path.join(output_dir, "material_triplets.jsonl")
    with open(triplet_path, "w", encoding="utf-8") as f:
        for t in triplets:
            f.write(json.dumps(t) + "\n")
    print(f"[+] Saved {len(triplets)} triplets to: {triplet_path}")

    # 2. Extract Live Governance Human Steward Pairs
    print("[*] Extracting ground truth pairs from SQLite governance audit logs...")
    feedback_pairs = extract_governance_feedback_pairs()
    print(f"[+] Found {len(feedback_pairs)} human steward verified pairs.")

    # 3. Build Pair Classification Dataset (Positives + Hard Negatives)
    pairs_path = os.path.join(output_dir, "material_pairs.csv")
    print(f"[*] Compiling labeled pairs dataset into: {pairs_path}...")

    with open(pairs_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text_a", "text_b", "label", "source"])

        # Write governance pairs first
        for p in feedback_pairs:
            writer.writerow([p["text_a"], p["text_b"], p["label"], p["source"]])

        # Write synthetic pairs (both positive & negative)
        for t in triplets:
            # Positive pair
            writer.writerow([t["anchor"], t["positive"], 1.0, "SYNTHETIC_MRO_CLUSTER"])
            # Hard negative pair
            writer.writerow([t["anchor"], t["negative"], 0.0, "SYNTHETIC_CRITICAL_CONFLICT"])

    total_pairs = len(feedback_pairs) + (len(triplets) * 2)
    print(f"[+] Successfully exported {total_pairs} labeled pairs to {pairs_path}")
    print("==================================================================")
    print("Next step: Run `python scripts/train_material_embeddings.py` to train!")
    print("==================================================================")


if __name__ == "__main__":
    main()
