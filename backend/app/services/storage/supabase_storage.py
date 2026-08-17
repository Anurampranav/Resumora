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
        from app.services.storage.local_storage import LocalStorage

        self._fallback = LocalStorage()
        self._client = None
        try:
            from supabase import create_client

            settings = get_settings()
            if settings.supabase_url and settings.supabase_service_role_key:
                self._client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        except Exception:
            self._client = None

    def save(self, path: str, content: bytes) -> str:
        if not self._client:
            return self._fallback.save(path, content)
        try:
            self._client.storage.from_(BUCKET_NAME).upload(
                path, content, {"upsert": "true"}
            )
            return path
        except Exception:
            return self._fallback.save(path, content)

    def load(self, path: str) -> bytes:
        if not self._client:
            return self._fallback.load(path)
        try:
            return self._client.storage.from_(BUCKET_NAME).download(path)
        except Exception:
            return self._fallback.load(path)

    def delete(self, path: str) -> None:
        if not self._client:
            return self._fallback.delete(path)
        try:
            self._client.storage.from_(BUCKET_NAME).remove([path])
        except Exception:
            self._fallback.delete(path)

    def exists(self, path: str) -> bool:
        if not self._client:
            return self._fallback.exists(path)
        try:
            folder = "/".join(path.split("/")[:-1])
            name = path.split("/")[-1]
            listing = self._client.storage.from_(BUCKET_NAME).list(folder)
            return any(f["name"] == name for f in listing)
        except Exception:
            return self._fallback.exists(path)
