import cohere
import chromadb
from config import COHERE_API_KEY
from chunking import chunk_text
import numpy as np

co = cohere.Client(COHERE_API_KEY)

chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name="document_embeddings")


def generate_embeddings(text):
    
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
    query_embedding = co.embed(
        texts=[query_text],
        model="embed-english-v3.0",
        input_type="search_query"
    ).embeddings[0]

    stored_embeddings = collection.get(include=["embeddings"])["embeddings"]
    
    if stored_embeddings.size == 0:
        return "No relevant document found."
    
    similarity_scores = np.dot(query_embedding, stored_embeddings.T)
    
    sorted_idx = np.argsort(similarity_scores)[::-1]
    
    top_n = 3
    top_documents = []
    for idx in sorted_idx[:top_n]:
        document = collection.get(ids=[f"chunk_{idx}"])["documents"][0]
        top_documents.append(document)

    if not top_documents:
        return "No relevant document found."
    
    return top_documents


