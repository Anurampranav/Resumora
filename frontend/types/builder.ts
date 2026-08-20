export interface PersonalInfo {
  full_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
}

export interface CareerGoal {
  target_role: string;
  target_company_type: string;
  work_mode: string;
}

export interface SummaryQuestionnaire {
  self_description: string;
  qualities: string[];
  interest_areas: string;
  generated_summary: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  field_of_study: string;
  institution: string;
  location: string;
  start_year: string;
  end_year: string;
  grade: string;
  coursework: string;
  achievements: string;
  level: "higher" | "12th" | "10th";
}

export interface ExperienceItem {
  id: string;
  company: string;
  job_title: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  responsibilities: string;
  technologies: string;
  accomplishments: string;
  bullets: string[];
}

export interface InternshipItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
  technologies: string;
  achievements: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  problem_solved: string;
  what_built: string;
  role: string;
  technologies: string;
  github_url: string;
  live_url: string;
  start_date: string;
  end_date: string;
  contributions: string;
  bullets: string[];
}

export interface CategorizedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud_tools: string[];
  ai_ml: string[];
  soft_skills: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_id: string;
  credential_url: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "hackathon" | "competition" | "award" | "academic" | "publication" | "other";
}

export interface ExtracurricularItem {
  id: string;
  organization: string;
  role: string;
  description: string;
}

export interface LeadershipItem {
  id: string;
  organization: string;
  position: string;
  duration: string;
  description: string;
}

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export interface TargetJob {
  has_target_job: boolean;
  job_description: string;
  target_role: string;
}

export type TemplateId = "ats-minimal" | "modern-professional" | "technical" | "executive";

export interface ResumeData {
  id?: string;
  title?: string;
  personal_info: PersonalInfo;
  career_goal: CareerGoal;
  summary: SummaryQuestionnaire;
  education: EducationItem[];
  has_experience: boolean;
  experience: ExperienceItem[];
  has_internships: boolean;
  internships: InternshipItem[];
  has_projects: boolean;
  projects: ProjectItem[];
  raw_skills_input: string;
  skills: CategorizedSkills;
  has_certifications: boolean;
  certifications: CertificationItem[];
  has_achievements: boolean;
  achievements: AchievementItem[];
  has_extracurriculars: boolean;
  extracurriculars: ExtracurricularItem[];
  has_leadership: boolean;
  leadership: LeadershipItem[];
  languages: LanguageItem[];
  interests: string[];
  additional_info: string;
  target_job: TargetJob;
  template: TemplateId;
  section_order: string[];
}

export interface AiImproveResult {
  original: string;
  why_improve: string;
  suggested: string;
}

export interface AtsCheckResult {
  score: number;
  match_percentage: number;
  target_role: string;
  breakdown: {
    formatting: number;
    skills: number;
    projects: number;
    experience: number;
    grammar: number;
    readability: number;
    education: number;
    achievements: number;
    overall: number;
  };
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  formatting_issues: string[];
  weak_bullet_points: string[];
}

export interface ResumeVersionItem {
  id: string;
  title: string;
  target_role: string | null;
  template: string;
  status: "draft" | "final";
  ats_score: number | null;
  updated_at: string;
}
