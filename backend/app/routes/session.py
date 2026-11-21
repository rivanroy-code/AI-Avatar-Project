from fastapi import APIRouter

from app.dialogue_models import DialogueTurnRequest, DialogueTurnResponse
from app.services.dialogue_engine import handle_dialogue_turn

router = APIRouter(prefix="/api/session", tags=["session"])


@router.post("/turn", response_model=DialogueTurnResponse)
def process_turn(request: DialogueTurnRequest) -> DialogueTurnResponse:
    return handle_dialogue_turn(request)
