from pydantic import BaseModel
from typing import Optional


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
