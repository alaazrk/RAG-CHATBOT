from fastapi import APIRouter

from app.rag.summarize import summarize_document

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/{filename}")
def resume_document(filename: str):
    result = summarize_document(filename)

    return {
        "filename": filename,
        "summary": result["summary"],
        "insights": result["insights"],
    }