import cohere
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator 
from pydantic import BaseModel
from pypdf import PdfReader
from embeddings import generate_embeddings, query_chroma
import io
from config import COHERE_API_KEY

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

co = cohere.ClientV2(COHERE_API_KEY)

session_memory = []
MAX_MEMORY = 20

document_uploaded = False
document_name = ""

class Message(BaseModel):
    role: str
    text: str

@app.post("/chat")
async def chat(message: Message):
    global document_uploaded, document_name
    session_memory.append({"role": message.role, "content": message.text})
    
    if len(session_memory) > MAX_MEMORY:
        session_memory.pop(0)

    system_prompt = "Use document-based knowledge if available. Otherwise, answer using general knowledge."
    if document_uploaded:
        system_prompt += f" A document named '{document_name}' has been uploaded and processed."
    
    system_message = {"role": "system", "content": system_prompt}
    
    relevant_document_chunks = query_chroma(message.text)
    
    if relevant_document_chunks:
        session_memory.append({"role": "system", "content": "Relevant document context:"})
        for chunk in relevant_document_chunks:
            session_memory.append({"role": "system", "content": chunk})

    async def generate_response() -> AsyncGenerator[str, None]:
        messages = [system_message] + session_memory

        response = co.chat_stream(
            model="command-a-03-2025",
            messages=messages,
        )

        full_response = ""
        for event in response:
            if event and event.type == "content-delta":
                chunk = event.delta.message.content.text
                full_response += chunk
                yield chunk

        session_memory.append({"role": "assistant", "content": full_response})

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global document_uploaded, document_name
    try:
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        
        extracted_text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
        
        chunks, embeddings = generate_embeddings(extracted_text)
        
        document_uploaded = True
        document_name = file.filename
        
        return {"text": extracted_text, "chunks": chunks, "embeddings": embeddings}
    
    except Exception as e:
        return {"error": str(e)}