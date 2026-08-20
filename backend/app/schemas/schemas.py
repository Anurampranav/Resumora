from pydantic import BaseModel


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    is_premium: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupIn(BaseModel):
    email: str
    full_name: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class ScoreBreakdownOut(BaseModel):
    formatting: int
    skills: int
    projects: int
    experience: int
    grammar: int
    readability: int
    education: int
    achievements: int
    overall: int


class WeakBulletOut(BaseModel):
    original: str
    suggested: str


class AnalysisOut(BaseModel):
    resume_id: str
    overall_score: int
    match_percentage: int
    target_role: str
    breakdown: ScoreBreakdownOut
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    formatting_issues: list[str]
    weak_bullet_points: list[WeakBulletOut]
    ai_summary: str
    ai_suggestions: list[str]


class ResumeListItemOut(BaseModel):
    id: str
    file_name: str
    file_type: str
    role_name: str | None
    status: str
    overall_score: int | None
    match_percentage: int | None
    created_at: str


class ResumeDetailOut(BaseModel):
    id: str
    file_name: str
    file_type: str
    role_name: str | None
    status: str
    created_at: str
    latest_analysis: AnalysisOut | None


class JobDescriptionAnalysisIn(BaseModel):
    job_description: str
    resume_id: str | None = None


class JobDescriptionAnalysisOut(BaseModel):
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[str]
    missing_keywords: list[str]
    experience_status: str
    education_status: str
    suggestions: list[str]


class TopJobMatchOut(BaseModel):
    name: str
    slug: str
    match_percentage: int
    color: str = "#6366F1"


class SkillCategoryBreakdownOut(BaseModel):
    name: str
    category: str  # "critical" | "recommended" | "optional"


class SkillGapAnalysisOut(BaseModel):
    skill_coverage_percent: int
    strong_skills: list[str]
    missing_skills: list[SkillCategoryBreakdownOut]


class VersionComparisonMetricsOut(BaseModel):
    oldest_resume_name: str
    latest_resume_name: str
    ats_score_old: int
    ats_score_new: int
    ats_score_diff: int
    skills_matched_old: str
    skills_matched_new: str
    skills_matched_diff: int
    keywords_found_old: str
    keywords_found_new: str
    keywords_found_diff: int
    readability_old: int
    readability_new: int
    readability_diff: int
    formatting_old: int
    formatting_new: int
    formatting_diff: int
    impact_old: int
    impact_new: int
    impact_diff: int


class DashboardSummaryOut(BaseModel):
    overall_ats_score: int
    resume_match_percent: int | None
    target_role_name: str | None
    has_target_job: bool
    missing_skills_count: int
    critical_missing_count: int
    resumes_analyzed_this_month: int
    latest_resume_id: str | None
    latest_breakdown: ScoreBreakdownOut | None
    latest_ai_summary: str | None
    skill_gap: SkillGapAnalysisOut | None
    top_job_matches: list[TopJobMatchOut]
    version_comparison: VersionComparisonMetricsOut | None
class AtsReportDetailOut(BaseModel):
    report_id: str
    resume_id: str
    resume_filename: str
    candidate_name: str
    analysis_date: str
    target_role: str | None
    overall_score: int
    status: str
    executive_summary: str
    breakdown: ScoreBreakdownOut
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    formatting_issues: list[str]
    weak_bullet_points: list[WeakBulletOut]
    ai_suggestions: list[str]
    download_url: str


# --- AI Coach Schemas ---

class AIChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class AIChatRequest(BaseModel):
    question: str
    history: list[AIChatMessage] = []


class AIChatResponse(BaseModel):
    reply: str
    suggested_questions: list[str] = []


class SectionCoachRequest(BaseModel):
    section_name: str  # "Summary" | "Experience" | "Projects" | "Skills" | "Achievements"
    section_text: str | None = None


class SectionCoachResponse(BaseModel):
    section_name: str
    strong: list[str]
    weak: list[str]
    missing: list[str]
    changes: list[str]
    why_improve: str
    suggested_version: str


class BulletCoachRequest(BaseModel):
    original_bullet: str
    context: str | None = None


class BulletCoachResponse(BaseModel):
    original: str
    clarity_assessment: str
    impact_assessment: str
    specificity_assessment: str
    recommendation: str
    suggested_version: str


class ProjectRecommendationOut(BaseModel):
    title: str
    why: str
    skills_demonstrated: list[str]
    potential_value: str


class ImprovementPlanItemOut(BaseModel):
    priority: str  # "HIGH" | "MEDIUM" | "LOW"
    category: str
    title: str
    recommendation: str
    action_tab: str  # "rewriter" | "section" | "bullet" | "skills"


class CareerGuidanceOut(BaseModel):
    suited_roles: list[str]
    potential_next_skills: list[dict[str, str]]  # [{"skill": str, "why": str}]
    project_recommendations: list[ProjectRecommendationOut]
    improvement_plan: list[ImprovementPlanItemOut]


class ActionCenterItemOut(BaseModel):
    id: str
    priority: str  # "HIGH" | "MEDIUM" | "LOW"
    title: str
    description: str
    workflow_target: str  # "rewriter" | "section" | "bullet" | "interview"


class ActionCenterResponse(BaseModel):
    items: list[ActionCenterItemOut]


class InterviewQuestionOut(BaseModel):
    id: str
    category: str  # "Technical" | "Project-based" | "Behavioral" | "Resume-based"
    question: str
    why_asked: str
    key_talking_points: list[str]


