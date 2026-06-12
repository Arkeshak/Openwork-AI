from pydantic import BaseModel


class DocumentInput(BaseModel):
    text: str


class SearchInput(BaseModel):
    query: str


class RAGQuestion(BaseModel):
    question: str
    workspace_id: int
    chat_id: int
