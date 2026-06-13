def calculate_ats_score(matched: list, jd_skills: list) -> int:
    if not jd_skills:
        return 0
    return round((len(matched) / len(jd_skills)) * 100)