from sqlalchemy.orm import Session

from app.models.chat import ChatSession

from app.models.chat import Message


class ChatRepository:

    @staticmethod
    def create_session(db: Session):

        session = ChatSession(
            title="New Chat"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def get_session(
        db: Session,
        session_id: int
    ):
        return (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id)
            .first()
        )

    @staticmethod
    def create_message(
        db: Session,
        session_id: int,
        role: str,
        content: str
    ):
        message = Message(
            session_id=session_id,
            role=role,
            content=content
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def get_messages(
        db: Session,
        session_id: int
    ):
        return (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .all()
        )
