from fastapi import APIRouter

from app.rag.pdf_loader import load_all_pdfs
from app.rag.text_splitter import split_documents
from app.rag.vector_store import create_vector_store

router = APIRouter(prefix="/index", tags=["Index"])


@router.post("/")
async def index_documents():
    documents = load_all_pdfs()

    if not documents:
        return {
            "message": "No PDF found in uploads folder."
        }

    chunks = split_documents(documents)

    create_vector_store(chunks)

    return {
        "message": "Documents indexed successfully.",
        "documents": len(documents),
        "chunks": len(chunks),
    }