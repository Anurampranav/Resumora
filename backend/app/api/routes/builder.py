import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import BuilderResume, JobRole, JobRoleSkill, Skill
from app.schemas.schemas import (
    AcceptRewriteRequest,
    BuilderATSCheckRequest,
    BuilderATSCheckResponse,
    BuilderImproveSectionRequest,
    BuilderImproveSectionResponse,
    BuiltResumeData,
    ResumeQuestionnairePayload,
)
from app.services.ai.builder_service import ResumeBuilderAIService
from app.services.ats.scoring_engine import match_percentage, score_resume
from app.services.pdf.resume_builder_pdf import generate_builder_resume_pdf

router = APIRouter(prefix="/builder", tags=["resume-builder"])
settings = get_settings()
ai_builder = ResumeBuilderAIService()


@router.post("/generate-summary")
@limiter.limit("15/minute")
def generate_summary(
    request: Request,
    payload: dict,
    user: dict = Depends(get_current_user),
):
    self_desc = payload.get("self_description", "")
    qualities = payload.get("qualities", [])
    interests = payload.get("interest_areas", "")
    target_role = payload.get("target_role", "Software Engineer")

    summary_text = ai_builder.generate_summary(self_desc, qualities, interests, target_role)
    return {"summary": summary_text}


@router.post("/transform-bullets")
@limiter.limit("20/minute")
def transform_bullets(
    request: Request,
    payload: dict,
    user: dict = Depends(get_current_user),
):
    raw_notes = payload.get("raw_input", "")
    role_title = payload.get("role_title", "Project / Position")
    section_type = payload.get("section_type", "Experience")
    target_role = payload.get("target_role", "Software Engineer")

    bullets = ai_builder.transform_bullets(raw_notes, role_title, section_type, target_role)
    return {"bullets": bullets}


@router.post("/improve-text")
@limiter.limit("20/minute")
def improve_text(
    request: Request,
    payload: dict,
    user: dict = Depends(get_current_user),
):
    current_text = payload.get("current_text", "")
    section_type = payload.get("section_type", "General Section")
    target_role = payload.get("target_role", "Software Engineer")
    context = payload.get("context", "")

    result = ai_builder.improve_text(current_text, section_type, target_role, context)
    return result


@router.post("/organize-skills")
@limiter.limit("20/minute")
def organize_skills(
    request: Request,
    payload: dict,
    user: dict = Depends(get_current_user),
):
    raw_skills = payload.get("raw_skills", "")
    categorized = ai_builder.organize_skills(raw_skills)
    return {"skills": categorized}


