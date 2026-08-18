import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.security import get_current_user
from app.db.database import get_db
from app.schemas.schemas import (
    AnalysisOut,
    JobDescriptionAnalysisIn,
    JobDescriptionAnalysisOut,
    ResumeDetailOut,
    ResumeListItemOut,
    ScoreBreakdownOut,
    TopJobMatchOut,
    VersionComparisonMetricsOut,
)
from app.services.ai.base import ResumeContext, get_ai_provider
from app.services.ats.scoring_engine import match_percentage, score_resume
from app.services.parsing.resume_parser import extract_text, parse_resume
from app.services.storage.base import get_storage_provider

router = APIRouter(prefix="/resumes", tags=["resumes"])
settings = get_settings()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}
CONTENT_TYPE_BY_EXT = {v: k for k, v in ALLOWED_TYPES.items()}


def _run_analysis(resume: Resume, contents: bytes, db: Session) -> AnalysisOut:
    """Shared by upload and reanalyze: parse -> deterministic score -> AI explain -> persist."""
    raw_text = extract_text(contents, resume.file_type)
    parsed = parse_resume(raw_text)

    required_skills: list[str] = []
    preferred_skills: list[str] = []
    target_role_name = "General"
    if resume.job_role_id:
        role_skills = (
            db.query(Skill.name, JobRoleSkill.importance)
            .join(JobRoleSkill, JobRoleSkill.skill_id == Skill.id)
            .filter(JobRoleSkill.job_role_id == resume.job_role_id)
            .all()
        )
        required_skills = [name for name, importance in role_skills if importance == "required"]
        preferred_skills = [name for name, importance in role_skills if importance == "preferred"]
        job_role = db.query(JobRole).filter(JobRole.id == resume.job_role_id).first()
        target_role_name = job_role.name if job_role else target_role_name

    breakdown = score_resume(parsed, required_skills, preferred_skills)
    match_pct = match_percentage(parsed, required_skills)

    ai = get_ai_provider(settings.ai_provider)
    ai_result = ai.analyze(
        ResumeContext(
            raw_text=raw_text,
            parsed_skills=parsed.skills,
            target_role=target_role_name,
            ats_breakdown=breakdown.as_dict(),
            missing_skills=breakdown.missing_skills,
        )
    )

    # The scoring engine flags *which* bullets are weak. We used to also
    # generate an AI rewrite for every one of them right here — that's up to
    # 5 extra AI calls per upload, repeated again on every re-analyze, for
    # rewrites the user might never look at. Rewrites are now generated
    # on-demand via POST /resumes/{id}/rewrite-bullet instead; "suggested"
    # starts empty and the UI fetches it when the user actually asks.
    weak_bullets_flagged = [{"original": bullet, "suggested": ""} for bullet in breakdown.weak_bullet_points[:5]]

    resume.parsed_skills = parsed.skills
    resume.parsed_experience = parsed.experience_bullets
    resume.parsed_projects = parsed.projects
    resume.parsed_education = parsed.education
    resume.parsed_achievements = parsed.achievements
    resume.status = "analyzed"

    analysis = ResumeAnalysis(
        id=uuid.uuid4(),
        resume_id=resume.id,
        overall_score=breakdown.overall,
        match_percentage=match_pct,
        score_formatting=breakdown.formatting,
        score_skills=breakdown.skills,
        score_projects=breakdown.projects,
        score_experience=breakdown.experience,
        score_grammar=breakdown.grammar,
        score_readability=breakdown.readability,
        score_education=breakdown.education,
        score_achievements=breakdown.achievements,
        missing_skills=breakdown.missing_skills,
        strengths=breakdown.strengths,
        weaknesses=breakdown.weaknesses,
        formatting_issues=breakdown.formatting_issues,
        weak_bullet_points=weak_bullets_flagged,
        ai_suggestions=ai_result.suggestions,
        ai_summary=ai_result.summary,
        ai_provider=settings.ai_provider,
    )
    db.add(analysis)
    db.commit()

    return AnalysisOut(
        resume_id=str(resume.id),
        overall_score=breakdown.overall,
        match_percentage=match_pct,
        target_role=target_role_name,
        breakdown=ScoreBreakdownOut(**breakdown.as_dict()),
        missing_skills=breakdown.missing_skills,
        strengths=breakdown.strengths,
        weaknesses=breakdown.weaknesses,
        formatting_issues=breakdown.formatting_issues,
        weak_bullet_points=weak_bullets_flagged,
        ai_summary=ai_result.summary,
        ai_suggestions=ai_result.suggestions,
    )


