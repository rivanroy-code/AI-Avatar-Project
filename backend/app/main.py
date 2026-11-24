from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.session import router as session_router

app = FastAPI(
    title="Avatar Speech Therapy Prototype API",
    description=(
        "Research prototype backend exposing a stable mock-analysis contract "
        "and deterministic dialogue controller."
    ),
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(session_router)


@app.get("/health")
def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "analysis_mode": "deterministic_mock",
    }
