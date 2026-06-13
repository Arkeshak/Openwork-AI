from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from app.core.config import settings
from app.database.base import Base

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Test connections before using them
    pool_size=5,  # Number of connections to keep in the pool
    max_overflow=10,  # Additional connections beyond pool_size
    pool_recycle=3600,  # Recycle connections after 1 hour
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
