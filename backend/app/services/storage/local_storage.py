"""Local disk storage — fully working, used whenever Supabase env vars
aren't set. Files land under backend/storage_data/, mirroring the path
structure Supabase Storage would use (so switching providers later
doesn't change any path the rest of the app constructs)."""
import os
from pathlib import Path

from app.services.storage.base import StorageProvider

STORAGE_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "storage_data"


class LocalStorage(StorageProvider):
    def __init__(self):
        STORAGE_ROOT.mkdir(parents=True, exist_ok=True)

    def _full_path(self, path: str) -> Path:
        full = (STORAGE_ROOT / path).resolve()
        if STORAGE_ROOT not in full.parents and full != STORAGE_ROOT:
            raise ValueError("Path escapes storage root")
        return full

    def save(self, path: str, content: bytes) -> str:
        full = self._full_path(path)
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_bytes(content)
        return path

    def load(self, path: str) -> bytes:
        return self._full_path(path).read_bytes()

    def delete(self, path: str) -> None:
        full = self._full_path(path)
        if full.exists():
            os.remove(full)

    def exists(self, path: str) -> bool:
        return self._full_path(path).exists()
