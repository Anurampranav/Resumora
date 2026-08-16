from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import JobRole, JobRoleSkill, Skill

router = APIRouter(prefix="/job-roles", tags=["job-roles"])


@router.get("")
def list_roles(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(JobRole)
    if q:
        query = query.filter(JobRole.name.ilike(f"%{q}%"))
    roles = query.all()
    return [
        {"id": str(r.id), "slug": r.slug, "name": r.name, "industry": r.industry, "demand_level": r.demand_level}
        for r in roles
    ]


@router.get("/{slug}")
def get_role(slug: str, db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.slug == slug).first()
    if not role:
        return {"error": "not found"}
    skills = (
        db.query(Skill.name, JobRoleSkill.importance)
        .join(JobRoleSkill, JobRoleSkill.skill_id == Skill.id)
        .filter(JobRoleSkill.job_role_id == role.id)
        .all()
    )
    return {
        "id": str(role.id),
        "slug": role.slug,
        "name": role.name,
        "description": role.description,
        "industry": role.industry,
        "demand_level": role.demand_level,
        "required_skills": [s[0] for s in skills if s[1] == "required"],
        "preferred_skills": [s[0] for s in skills if s[1] == "preferred"],
    }


@router.get("/compare/by-slugs")
def compare_roles(slugs: str, db: Session = Depends(get_db)):
    """slugs is a comma-separated list, e.g. ?slugs=backend-developer,ai-engineer"""
    slug_list = [s.strip() for s in slugs.split(",") if s.strip()][:4]  # cap comparison at 4
    results = []
    for slug in slug_list:
        results.append(get_role(slug, db))
    return [r for r in results if "error" not in r]
