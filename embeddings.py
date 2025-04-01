import cohere
import chromadb
from config import COHERE_API_KEY
from chunking import chunk_text
import numpy as np

co = cohere.Client(COHERE_API_KEY)

chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name="document_embeddings")


def get_fresh_collection():
    try:
        chroma_client.delete_collection(name="document_embeddings")
    except:
        pass
    return chroma_client.create_collection(name="document_embeddings")

collection = get_fresh_collection()

def generate_embeddings(text):
    global collection
    collection = get_fresh_collection()
    
    chunks = chunk_text(text, chunk_size=250, overlap=50)
    
    response = co.embed(
        texts=chunks,
        model="embed-english-v3.0",
        input_type="search_document"
    )
    
    embeddings = response.embeddings
    
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[f"chunk_{i}"]
        )
    
    return chunks, embeddings

def query_chroma(query_text):
    SIMILARITY_THRESHOLD = 0.25
    
    query_embedding = np.array(co.embed(
        texts=[query_text],
        model="embed-english-v3.0",
        input_type="search_query"
    ).embeddings[0])

    stored_embeddings = collection.get(include=["embeddings"])["embeddings"]
    
    if stored_embeddings.size == 0:
        return []
    
    stored_embeddings_np = np.array(stored_embeddings)
    
    similarity_scores = np.dot(query_embedding, stored_embeddings_np.T)
    
    qualified_indices = [
        i for i, score in enumerate(similarity_scores)
        if score > SIMILARITY_THRESHOLD
    ]
    
    sorted_indices = sorted(qualified_indices, 
        key=lambda i: similarity_scores[i], 
        reverse=True)[:3]
    
    return [collection.get(ids=[f"chunk_{idx}"])["documents"][0] 
            for idx in sorted_indices]