from fastapi import APIRouter
from sqlalchemy import text

from app.database.database import engine
from app.database.base import Base

router = APIRouter()


@router.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }


@router.post("/database/create")
def create_database():
    Base.metadata.create_all(bind=engine)
    return {
        "message": "Database created successfully"
    }

