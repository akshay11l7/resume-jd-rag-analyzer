import faiss
import numpy as np

def build_index(embeddings):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index

def search_index(index, query_embedding, chunks, top_k=5):
    query = np.array([query_embedding])
    _, indices = index.search(query, top_k)
    return [chunks[i] for i in indices[0] if i < len(chunks)]