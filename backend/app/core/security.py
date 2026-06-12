from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password,
    hashed_password
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
