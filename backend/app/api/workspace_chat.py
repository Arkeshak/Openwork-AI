from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.database import get_db
from app.models.workspace_chat import WorkspaceChat, WorkspaceMessage
from app.models.workspace import Workspace
from app.schemas.workspace_chat import ChatCreate, MessageCreate
from app.api.dependencies import get_current_user

router = APIRouter()


class ChatUpdate(BaseModel):
    title: Optional[str] = None


@router.post("/workspaces/{workspace_id}/chats")
def create_chat(
    workspace_id: int,
    payload: ChatCreate,
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

    chat = WorkspaceChat(
        workspace_id=workspace_id,
        title=payload.title
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return {"id": chat.id, "title": chat.title, "workspace_id": chat.workspace_id}


@router.get("/workspaces/{workspace_id}/chats")
def get_chats(
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

    chats = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.workspace_id == workspace_id)
        .order_by(WorkspaceChat.id.desc())
        .all()
    )

    return chats


@router.patch("/chats/{chat_id}")
def rename_chat(
    chat_id: int,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id)
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == chat.workspace_id)
        .first()
    )

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if payload.title is not None:
        chat.title = payload.title

    db.commit()
    db.refresh(chat)

    return {"id": chat.id, "title": chat.title}


@router.delete("/chats/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id)
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == chat.workspace_id)
        .first()
    )

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    db.query(WorkspaceMessage).filter(
        WorkspaceMessage.chat_id == chat_id
    ).delete()

    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted"}


@router.post("/chats/{chat_id}/messages")
def add_message(
    chat_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id)
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == chat.workspace_id)
        .first()
    )

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    message = WorkspaceMessage(
        chat_id=chat_id,
        role="user",
        content=payload.content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {"id": message.id, "content": message.content}


@router.get("/chats/{chat_id}/messages")
def get_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id)
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == chat.workspace_id)
        .first()
    )

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    messages = (
        db.query(WorkspaceMessage)
        .filter(WorkspaceMessage.chat_id == chat_id)
        .order_by(WorkspaceMessage.id.asc())
        .all()
    )

    return messages
