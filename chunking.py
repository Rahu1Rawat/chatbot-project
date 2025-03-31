def chunk_text(text, chunk_size=250, overlap=50):
    words = text.split()
    chunks = []
    
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        
        if end == len(words):
            break
        
        start += chunk_size - overlap

    return chunks