class InterviewQuestionsResponse(BaseModel):
    questions: list[InterviewQuestionOut]


class EvaluateAnswerRequest(BaseModel):
    question_id: str
    question_text: str
    user_answer: str


class EvaluateAnswerResponse(BaseModel):
    score: int
    strengths: list[str]
    weaknesses: list[str]
    missing_points: list[str]
    better_answer_structure: str


class AcceptRewriteRequest(BaseModel):
    section_name: str
    new_content: str


# --- Resume Builder Schemas ---

class PersonalInfoData(BaseModel):
    full_name: str = ""
    professional_title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    website: str = ""

class CareerGoalData(BaseModel):
    target_role: str = ""
    target_company_type: str = ""
    work_mode: str = ""

class SummaryQuestionnaireData(BaseModel):
    self_description: str = ""
    qualities: list[str] = []
    interest_areas: str = ""
    generated_summary: str = ""

class EducationData(BaseModel):
    id: str = ""
    degree: str = ""
    field_of_study: str = ""
    institution: str = ""
    location: str = ""
    start_year: str = ""
    end_year: str = ""
    grade: str = ""
    coursework: str = ""
    achievements: str = ""
    level: str = "higher"  # "higher" | "12th" | "10th"

class ExperienceData(BaseModel):
    id: str = ""
    company: str = ""
    job_title: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    is_current: bool = False
    responsibilities: str = ""
    technologies: str = ""
    accomplishments: str = ""
    bullets: list[str] = []

class InternshipData(BaseModel):
    id: str = ""
    company: str = ""
    role: str = ""
    duration: str = ""
    responsibilities: str = ""
    technologies: str = ""
    achievements: str = ""
    bullets: list[str] = []

class ProjectData(BaseModel):
    id: str = ""
    name: str = ""
    problem_solved: str = ""
    what_built: str = ""
    role: str = ""
    technologies: str = ""
    github_url: str = ""
    live_url: str = ""
    start_date: str = ""
    end_date: str = ""
    contributions: str = ""
    bullets: list[str] = []

class CategorizedSkillsData(BaseModel):
    languages: list[str] = []
    frameworks: list[str] = []
    databases: list[str] = []
    cloud_tools: list[str] = []
    ai_ml: list[str] = []
    soft_skills: list[str] = []

class CertificationData(BaseModel):
    id: str = ""
    name: str = ""
    issuer: str = ""
    issue_date: str = ""
    credential_id: str = ""
    credential_url: str = ""

class AchievementData(BaseModel):
    id: str = ""
    title: str = ""
    description: str = ""
    date: str = ""
    category: str = ""  # hackathon | competition | award | academic | publication

class ExtracurricularData(BaseModel):
    id: str = ""
    organization: str = ""
    role: str = ""
    description: str = ""

class LeadershipData(BaseModel):
    id: str = ""
    organization: str = ""
    position: str = ""
    duration: str = ""
    description: str = ""

class LanguageData(BaseModel):
    language: str = ""
    proficiency: str = ""

class TargetJobData(BaseModel):
    has_target_job: bool = False
    job_description: str = ""
    target_role: str = ""

class ResumeQuestionnairePayload(BaseModel):
    personal_info: PersonalInfoData = PersonalInfoData()
    career_goal: CareerGoalData = CareerGoalData()
    summary: SummaryQuestionnaireData = SummaryQuestionnaireData()
    education: list[EducationData] = []
    has_experience: bool = False
    experience: list[ExperienceData] = []
    has_internships: bool = False
    internships: list[InternshipData] = []
    has_projects: bool = False
    projects: list[ProjectData] = []
    raw_skills_input: str = ""
    skills: CategorizedSkillsData = CategorizedSkillsData()
    has_certifications: bool = False
    certifications: list[CertificationData] = []
    has_achievements: bool = False
    achievements: list[AchievementData] = []
    has_extracurriculars: bool = False
    extracurriculars: list[ExtracurricularData] = []
    has_leadership: bool = False
    leadership: list[LeadershipData] = []
    languages: list[LanguageData] = []
    interests: list[str] = []
    additional_info: str = ""
    target_job: TargetJobData = TargetJobData()
    template: str = "modern_professional"
    section_order: list[str] = ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"]

class BuiltResumeData(BaseModel):
    id: str | None = None
    title: str = "Untitled Resume"
    version: int = 1
    template: str = "modern_professional"
    section_order: list[str] = ["summary", "experience", "projects", "skills", "education", "certifications", "achievements"]
    personal_info: PersonalInfoData
    summary: str
    education: list[EducationData]
    experience: list[ExperienceData]
    internships: list[InternshipData]
    projects: list[ProjectData]
    skills: CategorizedSkillsData
    certifications: list[CertificationData]
    achievements: list[AchievementData]
    extracurriculars: list[ExtracurricularData]
    leadership: list[LeadershipData]
    languages: list[LanguageData]
    interests: list[str]
    additional_info: str
    target_role: str

class BuilderImproveSectionRequest(BaseModel):
    section_name: str
    original_content: str
    target_role: str = "Software Engineer"
    context: str = ""

class BuilderImproveSectionResponse(BaseModel):
    original: str
    why_improve: str
    suggested: str

class BuilderATSCheckRequest(BaseModel):
    resume_data: BuiltResumeData

class BuilderATSCheckResponse(BaseModel):
    score: int
    strengths: list[str]
    issues: list[str]
    recommendations: list[str]


