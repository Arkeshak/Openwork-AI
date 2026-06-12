from pydantic import BaseModel


class MessageCreate(BaseModel):
    session_id: int
    content: str


class ChatRequest(BaseModel):
    session_id: int
    content: str
