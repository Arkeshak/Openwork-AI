from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.document import Document
from app.models.workspace import Workspace
from app.schemas.document import DocumentCreate
from app.api.dependencies import get_current_user
from app.rag.document_loader import load_document
from app.services.rag_service import RAGService

import shutil
import os

router = APIRouter()


# ── Create document record (metadata only) ────────────────────────────────────

@router.post("/documents")
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == payload.workspace_id).first()
    if not workspace:
        return {"error": "Workspace not found"}
    if workspace.user_id != user["user_id"]:
        return {"error": "Access denied"}

    document = Document(
        filename=payload.filename,
        workspace_id=payload.workspace_id,
        uploaded_by=user["user_id"]
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {"id": document.id, "filename": document.filename}


# ── List documents for a workspace ────────────────────────────────────────────

@router.get("/workspaces/{workspace_id}/documents")
def get_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        return {"error": "Workspace not found"}
    if workspace.user_id != user["user_id"]:
        return {"error": "Access denied"}

    documents = (
        db.query(Document)
        .filter(Document.workspace_id == workspace_id)
        .all()
    )
    return documents


# ── Delete a document ─────────────────────────────────────────────────────────

@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return {"error": "Document not found"}

    workspace = db.query(Workspace).filter(Workspace.id == document.workspace_id).first()
    if workspace.user_id != user["user_id"]:
        return {"error": "Access denied"}

    db.delete(document)
    db.commit()
    return {"message": "Deleted"}


# ── Upload document (legacy: workspace_id as query param) ─────────────────────

@router.post("/upload-document")
def upload_document_legacy(
    workspace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        return {"error": "Workspace not found"}
    if workspace.user_id != user["user_id"]:
        return {"error": "Access denied"}

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        filename=file.filename,
        file_path=file_path,
        workspace_id=workspace_id,
        uploaded_by=user["user_id"],
        file_size=getattr(file, "size", None),
        content_type=file.content_type
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        text = load_document(file_path)
        if text and text.strip():
            print(f"DOCUMENT EXTRACTED: {len(text)} characters")
            RAGService.ingest_text(text, workspace_id, filename=file.filename)
            print("DOCUMENT INGESTED SUCCESSFULLY")
        else:
            print("No text extracted from document")
    except Exception as e:
        print("DOCUMENT PROCESSING ERROR:", str(e))

    return {
        "id": document.id,
        "filename": document.filename,
        "workspace_id": workspace_id,
        "uploaded_by": user["user_id"]
    }


# ── Upload document (REST: workspace_id in URL — used by frontend) ─────────────
# Frontend UploadButton calls: POST /workspaces/{workspace_id}/documents

@router.post("/workspaces/{workspace_id}/documents")
def upload_document_to_workspace(
    workspace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        filename=file.filename,
        file_path=file_path,
        workspace_id=workspace_id,
        uploaded_by=user["user_id"],
        file_size=getattr(file, "size", None),
        content_type=file.content_type
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    print("FILE SAVED:", file_path)
    print("FILE SIZE:", os.path.getsize(file_path))

    try:
        text = load_document(file_path)
        if text and text.strip():
            print(f"DOCUMENT EXTRACTED: {len(text)} characters")
            RAGService.ingest_text(text, workspace_id, filename=file.filename)
            print("DOCUMENT INGESTED SUCCESSFULLY")
        else:
            print("No text extracted from document")
    except Exception as e:
        print("DOCUMENT PROCESSING ERROR:", str(e))

    return {
        "id": document.id,
        "filename": document.filename,
        "workspace_id": workspace_id,
        "uploaded_by": user["user_id"]
    }


# ── Download a document ───────────────────────────────────────────────────────

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return {"error": "Document not found"}

    workspace = db.query(Workspace).filter(Workspace.id == document.workspace_id).first()
    if workspace.user_id != user["user_id"]:
        return {"error": "Access denied"}

    return FileResponse(path=document.file_path, filename=document.filename)
