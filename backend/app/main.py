from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.tavus import router as tavus_router
from app.routes.session import router as session_router

app = FastAPI(
    title="Avatar Speech Therapy Prototype API",
    description=(
        "Research prototype backend exposing a stable mock-analysis contract and "
        "an optional Tavus CVI integration boundary."
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(tavus_router)
app.include_router(session_router)


@app.get("/health")
def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "tavus_configured": bool(settings.tavus_api_key and settings.tavus_pal_id),
    }
