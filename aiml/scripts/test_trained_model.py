"""
scripts/test_trained_model.py
-----------------------------
Quick verification script to evaluate the fine-tuned custom material embedder
against equivalent vs non-equivalent industrial items.
"""

from sentence_transformers import SentenceTransformer
import numpy as np

def main():
    model_path = "backend/models/custom-material-embedder"
    print(f"Loading custom fine-tuned model from: {model_path}...")
    model = SentenceTransformer(model_path)

    samples = [
        # Anchor
        "BALL VALVE 2 INCH 150# ASTM A105 RF",
        # Equivalent (Positive)
        "VALVE BALL 2IN 150 LB CS A105 RAISED FACE API 6D",
        # Discrepant Rating (Hard Negative - 600# vs 150#)
        "BALL VALVE 2 INCH 600# ASTM A105 RF",
        # Completely different material (Gate Valve)
        "GATE VALVE 6 INCH 300# ASTM A216 WCB"
    ]

    embs = model.encode(samples, normalize_embeddings=True)

    sim_identical = float(np.dot(embs[0], embs[1]))
    sim_rating_conflict = float(np.dot(embs[0], embs[2]))
    sim_unrelated = float(np.dot(embs[0], embs[3]))

    print("==================================================================")
    print("           FINE-TUNED EMBEDDING MODEL EVALUATION                  ")
    print("==================================================================")
    print(f"Anchor:               '{samples[0]}'")
    print(f"Equivalent Positive:  '{samples[1]}' -> Cosine Similarity: {sim_identical:.4f} (Expected > 0.85)")
    print(f"Pressure Conflict:    '{samples[2]}' -> Cosine Similarity: {sim_rating_conflict:.4f} (Expected < 0.70)")
    print(f"Different Commodity:  '{samples[3]}' -> Cosine Similarity: {sim_unrelated:.4f} (Expected < 0.40)")
    print("==================================================================")

if __name__ == "__main__":
    main()
