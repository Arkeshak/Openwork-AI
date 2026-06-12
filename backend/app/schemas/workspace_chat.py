from pydantic import BaseModel


class ChatCreate(BaseModel):
    title: str


class MessageCreate(BaseModel):
    content: str