@router.post("/check-ats")
@limiter.limit("30/minute")
def check_ats(
    request: Request,
    payload: dict,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run deterministic ATS scoring on structured resume JSON payload."""
    resume_data = payload.get("resume_data") or payload

    # Build a pseudo ParsedResume object for the scoring engine
    class PseudoParsed:
        def __init__(self, data):
            self.name = (data.get("personal_info") or data.get("personalInfo") or {}).get("full_name")
            self.email = (data.get("personal_info") or data.get("personalInfo") or {}).get("email")
            self.phone = (data.get("personal_info") or data.get("personalInfo") or {}).get("phone")

            skills_raw = data.get("skills") or {}
            all_skills = []
            if isinstance(skills_raw, dict):
                for cat, items in skills_raw.items():
                    if isinstance(items, list):
                        all_skills.extend(items)
            elif isinstance(skills_raw, list):
                all_skills = skills_raw
            self.skills = list(set(all_skills))

            # Experience bullets
            exp_bullets = []
            for exp in data.get("experience") or []:
                exp_bullets.extend(exp.get("bullets") or [])
            self.experience_bullets = exp_bullets

            self.projects = [p.get("name") for p in (data.get("projects") or []) if p.get("name")]
            self.education = [e.get("degree") for e in (data.get("education") or []) if e.get("degree")]
            self.achievements = [a.get("title") for a in (data.get("achievements") or []) if a.get("title")]

    parsed = PseudoParsed(resume_data)

    target_role_str = (resume_data.get("target_role") or resume_data.get("career_goal", {}).get("target_role") or "Software Developer")
    job_role = db.query(JobRole).filter(JobRole.name.ilike(f"%{target_role_str}%")).first()

    required_skills = []
    preferred_skills = []
    if job_role:
        role_skills = (
            db.query(Skill.name, JobRoleSkill.importance)
            .join(JobRoleSkill, JobRoleSkill.skill_id == Skill.id)
            .filter(JobRoleSkill.job_role_id == job_role.id)
            .all()
        )
        required_skills = [name for name, importance in role_skills if importance == "required"]
        preferred_skills = [name for name, importance in role_skills if importance == "preferred"]

    if not required_skills:
        required_skills = ["Python", "SQL", "Git", "REST API", "JavaScript"]

    breakdown = score_resume(parsed, required_skills, preferred_skills)

    return {
        "score": breakdown.overall,
        "match_percentage": match_percentage(parsed, required_skills),
        "target_role": target_role_str,
        "breakdown": breakdown.as_dict(),
        "missing_skills": breakdown.missing_skills,
        "strengths": breakdown.strengths,
        "weaknesses": breakdown.weaknesses,
        "formatting_issues": breakdown.formatting_issues,
        "weak_bullet_points": breakdown.weak_bullet_points,
    }


@router.post("/pdf")
def generate_pdf(
    payload: dict,
    user: dict = Depends(get_current_user),
):
    """Generate and return a real vector PDF for the requested resume layout and template."""
    resume_data = payload.get("resume_data") or payload
    template_id = payload.get("template") or resume_data.get("template") or "modern-professional"

    pdf_bytes = generate_builder_resume_pdf(resume_data, template_id)
    cand_name = (
        (resume_data.get("personal_info") or resume_data.get("personalInfo") or {}).get("full_name")
        or "Candidate"
    )
    clean_name = cand_name.replace(" ", "_")
    filename = f"Resumora_Resume_{clean_name}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/draft")
def save_draft(
    payload: dict,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Auto-save or manually save a resume builder draft."""
    draft = (
        db.query(BuilderResume)
        .filter(BuilderResume.user_id == user["id"], BuilderResume.status == "draft")
        .order_by(BuilderResume.updated_at.desc())
        .first()
    )

    resume_data = payload.get("resume_data") or payload
    title = payload.get("title") or (resume_data.get("personal_info") or {}).get("full_name") or "Draft Resume"
    target_role = payload.get("target_role") or (resume_data.get("career_goal") or {}).get("target_role")
    template_id = payload.get("template") or "modern-professional"

    if draft:
        draft.title = title
        draft.target_role = target_role
        draft.template_id = template_id
        draft.resume_data = resume_data
    else:
        draft = BuilderResume(
            id=uuid.uuid4(),
            user_id=user["id"],
            title=title,
            target_role=target_role,
            template_id=template_id,
            status="draft",
            resume_data=resume_data,
        )
        db.add(draft)

    db.commit()
    db.refresh(draft)
    return {"status": "saved", "id": str(draft.id), "updated_at": draft.updated_at.isoformat()}


@router.get("/draft")
def get_draft(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve existing user draft resume."""
    draft = (
        db.query(BuilderResume)
        .filter(BuilderResume.user_id == user["id"], BuilderResume.status == "draft")
        .order_by(BuilderResume.updated_at.desc())
        .first()
    )
    if not draft:
        return {"draft": None}

    return {
        "draft": {
            "id": str(draft.id),
            "title": draft.title,
            "target_role": draft.target_role,
            "template": draft.template_id,
            "resume_data": draft.resume_data,
            "updated_at": draft.updated_at.isoformat(),
        }
    }


@router.post("/finalize")
def finalize_resume(
    payload: dict,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a finalized resume version."""
    resume_data = payload.get("resume_data") or payload
    title = payload.get("title") or (resume_data.get("personal_info") or {}).get("full_name") or "Final Resume"
    target_role = payload.get("target_role") or (resume_data.get("career_goal") or {}).get("target_role")
    template_id = payload.get("template") or "modern-professional"
    ats_score = payload.get("ats_score", 85)

    final_resume = BuilderResume(
        id=uuid.uuid4(),
        user_id=user["id"],
        title=title,
        target_role=target_role,
        template_id=template_id,
        status="final",
        resume_data=resume_data,
        ats_score=ats_score,
    )
    db.add(final_resume)
    db.commit()
    db.refresh(final_resume)

    return {
        "status": "finalized",
        "id": str(final_resume.id),
        "title": final_resume.title,
        "created_at": final_resume.created_at.isoformat(),
    }


@router.get("/versions")
def list_versions(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all saved resume versions for user."""
    versions = (
        db.query(BuilderResume)
        .filter(BuilderResume.user_id == user["id"])
        .order_by(BuilderResume.updated_at.desc())
        .all()
    )

    return [
        {
            "id": str(v.id),
            "title": v.title,
            "target_role": v.target_role,
            "template": v.template_id,
            "status": v.status,
            "ats_score": v.ats_score,
            "updated_at": v.updated_at.isoformat(),
        }
        for v in versions
    ]


@router.get("/versions/{version_id}")
def get_version(
    version_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ver = (
        db.query(BuilderResume)
        .filter(BuilderResume.id == version_id, BuilderResume.user_id == user["id"])
        .first()
    )
    if not ver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume version not found")

    return {
        "id": str(ver.id),
        "title": ver.title,
        "target_role": ver.target_role,
        "template": ver.template_id,
        "status": ver.status,
        "resume_data": ver.resume_data,
        "ats_score": ver.ats_score,
        "updated_at": ver.updated_at.isoformat(),
    }


@router.delete("/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_version(
    version_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ver = (
        db.query(BuilderResume)
        .filter(BuilderResume.id == version_id, BuilderResume.user_id == user["id"])
        .first()
    )
    if not ver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume version not found")

    db.delete(ver)
    db.commit()


@router.post("/versions/{version_id}/duplicate")
def duplicate_version(
    version_id: str,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ver = (
        db.query(BuilderResume)
        .filter(BuilderResume.id == version_id, BuilderResume.user_id == user["id"])
        .first()
    )
    if not ver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resume version not found")

    new_ver = BuilderResume(
        id=uuid.uuid4(),
        user_id=user["id"],
        title=f"{ver.title} (Copy)",
        target_role=ver.target_role,
        template_id=ver.template_id,
        status="draft",
        resume_data=ver.resume_data,
        ats_score=ver.ats_score,
    )
    db.add(new_ver)
    db.commit()
    db.refresh(new_ver)

    return {
        "id": str(new_ver.id),
        "title": new_ver.title,
        "status": new_ver.status,
    }
