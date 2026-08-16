from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import Resume, ResumeAnalysis
from app.schemas.schemas import DashboardSummaryOut, ScoreBreakdownOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
def get_summary(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    latest_analysis = (
        db.query(ResumeAnalysis)
        .join(Resume, Resume.id == ResumeAnalysis.resume_id)
        .filter(Resume.user_id == user["id"])
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )

    resumes_this_month = (
        db.query(func.count(Resume.id))
        .filter(
            Resume.user_id == user["id"],
            func.date_trunc("month", Resume.created_at) == func.date_trunc("month", func.now()),
        )
        .scalar()
        or 0
    )

    if not latest_analysis:
        return DashboardSummaryOut(
            overall_ats_score=0,
            resume_match_percent=0,
            missing_skills_count=0,
            resumes_analyzed_this_month=resumes_this_month,
            latest_resume_id=None,
            latest_breakdown=None,
            latest_ai_summary=None,
        )

    return DashboardSummaryOut(
        overall_ats_score=latest_analysis.overall_score,
        resume_match_percent=latest_analysis.match_percentage or 0,
        missing_skills_count=len(latest_analysis.missing_skills or []),
        resumes_analyzed_this_month=resumes_this_month,
        latest_resume_id=str(latest_analysis.resume_id),
        latest_breakdown=ScoreBreakdownOut(
            formatting=latest_analysis.score_formatting,
            skills=latest_analysis.score_skills,
            projects=latest_analysis.score_projects,
            experience=latest_analysis.score_experience,
            grammar=latest_analysis.score_grammar,
            readability=latest_analysis.score_readability,
            education=latest_analysis.score_education,
            achievements=latest_analysis.score_achievements,
            overall=latest_analysis.overall_score,
        ),
        latest_ai_summary=latest_analysis.ai_summary,
    )
