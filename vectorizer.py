import pandas as pd
import sqlite3
import pickle
from sentence_transformers import SentenceTransformer
import os

DB_PATH = 'supplements.db'
CSV_PATH = 'Supplement_Sales_Weekly_Expanded.csv'
MODEL_NAME = 'all-MiniLM-L6-v2'
TABLE_NAME = 'supplements'

if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"Removed old database file: {DB_PATH}")

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

try:
    print(f"Creating '{TABLE_NAME}' table...")
    cursor.execute(f'''
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT,
        category TEXT,
        price REAL,
        units_sold INTEGER,
        combined_text TEXT,
        embedding BLOB
    )
    ''')
    print("Table created successfully.")
except Exception as e:
    print(f"An error occurred while creating the table: {e}")
    conn.close()
    exit()

try:
    print(f"Reading data from '{CSV_PATH}'...")
    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    print("CSV data loaded successfully.")
    print("Columns found in CSV:", df.columns.tolist())

    print("\nProcessing data and inserting into the database...")
    for index, row in df.iterrows():
        combined_text = (
            f"Product: {row['Product Name']}. "
            f"Category: {row['Category']}. "
        )

        embedding = model.encode(combined_text)
        embedding_blob = pickle.dumps(embedding)

        cursor.execute(f'''
        INSERT INTO {TABLE_NAME} (
            product_name, category, price, units_sold, combined_text, embedding
        ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            row['Product Name'],
            row['Category'],
            row['Price'],
            row['Units Sold'],
            combined_text,
            embedding_blob
        ))

        if (index + 1) % 100 == 0:
            print(f"Processed {index + 1}/{len(df)} rows.")

    conn.commit()
    print("\nData processing complete. All records have been inserted into the database.")
except FileNotFoundError:
    print(f"Error: The file was not found at '{CSV_PATH}'")
except KeyError as e:
    print(f"\n---!!! LỖI TÊN CỘT (KeyError) !!!---")
    print(f"Không thể tìm thấy cột có tên: {e}")
except Exception as e:
    print(f"An error occurred during data processing: {e}")
finally:
    if conn:
        conn.close()
        print("Database connection closed.")