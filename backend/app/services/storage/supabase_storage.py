"""Real Supabase Storage implementation. Untested here — no live Supabase
project/key reachable from this sandbox. Shape is correct for the
`supabase-py` client; verify against a real bucket before relying on it.
Add `supabase` to requirements.txt when wiring this in.
"""
from app.services.storage.base import StorageProvider

BUCKET_NAME = "resumes"


class SupabaseStorage(StorageProvider):
    def __init__(self):
        from app.core.config import get_settings
        from supabase import create_client

        settings = get_settings()
        if not (settings.supabase_url and settings.supabase_service_role_key):
            raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set")
        self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    def save(self, path: str, content: bytes) -> str:
        self._client.storage.from_(BUCKET_NAME).upload(
            path, content, {"upsert": "true"}
        )
        return path

    def load(self, path: str) -> bytes:
        return self._client.storage.from_(BUCKET_NAME).download(path)

    def delete(self, path: str) -> None:
        self._client.storage.from_(BUCKET_NAME).remove([path])

    def exists(self, path: str) -> bool:
        folder = "/".join(path.split("/")[:-1])
        name = path.split("/")[-1]
        listing = self._client.storage.from_(BUCKET_NAME).list(folder)
        return any(f["name"] == name for f in listing)
