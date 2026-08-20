from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import ai_coach, auth, builder, dashboard, job_roles, resumes
from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.database import Base, SessionLocal, engine
from app.db.seed import seed_job_roles

settings = get_settings()

app = FastAPI(
    title="Resumora API",
    description="Deterministic ATS scoring + AI-assisted resume analysis",
    version="0.1.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(dashboard.router)
app.include_router(job_roles.router)
app.include_router(ai_coach.router)
app.include_router(builder.router)


@app.on_event("startup")
def on_startup():
    # Dev convenience: create tables if they don't exist. In real deployment,
    # use the SQL in database/schema.sql via a migration tool (Alembic) instead.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_job_roles(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "ai_provider": settings.ai_provider}
