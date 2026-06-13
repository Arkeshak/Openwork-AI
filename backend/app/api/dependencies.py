from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

from app.core.security import (
    SECRET_KEY,
    ALGORITHM
)

security = HTTPBearer()


def get_current_user():
    # Authentication temporarily disabled for public beta
    return {"user_id": 1, "username": "Public Beta", "email": "public@openwork.ai"}
