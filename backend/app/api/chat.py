from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.chat_service import ChatService

from app.schemas.chat import MessageCreate, ChatRequest
from app.schemas.chat_update import ChatUpdate
from app.models.workspace import Workspace
from app.models.workspace_chat import WorkspaceChat, WorkspaceMessage
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/chat/session")
def create_chat_session(
    db: Session = Depends(get_db)
):
    return ChatService.create_session(db)


@router.post("/chat/message")
def create_message(
    payload: MessageCreate,
    db: Session = Depends(get_db)
):
    return ChatService.create_message(
        db,
        payload.session_id,
        payload.content
    )


@router.get("/chat/{session_id}/messages")
def get_messages(
    session_id: int,
    db: Session = Depends(get_db)
):
    return ChatService.get_messages(
        db,
        session_id
    )


@router.post("/chat/ask")
def ask_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db)
):
    response = ChatService.ask(
        db=db,
        session_id=payload.session_id,
        content=payload.content
    )

    return {
        "response": response
    }


@router.patch("/chats/{chat_id}")
def rename_chat(
    chat_id: int,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(
            WorkspaceChat.id == chat_id
        )
        .first()
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == chat.workspace_id
        )
        .first()
    )

    if not workspace or workspace.user_id != user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    chat.title = payload.title

    db.commit()

    return chat


@router.delete("/chats/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    chat = (
        db.query(WorkspaceChat)
        .filter(
            WorkspaceChat.id == chat_id
        )
        .first()
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == chat.workspace_id
        )
        .first()
    )

    if not workspace or workspace.user_id != user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    (
        db.query(WorkspaceMessage)
        .filter(
            WorkspaceMessage.chat_id == chat_id
        )
        .delete()
    )

    db.delete(chat)

    db.commit()

    return {
        "message": "Deleted"
    }
