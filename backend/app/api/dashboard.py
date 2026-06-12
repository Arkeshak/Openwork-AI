from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.api.dependencies import get_current_user
from app.models.workspace import Workspace
from app.models.document import Document
from app.models.workspace_chat import WorkspaceChat, WorkspaceMessage

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    user_id = user["user_id"]

    # Use func.count + scalar() to generate a direct COUNT query
    # instead of SQLAlchemy's double-wrapped subquery COUNT (causes f405 ProgrammingError)
    workspace_count = (
        db.query(func.count(Workspace.id))
        .filter(Workspace.user_id == user_id)
        .scalar()
    ) or 0

    document_count = (
        db.query(func.count(Document.id))
        .filter(Document.uploaded_by == user_id)
        .scalar()
    ) or 0

    # Extract plain integer IDs (Row namedtuples -> int list)
    user_workspace_ids = [
        row[0] for row in db.query(Workspace.id)
        .filter(Workspace.user_id == user_id)
        .all()
    ]

    if user_workspace_ids:
        chat_count = (
            db.query(func.count(WorkspaceChat.id))
            .filter(WorkspaceChat.workspace_id.in_(user_workspace_ids))
            .scalar()
        ) or 0

        message_count = (
            db.query(func.count(WorkspaceMessage.id))
            .join(WorkspaceChat, WorkspaceMessage.chat_id == WorkspaceChat.id)
            .filter(WorkspaceChat.workspace_id.in_(user_workspace_ids))
            .scalar()
        ) or 0
    else:
        chat_count = 0
        message_count = 0

    # Recent workspaces (last 6)
    recent_workspaces = (
        db.query(Workspace)
        .filter(Workspace.user_id == user_id)
        .order_by(Workspace.id.desc())
        .limit(6)
        .all()
    )

    # Recent chats (last 5)
    recent_chats = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.workspace_id.in_(user_workspace_ids))
        .order_by(WorkspaceChat.id.desc())
        .limit(5)
        .all()
    ) if user_workspace_ids else []

    return {
        "workspaces": workspace_count,
        "documents": document_count,
        "chats": chat_count,
        "messages": message_count,
        "recent_workspaces": [
            {
                "id": w.id,
                "name": w.name,
                "description": w.description,
                "created_at": w.created_at
            }
            for w in recent_workspaces
        ],
        "recent_chats": [
            {
                "id": c.id,
                "title": c.title,
                "workspace_id": c.workspace_id
            }
            for c in recent_chats
        ]
    }


@router.get("/workspaces/{workspace_id}/stats")
def workspace_stats(
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

    document_count = (
        db.query(func.count(Document.id))
        .filter(Document.workspace_id == workspace_id)
        .scalar()
    ) or 0

    chat_count = (
        db.query(func.count(WorkspaceChat.id))
        .filter(WorkspaceChat.workspace_id == workspace_id)
        .scalar()
    ) or 0

    message_count = (
        db.query(func.count(WorkspaceMessage.id))
        .join(WorkspaceChat, WorkspaceMessage.chat_id == WorkspaceChat.id)
        .filter(WorkspaceChat.workspace_id == workspace_id)
        .scalar()
    ) or 0

    return {
        "documents": document_count,
        "chats": chat_count,
        "messages": message_count
    }
