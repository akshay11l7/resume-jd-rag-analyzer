import numpy as np
from sentence_transformers import SentenceTransformer

# Load model lazily to avoid delay on startup if not used immediately
_model = None
def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def keyword_match_score(resume_skills: list, jd_required_skills: list) -> dict:
    if not jd_required_skills:
        return {"score": 0, "matched": [], "missing": []}
        
    resume_skills_lower = [s.lower() for s in resume_skills]
    matched = []
    missing = []
    
    for req_skill in jd_required_skills:
        # Simple keyword substring match
        if any(req_skill.lower() in rs or rs in req_skill.lower() for rs in resume_skills_lower):
            matched.append(req_skill)
        else:
            missing.append(req_skill)
            
    score = round((len(matched) / len(jd_required_skills)) * 100)
    
    return {
        "score": score,
        "matched": matched,
        "missing": missing
    }

def cosine_similarity(v1, v2):
    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def semantic_match_score(resume_phrases: list, jd_requirements: list) -> dict:
    if not jd_requirements or not resume_phrases:
        return {"score": 0, "details": []}
    
    model = get_model()
    req_embeddings = model.encode(jd_requirements)
    res_embeddings = model.encode(resume_phrases)
    
    total_score = 0
    details = []
    
    for i, req in enumerate(jd_requirements):
        similarities = [cosine_similarity(req_embeddings[i], res_emb) for res_emb in res_embeddings]
        max_sim = max(similarities) if similarities else 0
        total_score += max_sim
        
        best_match_idx = np.argmax(similarities) if similarities else -1
        best_phrase = resume_phrases[best_match_idx] if best_match_idx != -1 else ""
        
        details.append({
            "requirement": req,
            "best_match": best_phrase,
            "similarity": round(float(max_sim), 2)
        })
        
    avg_score = (total_score / len(jd_requirements)) * 100 if jd_requirements else 0
    
    return {
        "score": round(avg_score),
        "details": details
    }

def experience_match_score(candidate_years: float, required_years: float) -> dict:
    if required_years is None or required_years <= 0:
        return {"score": 100} # No experience requirement stated
    
    if candidate_years >= required_years:
        score = 100
    else:
        score = round((candidate_years / required_years) * 100)
        
    return {"score": score}

def education_match_score(candidate_degrees: list, accepted_degrees: list) -> dict:
    if not accepted_degrees:
        return {"score": 100}
    
    if not candidate_degrees:
        return {"score": 0}
        
    candidate_lower = " ".join([str(d).lower() for d in candidate_degrees])
    
    score = 0
    for req_deg in accepted_degrees:
        # Check if requested degree keyword exists in candidate degrees
        if any(word.lower() in candidate_lower for word in req_deg.split()):
            score = 100
            break
            
    if score == 0 and len(candidate_degrees) > 0:
        score = 70  # Has some degree but not exact match
        
    return {"score": score}

def calculate_comprehensive_ats_score(keyword_score: float, semantic_score: float, exp_score: float, edu_score: float) -> dict:
    """
    Weights: Keyword (30%), Semantic (30%), Experience (25%), Education (15%)
    """
    final = (
        (keyword_score * 0.30) +
        (semantic_score * 0.30) +
        (exp_score * 0.25) +
        (edu_score * 0.15)
    )
    final_rounded = round(final)
    
    # Result classification
    if final_rounded >= 90:
        classification = "Strong match, likely recruiter review."
    elif final_rounded >= 75:
        classification = "Good candidate."
    elif final_rounded >= 60:
        classification = "May be considered if applicant pool is small."
    else:
        classification = "Usually filtered out automatically."
        
    return {
        "final_score": final_rounded,
        "classification": classification,
        "breakdown": {
            "keyword": keyword_score,
            "semantic": semantic_score,
            "experience": exp_score,
            "education": edu_score
        }
    }

# Keep the old one just in case it's imported elsewhere and needs a smooth transition
def calculate_ats_score(matched: list, jd_skills: list) -> int:
    if not jd_skills:
        return 0
    return round((len(matched) / len(jd_skills)) * 100)