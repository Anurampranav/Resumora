"""Storage boundary for uploaded resumes and generated files.

Production target: Supabase Storage (private bucket, signed URLs). No live
Supabase project is reachable from this sandbox, so the default provider
writes to local disk under backend/storage_data/. Every call site uses
`get_storage_provider()`, so switching to Supabase later is a one-file change.
"""
from abc import ABC, abstractmethod


class StorageProvider(ABC):
    @abstractmethod
    def save(self, path: str, content: bytes) -> str:
        """Persist content at `path`, return the path/key it was stored under."""
        ...

    @abstractmethod
    def load(self, path: str) -> bytes:
        ...

    @abstractmethod
    def delete(self, path: str) -> None:
        ...

    @abstractmethod
    def exists(self, path: str) -> bool:
        ...


def get_storage_provider() -> StorageProvider:
    from app.core.config import get_settings

    settings = get_settings()
    if settings.supabase_url and settings.supabase_service_role_key:
        from app.services.storage.supabase_storage import SupabaseStorage

        return SupabaseStorage()

    from app.services.storage.local_storage import LocalStorage

    return LocalStorage()
