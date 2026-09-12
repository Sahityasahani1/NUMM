"""
National Unified Material Master (NUMM) · Two-Stage Hybrid Neural Retrieval
Combines Dense Semantic Vectors (SentenceTransformers + FAISS IndexFlatIP) with
Sparse Lexical Search (BM25Okapi) using Reciprocal Rank Fusion (RRF), with
disk serialization for zero-loss server reboots.
"""

import os
import json
import math
import logging
import threading
from collections import Counter
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from app.core.config import settings

logger = logging.getLogger("vector_search")

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    HAS_FAISS_TRANSFORMERS = True
except ImportError:
    HAS_FAISS_TRANSFORMERS = False


class BM25Okapi:
    """
    Pure-Python BM25Okapi implementation for industrial alphanumeric codes,
    part numbers, imperial fractions, and OEM references.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = 0
        self.avgdl = 0.0
        self.doc_freqs: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_len: List[int] = []
        self.docs: List[List[str]] = []

    def tokenize(self, text: str) -> List[str]:
        # Keeps alphanumeric, fractions, and symbols like #, ", /
        return [w for w in text.upper().replace("-", " ").replace("_", " ").split() if len(w) > 0]

    def fit(self, texts: List[str]):
        self.corpus_size = len(texts)
        if self.corpus_size == 0:
            return

        self.docs = [self.tokenize(t) for t in texts]
        self.doc_len = [len(d) for d in self.docs]
        self.avgdl = sum(self.doc_len) / self.corpus_size if self.corpus_size > 0 else 1.0

        # Document frequencies
        df: Dict[str, int] = Counter()
        for doc in self.docs:
            for term in set(doc):
                df[term] += 1
        self.doc_freqs = dict(df)

        # Precompute Lucene/Okapi standard IDF
        self.idf = {}
        for term, freq in self.doc_freqs.items():
            self.idf[term] = math.log(1.0 + (self.corpus_size - freq + 0.5) / (freq + 0.5))

    def score(self, query_terms: List[str], doc_idx: int) -> float:
        score = 0.0
        doc = self.docs[doc_idx]
        dlen = self.doc_len[doc_idx]
        tf_map = Counter(doc)

        for term in query_terms:
            if term not in tf_map:
                continue
            tf = tf_map[term]
            idf = self.idf.get(term, 0.0)
            numerator = tf * (self.k1 + 1.0)
            denominator = tf + self.k1 * (1.0 - self.b + self.b * (dlen / self.avgdl))
            score += idf * (numerator / denominator)
        return score

    def search(self, query: str, top_k: int = 10) -> List[Tuple[int, float]]:
        if not query or self.corpus_size == 0:
            return []
        query_terms = self.tokenize(query)
        if not query_terms:
            return []

        scores = [self.score(query_terms, idx) for idx in range(self.corpus_size)]
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(int(i), float(scores[i])) for i in top_indices if scores[i] > 0.0]


class VectorSearchService:
    _instance: Optional["VectorSearchService"] = None
    _lock: threading.Lock = threading.Lock()
    DEFAULT_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "vector_index"))

    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.dimension = settings.EMBEDDING_DIMENSION
        self.has_neural = HAS_FAISS_TRANSFORMERS
        self.model = None
        self._rw_lock = threading.Lock()
        
        self.id_map: Dict[int, str] = {}
        self.reverse_map: Dict[str, int] = {}
        self.indexed_texts: List[str] = []
        self.bm25 = BM25Okapi()

        if self.has_neural:
            try:
                self.model = SentenceTransformer(self.model_name)
                self.index = faiss.IndexFlatIP(self.dimension)
            except Exception as e:
                logger.warning(f"Failed to initialize SentenceTransformer/FAISS: {e}. Falling back to n-gram vectors.")
                self.has_neural = False

        if not self.has_neural:
            self.vectors: Optional[np.ndarray] = None

        # Auto-load existing persisted vector index if available on disk
        self.load_index()

    @classmethod
    def get_instance(cls) -> "VectorSearchService":
        with cls._lock:
            if cls._instance is None:
                cls._instance = VectorSearchService()
            return cls._instance

    def _pseudo_vectorize(self, text: str) -> np.ndarray:
        """Lightweight 384-d deterministic character n-gram hash vector normalized to unit length."""
        v = np.zeros(self.dimension, dtype=np.float32)
        words = str(text).lower().split()
        for i, w in enumerate(words):
            h = hash(w) % self.dimension
            v[h] += 1.0 + (1.0 / (i + 1))
            for k in range(len(w) - 2):
                tri = hash(w[k:k+3]) % self.dimension
                v[tri] += 0.5
        norm = np.linalg.norm(v)
        if norm > 0:
            v /= norm
        return v

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)
        clean_texts = [str(t) if t else "" for t in texts]

        if self.has_neural and self.model:
            try:
                embeddings = self.model.encode(
                    clean_texts,
                    normalize_embeddings=True,
                    show_progress_bar=False
                )
                return np.array(embeddings, dtype=np.float32)
            except Exception:
                pass

        # Fallback to pseudo-vectorizer
        embs = np.array([self._pseudo_vectorize(t) for t in clean_texts], dtype=np.float32)
        return embs

    def calculate_pairwise_similarity(self, text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0
        embs = self.generate_embeddings([text1, text2])
        sim = float(np.dot(embs[0], embs[1]))
        return max(0.0, min(1.0, round(sim, 4)))

    def clear_index(self):
        with self._rw_lock:
            if self.has_neural and hasattr(self, "index"):
                self.index = faiss.IndexFlatIP(self.dimension)
            self.id_map.clear()
            self.reverse_map.clear()
            self.indexed_texts.clear()
            self.bm25 = BM25Okapi()
            self.vectors = None

    def index_materials(self, materials: List[Dict[str, Any]], persist: bool = True):
        if not materials:
            return

        with self._rw_lock:
            new_materials = [m for m in materials if m["id"] not in self.reverse_map]
            if not new_materials:
                return

            texts = [m.get("text", "") for m in new_materials]
            embs = self.generate_embeddings(texts)

            if self.has_neural and hasattr(self, "index"):
                start_idx = self.index.ntotal
                self.index.add(embs)
            else:
                start_idx = len(self.indexed_texts)
                if self.vectors is None:
                    self.vectors = embs
                else:
                    self.vectors = np.vstack([self.vectors, embs])

            for offset, m in enumerate(new_materials):
                curr_idx = start_idx + offset
                m_id = m["id"]
                self.id_map[curr_idx] = m_id
                self.reverse_map[m_id] = curr_idx
                self.indexed_texts.append(m.get("text", ""))

            # Auto-upgrade to HNSW index when corpus scale reaches 2,000 items (Pillar 1 & 2)
            if self.has_neural and hasattr(self, "index") and self.index.ntotal >= 2000 and not isinstance(self.index, faiss.IndexHNSWFlat):
                self._convert_to_hnsw()

            # Update BM25 index over all indexed descriptions
            self.bm25.fit(self.indexed_texts)

        if persist:
            self.save_index()

    def _convert_to_hnsw(self, M: int = 32, ef_construction: int = 64, ef_search: int = 32):
        """Converts internal Flat index to Graph-based HNSW Flat index for sub-linear O(log N) KNN search."""
        try:
            embs = self.generate_embeddings(self.indexed_texts)
            hnsw_index = faiss.IndexHNSWFlat(self.dimension, M, faiss.METRIC_INNER_PRODUCT)
            hnsw_index.hnsw.efConstruction = ef_construction
            hnsw_index.hnsw.efSearch = ef_search
            hnsw_index.add(embs)
            self.index = hnsw_index
            logger.info(f"Successfully upgraded FAISS index to IndexHNSWFlat (M={M}, N={len(self.indexed_texts)})")
        except Exception as e:
            logger.warning(f"Failed to upgrade to IndexHNSWFlat: {e}")

    def upgrade_to_hnsw(self, M: int = 32, ef_construction: int = 64, ef_search: int = 32):
        """Public API to manually trigger HNSW index transition."""
        with self._rw_lock:
            if self.has_neural and hasattr(self, "index"):
                self._convert_to_hnsw(M, ef_construction, ef_search)

    def build_or_update_index(self, texts: List[str], metadata: Optional[List[Dict[str, Any]]] = None):
        """
        API Compatibility Bridge:
        Allows routers (e.g. cpse.py sync) to index raw texts with optional metadata dicts.
        """
        materials = []
        for i, text in enumerate(texts):
            meta = metadata[i] if (metadata and i < len(metadata)) else {}
            mat_id = meta.get("id") or f"DYNAMIC-{i}"
            materials.append({"id": mat_id, "text": text})
        self.index_materials(materials)

    def retrieve_candidates(self, query_text: str, k: int = 10) -> List[Tuple[str, float]]:
        """
        Two-Stage Hybrid Search: Dense Vector KNN + Sparse BM25 combined via Reciprocal Rank Fusion (RRF).
        """
        if not query_text:
            return []

        with self._rw_lock:
            total = self.index.ntotal if (self.has_neural and hasattr(self, "index")) else len(self.indexed_texts)
            if total == 0:
                return []

            candidate_limit = min(k * 2, total)
            
            # --- 1. Dense Semantic Vector Retrieval ---
            dense_ranks: Dict[str, int] = {}
            dense_scores: Dict[str, float] = {}

            query_emb = self.generate_embeddings([query_text])
            if self.has_neural and hasattr(self, "index"):
                if hasattr(self.index, "hnsw"):
                    self.index.hnsw.efSearch = max(32, k * 2)
                D, I = self.index.search(query_emb, candidate_limit)
                for rank, (score, idx) in enumerate(zip(D[0], I[0])):
                    if idx != -1 and idx in self.id_map:
                        m_id = self.id_map[idx]
                        dense_ranks[m_id] = rank + 1
                        dense_scores[m_id] = float(score)
            else:
                sims = np.dot(self.vectors, query_emb[0])
                top_indices = np.argsort(sims)[::-1][:candidate_limit]
                for rank, idx in enumerate(top_indices):
                    if idx in self.id_map:
                        m_id = self.id_map[idx]
                        dense_ranks[m_id] = rank + 1
                        dense_scores[m_id] = float(sims[idx])

            # --- 2. Sparse Lexical BM25 Retrieval ---
            bm25_ranks: Dict[str, int] = {}
            bm25_results = self.bm25.search(query_text, top_k=candidate_limit)
            for rank, (idx, _) in enumerate(bm25_results):
                if idx in self.id_map:
                    m_id = self.id_map[idx]
                    bm25_ranks[m_id] = rank + 1

            # --- 3. Reciprocal Rank Fusion (RRF) ---
            all_candidate_ids = set(dense_ranks.keys()) | set(bm25_ranks.keys())
            rrf_scores: List[Tuple[str, float]] = []

            for m_id in all_candidate_ids:
                r_dense = dense_ranks.get(m_id, 1000)
                r_bm25 = bm25_ranks.get(m_id, 1000)
                # Standard RRF constant k=60
                rrf = (1.0 / (60.0 + r_dense)) + (1.0 / (60.0 + r_bm25))
                # Calibrated hybrid confidence score combining dense semantic and sparse BM25
                dense_base = dense_scores.get(m_id, 0.0)
                bm25_base = 0.65 if m_id in bm25_ranks else 0.0
                if dense_base > 0 and bm25_base > 0:
                    composite_retrieval_score = min(1.0, round(max(dense_base, 0.5 * dense_base + 0.5 * bm25_base + 0.08), 4))
                elif dense_base > 0:
                    composite_retrieval_score = round(dense_base, 4)
                else:
                    composite_retrieval_score = round(bm25_base, 4)
                rrf_scores.append((m_id, composite_retrieval_score, rrf))

            # Sort primarily by RRF rank fusion, returning normalized composite score
            rrf_scores.sort(key=lambda x: x[2], reverse=True)
            return [(m_id, score) for m_id, score, _ in rrf_scores[:k]]

    def save_index(self, storage_dir: Optional[str] = None):
        """Serializes FAISS vector index and metadata mapping to disk."""
        target_dir = storage_dir or self.DEFAULT_STORAGE_DIR
        try:
            os.makedirs(target_dir, exist_ok=True)
            with self._rw_lock:
                # 1. Save FAISS index
                if self.has_neural and hasattr(self, "index") and self.index.ntotal > 0:
                    faiss_path = os.path.join(target_dir, "faiss_index.bin")
                    faiss.write_index(self.index, faiss_path)

                # 2. Save metadata & texts
                meta_path = os.path.join(target_dir, "vectors_meta.json")
                meta_data = {
                    "id_map": {str(k): v for k, v in self.id_map.items()},
                    "reverse_map": self.reverse_map,
                    "indexed_texts": self.indexed_texts
                }
                with open(meta_path, "w", encoding="utf-8") as f:
                    json.dump(meta_data, f)

                # 3. Save fallback numpy array if present
                if not self.has_neural and self.vectors is not None:
                    npy_path = os.path.join(target_dir, "fallback_vectors.npy")
                    np.save(npy_path, self.vectors)

                logger.info(f"Vector search index persisted successfully to {target_dir}")
        except Exception as e:
            logger.warning(f"Failed to persist vector index to disk: {e}")

    def load_index(self, storage_dir: Optional[str] = None) -> bool:
        """Loads serialized FAISS vector index and metadata mapping from disk."""
        target_dir = storage_dir or self.DEFAULT_STORAGE_DIR
        meta_path = os.path.join(target_dir, "vectors_meta.json")
        faiss_path = os.path.join(target_dir, "faiss_index.bin")

        if not os.path.exists(meta_path):
            return False

        try:
            with self._rw_lock:
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta_data = json.load(f)
                
                self.id_map = {int(k): v for k, v in meta_data.get("id_map", {}).items()}
                self.reverse_map = meta_data.get("reverse_map", {})
                self.indexed_texts = meta_data.get("indexed_texts", [])

                if self.has_neural and os.path.exists(faiss_path):
                    self.index = faiss.read_index(faiss_path)
                elif not self.has_neural:
                    npy_path = os.path.join(target_dir, "fallback_vectors.npy")
                    if os.path.exists(npy_path):
                        self.vectors = np.load(npy_path)

                # Rebuild BM25 index
                if self.indexed_texts:
                    self.bm25.fit(self.indexed_texts)

                logger.info(f"Loaded {len(self.indexed_texts)} vectors from {target_dir}")
                return True
        except Exception as e:
            logger.warning(f"Failed to load vector index from disk: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        with self._rw_lock:
            total = self.index.ntotal if (self.has_neural and hasattr(self, "index")) else len(self.indexed_texts)
            idx_name = f"faiss.{type(self.index).__name__}" if (self.has_neural and hasattr(self, "index")) else "numpy.CosineMatrix"
            return {
                "model_name": self.model_name,
                "dimension": self.dimension,
                "total_indexed_vectors": total,
                "index_type": idx_name,
                "retrieval_pipeline": f"Two-Stage Hybrid ({idx_name} + BM25Okapi via RRF)",
                "similarity_metric": "Cosine Similarity (Normalized Dot Product)",
                "engine": f"Two-Stage Hybrid ({idx_name} + BM25Okapi)",
                "disk_persisted": os.path.exists(os.path.join(self.DEFAULT_STORAGE_DIR, "vectors_meta.json"))
            }
