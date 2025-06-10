import pandas as pd
import sqlite3
import pickle
from sentence_transformers import SentenceTransformer
import os

# --- Cấu hình ---
# Đường dẫn tới file cơ sở dữ liệu SQLite sẽ được tạo
DB_PATH = 'supplements.db'
# Đường dẫn tới file CSV chứa dữ liệu đầu vào
CSV_PATH = 'Supplement_Sales_Weekly_Expanded.csv'
# Tên mô hình Sentence Transformer
MODEL_NAME = 'all-MiniLM-L6-v2'

# --- Xóa file DB cũ nếu tồn tại để đảm bảo dữ liệu mới hoàn toàn ---
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"Removed old database file: {DB_PATH}")

# --- Khởi tạo mô hình và kết nối CSDL ---
try:
    print(f"Loading model '{MODEL_NAME}'...")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded successfully.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(f"Database connected at: {DB_PATH}")

except Exception as e:
    print(f"An error occurred during initialization: {e}")
    exit()

# --- Tạo bảng trong cơ sở dữ liệu ---
try:
    print("Creating 'supplements' table...")
    # Tạo bảng với các cột tương ứng với file CSV và thêm cột cho text và embedding
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS supplements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT,
        category TEXT,
        primary_benefit TEXT,
        price_usd REAL,
        weekly_sales INTEGER,
        combined_text TEXT,
        embedding BLOB
    )
    ''')
    print("Table 'supplements' created successfully.")
except Exception as e:
    print(f"An error occurred while creating the table: {e}")
    conn.close()
    exit()

# --- Đọc và xử lý dữ liệu từ CSV ---
try:
    print(f"Reading data from '{CSV_PATH}'...")
    df = pd.read_csv(CSV_PATH)
    print("CSV data loaded successfully.")

    # Vòng lặp qua từng dòng của DataFrame để xử lý và chèn vào CSDL
    print("Processing rows and inserting into database...")
    for index, row in df.iterrows():
        # Kết hợp các cột văn bản để tạo ngữ cảnh tốt hơn cho embedding
        combined_text = (
            f"Product: {row['Product Name']}. "
            f"Category: {row['Category']}. "
            f"Benefit: {row['Primary Benefit']}."
        )

        # Tạo vector embedding
        embedding = model.encode(combined_text)

        # Chuyển đổi embedding thành dạng BLOB để lưu trữ trong SQLite
        embedding_blob = pickle.dumps(embedding)

        # Chèn dữ liệu vào bảng
        cursor.execute('''
        INSERT INTO supplements (
            product_name, category, primary_benefit, price_usd, weekly_sales, combined_text, embedding
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            row['Product Name'],
            row['Category'],
            row['Primary Benefit'],
            row['Price (USD)'],
            row['Weekly Sales'],
            combined_text,
            embedding_blob
        ))

        # In tiến trình sau mỗi 100 dòng
        if (index + 1) % 100 == 0:
            print(f"Processed {index + 1}/{len(df)} rows.")

    # Lưu (commit) các thay đổi
    conn.commit()
    print("\nData processing complete. All records have been inserted into the database.")

except FileNotFoundError:
    print(f"Error: The file was not found at '{CSV_PATH}'")
except Exception as e:
    print(f"An error occurred during data processing: {e}")

finally:
    # Đóng kết nối CSDL
    if conn:
        conn.close()
        print("Database connection closed.")