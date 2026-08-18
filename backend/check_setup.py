#!/usr/bin/env python3
"""Run this before `uvicorn app.main:app --reload` if the frontend shows
"Backend isn't reachable". Checks the things that most commonly go wrong:
missing .env, unreachable database, missing dependencies — and tells you
exactly which one, instead of a bare traceback.

Usage: python check_setup.py
"""
import sys
from pathlib import Path

print("Resumora backend — setup check\n" + "-" * 40)

ok = True

# 1. .env exists
env_path = Path(__file__).parent / ".env"
if not env_path.exists():
    print("[FAIL] backend/.env does not exist.")
    print("       Fix: cp .env.example .env")
    ok = False
else:
    print("[ OK ] backend/.env exists")

# 2. Required packages import
missing = []
for pkg in ["fastapi", "uvicorn", "sqlalchemy", "psycopg2", "pydantic_settings", "jose", "docx", "pymupdf", "pdfplumber", "slowapi"]:
    try:
        __import__(pkg)
    except ImportError:
        missing.append(pkg)
if missing:
    print(f"[FAIL] Missing Python packages: {', '.join(missing)}")
    print("       Fix: pip install -r requirements.txt   (make sure your venv is activated)")
    ok = False
else:
    print("[ OK ] All required packages import successfully")

# 3. Config loads
try:
    from app.core.config import get_settings
    settings = get_settings()
    print(f"[ OK ] Config loads. DATABASE_URL points to: {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
except Exception as e:
    print(f"[FAIL] Could not load config: {e}")
    ok = False
    settings = None

# 4. Database is actually reachable
if settings:
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(settings.database_url, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[ OK ] Database is reachable")
    except Exception as e:
        print(f"[FAIL] Cannot connect to the database: {e}")
        print("       Fix: make sure Postgres is running and DATABASE_URL in .env is correct.")
        print("       If the database doesn't exist yet: createdb resumora")
        ok = False

print("-" * 40)
if ok:
    print("All checks passed. Run: uvicorn app.main:app --reload")
    sys.exit(0)
else:
    print("Fix the [FAIL] items above, then re-run this script.")
    sys.exit(1)
