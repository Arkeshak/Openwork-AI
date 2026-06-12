from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "OpenWork AI"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    JWT_SECRET: str = "openwork-ai-secret-key"
    GEMINI_API_KEY: str
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:8000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
