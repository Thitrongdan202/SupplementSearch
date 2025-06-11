import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_KEY"))

def parse_query_dimensions(question: str) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
Input: Một câu hỏi bằng tiếng Việt về thực phẩm bổ sung.
Output:
• Trích xuất các thuộc tính hoặc chủ đề chính từ câu hỏi để tạo ra một chuỗi tìm kiếm hiệu quả bằng tiếng Anh.
• Không suy diễn thông tin không có trong câu hỏi.
Ví dụ:
Input: “Sản phẩm nào thuộc danh mục Vitamin?”
Output: Vitamins category
Input: “Sản phẩm nào bán chạy nhất?”
Output: best selling supplements
Input: “Tôi muốn tìm sản phẩm bổ sung Kẽm”
Output: Zinc supplement
Câu hỏi: {question}
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return question # Trả về câu hỏi gốc nếu có lỗi