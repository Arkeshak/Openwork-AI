from fastapi import APIRouter, UploadFile, File, Form
from pypdf import PdfReader

from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/workspaces/upload")
async def upload_document(
    workspace_id: int = Form(...),
    file: UploadFile = File(...)
):

    reader = PdfReader(file.file)

    text = ""

    for page in reader.pages:
        text += page.extract_text() + "\n"

    result = RAGService.ingest_text(
        text,
        workspace_id
    )

    return {
        "workspace_id": workspace_id,
        "chunks": result["chunks"]
    }
