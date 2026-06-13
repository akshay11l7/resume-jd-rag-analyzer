import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_resume_info(resume_text: str) -> dict:
    """
    Uses Groq LLM to extract structured entities from raw resume text.
    """
    prompt = f"""You are an expert NLP parser. Extract the following information from the resume text provided below. 
You MUST return ONLY a valid JSON object with the following structure:
{{
  "personal_info": {{
    "name": "string",
    "email": "string",
    "phone": "string"
  }},
  "education": [
    {{
      "degree": "string",
      "institution": "string",
      "year": "string"
    }}
  ],
  "experience": [
    {{
      "role": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }}
  ],
  "skills": ["string"]
}}

If a piece of information is missing, use null or an empty array.

Resume Text:
{resume_text[:4000]}  # Limiting length just in case
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    
    # Safely parse the JSON response
    try:
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing JSON from LLM: {e}")
        return {}

def extract_jd_info(jd_text: str) -> dict:
    """
    Uses Groq LLM to extract structured requirements from a Job Description.
    """
    prompt = f"""You are an expert HR parser. Extract the following requirements from the job description provided below. 
You MUST return ONLY a valid JSON object with the following structure:
{{
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "minimum_experience": number (or null if not specified),
  "accepted_degrees": ["string"]
}}

Job Description:
{jd_text[:4000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    
    try:
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing JSON from LLM: {e}")
        return {}

# Simple test block if run directly
if __name__ == "__main__":
    test_resume = "John Doe. Email: john@example.com. Phone: 1234567890. Experience: Software Engineer at Google (2020-2023). Skills: Python, React, NLP. Education: BS Computer Science, MIT 2020."
    print("Testing resume extraction...")
    print(json.dumps(extract_resume_info(test_resume), indent=2))
    
    test_jd = "Looking for an ML Engineer with: Python, Docker/Kubernetes, TensorFlow or PyTorch, REST API development. 2+ years experience. Bachelor's in CS/ECE/EE."
    print("\nTesting JD extraction...")
    print(json.dumps(extract_jd_info(test_jd), indent=2))
