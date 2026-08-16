"""Idempotent seed data for job roles + skills, per the role list in the
brief. Run at startup (see main.py) and safe to run repeatedly — it only
inserts what's missing.
"""
from sqlalchemy.orm import Session

from app.models.models import JobRole, JobRoleSkill, Skill

ROLES: list[dict] = [
    {
        "slug": "software-engineer",
        "name": "Software Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Python", "Java", "Git", "SQL", "Data Structures", "Algorithms"],
        "preferred": ["Docker", "AWS", "CI/CD"],
    },
    {
        "slug": "backend-developer",
        "name": "Backend Developer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Python", "SQL", "REST APIs", "PostgreSQL", "Git"],
        "preferred": ["Docker", "Redis", "Kubernetes", "FastAPI"],
    },
    {
        "slug": "frontend-developer",
        "name": "Frontend Developer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
        "preferred": ["Next.js", "Tailwind CSS", "Redux"],
    },
    {
        "slug": "ai-engineer",
        "name": "AI Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Python", "Machine Learning", "PyTorch", "SQL"],
        "preferred": ["TensorFlow", "LangChain", "Docker", "AWS"],
    },
    {
        "slug": "machine-learning-engineer",
        "name": "Machine Learning Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Python", "Machine Learning", "TensorFlow", "Statistics"],
        "preferred": ["PyTorch", "MLOps", "Docker", "Kubernetes"],
    },
    {
        "slug": "data-analyst",
        "name": "Data Analyst",
        "industry": "Technology",
        "demand_level": 4,
        "required": ["SQL", "Excel", "Data Visualization", "Python"],
        "preferred": ["Tableau", "Power BI", "Statistics"],
    },
    {
        "slug": "data-scientist",
        "name": "Data Scientist",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Python", "SQL", "Statistics", "Machine Learning"],
        "preferred": ["Pandas", "Scikit-learn", "Data Visualization"],
    },
    {
        "slug": "cybersecurity-engineer",
        "name": "Cybersecurity Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Network Security", "Linux", "Python", "SIEM"],
        "preferred": ["Penetration Testing", "AWS Security", "Cryptography"],
    },
    {
        "slug": "cloud-engineer",
        "name": "Cloud Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["AWS", "Linux", "Networking", "Terraform"],
        "preferred": ["Kubernetes", "Docker", "Azure", "GCP"],
    },
    {
        "slug": "devops-engineer",
        "name": "DevOps Engineer",
        "industry": "Technology",
        "demand_level": 5,
        "required": ["Docker", "CI/CD", "Linux", "Git", "AWS"],
        "preferred": ["Kubernetes", "Terraform", "Ansible"],
    },
    {
        "slug": "ui-ux-designer",
        "name": "UI UX Designer",
        "industry": "Design",
        "demand_level": 4,
        "required": ["Figma", "Wireframing", "User Research", "Prototyping"],
        "preferred": ["Adobe XD", "Design Systems", "Usability Testing"],
    },
    {
        "slug": "android-developer",
        "name": "Android Developer",
        "industry": "Technology",
        "demand_level": 4,
        "required": ["Kotlin", "Java", "Android SDK", "Git"],
        "preferred": ["Jetpack Compose", "Firebase", "REST APIs"],
    },
    {
        "slug": "ios-developer",
        "name": "iOS Developer",
        "industry": "Technology",
        "demand_level": 4,
        "required": ["Swift", "Xcode", "UIKit", "Git"],
        "preferred": ["SwiftUI", "Core Data", "REST APIs"],
    },
    {
        "slug": "product-manager",
        "name": "Product Manager",
        "industry": "Technology",
        "demand_level": 4,
        "required": ["Product Strategy", "Roadmapping", "Stakeholder Management", "Agile"],
        "preferred": ["SQL", "A/B Testing", "User Research"],
    },
    {
        "slug": "business-analyst",
        "name": "Business Analyst",
        "industry": "Business",
        "demand_level": 4,
        "required": ["Requirements Gathering", "SQL", "Excel", "Data Visualization"],
        "preferred": ["Agile", "Power BI", "Process Mapping"],
    },
]


def seed_job_roles(db: Session) -> None:
    if db.query(JobRole).count() > 0:
        return  # already seeded

    skill_cache: dict[str, Skill] = {}

    def get_or_create_skill(name: str) -> Skill:
        if name not in skill_cache:
            existing = db.query(Skill).filter(Skill.name == name).first()
            skill_cache[name] = existing or Skill(name=name)
            if not existing:
                db.add(skill_cache[name])
                db.flush()
        return skill_cache[name]

    for role_data in ROLES:
        role = JobRole(
            slug=role_data["slug"],
            name=role_data["name"],
            description=f"{role_data['name']} — required and preferred skill profile.",
            industry=role_data["industry"],
            demand_level=role_data["demand_level"],
        )
        db.add(role)
        db.flush()

        for skill_name in role_data["required"]:
            skill = get_or_create_skill(skill_name)
            db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="required", weight=2))
        for skill_name in role_data["preferred"]:
            skill = get_or_create_skill(skill_name)
            db.add(JobRoleSkill(job_role_id=role.id, skill_id=skill.id, importance="preferred", weight=1))

    db.commit()
