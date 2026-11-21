import httpx
from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.models import TavusConversationRequest, TavusConversationResponse

router = APIRouter(prefix="/api/tavus", tags=["tavus"])


def _require_tavus_config() -> tuple[str, str]:
    if not settings.tavus_api_key or not settings.tavus_pal_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Tavus is not configured. Set TAVUS_API_KEY and TAVUS_PAL_ID "
                "in backend/.env. The mock analysis flow remains fully usable."
            ),
        )
    return settings.tavus_api_key, settings.tavus_pal_id


@router.post("/conversations", response_model=TavusConversationResponse)
async def create_tavus_conversation(
    request: TavusConversationRequest,
) -> TavusConversationResponse:
    api_key, pal_id = _require_tavus_config()

    payload: dict[str, object] = {
        "pal_id": pal_id,
        "conversation_name": f"Speech Practice - {request.task_id or 'session'}",
        "conversational_context": (
            "This is a research prototype for guided speech practice. "
            "You are the presentation layer only. Be calm, supportive, concise, "
            "non-diagnostic, and do not claim to be a clinician. The web application "
            "controls task progression and analysis results."
        ),
        "custom_greeting": request.custom_greeting
        or "Hi! I'm here to guide you through a short speech practice activity.",
    }

    if settings.tavus_face_id:
        payload["face_id"] = settings.tavus_face_id

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.tavus_base_url}/conversations",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                },
                json=payload,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Tavus.",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Tavus conversation creation failed with HTTP {response.status_code}.",
        )

    data = response.json()
    return TavusConversationResponse(
        conversation_id=data["conversation_id"],
        conversation_url=data["conversation_url"],
        status=data.get("status", "active"),
    )


@router.post("/conversations/{conversation_id}/end", status_code=204)
async def end_tavus_conversation(conversation_id: str) -> None:
    api_key, _ = _require_tavus_config()

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.tavus_base_url}/conversations/{conversation_id}/end",
                headers={"x-api-key": api_key},
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Tavus.",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Tavus conversation end failed with HTTP {response.status_code}.",
        )
