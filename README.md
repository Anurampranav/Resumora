<div align="center">

# Resumora

**AI-Powered Resume Analyzer & ATS Score Optimizer**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.dev/)

Upload your resume, choose a target job role, and get a deterministic ATS score plus AI-driven improvement suggestions — instantly.

</div>

---

## Overview

Resumora is a full-stack resume analysis platform that helps job seekers understand how their resume performs against Applicant Tracking Systems (ATS). Users upload a PDF or DOCX resume, optionally select a target role from 15 seeded job profiles, and instantly receive:

- A **deterministic ATS score** (0–100) broken down across 8 categories
- A **skills gap analysis** showing which required skills are missing
- **AI-generated suggestions** explaining the score and recommending improvements
- **On-demand bullet-point rewrites** powered by Gemini (or OpenAI/Claude)
- A **full analysis history** across all uploaded resumes

---

## Features

| Feature | Status |
|---|---|
| Resume upload (PDF / DOCX, up to 10 MB) | ✅ Implemented |
| Deterministic ATS scoring (8-category breakdown) | ✅ Implemented |
| Skills gap analysis vs. target job role | ✅ Implemented |
| AI summary and improvement suggestions | ✅ Implemented |
| On-demand weak bullet-point rewrite | ✅ Implemented |
| Re-analyze existing resume | ✅ Implemented |
| Resume download (original file) | ✅ Implemented |
| Resume delete | ✅ Implemented |
| Analysis history (paginated list) | ✅ Implemented |
| Full per-resume analysis report page | ✅ Implemented |
| 15 seeded job roles with required/preferred skills | ✅ Implemented |
| Job role browser with search | ✅ Implemented |
| Side-by-side job role comparison (up to 4 roles) | ✅ Implemented |
| Dashboard summary (score, match %, stats) | ✅ Implemented |
| Radar chart score visualization | ✅ Implemented |
| Clerk authentication (email + Google + GitHub OAuth) | ✅ Implemented |
| Dark / light theme | ✅ Implemented |
| Route protection via Next.js middleware | ✅ Implemented |
| Rate limiting on sensitive endpoints | ✅ Implemented |
| Local disk storage (default) + Supabase Storage (config) | ✅ Implemented |
| Mock AI provider (no key required for dev) | ✅ Implemented |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | Recharts, Framer Motion, Lucide React |
| **Backend** | FastAPI (Python 3.13), Uvicorn |
| **Database** | PostgreSQL via SQLAlchemy 2.x (hosted on Supabase) |
| **Auth** | Clerk (RS256 JWT verification, JIT user provisioning) |
| **AI** | Gemini (default) — provider-agnostic interface supports OpenAI, Claude, or a built-in mock |
| **File Storage** | Local disk (dev default) or Supabase Storage (set via env var) |
| **Rate Limiting** | SlowAPI |

---

## Architecture

```mermaid
graph TD
    Browser["Browser (Next.js)"]
    Clerk["Clerk Auth"]
    API["FastAPI Backend :8000"]
    DB["PostgreSQL (Supabase)"]
    Storage["File Storage<br/>(Local disk / Supabase)"]
    AI["AI Provider<br/>(Gemini / OpenAI / Claude / Mock)"]
    ATS["ATS Scoring Engine<br/>(deterministic, no AI)"]

    Browser -->|"Clerk JWT"| API
    Browser <-->|"OAuth / session"| Clerk
    API -->|"verify JWT"| Clerk
    API --> DB
    API --> Storage
    API --> ATS
    API --> AI
    ATS -->|"score breakdown"| API
    AI -->|"suggestions only"| API
```

> **Important design principle:** The ATS score is always computed by the deterministic rule-based engine (`services/ats/scoring_engine.py`). AI is used *only* to explain the score and suggest improvements — it never influences the score itself.

---

## ATS Scoring Breakdown

Scores are computed deterministically from the parsed resume content. The same resume always produces the same score.

| Category | Max Points | What is evaluated |
|---|---|---|
| **Formatting** | 20 | Presence of standard sections (Experience, Education, Skills), email, phone number |
| **Skills** | 20 | Match against job role's required (2×) and preferred (1×) skills |
| **Experience** | 15 | Number and quality of experience bullet points |
| **Projects** | 15 | Number of listed projects |
| **Grammar** | 10 | Absence of weak verbs (e.g. "responsible for", "worked on", "helped with") |
| **Readability** | 10 | Average bullet-point length (sweet spot: 12–22 words) |
| **Education** | 5 | Presence of an education section |
| **Achievements** | 5 | Number of listed achievements |
| **Total** | **100** | Sum of above |

Skills scoring uses **weighted matching**: required skills carry 2× the weight of preferred skills, so a missing required skill costs more than a missing preferred one.

