from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.database import router as database_router
from app.core.config import settings

from app.database.base import Base
from app.database.database import engine

from app.models.user import User
from app.api.users import router as users_router

from app.api.ai import router as ai_router

from app.models.chat import ChatSession, Message
from app.api.chat import router as chat_router

from app.api.documents import router as document_router

from app.api.rag import router as rag_router

from app.models.workspace import Workspace

from app.api.workspaces import router as workspace_router

from app.api.workspace_documents import router as workspace_document_router
from app.api.auth import router as auth_router

from app.models.document import Document
from app.api.documents_metadata import (
    router as documents_metadata_router
)

from app.models.workspace_chat import WorkspaceChat
from app.models.workspace_chat import WorkspaceMessage
from app.api.workspace_chat import (
    router as workspace_chat_router
)
from app.api.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if "https://openwork-ai-dusky.vercel.app" not in origins:
    origins.append("https://openwork-ai-dusky.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.railway\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}"
    }


app.include_router(health_router)
app.include_router(database_router)
app.include_router(users_router)
app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(rag_router)
app.include_router(document_router)
app.include_router(workspace_router)
app.include_router(workspace_document_router)
app.include_router(auth_router)
app.include_router(
    documents_metadata_router
)
app.include_router(
    workspace_chat_router
)
app.include_router(dashboard_router)