@router.post("/upload", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    job_role_slug: str | None = None,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only PDF and DOCX are accepted")

    contents = await file.read()
    if not contents:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded file is empty")
    if len(contents) > settings.max_upload_size_bytes:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File exceeds 10 MB limit")

    file_type = ALLOWED_TYPES[file.content_type]
    job_role = None
    if job_role_slug:
        job_role = db.query(JobRole).filter(JobRole.slug == job_role_slug).first()
        if not job_role:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown job_role_slug: {job_role_slug}")

    resume_id = uuid.uuid4()
    storage_path = f"{user['id']}/{resume_id}/{file.filename}"

    storage = get_storage_provider()
    try:
        storage.save(storage_path, contents)
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage write failed: {exc}") from exc

    resume = Resume(
        id=resume_id,
        user_id=user["id"],
        job_role_id=job_role.id if job_role else None,
        file_name=file.filename,
        file_type=file_type,
        file_size_bytes=len(contents),
        storage_path=storage_path,
        status="uploaded",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    try:
        return _run_analysis(resume, contents, db)
    except Exception:
        resume.status = "failed"
        db.commit()
        raise


@router.post("/analyze-job-description", response_model=JobDescriptionAnalysisOut)
@limiter.limit("15/minute")
def analyze_job_description(
    request: Request,
    body: JobDescriptionAnalysisIn,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze a custom pasted job description against the selected or latest resume."""
    if not body.job_description.strip():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Job description text cannot be empty")

    resume = None
    if body.resume_id:
        resume = db.query(Resume).filter(Resume.id == body.resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        resume = (
            db.query(Resume)
            .filter(Resume.user_id == user["id"])
            .order_by(Resume.created_at.desc())
            .first()
        )

    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No resume found. Please upload a resume first.")

    # Simple NLP / keyword extraction from job description
    jd_lower = body.job_description.lower()
    common_skills = [
        "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular",
        "Node.js", "FastAPI", "Django", "Flask", "Express", "SQL", "PostgreSQL", "MongoDB", "Redis",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Git", "REST API", "GraphQL",
        "Machine Learning", "PyTorch", "TensorFlow", "Pandas", "Scikit-learn", "HTML", "CSS", "Tailwind"
    ]
    
    extracted_req = [s for s in common_skills if s.lower() in jd_lower]
    if not extracted_req:
        extracted_req = ["Python", "SQL", "Git", "REST API"]

    resume_skills = [str(s).lower() for s in (resume.parsed_skills or [])]
    matched = [s for s in extracted_req if s.lower() in resume_skills]
    missing = [s for s in extracted_req if s.lower() not in resume_skills]

    match_pct = int((len(matched) / len(extracted_req)) * 100) if extracted_req else 80

    exp_status = "Match" if any(w in jd_lower for w in ["junior", "entry", "intern"]) or len(matched) > 2 else "Gap"
    edu_status = "Match" if "bachelor" in jd_lower or "degree" in jd_lower or "master" in jd_lower else "Match"

    missing_kw = [s for s in missing[:3]]
    suggestions = [
        f"Incorporate missing core skill keywords: {', '.join(missing[:3])}" if missing else "Your skills strongly align with this job description!",
        "Quantify your bullet points with measurable impacts and percentages.",
        "Align your summary section to reflect the key responsibilities described in the job post."
    ]

    return JobDescriptionAnalysisOut(
        match_percentage=match_pct,
        matched_skills=matched,
        missing_skills=missing,
        missing_keywords=missing_kw,
        experience_status=exp_status,
        education_status=edu_status,
        suggestions=suggestions,
    )


@router.post("/{resume_id}/rewrite-bullet")
@limiter.limit("20/minute")
def rewrite_bullet(
    request: Request,
    resume_id: str,
    original: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """One AI call, fired only when the user clicks a specific weak bullet
    in the report — not automatically for all 5 on every upload."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume not found")

    target_role_name = "General"
    if resume.job_role_id:
        job_role = db.query(JobRole).filter(JobRole.id == resume.job_role_id).first()
        target_role_name = job_role.name if job_role else target_role_name

    ai = get_ai_provider(settings.ai_provider)
    suggested = ai.rewrite_bullet(original, target_role_name)
    return {"original": original, "suggested": suggested}


@router.post("/{resume_id}/reanalyze", response_model=AnalysisOut)
@limiter.limit("10/minute")
def reanalyze_resume(
    request: Request, resume_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume not found")

    storage = get_storage_provider()
    try:
        contents = storage.load(resume.storage_path)
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Could not read stored file: {exc}") from exc

    return _run_analysis(resume, contents, db)


@router.get("/{resume_id}/download")
def download_resume(resume_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume not found")

    storage = get_storage_provider()
    try:
        contents = storage.load(resume.storage_path)
    except Exception as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Stored file missing: {exc}") from exc

    return Response(
        content=contents,
        media_type=CONTENT_TYPE_BY_EXT[resume.file_type],
        headers={"Content-Disposition": f'attachment; filename="{resume.file_name}"'},
    )


@router.get("", response_model=list[ResumeListItemOut])
def list_resumes(
    skip: int = 0,
    limit: int = 50,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limit = min(limit, 100)  # hard cap regardless of what's requested
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user["id"])
        .order_by(Resume.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = []
    for r in resumes:
        latest = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.resume_id == r.id)
            .order_by(ResumeAnalysis.created_at.desc())
            .first()
        )
        role = db.query(JobRole).filter(JobRole.id == r.job_role_id).first() if r.job_role_id else None
        items.append(
            ResumeListItemOut(
                id=str(r.id),
                file_name=r.file_name,
                file_type=r.file_type,
                role_name=role.name if role else None,
                status=r.status,
                overall_score=latest.overall_score if latest else None,
                match_percentage=latest.match_percentage if latest else None,
                created_at=r.created_at.isoformat(),
            )
        )
    return items


@router.get("/{resume_id}", response_model=ResumeDetailOut)
def get_resume(resume_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume not found")

    latest = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.resume_id == resume.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    role = db.query(JobRole).filter(JobRole.id == resume.job_role_id).first() if resume.job_role_id else None

    return ResumeDetailOut(
        id=str(resume.id),
        file_name=resume.file_name,
        file_type=resume.file_type,
        role_name=role.name if role else None,
        status=resume.status,
        created_at=resume.created_at.isoformat(),
        latest_analysis=(
            AnalysisOut(
                resume_id=str(resume.id),
                overall_score=latest.overall_score,
                match_percentage=latest.match_percentage or 0,
                target_role=role.name if role else "General",
                breakdown=ScoreBreakdownOut(
                    formatting=latest.score_formatting,
                    skills=latest.score_skills,
                    projects=latest.score_projects,
                    experience=latest.score_experience,
                    grammar=latest.score_grammar,
                    readability=latest.score_readability,
                    education=latest.score_education,
                    achievements=latest.score_achievements,
                    overall=latest.overall_score,
                ),
                missing_skills=latest.missing_skills or [],
                strengths=latest.strengths or [],
                weaknesses=latest.weaknesses or [],
                formatting_issues=latest.formatting_issues or [],
                weak_bullet_points=latest.weak_bullet_points or [],
                ai_summary=latest.ai_summary or "",
                ai_suggestions=latest.ai_suggestions or [],
            )
            if latest
            else None
        ),
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user["id"]).first()
    if not resume:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume not found")

    storage = get_storage_provider()
    try:
        storage.delete(resume.storage_path)
    except Exception:
        pass  # DB row is the source of truth for the user; a dangling blob isn't worth failing the request over

    db.delete(resume)
    db.commit()
