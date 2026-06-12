from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository


class UserService:

    @staticmethod
    def create_user(
        db: Session,
        username: str,
        email: str
    ):
        return UserRepository.create_user(
            db,
            username,
            email
        )

    @staticmethod
    def get_users(db: Session):
        return UserRepository.get_all_users(db)

    @staticmethod
    def get_user(
        db: Session,
        user_id: int
    ):
        return UserRepository.get_user_by_id(
            db,
            user_id
        )
