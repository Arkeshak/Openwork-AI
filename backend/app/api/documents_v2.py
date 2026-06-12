from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api.dependencies import get_current_user

from app.models.document import Document
from app.schemas.document import DocumentCreate

from app.models.workspace import Workspace
from fastapi import HTTPException

router = APIRouter()


@router.post("/documents")
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == payload.workspace_id,
            Workspace.user_id == user["user_id"]
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    document = Document(
        filename=payload.filename,
        workspace_id=payload.workspace_id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get("/workspaces/{workspace_id}/documents")
def get_workspace_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.user_id == user["user_id"]
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    return (
        db.query(Document)
        .filter(
            Document.workspace_id == workspace_id
        )
        .all()
    )
