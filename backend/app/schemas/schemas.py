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


