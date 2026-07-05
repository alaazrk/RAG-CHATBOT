from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.rag.pdf_loader import load_pdf
from app.rag.text_splitter import split_documents
from app.rag.vector_store import vector_store

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


def fix_filename_encoding(filename: str) -> str:
    """Corrige le mojibake fréquent sur Windows où un nom de fichier
    accentué (ex: 'Calcul numérique.pdf') est mal décodé en 'Calcul
    numÃ©rique.pdf'. Cela vient de python-multipart qui décode parfois
    l'en-tête en latin-1 au lieu d'utf-8."""
    try:
        return filename.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return filename


@router.post("/")
def upload_pdf(file: UploadFile = File(...)):
    filename = fix_filename_encoding(file.filename)

    if not filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_path = UPLOAD_FOLDER / filename

    # file.file est l'objet fichier sous-jacent (synchrone), utilisé
    # au lieu de `await file.read()` maintenant que la route n'est
    # plus asynchrone.
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    documents = load_pdf(str(file_path))

    chunks = split_documents(documents)

    for chunk in chunks:
        chunk.metadata["source"] = filename

    vector_store.add_documents(chunks)

    return {
        "success": True,
        "filename": filename,
        "chunks": len(chunks)
    }