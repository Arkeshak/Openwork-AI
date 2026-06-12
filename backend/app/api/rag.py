from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.services.ai_service import AIService
from app.services.rag_service import RAGService

from app.schemas.workspace_rag import (
    WorkspaceDocumentInput,
    WorkspaceSearchInput,
    WorkspaceQuestion
)

from app.models.workspace_chat import (
    WorkspaceChat,
    WorkspaceMessage
)

from app.models.workspace import Workspace
from app.api.dependencies import get_current_user

router = APIRouter()


class ChatQuestionBody(BaseModel):
    question: str


# ── Existing routes ────────────────────────────────────────────────────────────

@router.post("/rag/ingest")
def ingest_document(
    payload: WorkspaceDocumentInput,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == payload.workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return RAGService.ingest_text(payload.text, payload.workspace_id)


@router.post("/rag/search")
def search_document(
    payload: WorkspaceSearchInput,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == payload.workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return RAGService.search(payload.query, payload.workspace_id)


@router.post("/rag/chat")
def rag_chat(
    payload: WorkspaceQuestion,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == payload.workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    chat = (
        db.query(WorkspaceChat)
        .filter(
            WorkspaceChat.id == payload.chat_id,
            WorkspaceChat.workspace_id == payload.workspace_id
        )
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    past_messages = (
        db.query(WorkspaceMessage)
        .filter(WorkspaceMessage.chat_id == payload.chat_id)
        .order_by(WorkspaceMessage.id.asc())
        .all()
    )
    history = "\n".join([f"{msg.role}: {msg.content}" for msg in past_messages])

    user_message = WorkspaceMessage(
        chat_id=payload.chat_id,
        role="user",
        content=payload.question
    )
    db.add(user_message)
    db.commit()

    search_query = AIService.condense_query(payload.question, history)
    context = RAGService.retrieve_context(payload.question, payload.workspace_id, search_query=search_query)

    full_history = history + f"\nuser: {payload.question}" if history else f"user: {payload.question}"
    answer = AIService.rag_answer_with_history(payload.question, context, full_history)

    assistant_message = WorkspaceMessage(
        chat_id=payload.chat_id,
        role="assistant",
        content=answer
    )
    db.add(assistant_message)
    db.commit()

    return {
        "workspace_id": payload.workspace_id,
        "chat_id": payload.chat_id,
        "context": context,
        "answer": answer
    }


@router.post("/rag/chat/stream")
def stream_rag_chat(
    payload: WorkspaceQuestion,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == payload.workspace_id)
        .first()
    )

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    chat = (
        db.query(WorkspaceChat)
        .filter(
            WorkspaceChat.id == payload.chat_id,
            WorkspaceChat.workspace_id == payload.workspace_id
        )
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    past_messages = (
        db.query(WorkspaceMessage)
        .filter(WorkspaceMessage.chat_id == payload.chat_id)
        .order_by(WorkspaceMessage.id.asc())
        .all()
    )
    history = "\n".join([f"{msg.role}: {msg.content}" for msg in past_messages])

    user_message = WorkspaceMessage(
        chat_id=payload.chat_id,
        role="user",
        content=payload.question
    )
    db.add(user_message)
    db.commit()

    search_query = AIService.condense_query(payload.question, history)
    context = RAGService.retrieve_context(payload.question, payload.workspace_id, search_query=search_query)

    full_history = history + f"\nuser: {payload.question}" if history else f"user: {payload.question}"

    def generate():
        import json
        answer_parts = []
        for token in AIService.stream_rag_answer_with_history(
            payload.question, context, full_history
        ):
            answer_parts.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"

        assistant_message = WorkspaceMessage(
            chat_id=payload.chat_id,
            role="assistant",
            content="".join(answer_parts)
        )
        db.add(assistant_message)
        db.commit()

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── REST-style aliases matching the frontend's URL pattern ─────────────────────
# Frontend calls: POST /workspaces/{workspace_id}/chats/{chat_id}/rag
# Frontend calls: POST /workspaces/{workspace_id}/chats/{chat_id}/rag-stream

@router.post("/workspaces/{workspace_id}/chats/{chat_id}/rag")
def workspace_chat_rag(
    workspace_id: int,
    chat_id: int,
    body: ChatQuestionBody,
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

    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id, WorkspaceChat.workspace_id == workspace_id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    past_messages = (
        db.query(WorkspaceMessage)
        .filter(WorkspaceMessage.chat_id == chat_id)
        .order_by(WorkspaceMessage.id.asc())
        .all()
    )
    history = "\n".join([f"{m.role}: {m.content}" for m in past_messages])

    user_message = WorkspaceMessage(chat_id=chat_id, role="user", content=body.question)
    db.add(user_message)
    db.commit()

    search_query = AIService.condense_query(body.question, history)
    context = RAGService.retrieve_context(body.question, workspace_id, search_query=search_query)

    full_history = history + f"\nuser: {body.question}" if history else f"user: {body.question}"
    answer = AIService.rag_answer_with_history(body.question, context, full_history)

    assistant_message = WorkspaceMessage(chat_id=chat_id, role="assistant", content=answer)
    db.add(assistant_message)
    db.commit()

    return {"workspace_id": workspace_id, "chat_id": chat_id, "answer": answer, "sources": []}


@router.post("/workspaces/{workspace_id}/chats/{chat_id}/rag-stream")
def workspace_chat_rag_stream(
    workspace_id: int,
    chat_id: int,
    body: ChatQuestionBody,
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

    chat = (
        db.query(WorkspaceChat)
        .filter(WorkspaceChat.id == chat_id, WorkspaceChat.workspace_id == workspace_id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    past_messages = (
        db.query(WorkspaceMessage)
        .filter(WorkspaceMessage.chat_id == chat_id)
        .order_by(WorkspaceMessage.id.asc())
        .all()
    )
    history = "\n".join([f"{m.role}: {m.content}" for m in past_messages])

    user_message = WorkspaceMessage(chat_id=chat_id, role="user", content=body.question)
    db.add(user_message)
    db.commit()

    search_query = AIService.condense_query(body.question, history)
    context = RAGService.retrieve_context(body.question, workspace_id, search_query=search_query)

    full_history = history + f"\nuser: {body.question}" if history else f"user: {body.question}"

    def generate():
        import json
        answer_parts = []
        for token in AIService.stream_rag_answer_with_history(body.question, context, full_history):
            answer_parts.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"
        
        # Optionally send sources at the end
        # yield f"data: {json.dumps({'sources': []})}\n\n"
        
        assistant_message = WorkspaceMessage(
            chat_id=chat_id,
            role="assistant",
            content="".join(answer_parts)
        )
        db.add(assistant_message)
        db.commit()

    return StreamingResponse(generate(), media_type="text/event-stream")


class RagDebugRequest(BaseModel):
    workspace_id: int
    question: str

@router.post("/rag/debug")
def rag_debug(
    payload: RagDebugRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Verify workspace
    workspace = db.query(Workspace).filter(Workspace.id == payload.workspace_id).first()
    if not workspace or workspace.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # 1. Retrieve raw results
    search_results = RAGService.search(payload.question, payload.workspace_id, top_k=3)

    documents = (search_results.get("documents") or [[]])[0] if search_results else []
    distances = (search_results.get("distances") or [[]])[0] if search_results else []
    metadatas = (search_results.get("metadatas") or [[]])[0] if search_results else []

    # 2. Format context and retrieved chunks
    retrieved_chunks = []
    for doc, dist, meta in zip(documents, distances, metadatas):
        retrieved_chunks.append({
            "text": doc,
            "score": dist,
            "metadata": meta
        })

    context = "\n\n".join(documents)
    
    # 3. Construct prompt exactly as AIService does
    prompt = f"""You are an AI assistant that answers questions based on uploaded documents.

Document Context:
{context}

Question:
{payload.question}

Rules:
1. Use document context when available.
2. If the question is a general greeting or casual chat (e.g. "Hi", "Hello", "How are you?", "Thank you"), respond politely and naturally using your general knowledge.
3. If the user is asking about document details or specific information, and it is not found in the context, say:
   "I cannot find that information in the uploaded documents."
4. Never hallucinate.

Answer:"""

    # 4. Generate answer
    answer = AIService.rag_answer(payload.question, context)
    
    return {
        "question": payload.question,
        "retrieved_chunks": retrieved_chunks,
        "scores": distances,
        "prompt": prompt,
        "answer": answer
    }
