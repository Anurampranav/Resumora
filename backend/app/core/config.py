"""Centralized settings. Nothing else in the app should call os.environ directly —
that's what keeps every third-party integration swappable from one place."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    database_url: str = "postgresql://postgres:postgres@localhost:5432/resumora"

    jwt_secret: str = "change-me-in-production"
    clerk_secret_key: str = ""
    clerk_jwks_url: str = ""

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    ai_provider: str = "mock"  # mock | gemini | openai | claude
    gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    max_upload_size_bytes: int = 10 * 1024 * 1024  # 10 MB, per brief

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.allowed_origins.strip() == "*":
            return ["*"]
        origins = [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        return origins if origins else ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
