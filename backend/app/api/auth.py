from app.schemas.auth import LoginRequest, PasswordChangeRequest, RegisterRequest
from app.core.security import verify_password, create_access_token, hash_password
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal, get_db
from app.api.dependencies import get_current_user
from app.models.document import Document
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_chat import WorkspaceChat, WorkspaceMessage

router = APIRouter()


@router.post("/auth/register")
def register(payload: RegisterRequest):
    db: Session = SessionLocal()
    user = User(
        username=payload.username,
        email=payload.email,
        password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }


@router.post("/auth/login")
def login(payload: LoginRequest):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {
            "user_id": user.id,
            "email": user.email
        }
    )
    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/auth/me")
def me(db: Session = Depends(get_db), user=Depends(get_current_user)):
    current_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }


@router.patch("/auth/password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    current_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.delete("/auth/account")
def delete_account(db: Session = Depends(get_db), user=Depends(get_current_user)):
    current_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    workspaces = db.query(Workspace).filter(Workspace.user_id == user["user_id"]).all()
    for workspace in workspaces:
        chats = db.query(WorkspaceChat).filter(WorkspaceChat.workspace_id == workspace.id).all()
        for chat in chats:
            db.query(WorkspaceMessage).filter(WorkspaceMessage.chat_id == chat.id).delete()
            db.delete(chat)
        db.query(Document).filter(Document.workspace_id == workspace.id).delete()
        db.delete(workspace)

    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}
