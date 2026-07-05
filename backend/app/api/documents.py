from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_FOLDER = Path("uploads")


@router.get("/")
async def get_documents():
    files = []

    if UPLOAD_FOLDER.exists():
        for file in UPLOAD_FOLDER.glob("*.pdf"):
            files.append({
                "name": file.name,
                "size": round(file.stat().st_size / 1024, 2)
            })

    return {
        "count": len(files),
        "documents": files
    }