import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_KEY"))

def parse_query_dimensions(question: str) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    # Cập nhật các thuộc tính và ví dụ
    prompt = f"""
Input: Một câu hỏi bằng tiếng Việt về thực phẩm bổ sung.
Output:
• Trích xuất các thuộc tính liên quan đến sản phẩm để tìm kiếm theo dữ liệu sau: Product Name, Category, Price, Units Sold.
• Mỗi thuộc tính ghi rõ tên bằng tiếng Anh chuẩn như cột dữ liệu.
• Chỉ điền giá trị nếu câu hỏi có nhắc đến hoặc có thể suy luận trực tiếp.
• Dịch các thuật ngữ sang tiếng Anh.
Ví dụ:
Input: “Sản phẩm nào thuộc danh mục Vitamin?”
Output: category: Vitamins
Input: “Sản phẩm nào bán chạy nhất?”
Output: units_sold: high
Câu hỏi: {question}
    """
    response = model.generate_content(prompt)
    return response.text.strip()

# Các hàm khác giữ nguyên vì chúng không phụ thuộc trực tiếp vào tên cột

def summarize_results(question: str, documents: list) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    docs_text = "\\n".join(documents)
    prompt = f"""
    Dựa trên danh sách thông tin thực phẩm bổ sung sau đây:
{docs_text}
Hãy thực hiện các bước sau:
1. Trả lời câu hỏi {question} một cách ngắn gọn, súc tích, chỉ tập trung vào thông tin liên quan đến tra cứu sản phẩm, không đưa ra tư vấn.
2. Trả kết quả dưới dạng text thuần, không cần bọc HTML.
3. Dịch nội dung câu trả lời sang tiếng Việt.
4. Trả kết quả cuối cùng là bản dịch tiếng Việt.

Quy tắc:
- Không thêm giải thích ngoài yêu cầu.
- Nếu nhiều sản phẩm phù hợp, liệt kê ngắn gọn tất cả.
- Nếu không tìm thấy sản phẩm phù hợp, ghi rõ: "Không tìm thấy sản phẩm phù hợp."
    """
    response = model.generate_content(prompt)
    return response.text.strip()


def translate_results(results: list[dict]) -> list[dict]:
    # Hàm này hiện không được dùng nhưng vẫn giữ lại cấu trúc
    return results