from sqlalchemy.orm import Session

from app.repositories.chat_repository import ChatRepository
from app.services.ai_service import AIService


class ChatService:

    @staticmethod
    def create_session(db: Session):
        return ChatRepository.create_session(db)

    @staticmethod
    def get_session(
        db: Session,
        session_id: int
    ):
        return ChatRepository.get_session(
            db,
            session_id
        )

    @staticmethod
    def create_message(
        db: Session,
        session_id: int,
        content: str
    ):
        return ChatRepository.create_message(
            db=db,
            session_id=session_id,
            role="user",
            content=content
        )

    @staticmethod
    def get_messages(
        db: Session,
        session_id: int
    ):
        return ChatRepository.get_messages(
            db,
            session_id
        )

    @staticmethod
    def ask(
        db: Session,
        session_id: int,
        content: str
    ):
        # Save user message
        ChatRepository.create_message(
            db=db,
            session_id=session_id,
            role="user",
            content=content
        )

        # Load all messages
        messages = ChatRepository.get_messages(
            db,
            session_id
        )

        chat_messages = [
            {
                "role": m.role,
                "content": m.content
            }
            for m in messages
        ]

        ai_response = AIService.chat_with_history(
            chat_messages
        )

        # Save assistant response
        ChatRepository.create_message(
            db=db,
            session_id=session_id,
            role="assistant",
            content=ai_response
        )

        return ai_response
