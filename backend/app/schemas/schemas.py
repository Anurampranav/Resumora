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


class DashboardSummaryOut(BaseModel):
    overall_ats_score: int
    resume_match_percent: int
    missing_skills_count: int
    resumes_analyzed_this_month: int
    latest_resume_id: str | None
    latest_breakdown: ScoreBreakdownOut | None
    latest_ai_summary: str | None
