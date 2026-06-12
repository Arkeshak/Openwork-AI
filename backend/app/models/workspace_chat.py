from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from app.database.base import Base


class WorkspaceChat(Base):

    __tablename__ = "workspace_chats"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )


class WorkspaceMessage(Base):

    __tablename__ = "workspace_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    chat_id = Column(
        Integer,
        ForeignKey("workspace_chats.id"),
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    content = Column(
        String,
        nullable=False
    )
