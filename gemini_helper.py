import google.generativeai as genai
import os, json
from dotenv import load_dotenv

load_dotenv(".env")
genai.configure(api_key=os.environ.get("GEMINI_KEY"))

def parse_query_dimensions(question: str) -> str:
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f
    response = model.generate_content(prompt)
    return response.text.strip()

def summarize_results(question: str, documents: list) -> str:
    model = genai.GenerativeModel('gemini-2.0-flash')
    docs_text = "\\n".join(documents)
    prompt = f
    response = model.generate_content(prompt)
    print(f"🔍 Summarized Response: {response.text.strip()}")
    return response.text.strip()

def translate_results(results: list[dict]) -> list[dict]:
    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = """
    """ + str(results)
    response = model.generate_content(prompt)
    text = response.text.strip()
    print(f"🔍 Summarized Response: {response.text.strip()}")
    text = text.replace('```', '').replace('json', '')
    return json.loads(text)