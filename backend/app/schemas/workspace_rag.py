from pydantic import BaseModel


class WorkspaceDocumentInput(BaseModel):
    workspace_id: int
    text: str


class WorkspaceSearchInput(BaseModel):
    workspace_id: int
    query: str


class WorkspaceQuestion(BaseModel):
    workspace_id: int
    chat_id: int
    question: str
