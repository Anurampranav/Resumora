import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import JobRole, Resume, ResumeAnalysis, User
from app.schemas.schemas import (
    AcceptRewriteRequest,
    ActionCenterResponse,
    AIChatRequest,
    AIChatResponse,
    BulletCoachRequest,
    BulletCoachResponse,
    CareerGuidanceOut,
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    InterviewQuestionsResponse,
    SectionCoachRequest,
    SectionCoachResponse,
)
from app.services.ai.base import get_ai_provider
from app.services.parsing.resume_parser import extract_text
from app.services.storage.base import get_storage_provider

router = APIRouter(prefix="/ai-coach", tags=["ai-coach"])
settings = get_settings()
logger = logging.getLogger(__name__)


def _get_resume_and_text(resume_id: str, current_user: User, db: Session) -> tuple[Resume, str, str]:
    """Helper to fetch user resume, download stored file, extract raw text, and get target role."""
    try:
        res_uuid = uuid.UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid resume ID format")

    resume = (
        db.query(Resume)
        .filter(Resume.id == res_uuid, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    target_role_name = "General Software Engineer"
    if resume.job_role_id:
        role = db.query(JobRole).filter(JobRole.id == resume.job_role_id).first()
        if role:
            target_role_name = role.name

    raw_text = ""
    try:
        storage = get_storage_provider(settings.storage_provider)
        contents = storage.download(resume.file_path)
        raw_text = extract_text(contents, resume.file_type)
    except Exception as exc:
        logger.warning(f"Storage download failed: {exc}. Using fallback text from parsed components.")
        parts = []
        if resume.parsed_skills:
            parts.append(f"Skills: {', '.join(resume.parsed_skills)}")
        if resume.parsed_experience:
            parts.append(f"Experience: {', '.join(resume.parsed_experience)}")
        if resume.parsed_projects:
            parts.append(f"Projects: {', '.join(resume.parsed_projects)}")
        raw_text = "\n\n".join(parts) if parts else "Resume content unavailable."

    return resume, raw_text, target_role_name


@router.post("/{resume_id}/chat", response_model=AIChatResponse)
def chat_with_resumora_ai(
    resume_id: str,
    body: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Multi-turn conversational chat with Gemini using user's actual uploaded resume."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    history_dicts = [{"role": m.role, "content": m.content} for m in body.history]
    
    if hasattr(ai, "chat"):
        res = ai.chat(raw_text, target_role, body.question, history_dicts)
        return AIChatResponse(
            reply=res.get("reply", "Analysis completed."),
            suggested_questions=res.get("suggested_questions", []),
        )
    
    return AIChatResponse(
        reply=f"Based on your resume for {target_role}, I recommend highlighting measurable technical impact.",
        suggested_questions=["What should I improve first?", "Is my project section strong?"],
    )


@router.post("/{resume_id}/section", response_model=SectionCoachResponse)
def analyze_section_coach(
    resume_id: str,
    body: SectionCoachRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Section-by-section analysis and dynamic rewrite."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    # Determine section content from parsed attributes if not explicitly provided
    section_content = body.section_text or ""
    if not section_content:
        name_lower = body.section_name.lower()
        if "summary" in name_lower:
            section_content = raw_text[:400]
        elif "experience" in name_lower and resume.parsed_experience:
            section_content = "\n• ".join(resume.parsed_experience)
        elif "project" in name_lower and resume.parsed_projects:
            section_content = "\n• ".join(resume.parsed_projects)
        elif "skill" in name_lower and resume.parsed_skills:
            section_content = ", ".join(resume.parsed_skills)
        elif "achiev" in name_lower and resume.parsed_achievements:
            section_content = "\n• ".join(resume.parsed_achievements)
        else:
            section_content = raw_text[:1000]

    if hasattr(ai, "analyze_section"):
        res = ai.analyze_section(raw_text, target_role, body.section_name, section_content)
        return SectionCoachResponse(
            section_name=res.get("section_name", body.section_name),
            strong=res.get("strong", []),
            weak=res.get("weak", []),
            missing=res.get("missing", []),
            changes=res.get("changes", []),
            why_improve=res.get("why_improve", ""),
            suggested_version=res.get("suggested_version", section_content),
        )

    return SectionCoachResponse(
        section_name=body.section_name,
        strong=["Clear technical stack listed."],
        weak=["Could emphasize active outcomes."],
        missing=["Quantitative performance metrics."],
        changes=["Reframe descriptions with action verbs."],
        why_improve="Improving this section increases candidate impact score.",
        suggested_version=section_content,
    )


@router.post("/{resume_id}/bullet", response_model=BulletCoachResponse)
def analyze_bullet_coach(
    resume_id: str,
    body: BulletCoachRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """In-depth Bullet Point Coach analysis."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    context = body.context or raw_text[:2000]

    if hasattr(ai, "analyze_bullet_detailed"):
        res = ai.analyze_bullet_detailed(body.original_bullet, target_role, context)
        return BulletCoachResponse(
            original=res.get("original", body.original_bullet),
            clarity_assessment=res.get("clarity_assessment", "Clear phrasing."),
            impact_assessment=res.get("impact_assessment", "Could highlight outcomes."),
            specificity_assessment=res.get("specificity_assessment", "Mentions core technologies."),
            recommendation=res.get("recommendation", "Use action verbs and quantitative metrics."),
            suggested_version=res.get("suggested_version", body.original_bullet),
        )

    suggested = ai.rewrite_bullet(body.original_bullet, target_role)
    return BulletCoachResponse(
        original=body.original_bullet,
        clarity_assessment="Direct phrasing.",
        impact_assessment="Needs quantitative metrics.",
        specificity_assessment="Identifies core technical work.",
        recommendation="Use action verbs and quantitative impact.",
        suggested_version=suggested,
    )


@router.get("/{resume_id}/guidance", response_model=CareerGuidanceOut)
def get_career_guidance(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Career guidance, next skill recommendations, custom project ideas, and improvement plan."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    parsed_skills = resume.parsed_skills or []

    if hasattr(ai, "generate_career_guidance"):
        res = ai.generate_career_guidance(raw_text, target_role, parsed_skills)
        return CareerGuidanceOut(
            suited_roles=res.get("suited_roles", [target_role]),
            potential_next_skills=res.get("potential_next_skills", []),
            project_recommendations=res.get("project_recommendations", []),
            improvement_plan=res.get("improvement_plan", []),
        )

    return CareerGuidanceOut(
        suited_roles=[target_role, "Software Engineer"],
        potential_next_skills=[
            {"skill": "Docker", "why": "Essential for containerization."},
            {"skill": "AWS", "why": "Boosts cloud architecture credentials."}
        ],
        project_recommendations=[
            {
                "title": "Scalable REST Service",
                "why": "Demonstrates backend API design skills.",
                "skills_demonstrated": ["FastAPI", "PostgreSQL"],
                "potential_value": "Shows real-world backend readiness."
            }
        ],
        improvement_plan=[
            {
                "priority": "HIGH",
                "category": "Projects",
                "title": "Reframe project accomplishments",
                "recommendation": "Use active action verbs and quantitative results.",
                "action_tab": "rewriter"
            }
        ],
    )


@router.get("/{resume_id}/action-center", response_model=ActionCenterResponse)
def get_action_center(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Top AI Action Center priority items."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    missing_skills = []
    if resume.latest_analysis:
        missing_skills = resume.latest_analysis.missing_skills or []

    if hasattr(ai, "generate_action_center"):
        res = ai.generate_action_center(raw_text, target_role, missing_skills)
        return ActionCenterResponse(items=res.get("items", []))

    return ActionCenterResponse(
        items=[
            {
                "id": "act-1",
                "priority": "HIGH",
                "title": "Reframe project descriptions with technical results",
                "description": "Convert passive statements into outcome-driven metrics.",
                "workflow_target": "rewriter"
            },
            {
                "id": "act-2",
                "priority": "MEDIUM",
                "title": "Strengthen professional summary",
                "description": "Align your headline directly with your target role.",
                "workflow_target": "section"
            }
        ]
    )


@router.get("/{resume_id}/interview-questions", response_model=InterviewQuestionsResponse)
def get_interview_questions(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Resume-tailored interview questions."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    if hasattr(ai, "generate_interview_prep"):
        res = ai.generate_interview_prep(raw_text, target_role)
        return InterviewQuestionsResponse(questions=res.get("questions", []))

    return InterviewQuestionsResponse(
        questions=[
            {
                "id": "q-1",
                "category": "Technical",
                "question": f"How do you optimize API query latency when working with backend frameworks for {target_role}?",
                "why_asked": "Evaluates architectural depth and optimization strategies.",
                "key_talking_points": ["Database indexing", "Caching layer", "Asynchronous handlers"]
            }
        ]
    )


@router.post("/{resume_id}/evaluate-answer", response_model=EvaluateAnswerResponse)
def evaluate_interview_answer(
    resume_id: str,
    body: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Evaluate candidate interview answer."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    ai = get_ai_provider(settings.ai_provider)

    if hasattr(ai, "evaluate_interview_answer"):
        res = ai.evaluate_interview_answer(body.question_text, body.user_answer, raw_text)
        return EvaluateAnswerResponse(
            score=res.get("score", 85),
            strengths=res.get("strengths", []),
            weaknesses=res.get("weaknesses", []),
            missing_points=res.get("missing_points", []),
            better_answer_structure=res.get("better_answer_structure", "Use STAR framework."),
        )

    return EvaluateAnswerResponse(
        score=82,
        strengths=["Clear technical context."],
        weaknesses=["Could include quantitative impact metrics."],
        missing_points=["Trade-off rationale."],
        better_answer_structure="Structure answer with Situation -> Task -> Action -> Result."
    )


@router.post("/{resume_id}/accept-rewrite")
def accept_rewrite(
    resume_id: str,
    body: AcceptRewriteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates working resume state when user accepts an AI improvement."""
    resume, raw_text, target_role = _get_resume_and_text(resume_id, current_user, db)
    
    sec_name = body.section_name.lower()
    if "summary" in sec_name:
        resume.parsed_summary = body.new_content
    elif "experience" in sec_name:
        resume.parsed_experience = [body.new_content]
    elif "project" in sec_name:
        resume.parsed_projects = [body.new_content]
    
    db.commit()
    return {"status": "success", "message": f"Updated {body.section_name} content."}
