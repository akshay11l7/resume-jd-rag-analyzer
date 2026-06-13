import re

def chunk_text(text: str, chunk_size=500, overlap=50) -> list:
    """
    Attempts to split text into semantic sections (e.g., Education, Experience).
    Falls back to character-based sliding window if sections are too large or not found.
    """
    headers = [
        "summary", "objective", "profile", 
        "education", "academic background",
        "experience", "work experience", "employment", "professional experience",
        "projects", "personal projects",
        "skills", "technical skills", "competencies",
        "certifications", "awards", "achievements", "honors", "languages",
        "position of responsibility"
    ]
    
    # Match these headers (case insensitive, standalone on a line)
    header_pattern = re.compile(r"^(?P<header>" + "|".join(headers) + r")\s*$", re.IGNORECASE | re.MULTILINE)
    
    sections = []
    matches = list(header_pattern.finditer(text))
    
    # Fallback if no recognizable headers are found
    if not matches:
        return _sliding_window_chunk(text, chunk_size, overlap)
        
    for i, match in enumerate(matches):
        header_start = match.start()
        
        # Capture anything before the first header (e.g., Contact Info)
        if i == 0 and header_start > 0:
            pre_text = text[0:header_start].strip()
            if pre_text:
                sections.extend(_sliding_window_chunk(pre_text, chunk_size, overlap))
                
        content_start = match.start()  # Keep the header title in the chunk
        content_end = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        section_text = text[content_start:content_end].strip()
        
        if section_text:
            # If a section is very long, split it further so we don't overwhelm the LLM's context window
            if len(section_text) > chunk_size * 2:
                sections.extend(_sliding_window_chunk(section_text, chunk_size, overlap))
            else:
                sections.append(section_text)
                
    return sections

def _sliding_window_chunk(text: str, chunk_size: int, overlap: int) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks