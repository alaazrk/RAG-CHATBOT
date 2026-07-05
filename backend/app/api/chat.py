from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter

from app.rag.chat import ask_question

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class ChatRequest(BaseModel):
    question: str
    filename: Optional[str] = None


@router.post("/")
def chat(request: ChatRequest):
    result = ask_question(request.question, filename=request.filename)

    return {
        "answer": result["answer"],
        "sources": result["sources"]
    }