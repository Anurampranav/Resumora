# Resumora — AI Resume Analyzer

Production-track SaaS app: users upload a resume, pick a target role, get a
deterministic ATS score plus AI-generated improvement suggestions, and can
pay to unlock an AI-rewritten, ATS-optimized resume (DOCX/PDF).

This repo is being built in phases (per the project brief).

- **Phase 1** — project setup, folder structure, database schema, auth
  abstraction, Dashboard UI built to match the approved design spec.
- **Phase 2** — real resume upload (drag & drop, client validation, live
  progress bar), persistent storage, PDF/DOCX parsing, the deterministic
  ATS engine running against 14 seeded job roles, and the My Resumes
  history page. Upload and analysis are a single request.
- **Phase 3** — the full Analysis Report page per resume (category
  breakdown, missing skills, strengths/weaknesses, weak bullet points,
  formatting issues, AI suggestions), the Job Roles browser (search +
  side-by-side comparison of up to 4 roles' required/preferred skills),
  and wiring the dashboard's radar chart and AI suggestion card to real
  data — both previously rendered with empty defaults despite the data
  existing.
- **Phase 3.1 (hardening)** — fixed a real scoring bug (required and
  preferred skills were weighted identically; required now counts 2x),
  changed bullet rewrites from automatic-on-every-upload to on-demand
  (cuts AI calls per upload from 6 to 1), added pagination to the resume
  list, added rate limiting on upload/reanalyze/rewrite/auth endpoints,
  added a "Coming soon" state for unbuilt sidebar items instead of dead
  links, and wired the real Gemini and Supabase SDKs in.
- **Phase 3.2 (bugfix)** — fixed a hydration mismatch affecting every page
  (browser extensions inject attributes before React hydrates), and added
  `backend/check_setup.py`, a diagnostic script for local setup issues.
- **Phase 3.3 (real auth + theme)** — delivered here. Real credentials are
  wired into `backend/.env` and `frontend/.env.local`:
  - **Clerk auth** — replaced the local-JWT-only auth with real Clerk JWT
    verification (RS256 against Clerk's JWKS) plus JIT user provisioning
    (a local `users` row is auto-created on a new Clerk user's first
    request, keyed by `external_auth_id`, so the rest of the app keeps
    using its own UUIDs). The local-JWT path still exists as a fallback
    when `CLERK_JWKS_URL` isn't set.
  - **Custom login/signup pages** (`/sign-in`, `/sign-up`) — 3D-glassmorphism
    design matching the dashboard's look, with Google and GitHub OAuth via
    Clerk (`useSignIn`/`useSignUp` + `authenticateWithRedirect`), an
    email/password fallback, and a working light/dark theme toggle.
  - **Real dark mode** — the color system was rebuilt on CSS variables
    (48 tokens, each with a light and dark value) instead of flat hex, so
    `next-themes`' dark class actually repaints the whole app, not just
    new components. The `bg-white/opacity` glassmorphism pattern used
    everywhere was converted to a `surface-glass` token that adapts too.
  - **Route protection** — `middleware.ts` redirects unauthenticated users
    away from `/dashboard`, `/resumes`, `/job-roles` to `/sign-in`.
  - **What's verified vs. not**: the Clerk JWT verification and JIT
    provisioning logic was tested against a real RSA-signed token and a
    real local JWKS HTTP server (not just written) — signature validation,
    tampered-token rejection, and duplicate-user prevention all confirmed
    against a real Postgres database. What's *not* verified from this
    environment: an actual OAuth round-trip through Google/GitHub via
    Clerk's live servers, a connection to your real Supabase Postgres
    instance, or a real Gemini API call — this sandbox has no network
    route to any of those domains. Test those yourself once you run it
    locally with your real `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in place.

- **Phase 3.4 (bugfixes)** — delivered here.
  - **Hooks-order crash in UploadModal** — an `if (!open) return null` sat
    between the component's `useState` calls and its `useCallback`, so
    React called a different number of hooks depending on whether the
    modal was open. Since `TopNav` always mounts `<UploadModal
    open={modalOpen} .../>`, this fired every time the modal was opened
    from a closed state. Fixed by moving the early return after all hooks.
    Verified at runtime (not just by review) with `react-test-renderer`:
    mounted the component closed, then transitioned `open` through
    `true→false→true` on the same instance — no hooks-order error.
  - **Unhandled "Failed to fetch" crashes** — `handleReanalyze`,
    `handleDelete`, and the download buttons across `/resumes`,
    `/resumes/[id]`, and `RecentAnalyses` had `try { } finally { }` with no
    `catch`, or no error handling at all, so any network failure crashed
    to Next.js's unhandled-exception overlay instead of showing an inline
    message. Fixed everywhere, and `lib/api.ts`'s `request()` now
    translates a bare `TypeError: Failed to fetch` into an actionable
    message naming the likely causes (backend not running, wrong port,
    CORS) instead of leaving callers to guess. Also widened the default
    `ALLOWED_ORIGINS` to include both `localhost` and `127.0.0.1` on port
    3000, since browsers treat those as different origins for CORS and
    that mismatch is a common cause of this exact failure.

## Plugging in real credentials

`backend/.env` and `frontend/.env.local` already have real Supabase,
Clerk, Gemini, and Razorpay (test mode) credentials wired in. One thing
is still missing and **required** before the app will build or run:

**`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** in `frontend/.env.local` — get it
from Clerk Dashboard → API Keys (same page as the secret key you already
have), starts with `pk_test_...`. Clerk validates this key's *format* at
build time, not just runtime — `npm run build` and `npm run dev` will
both fail immediately without a real one. The placeholder currently in
`.env.local` is a syntactically-valid-but-fake key (built from your
instance's JWKS domain) that gets past the format check for local
testing — swap it for your real one before actually using auth.

Everything else:

**Gemini** (`backend/.env`):
1. Get a free key at [aistudio.google.com](https://aistudio.google.com) → "Get API key"
2. Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=<your key>`

**Supabase Storage** (`backend/.env`):
1. Create a project at [supabase.com](https://supabase.com)
2. Settings → API → copy the **Project URL** and the **service_role** key
   (not the `anon` key — file operations need the elevated role)
3. Storage → New bucket → name it exactly `resumes`, set it **Private**
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

Once those env vars are set, `get_ai_provider()` / `get_storage_provider()`
switch automatically — no code changes. What's been verified without a
live key: both SDKs (`google-generativeai`, `supabase`) install cleanly,
import cleanly, and `GeminiProvider`/`SupabaseStorage`'s calls have been
checked against the installed SDK's actual method signatures (`genai.configure`,
`GenerativeModel`, `create_client`, and the storage bucket's
`upload`/`download`/`remove` signatures) — so the shape is right. What
hasn't been verified: an actual network round-trip to Google's or
Supabase's servers, since this sandbox has no route to either. Test that
part yourself once real keys are in.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL via SQLAlchemy (schema in `database/schema.sql`) |
| Auth | Abstracted behind `lib/auth.ts` (frontend) / `core/security.py` (backend) — swap in Clerk later without touching call sites |
| AI | Abstracted behind `services/ai/base.py` — Gemini is the default provider, OpenAI/Claude are drop-in |
| ATS scoring | Deterministic, rule-based — `services/ats/scoring_engine.py`. Never AI-driven. |
| Storage | Abstracted behind `services/storage/` (Phase 2) — Supabase Storage is the target |
| Payments | Abstracted behind `services/payments/` (Phase 6) — Razorpay is the target |

## A note on this environment

This was built inside a sandboxed dev container with outbound access to
package registries (npm, PyPI) only — not to Clerk, Supabase, Razorpay, or
Gemini. Every third-party integration is written behind an interface with
a working **mock/local implementation** so the app runs end-to-end today,
and swapping in real credentials later is a config change (`.env`), not a
rewrite. None of those integrations have been validated against the live
services — do that before shipping.

## Getting started

```bash
# frontend
cd frontend
npm install
npm run dev        # http://localhost:3000

# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python check_setup.py       # verifies .env, dependencies, and DB connectivity — run this if the frontend says "Backend isn't reachable"
uvicorn app.main:app --reload   # http://localhost:8000
```

Copy `.env.example` to `.env` in both `frontend/` and `backend/` and fill
in real keys when you have them. The app runs without them using mock
providers (see `services/ai/mock_provider.py` and `lib/auth.ts`).

Uploaded files land in `backend/storage_data/` by default (local disk
provider). 14 job roles with required/preferred skills are seeded
automatically on first backend startup — see `app/db/seed.py`.

## Phases

1. **Project setup, folder structure, DB schema, auth scaffold, Dashboard UI** ← this delivery
2. Resume upload, parsing (PDF/DOCX), Supabase storage, resume history
3. ATS scoring engine + job role/skill database
4. Gemini integration for suggestions, rewriting, skill-gap analysis
5. Premium resume generator (DOCX/PDF) with before/after
6. Razorpay payments
7. Testing, deployment, docs

See `docs/ARCHITECTURE.md` for the provider-abstraction pattern used
throughout, and `database/schema.sql` for the full normalized schema.
