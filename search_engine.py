import sqlite3
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from gemini_helper import parse_query_dimensions
from collections import Counter
import re

# Đường dẫn CSDL phải khớp với tệp vectorizer.py
DB_PATH = 'supplements.db'
TABLE_NAME = 'supplements'
model = SentenceTransformer('all-MiniLM-L6-v2')


class SupplementSearchEngine:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self._load_data()

    def _load_data(self):
        self.cursor.execute(f"SELECT id, embedding FROM {TABLE_NAME}")
        rows = self.cursor.fetchall()
        self.data_ids = []
        self.embeddings = []
        for _id, embedding in rows:
            self.data_ids.append(_id)
            self.embeddings.append(pickle.loads(embedding))
        self.embeddings = np.array(self.embeddings)

    def search(self, query, top_k=10) -> list[dict]:
        query_embedding = model.encode(query)
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        top_indices = similarities.argsort()[-top_k:][::-1]
        top_ids = [self.data_ids[idx] for idx in top_indices]

        # Lấy thông tin chi tiết của sản phẩm từ CSDL
        # Các cột phải khớp với bảng 'supplements'
        placeholders = ','.join('?' for _ in top_ids)
        self.cursor.execute(f"""
            SELECT id, product_name, category, primary_benefit, price_usd, weekly_sales
            FROM {TABLE_NAME}
            WHERE id IN ({placeholders})
        """, top_ids)

        # Sắp xếp kết quả theo thứ tự của top_ids để giữ nguyên độ tương đồng
        id_to_row = {row[0]: row for row in self.cursor.fetchall()}
        results = []
        for _id in top_ids:
            row = id_to_row.get(_id)
            if row:
                results.append({
                    "id": row[0],
                    "product_name": row[1],
                    "category": row[2],
                    "primary_benefit": row[3],
                    "price_usd": row[4],
                    "weekly_sales": row[5]
                })
        return results

    def recommend_keywords(self, query: str, num_keywords: int = 5) -> list[str]:
        """Return recommended keywords extracted from top search results."""
        # Lấy từ khóa gợi ý từ 'primary_benefit'
        results = self.search(query, top_k=20)
        text = " ".join([r.get("primary_benefit", "") or "" for r in results])
        tokens = re.findall(r"[A-Za-z]+", text.lower())
        stopwords = {
            "and", "or", "of", "the", "to", "with", "for", "in", "a", "an", "is", "helps", "support"
        }
        freq = Counter(t for t in tokens if t not in stopwords and len(t) > 2)
        return [word for word, _ in freq.most_common(num_keywords)]

    def search_with_llm(self, question, top_k=6):
        # Sử dụng LLM để phân tích câu hỏi (tùy chọn, có thể giữ nguyên)
        parsed_query = parse_query_dimensions(question)
        print(f"🔍 Parsed Query: {parsed_query}")

        # Tìm kiếm dựa trên câu hỏi đã phân tích
        results = self.search(parsed_query, top_k)
        print(f"🔍 Search Results: {results}")

        # Không cần xử lý thêm với translate_results vì dữ liệu đã phù hợp
        return results