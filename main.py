# Project: Supplement Search RAG
# Structure:
# - vectorizer.py: Load CSV -> Embed -> Save to SQLite
# - search_engine.py: Query from SQLite -> Search vector
# - main.py (api.py): FastAPI chat API

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Import class đã được đổi tên từ search_engine
from search_engine import SupplementSearchEngine

app = FastAPI()
# add cors
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo search engine với class mới
search_engine = SupplementSearchEngine()
templates = Jinja2Templates(directory=".") # Giả sử chat.html cùng thư mục

class QueryRequest(BaseModel):
    question: str

# Endpoint này có thể giữ nguyên hoặc đổi tên cho rõ nghĩa
@app.post("/search_raw")
async def search_raw(req: QueryRequest):
    results = search_engine.search(req.question)
    return {"matches": results}

@app.get("/", response_class=HTMLResponse)
async def chat_ui(request: Request):
    # Trả về file chat.html
    return templates.TemplateResponse("chat.html", {"request": request})

# Đổi tên endpoint cho phù hợp với dữ liệu
@app.get("/supplements", response_class=JSONResponse)
async def get_supplements(request: Request, query: str):
    data = search_engine.search_with_llm(query)
    return {"supplements": data} # Trả về dưới key 'supplements'

@app.get("/recommendations", response_class=JSONResponse)
async def recommend_keywords(request: Request, query: str):
    keywords = search_engine.recommend_keywords(query)
    return {"keywords": keywords}