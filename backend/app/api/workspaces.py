from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.schemas.workspace import WorkspaceCreate
from app.models.workspace import Workspace
from app.models.document import Document
from app.models.workspace_chat import WorkspaceChat, WorkspaceMessage
from app.database.database import get_db
from app.api.dependencies import get_current_user

router = APIRouter()


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


@router.post("/workspaces")
def create_workspace(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = Workspace(
        name=payload.name,
        description=getattr(payload, "description", None),
        user_id=user["user_id"]
    )

    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return {
        "id": workspace.id,
        "name": workspace.name,
        "description": workspace.description,
        "user_id": workspace.user_id,
        "created_at": workspace.created_at
    }


@router.get("/workspaces")
def get_workspaces(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspaces = (
        db.query(Workspace)
        .filter(Workspace.user_id == user["user_id"])
        .order_by(Workspace.id.desc())
        .all()
    )

    return workspaces


@router.get("/workspaces/{workspace_id}")
def get_workspace(
    workspace_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return workspace


@router.patch("/workspaces/{workspace_id}")
def update_workspace(
    workspace_id: int,
    payload: WorkspaceUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if payload.name is not None:
        workspace.name = payload.name

    if payload.description is not None:
        workspace.description = payload.description

    db.commit()
    db.refresh(workspace)

    return {
        "id": workspace.id,
        "name": workspace.name,
        "description": workspace.description,
        "user_id": workspace.user_id,
        "created_at": workspace.created_at
    }


@router.delete("/workspaces/{workspace_id}")
def delete_workspace(
    workspace_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Cascade: delete messages -> chats -> documents -> workspace
    chats = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.workspace_id == workspace_id)
        .all()
    )
    for chat in chats:
        db.query(WorkspaceMessage).filter(
            WorkspaceMessage.chat_id == chat.id
        ).delete()
        db.delete(chat)

    db.query(Document).filter(
        Document.workspace_id == workspace_id
    ).delete()

    db.delete(workspace)
    db.commit()

    return {"message": "Workspace deleted"}
