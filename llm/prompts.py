import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_resume(jd_text: str, resume_chunks: list, matched: list, missing: list) -> str:
    context = "\n\n".join(resume_chunks)
    prompt = f"""You are an expert ATS evaluator and career coach.

Job Description:
{jd_text[:2000]}

Relevant Resume Sections:
{context[:3000]}

Matched Skills: {', '.join(matched)}
Missing Skills: {', '.join(missing)}

Tasks:
1. Give a brief ATS analysis (2-3 lines).
2. Suggest 3 specific resume improvements.
3. Generate 5 targeted interview questions for this role.

Be concise and actionable."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )
    return response.choices[0].message.content


def chat_with_resume(question: str, resume_chunks: list, history: list) -> str:
    context = "\n\n".join(resume_chunks)
    messages = history + [{
        "role": "user",
        "content": f"Resume context:\n{context[:3000]}\n\nQuestion: {question}"
    }]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=500
    )
    return response.choices[0].message.content