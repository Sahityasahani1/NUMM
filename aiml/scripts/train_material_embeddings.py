"""
scripts/train_material_embeddings.py
-----------------------------------
Fine-tunes a SentenceTransformer bi-encoder on industrial material descriptions
using CosineSimilarityLoss on labeled CSV pairs (text_a, text_b, label) or
MultipleNegativesRankingLoss (MNRL) on JSONL triplets (Anchor, Positive, Hard Negative).

Usage:
  # Train on CSV dataset:
  python scripts/train_material_embeddings.py --data data/training/material_pairs.csv --epochs 2 --batch-size 32

  # Fast preview test (1000 samples):
  python scripts/train_material_embeddings.py --data data/training/material_pairs.csv --limit 1000 --epochs 1
"""

import os
import sys
import csv
import json
import argparse
from typing import List, Tuple


def load_csv_pairs(file_path: str, max_samples: int = None):
    from sentence_transformers import InputExample

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at {file_path}. Run `python scripts/generate_training_dataset.py` first.")

    examples = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            t_a = (row.get("text_a") or "").strip()
            t_b = (row.get("text_b") or "").strip()
            label_val = float(row.get("label", 0.0))
            if t_a and t_b:
                examples.append(InputExample(texts=[t_a, t_b], label=label_val))
                if max_samples and len(examples) >= max_samples:
                    break

    return examples


def load_triplets(file_path: str, max_samples: int = None):
    from sentence_transformers import InputExample

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at {file_path}. Run `python scripts/generate_training_dataset.py` first.")

    examples = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            examples.append(InputExample(texts=[item["anchor"], item["positive"], item["negative"]]))
            if max_samples and len(examples) >= max_samples:
                break

    return examples


def main():
    parser = argparse.ArgumentParser(description="Fine-tune embedding model for industrial materials")
    parser.add_argument("--data", type=str, default="data/training/material_pairs.csv", help="Path to training CSV or JSONL dataset")
    parser.add_argument("--base-model", type=str, default="all-MiniLM-L6-v2", help="Base HuggingFace model")
    parser.add_argument("--epochs", type=int, default=2, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=2e-5, help="Learning rate")
    parser.add_argument("--limit", type=int, default=None, help="Optional sample limit for quick training")
    parser.add_argument("--output-dir", type=str, default="backend/models/custom-material-embedder", help="Save directory")
    args = parser.parse_args()

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_file = os.path.isabs(args.data) and args.data or os.path.join(project_root, args.data)
    save_path = os.path.isabs(args.output_dir) and args.output_dir or os.path.join(project_root, args.output_dir)

    import torch
    from sentence_transformers import SentenceTransformer, losses, evaluation
    from torch.utils.data import DataLoader

    print("==================================================================")
    print("      NUMM Embedding Model Fine-Tuning Pipeline                   ")
    print("==================================================================")
    print(f"  * Base Model:       {args.base_model}")
    print(f"  * Training Data:    {data_file}")
    print(f"  * Target Output:    {save_path}")
    print(f"  * Epochs:           {args.epochs}")
    print(f"  * Batch Size:       {args.batch_size}")
    print(f"  * Sample Limit:     {args.limit or 'All records'}")
    print(f"  * Device:           {'cuda' if torch.cuda.is_available() else 'cpu'}")
    print("==================================================================")

    # 1. Load Data
    is_csv = data_file.lower().endswith(".csv")
    print(f"[*] Loading dataset ({'CSV Pairs' if is_csv else 'JSONL Triplets'})...")

    if is_csv:
        samples = load_csv_pairs(data_file, max_samples=args.limit)
    else:
        samples = load_triplets(data_file, max_samples=args.limit)

    print(f"[+] Loaded {len(samples)} valid training samples.")

    # 2. Split into Train / Validation (85/15)
    split_idx = int(len(samples) * 0.85)
    train_data = samples[:split_idx]
    val_data = samples[split_idx:]
    print(f"[+] Train Split: {len(train_data)} | Validation Split: {len(val_data)}")

    # 3. Initialize Model
    print(f"[*] Initializing base model '{args.base_model}'...")
    model = SentenceTransformer(args.base_model)

    # 4. DataLoader & Loss Selection
    train_dataloader = DataLoader(train_data, shuffle=True, batch_size=args.batch_size)

    evaluator = None
    if is_csv:
        # CosineSimilarityLoss learns relative vector distance from continuous labels (1.0 vs 0.0)
        train_loss = losses.CosineSimilarityLoss(model=model)
        val_sentences1 = [ex.texts[0] for ex in val_data]
        val_sentences2 = [ex.texts[1] for ex in val_data]
        val_scores = [float(ex.label) for ex in val_data]
        evaluator = evaluation.EmbeddingSimilarityEvaluator(
            val_sentences1, val_sentences2, val_scores,
            name="industrial-mro-val"
        )
    else:
        # MultipleNegativesRankingLoss for triplets
        train_loss = losses.MultipleNegativesRankingLoss(model=model)

    # 5. Fine-Tuning Loop
    warmup_steps = max(10, int(len(train_dataloader) * args.epochs * 0.1))
    print(f"[*] Starting fine-tuning for {args.epochs} epochs ({warmup_steps} warmup steps)...")

    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        evaluator=evaluator,
        epochs=args.epochs,
        evaluation_steps=len(train_dataloader) // 2 if evaluator and len(train_dataloader) >= 4 else 0,
        warmup_steps=warmup_steps,
        show_progress_bar=True,
        output_path=save_path
    )

    print("==================================================================")
    print(f"[SUCCESS] Fine-tuned model saved successfully to:")
    print(f"          {save_path}")
    print("==================================================================")
    print("To activate this model in NUMM platform:")
    print("1. Open `backend/app/core/config.py`")
    print(f"2. Set: EMBEDDING_MODEL_NAME = '{save_path}'")
    print("3. Restart: `python run.py`")
    print("==================================================================")


if __name__ == "__main__":
    main()
