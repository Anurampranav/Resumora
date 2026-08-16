# Architecture

## Provider abstraction pattern

Every third-party service the brief specifies (Clerk, Supabase, Razorpay,
Gemini) is wired behind a Python ABC or a single frontend module, never
called directly from route/page code. This is what makes "swap Gemini for
Claude later" a one-file change instead of a search-and-replace:

| Concern | Interface | Default (works with no keys) | Real target |
|---|---|---|---|
| Auth | `backend/app/core/security.py` `get_current_user()`, `frontend/lib/auth.ts` | Local HS256 JWT + in-memory password store | Clerk (JWKS verification, `@clerk/nextjs`) |
| AI | `backend/app/services/ai/base.py` `AIProvider` | `MockProvider` (deterministic, offline) | `GeminiProvider` (implemented, needs a real key to exercise) |
| ATS scoring | `backend/app/services/ats/scoring_engine.py` | N/A — always deterministic, no swap needed by design | same |
| Storage | referenced in `resumes.py` as `storage_path`, not yet abstracted into its own module | in-memory bytes only (not persisted) | Supabase Storage — build `services/storage/base.py` in Phase 2 |
| Payments | not yet built | — | Razorpay — build `services/payments/base.py` in Phase 6 |

Rule of thumb going forward: if a route or component needs to know
*which* vendor it's talking to, the abstraction has a leak. Fix the
interface, not the call site.

## Request flow (resume analysis)

```
Upload (frontend) --FormData--> POST /resumes/upload (backend)
                                        |
                                        v
                              stores Resume row, (Phase 2: bytes -> Supabase)
                                        |
POST /resumes/{id}/analyze <-----------+
        |
        v
resume_parser.extract_text()  -- PyMuPDF / python-docx, real, offline
        |
        v
resume_parser.parse_resume()  -- heuristic section splitting
        |
        v
ats/scoring_engine.score_resume()  -- deterministic, NEVER calls AI
        |
        v
ai/base.get_ai_provider().analyze()  -- explains the score, suggests fixes
        |
        v
ResumeAnalysis row persisted, AnalysisOut returned to frontend
```

## Known gaps to close before this is production-ready

- **Storage isn't wired.** Uploaded file bytes aren't persisted between
  the `/upload` and `/analyze` calls in this scaffold — `/analyze`
  currently expects the file re-supplied. Fix in Phase 2 by writing to
  Supabase Storage on upload and reading back on analyze.
- **Clerk verification is unimplemented** (`verify_clerk_token` raises
  501) — there's no live Clerk project to test against from this
  environment. The local-JWT path is fully functional for development.
- **Resume field extraction is heuristic**, not ML-based. It'll do
  reasonably on resumes with standard section headers and will need
  tuning against a real resume corpus.
- **Skill matching only reads the Skills section**, verified against a
  sample resume during testing: a skill mentioned only in an Experience
  bullet (e.g. "migrated to Kubernetes") is *not* counted as matched
  unless it also appears under Skills, so `missing_skills` can list
  things the resume actually demonstrates. Worth extending
  `_score_skills` in Phase 3 to also scan experience/project text.
- **Razorpay, DOCX/PDF generation, and the job-role/skill seed data**
  are Phase 5/6/3 work respectively and aren't in this delivery.
