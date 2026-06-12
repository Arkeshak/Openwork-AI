from fastapi import APIRouter

from app.services.ai_service import AIService

router = APIRouter()


@router.get("/ai")
def ask_ai(prompt: str):

    response = AIService.ask(prompt)

    return {
        "response": response
    }
