from rag.chunker import chunk_text
from rag.embeddings import get_embeddings, model
from rag.vector_store import build_index, search_index

def build_retriever(text: str):
    chunks = chunk_text(text)
    embeddings = get_embeddings(chunks)
    index = build_index(embeddings)
    return index, chunks

def retrieve(query: str, index, chunks, top_k=5):
    query_emb = model.encode([query], convert_to_numpy=True)[0]
    return search_index(index, query_emb, chunks, top_k)