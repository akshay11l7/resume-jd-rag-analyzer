import os
import uuid
import tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

from parser.pdf_parser import parse_pdf
from parser.docx_parser import parse_docx
from ats.skill_match import match_skills
from ats.ats_score import calculate_ats_score
from rag.retriever import build_retriever, retrieve
from llm.prompts import analyze_resume, chat_with_resume

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for demo
session_store = {}

def extract_text(file: UploadFile) -> str:
    suffix = "." + file.filename.split(".")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name
    
    if suffix.lower() == ".pdf":
        text = parse_pdf(tmp_path)
    else:
        text = parse_docx(tmp_path)
        
    os.remove(tmp_path)
    return text

@app.post("/api/analyze")
async def analyze(
    resume: UploadFile = File(...),
    jd: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None)
):
    resume_text = extract_text(resume)
    
    if jd:
        final_jd_text = extract_text(jd)
    elif jd_text:
        final_jd_text = jd_text
    else:
        return {"error": "JD required"}
        
    result = match_skills(resume_text, final_jd_text)
    score = calculate_ats_score(result["matched"], result["jd_skills"])
    
    index, chunks = build_retriever(resume_text)
    top_chunks = retrieve(final_jd_text[:300], index, chunks)
    ai_analysis = analyze_resume(final_jd_text, top_chunks, result["matched"], result["missing"])
    
    session_id = str(uuid.uuid4())
    session_store[session_id] = {
        "index": index,
        "chunks": chunks,
        "chat_history": []
    }
    
    return {
        "session_id": session_id,
        "score": score,
        "matched": list(result["matched"]),
        "missing": list(result["missing"]),
        "ai_analysis": ai_analysis
    }

class ChatRequest(BaseModel):
    session_id: str
    question: str

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if req.session_id not in session_store:
        return {"error": "Invalid session"}
        
    session = session_store[req.session_id]
    top = retrieve(req.question, session["index"], session["chunks"])
    answer = chat_with_resume(req.question, top, session["chat_history"])
    
    session["chat_history"].append({"role": "user", "content": req.question})
    session["chat_history"].append({"role": "assistant", "content": answer})
    
    return {"answer": answer, "history": session["chat_history"]}
