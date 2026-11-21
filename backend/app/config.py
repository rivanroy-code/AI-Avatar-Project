import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    tavus_api_key: str | None = os.getenv("TAVUS_API_KEY") or None
    tavus_pal_id: str | None = os.getenv("TAVUS_PAL_ID") or None
    tavus_face_id: str | None = os.getenv("TAVUS_FACE_ID") or None
    tavus_base_url: str = "https://tavusapi.com/v2"


settings = Settings()
