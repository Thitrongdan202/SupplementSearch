import google.generativeai as genai
import os, json

from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_KEY"))

def parse_query_dimensions(question: str) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
Input: Một câu hỏi bằng tiếng Việt về thực phẩm bổ sung (ví dụ: “Sản phẩm nào hỗ trợ xương khớp?”)
Output:
•    Trích xuất các thuộc tính liên quan đến sản phẩm để tìm kiếm theo dữ liệu sau: Product Name, Category, Primary Benefit, Price (USD), Weekly Sales.
•    Mỗi thuộc tính ghi rõ tên bằng tiếng Anh chuẩn như cột dữ liệu.
•    Chỉ điền giá trị nếu câu hỏi có nhắc đến hoặc có thể suy luận trực tiếp, không suy diễn thêm.
•    Dịch các thuật ngữ sang tiếng Anh.
Ví dụ:
Input: “Sản phẩm nào bổ sung Vitamin D3?”
Output: primary_benefit: Vitamin D3 supplement
Input: “Sản phẩm nào hỗ trợ xương khớp giá rẻ?”
Output: primary_benefit: joint support
Câu hỏi: {question}
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def summarize_results(question: str, documents: list) -> str:
    model = genai.GenerativeModel('gemini-1.5-flash')
    docs_text = "\\n".join(documents)
    prompt = f"""
    Dựa trên danh sách thông tin thực phẩm bổ sung sau đây:
{docs_text}
Hãy thực hiện các bước sau:
1. Trả lời câu hỏi {question} một cách ngắn gọn, súc tích, chỉ tập trung vào thông tin liên quan đến tra cứu sản phẩm, không đưa ra tư vấn.
2. Trả kết quả dưới dạng text thuần, không cần bọc HTML.
3. Dịch nội dung câu trả lời sang tiếng Việt, sử dụng đúng thuật ngữ.
4. Trả kết quả cuối cùng là bản dịch tiếng Việt, không cần bản tiếng Anh.

Quy tắc:
- Không thêm giải thích ngoài yêu cầu.
- Nếu nhiều sản phẩm phù hợp, liệt kê ngắn gọn tất cả.
- Nếu không tìm thấy sản phẩm phù hợp, ghi rõ: "Không tìm thấy sản phẩm phù hợp."
    """
    response = model.generate_content(prompt)
    return response.text.strip()

def translate_results(results: list[dict]) -> list[dict]:
    # Lưu ý: Hàm này được điều chỉnh cho phù hợp, nhưng vì dữ liệu gốc của bạn
    # đã là tiếng Anh nên có thể không cần thiết.
    # Tuy nhiên, giữ lại cấu trúc này có thể hữu ích cho các mục đích khác trong tương lai.
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = """
    Bạn được cung cấp một danh sách dữ liệu dạng JSON về thực phẩm bổ sung.
Yêu cầu:
- Dịch các giá trị text trong trường "primary_benefit" sang tiếng Việt.
- Giữ nguyên cấu trúc JSON, đúng format, đúng "id".
- Nếu có từ ngữ không chắc chắn hoặc không dịch được, giữ nguyên từ tiếng Anh ban đầu.
- Không thay đổi key hay thêm bớt dữ liệu.
- Trả về đúng kết quả dạng JSON. Không được phép thay đổi định dạng JSON.

Ví dụ:
- "Joint support" ➔ "Hỗ trợ xương khớp"
- "Immune health" ➔ "Tăng cường miễn dịch"
- "Energy boost" ➔ "Tăng cường năng lượng"

Bây giờ, hãy tiến hành dịch dữ liệu sau:
    """ + str(results)
    response = model.generate_content(prompt)
    text = response.text.strip()
    # Xóa các ký tự markdown có thể xuất hiện trong phản hồi của model
    text = text.replace('```', '').replace('json', '')
    return json.loads(text)