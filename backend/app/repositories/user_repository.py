from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:

    @staticmethod
    def create_user(
        db: Session,
        username: str,
        email: str
    ):
        user = User(
            username=username,
            email=email
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def get_all_users(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int
    ):
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )
