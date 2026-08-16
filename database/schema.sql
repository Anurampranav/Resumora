-- Resumora — PostgreSQL schema
-- Normalized per brief: Users, Resumes, ResumeAnalysis, JobRoles, Skills,
-- GeneratedResumes, Payments, Transactions.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_auth_id TEXT UNIQUE NOT NULL,   -- Clerk user id (or any auth provider's id)
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE job_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT UNIQUE NOT NULL,      -- e.g. 'software-engineer'
    name            TEXT NOT NULL,             -- 'Software Engineer'
    description     TEXT,
    industry        TEXT,
    demand_level    SMALLINT CHECK (demand_level BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT UNIQUE NOT NULL,
    category        TEXT                       -- 'language', 'framework', 'tool', 'soft-skill'
);

-- Many-to-many: which skills matter for which role, and how much
CREATE TABLE job_role_skills (
    job_role_id     UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
    skill_id        UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance      TEXT NOT NULL DEFAULT 'required' CHECK (importance IN ('required', 'preferred')),
    weight          SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (job_role_id, skill_id)
);

CREATE TABLE resumes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_role_id     UUID REFERENCES job_roles(id),
    file_name       TEXT NOT NULL,
    file_type       TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes <= 10485760), -- 10 MB
    storage_path    TEXT NOT NULL,             -- Supabase Storage object path
    status          TEXT NOT NULL DEFAULT 'uploaded'
                        CHECK (status IN ('uploaded', 'parsing', 'analyzed', 'failed')),
    -- extracted fields
    parsed_name     TEXT,
    parsed_email    TEXT,
    parsed_phone    TEXT,
    parsed_skills       JSONB,
    parsed_experience   JSONB,
    parsed_projects     JSONB,
    parsed_certifications JSONB,
    parsed_education    JSONB,
    parsed_achievements  JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resume_analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id           UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    -- deterministic ATS engine output
    overall_score        SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    match_percentage      SMALLINT CHECK (match_percentage BETWEEN 0 AND 100),
    score_formatting      SMALLINT CHECK (score_formatting BETWEEN 0 AND 20),
    score_skills          SMALLINT CHECK (score_skills BETWEEN 0 AND 20),
    score_projects        SMALLINT CHECK (score_projects BETWEEN 0 AND 15),
    score_experience       SMALLINT CHECK (score_experience BETWEEN 0 AND 15),
    score_grammar          SMALLINT CHECK (score_grammar BETWEEN 0 AND 10),
    score_readability      SMALLINT CHECK (score_readability BETWEEN 0 AND 10),
    score_education         SMALLINT CHECK (score_education BETWEEN 0 AND 5),
    score_achievements       SMALLINT CHECK (score_achievements BETWEEN 0 AND 5),
    missing_skills          JSONB,             -- ["Docker", "Kubernetes", ...]
    strengths                JSONB,
    weaknesses                JSONB,
    formatting_issues          JSONB,
    weak_bullet_points          JSONB,
    -- AI layer output (explanatory only, never scoring)
    ai_suggestions               JSONB,
    ai_summary                    TEXT,
    ai_provider                    TEXT,        -- 'gemini' | 'openai' | 'claude' | 'mock'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id   TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    amount_paise    INTEGER NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'INR',
    status          TEXT NOT NULL DEFAULT 'created'
                        CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,   -- 'order.created', 'payment.captured', 'payment.failed', ...
    raw_payload     JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE generated_resumes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    payment_id      UUID REFERENCES payments(id),
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
    docx_path       TEXT,
    pdf_path        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resume_analyses_resume_id ON resume_analyses(resume_id);
CREATE INDEX idx_generated_resumes_user_id ON generated_resumes(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