---

## Upload & Analysis Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant ATS as ATS Engine
    participant AI as AI Provider
    participant DB as Database
    participant S as Storage

    U->>FE: Upload resume (PDF/DOCX) + select job role
    FE->>BE: POST /resumes/upload (multipart, Clerk JWT)
    BE->>S: Save file to storage
    BE->>ATS: Parse text → deterministic score
    BE->>AI: Generate summary + suggestions
    BE->>DB: Persist resume + analysis
    BE->>FE: Return full AnalysisOut
    FE->>U: Show score, breakdown, suggestions
```

---

## Job Roles

15 job roles are seeded automatically on first backend startup. Each role has **required** and **preferred** skills used for ATS scoring.

| Role | Industry |
|---|---|
| Software Engineer | Technology |
| Backend Developer | Technology |
| Frontend Developer | Technology |
| AI Engineer | Technology |
| Machine Learning Engineer | Technology |
| Data Analyst | Technology |
| Data Scientist | Technology |
| Cybersecurity Engineer | Technology |
| Cloud Engineer | Technology |
| DevOps Engineer | Technology |
| UI/UX Designer | Design |
| Android Developer | Technology |
| iOS Developer | Technology |
| Product Manager | Technology |
| Business Analyst | Business |

You can also browse and compare up to 4 roles side-by-side via the **Job Roles** page or the `/job-roles/compare/by-slugs` API endpoint.

---

## Project Structure

```
resumora/
├── frontend/                   # Next.js 15 application
│   ├── app/
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── resumes/            # Resume list + per-resume analysis report
│   │   │   └── [id]/           # Full analysis report for one resume
│   │   ├── job-roles/          # Job role browser + comparison
│   │   ├── sign-in/            # Clerk-powered login page
│   │   └── sign-up/            # Clerk-powered signup page
│   ├── components/             # Shared UI components
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   ├── UploadModal.tsx
│   │   ├── AtsScoreChart.tsx
│   │   ├── ScoreBreakdownRadar.tsx
│   │   ├── CircularScore.tsx
│   │   ├── AiSuggestionCard.tsx
│   │   ├── AnalyticsCards.tsx
│   │   └── RecentAnalyses.tsx
│   ├── lib/
│   │   ├── api.ts              # Typed API client (all fetch calls)
│   │   └── auth.ts             # Auth abstraction (Clerk)
│   ├── middleware.ts            # Route protection (redirects unauthenticated users)
│   └── .env.example
│
├── backend/                    # FastAPI application
│   └── app/
│       ├── api/routes/
│       │   ├── resumes.py      # Upload, list, detail, reanalyze, download, delete
│       │   ├── dashboard.py    # Dashboard summary stats
│       │   ├── job_roles.py    # List, detail, compare
│       │   └── auth.py         # JIT user provisioning
│       ├── core/
│       │   ├── config.py       # Pydantic settings (reads .env)
│       │   ├── security.py     # Clerk JWT verification
│       │   └── limiter.py      # SlowAPI rate limiter
│       ├── db/
│       │   ├── database.py     # SQLAlchemy engine + session
│       │   └── seed.py         # Auto-seeds 15 job roles on startup
│       ├── models/models.py    # SQLAlchemy ORM models
│       ├── schemas/schemas.py  # Pydantic request/response schemas
│       └── services/
│           ├── ai/             # AI provider abstraction (Gemini/OpenAI/Claude/Mock)
│           ├── ats/            # Deterministic ATS scoring engine
│           ├── parsing/        # PDF + DOCX text extraction
│           └── storage/        # File storage abstraction (local / Supabase)
│
├── database/
│   └── schema.sql              # Full PostgreSQL schema
│
└── docs/
    └── ARCHITECTURE.md         # Provider abstraction pattern details
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** (or a [Supabase](https://supabase.com) project)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section below)

# Verify your setup (optional but recommended)
python check_setup.py

# Start the backend
uvicorn app.main:app --reload
# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

> The backend auto-creates all database tables and seeds 15 job roles on first startup — no migration step needed.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk keys

# Start the development server
npm run dev
# Frontend runs at http://localhost:3000
```

---

## Environment Variables

### Backend — `backend/.env`

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/dbname

# Clerk authentication (RS256 JWT verification)
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://<your-clerk-instance>.clerk.accounts.dev/.well-known/jwks.json

# Supabase Storage (optional — leave blank to use local disk storage)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI provider: mock | gemini | openai | claude
# Leave as "mock" during development — no API key needed
AI_PROVIDER=mock
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# App settings
JWT_SECRET=change-me-in-production
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend — `frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk (get from Clerk Dashboard → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

> **Never commit `.env` or `.env.local` files.** Both are in `.gitignore`. Only `.env.example` files are committed.

---

## Authentication

Resumora uses **[Clerk](https://clerk.dev)** for authentication:

- **Sign-in options:** Email/password, Google OAuth, GitHub OAuth
- **JWT verification:** Backend verifies Clerk RS256 JWTs against Clerk's JWKS endpoint
- **JIT provisioning:** A local `users` row is auto-created on a new user's first API request, keyed by `external_auth_id` — no separate registration step needed
- **Route protection:** `middleware.ts` redirects unauthenticated users away from `/dashboard`, `/resumes`, and `/job-roles` to `/sign-in`
- **Fallback:** If `CLERK_JWKS_URL` is not set, the backend falls back to local JWT verification (useful for testing without a Clerk account)

---

## Database

The schema (`database/schema.sql`) is a normalized PostgreSQL schema with the following core tables:

| Table | Purpose |
|---|---|
| `users` | Registered users (keyed by Clerk `external_auth_id`) |
| `resumes` | Uploaded resume metadata + parsed content (JSONB) |
| `resume_analyses` | ATS score breakdown + AI output per analysis run |
| `job_roles` | 15 seeded roles with slug, name, industry, demand level |
| `skills` | Skill catalog |
| `job_role_skills` | Many-to-many: which skills belong to which role, with `required`/`preferred` importance |

SQLAlchemy ORM models mirror this schema. Tables are created automatically via `Base.metadata.create_all()` on startup.

---

## API Reference

Interactive API docs are available at **`http://localhost:8000/docs`** (Swagger UI) when the backend is running.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/auth/provision` | JIT user provisioning |
| `POST` | `/resumes/upload` | Upload + analyze a resume |
| `GET` | `/resumes` | List all resumes (paginated) |
| `GET` | `/resumes/{id}` | Get resume detail + latest analysis |
| `POST` | `/resumes/{id}/reanalyze` | Re-run analysis on stored file |
| `POST` | `/resumes/{id}/rewrite-bullet` | On-demand AI bullet rewrite |
| `GET` | `/resumes/{id}/download` | Download original file |
| `DELETE` | `/resumes/{id}` | Delete resume + stored file |
| `GET` | `/dashboard/summary` | Dashboard stats for current user |
| `GET` | `/job-roles` | List all job roles (supports `?q=` search) |
| `GET` | `/job-roles/{slug}` | Job role detail with required/preferred skills |
| `GET` | `/job-roles/compare/by-slugs` | Compare up to 4 roles (`?slugs=a,b,c,d`) |

---

## Security Notes

- All resume endpoints require a valid Clerk JWT in the `Authorization: Bearer <token>` header
- Users can only access their own resumes (enforced at the DB query level)
- File uploads are validated for MIME type (PDF/DOCX only) and capped at **10 MB**
- Rate limits are applied to upload (10/min), reanalyze (10/min), rewrite-bullet (20/min), and auth endpoints
- CORS is restricted to configured `ALLOWED_ORIGINS`
- Secrets never appear in API responses

---

## AI Provider Abstraction

The AI layer is fully swappable via the `AI_PROVIDER` environment variable — no code changes required:

```
AI_PROVIDER=mock    → uses MockProvider   (offline, no key needed — default)
AI_PROVIDER=gemini  → uses GeminiProvider (requires GEMINI_API_KEY)
AI_PROVIDER=openai  → uses OpenAIProvider (requires OPENAI_API_KEY)
AI_PROVIDER=claude  → uses ClaudeProvider (requires ANTHROPIC_API_KEY)
```

All providers implement the same `AIProvider` interface (`services/ai/base.py`). The mock provider returns realistic placeholder suggestions so the full UI works during development without any API keys.

---

## Roadmap

- [ ] **AI-powered resume rewriter** — generate an ATS-optimized DOCX/PDF version of the resume
- [ ] **Cover letter generator** — AI-generated cover letter tailored to the target role
- [ ] **More job roles** — expand beyond the current 15 technology-focused roles
- [ ] **Resume scoring history chart** — track score improvement over multiple uploads
- [ ] **Email notifications** — notify users when analysis is complete
- [ ] **Deployment** — Docker Compose setup + cloud deployment guide

---

## Local Development Tips

- Run `python check_setup.py` in the backend directory to verify your `.env`, dependencies, and database connectivity before starting the server
- The frontend shows a "Backend isn't reachable" error if the backend is not running on port 8000 — check `NEXT_PUBLIC_API_URL` in `.env.local`
- Uploaded files land in `backend/storage_data/` by default (local disk provider). Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to switch to Supabase Storage automatically
- Use `AI_PROVIDER=mock` during development to avoid AI API costs

---

<div align="center">
Built with Next.js · FastAPI · PostgreSQL · Clerk · Gemini
</div>
