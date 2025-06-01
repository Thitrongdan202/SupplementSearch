
import pandas as pd
import numpy as np
import sqlite3
import pickle
from sentence_transformers import SentenceTransformer

DB_PATH = './db.sqlite3'
CSV_PATH = './datasets/Medicine_Details.csv'

model = SentenceTransformer('all-MiniLM-L6-v2')

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
# Load CSV
df = pd.read_csv(CSV_PATH)

for idx, row in df.iterrows():
    text = f"name: {row['Medicine Name']}. composition: {row['Composition']}. uses: {row['Uses']}."
    embedding = model.encode(text)
    embedding_blob = pickle.dumps(embedding)
    cursor.execute('''
    INSERT INTO medicines_detail (name, composition, uses, side_effects, image_url, manufacturer, excellent_review, average_review, poor_review, text, embedding)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)               
    ''', (row['Medicine Name'], row['Composition'], row['Uses'], row['Side_effects'], row['Image URL'], row['Manufacturer'], row['Excellent Review %'], row['Average Review %'], row['Poor Review %'], text, embedding_blob))

conn.commit()
conn.close()
print("✅ Vectorizing done and saved into SQLite!")
