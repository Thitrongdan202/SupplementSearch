# MedicineSearch - Tìm Kiếm Thực Phẩm Chức Năng

## Hướng Dẫn Cài Đặt

1. **Tạo và Kích Hoạt Môi Trường Python**
   - Đảm bảo bạn đã cài đặt Python 3.13.
   - Tạo môi trường ảo:
     ```
     python3 -m venv venv
     ```
   - Kích hoạt môi trường ảo:
     - Trên macOS/Linux:
       ```
       source venv/bin/activate
       ```
     - Trên Windows:
       ```
       venv\Scripts\activate
       ```

2. **Cài Đặt Các Thư Viện Cần Thiết**
   - Cài đặt các thư viện cần thiết bằng lệnh sau:
     ```
     pip install -r libs.txt
     ```

3. **Khởi Tạo Cơ Sở Dữ Liệu và Vector Hóa Dữ Liệu**
   - Chạy lệnh sau để khởi tạo cơ sở dữ liệu và vector hóa dữ liệu:
     ```
     python vectorizer.py
     ```

4. **Chạy Dự Án**
   - Khởi động ứng dụng FastAPI bằng lệnh:
     ```
     fastapi dev
     ```

## Tính Năng Mới

- **Gợi Ý Từ Khóa**
  - Endpoint: `/recommendations?query=từ+khóa+tìm+kiếm`
  - Trả về danh sách các từ khóa gợi ý được trích xuất từ các sản phẩm phù hợp nhất để giúp tinh chỉnh tìm kiếm của bạn.