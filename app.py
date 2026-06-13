import streamlit as st
import tempfile

from parser.pdf_parser import parse_pdf
from parser.docx_parser import parse_docx
from ats.skill_match import match_skills
from ats.ats_score import calculate_ats_score
from rag.retriever import build_retriever, retrieve
from llm.prompts import analyze_resume, chat_with_resume

st.set_page_config(page_title="Resume Analyzer", layout="wide")
st.title("📄 Resume & JD Analyzer")

col1, col2 = st.columns(2)

with col1:
    resume_file = st.file_uploader("Upload Resume", type=["pdf", "docx"])
with col2:
    jd_file = st.file_uploader("Upload Job Description", type=["pdf", "docx"])
    jd_text_input = st.text_area("Or paste Job Description here")

def extract_text(uploaded_file):
    suffix = "." + uploaded_file.name.split(".")[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded_file.read())
        tmp_path = tmp.name
    if suffix == ".pdf":
        return parse_pdf(tmp_path)
    else:
        return parse_docx(tmp_path)

if st.button("🔍 Analyze Match", type="primary"):
    if not resume_file:
        st.error("Please upload a resume.")
    elif not (jd_file or jd_text_input):
        st.error("Please upload or paste a job description.")
    else:
        with st.spinner("Analyzing..."):
            resume_text = extract_text(resume_file)
            jd_text = extract_text(jd_file) if jd_file else jd_text_input

            result = match_skills(resume_text, jd_text)
            score  = calculate_ats_score(result["matched"], result["jd_skills"])

            index, chunks = build_retriever(resume_text)
            top_chunks = retrieve(jd_text[:300], index, chunks)
            ai_analysis = analyze_resume(jd_text, top_chunks,
                                         result["matched"], result["missing"])

            st.session_state.index         = index
            st.session_state.chunks        = chunks
            st.session_state.analysis_done = True

        st.metric("ATS Score", f"{score}/100")

        col_a, col_b = st.columns(2)
        with col_a:
            st.subheader("✅ Matched Skills")
            for s in result["matched"]:
                st.success(s)
        with col_b:
            st.subheader("❌ Missing Skills")
            for s in result["missing"]:
                st.error(s)

        st.subheader("🤖 AI Analysis & Interview Questions")
        st.markdown(ai_analysis)

if st.session_state.get("analysis_done"):
    st.divider()
    st.subheader("💬 Chat with your Resume")

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    for msg in st.session_state.chat_history:
        st.chat_message(msg["role"]).write(msg["content"])

    if question := st.chat_input("Ask something about your resume..."):
        st.chat_message("user").write(question)
        top = retrieve(question, st.session_state.index, st.session_state.chunks)
        answer = chat_with_resume(question, top, st.session_state.chat_history)
        st.chat_message("assistant").write(answer)
        st.session_state.chat_history += [
            {"role": "user",      "content": question},
            {"role": "assistant", "content": answer}
        ]