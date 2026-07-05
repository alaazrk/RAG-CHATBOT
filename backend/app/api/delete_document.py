from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.rag.vector_store import vector_store

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_FOLDER = Path("uploads")


@router.delete("/{filename}")
async def delete_pdf(filename: str):
    file_path = UPLOAD_FOLDER / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    vector_store.delete_document(filename)

    file_path.unlink()

    return {
        "success": True,
        "message": "Document deleted successfully."
    }