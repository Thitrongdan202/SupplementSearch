import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from django.db import transaction

from .models import MedicinesDetail  # noqa: E402
from utils.gemini_helper import (
    parse_query_dimensions,
    summarize_results,
    translate_results,
)

model = SentenceTransformer("all-MiniLM-L6-v2")


class MedicineSearchEngine:
    """Vector‑based semantic search over :class:`MedicineDetail` records using Django ORM.

    This is a drop‑in replacement for the old SQLite‑cursor implementation.
    The public API (`search`, `search_with_llm`) remains unchanged.
    """

    def __init__(self):
        # ⚠️ No explicit DB connection/cursor — Django handles it.
        self._load_data()

    # ---------------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------------
    def _load_data(self):
        """Load all (id, embedding) pairs from the DB into memory."""
        rows = (
            MedicinesDetail.objects
            .only("id", "embedding")
            .values_list("id", "embedding")
        )
        ids, embeddings = [], []
        for _id, emb_blob in rows:
            # `embedding` is stored as a pickled numpy array (BinaryField)
            if isinstance(emb_blob, (bytes, bytearray)):
                emb_vec = pickle.loads(emb_blob)
            else:
                emb_vec = emb_blob  # already array / list
            ids.append(_id)
            embeddings.append(emb_vec)
        self.ids = np.array(ids)
        self.embeddings = np.vstack(embeddings).astype(np.float32)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def embed_query(self, query_dict: dict[str, str | None]) -> np.ndarray:
        """Return the sentence‑transformer embedding of the *combined* query dict."""
        if isinstance(query_dict, dict):
            _query = "; ".join(f"{k}: {v}" for k, v in query_dict.items() if v)
        else:
            _query = query_dict
        return model.encode(_query, convert_to_numpy=True)

    def search(self, query_dict: dict[str, str | None], top_k: int = 6):
        """Return top‑*k* :class:`MedicineDetail` rows most similar to *query_dict*."""
        q_embedding = self.embed_query(query_dict)
        sims = cosine_similarity(q_embedding.reshape(1, -1), self.embeddings)[0]
        top_indices = sims.argsort()[-top_k:][::-1]
        top_ids = list(map(int, self.ids[top_indices]))

        # Query DB via ORM (no raw SQL)
        medicines = (
            MedicinesDetail.objects
            .filter(id__in=top_ids)
            .annotate()
            .values(
                "id",
                "name",
                "composition",
                "uses",
                "side_effects",
                "image_url",
                "manufacturer",
                "excellent_review",
                "average_review",
                "poor_review",
            )
        )
        # Preserve similarity ranking order
        order = {mid: idx for idx, mid in enumerate(top_ids)}
        ordered_results = sorted(medicines, key=lambda m: order[m["id"]])
        return ordered_results

    # ------------------------------------------------------------------
    # Convenience wrappers
    # ------------------------------------------------------------------
    def process_results(self, results):
        """Translate *uses* & *side_effects* to Vietnamese via Gemini helper."""
        _result_trans = [{"id": res["id"], "uses": res["uses"], "side_effects": res["side_effects"]} for res in results]
        translated = translate_results(_result_trans)
        for res, trans in zip(results, translated, strict=False):
            res["uses"] = trans["uses"]
            res["side_effects"] = trans["side_effects"]
        return results

    def search_with_llm(self, question: str, top_k: int = 6):
        """Chat‑style helper: parse *question* dimensions, run `search`, translate."""
        print("🔍 Question:", question)
        parsed_query = parse_query_dimensions(question)
        print("🔍 Parsed query:", parsed_query)
        results = self.search(parsed_query, top_k)
        print("🔍 Search results:", results)
        results = self.process_results(results)
        print("🔍 Translated results:", results)
        return results
