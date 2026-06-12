from fastapi import APIRouter, UploadFile, File
import os

from app.services.pdf_service import PDFService
from app.services.rag_service import RAGService

router = APIRouter()


UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(
            await file.read()
        )

    text = PDFService.extract_text(
        file_path
    )

    result = RAGService.ingest_text(
        text
    )

    return {
        "filename": file.filename,
        "chunks": result["chunks"]
    }
