import os
import uuid
import tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

from parser.pdf_parser import parse_pdf
from parser.docx_parser import parse_docx
from ats.ats_score import (
    keyword_match_score, 
    semantic_match_score, 
    experience_match_score, 
    education_match_score, 
    calculate_comprehensive_ats_score
)
from llm.extractor import extract_resume_info, extract_jd_info
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

def estimate_years(experience_list):
    # Simple heuristic: assume each role is ~1.5 years if dates aren't parsed explicitly
    return len(experience_list) * 1.5

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
        
    # Extract structured data
    resume_data = extract_resume_info(resume_text)
    jd_data = extract_jd_info(final_jd_text)
    
    # 1. Keyword Match
    resume_skills = resume_data.get("skills") or []
    jd_req_skills = jd_data.get("required_skills") or []
    keyword_result = keyword_match_score(resume_skills, jd_req_skills)
    
    # 2. Semantic Match
    resume_phrases = []
    for exp in resume_data.get("experience") or []:
        if exp.get("description"):
            resume_phrases.append(exp["description"])
        if exp.get("role"):
            resume_phrases.append(exp["role"])
    resume_phrases.extend(resume_skills)
    if not resume_phrases:
        resume_phrases = ["No experience provided"]
    semantic_result = semantic_match_score(resume_phrases, jd_req_skills)
    
    # 3. Experience Match
    candidate_years = estimate_years(resume_data.get("experience") or [])
    req_years = jd_data.get("minimum_experience") or 0
    exp_result = experience_match_score(candidate_years, req_years)
    
    # 4. Education Match
    candidate_degrees = [ed.get("degree", "") for ed in (resume_data.get("education") or [])]
    req_degrees = jd_data.get("accepted_degrees") or []
    edu_result = education_match_score(candidate_degrees, req_degrees)
    
    # Final Score
    comprehensive_result = calculate_comprehensive_ats_score(
        keyword_result["score"],
        semantic_result["score"],
        exp_result["score"],
        edu_result["score"]
    )
    
    index, chunks = build_retriever(resume_text)
    top_chunks = retrieve(final_jd_text[:300], index, chunks)
    ai_analysis = analyze_resume(final_jd_text, top_chunks, keyword_result["matched"], keyword_result["missing"])
    
    # Add classification and breakdown to the AI analysis text
    ai_analysis = f"**ATS Status:** {comprehensive_result['classification']}\n" \
                  f"**Breakdown:** Keyword ({comprehensive_result['breakdown']['keyword']}), Semantic ({comprehensive_result['breakdown']['semantic']}), Experience ({comprehensive_result['breakdown']['experience']}), Education ({comprehensive_result['breakdown']['education']})\n\n" \
                  f"{ai_analysis}"
    
    session_id = str(uuid.uuid4())
    session_store[session_id] = {
        "index": index,
        "chunks": chunks,
        "chat_history": []
    }
    
    return {
        "session_id": session_id,
        "score": comprehensive_result["final_score"],
        "classification": comprehensive_result["classification"],
        "matched": list(keyword_result["matched"]),
        "missing": list(keyword_result["missing"]),
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
