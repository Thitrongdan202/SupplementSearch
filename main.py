from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from search_engine import SupplementSearchEngine
from gemini_helper import parse_query_dimensions # Thêm import này
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

search_engine = SupplementSearchEngine()
templates = Jinja2Templates(directory=".")

class QueryRequest(BaseModel):
    question: str

@app.get("/", response_class=HTMLResponse)
async def chat_ui(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/supplements", response_class=JSONResponse)
async def get_supplements(request: Request, query: str):
    # Sử dụng gemini để phân tích câu hỏi trước khi tìm kiếm
    parsed_query = parse_query_dimensions(query)
    print(f"Original Query: '{query}' -> Parsed Query: '{parsed_query}'")
    data = search_engine.search(parsed_query)
    return {"supplements": data}

@app.get("/recommendations", response_class=JSONResponse)
async def recommend_keywords(request: Request, query: str):
    keywords = search_engine.recommend_keywords(query)
    return {"keywords": keywords}