from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from search_engine import SupplementSearchEngine
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

# --- SỬA Ở ĐÂY ---
# Đổi directory="templates" thành directory="."
# Điều này báo cho FastAPI tìm tệp chat.html ngay tại thư mục hiện tại.
templates = Jinja2Templates(directory=".")

class QueryRequest(BaseModel):
    question: str

@app.post("/search_raw")
async def search_raw(req: QueryRequest):
    results = search_engine.search(req.question)
    return {"matches": results}

@app.get("/", response_class=HTMLResponse)
async def chat_ui(request: Request):
    # Dòng này bây giờ sẽ hoạt động chính xác
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/supplements", response_class=JSONResponse)
async def get_supplements(request: Request, query: str):
    data = search_engine.search_with_llm(query)
    return {"supplements": data}

@app.get("/recommendations", response_class=JSONResponse)
async def recommend_keywords(request: Request, query: str):
    keywords = search_engine.recommend_keywords(query)
    return {"keywords": keywords}