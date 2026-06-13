import json

def load_skills(path="data/skills.json"):
    with open(path) as f:
        return json.load(f)

def extract_skills(text: str, skills: list) -> list:
    text_lower = text.lower()
    return [s for s in skills if s.lower() in text_lower]

def match_skills(resume_text: str, jd_text: str):
    skills = load_skills()
    resume_skills = set(extract_skills(resume_text, skills))
    jd_skills     = set(extract_skills(jd_text, skills))

    matched = resume_skills & jd_skills
    missing = jd_skills - resume_skills

    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "jd_skills": sorted(jd_skills)
    }