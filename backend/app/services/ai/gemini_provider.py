"""Real Gemini implementation. Untested here — this sandbox has no
GEMINI_API_KEY and no network path to Google's API. The call shape is
correct for the `google-generativeai` SDK; verify against a live key
before relying on it. Add `google-generativeai` to requirements.txt
when you wire this in.
"""
import json

from app.core.config import get_settings
from app.services.ai.base import AIProvider, AISuggestions, ResumeContext

PROMPT_TEMPLATE = """You are a resume-improvement assistant. You are given a
resume's extracted text, its target role, and a deterministic ATS score
breakdown that has ALREADY been computed — do not recompute or contradict
the score, only explain it. Never invent experience, projects, skills, or
certifications that are not present in the resume text.

Target role: {target_role}
Missing skills (from deterministic engine): {missing_skills}
ATS category breakdown: {ats_breakdown}

Resume text:
---
{raw_text}
---

Respond ONLY with JSON matching this shape, nothing else:
{{
  "summary": str,
  "strengths": [str],
  "weaknesses": [str],
  "suggestions": [str],
  "weak_bullet_points": [{{"original": str, "suggested": str}}],
  "score_explanation": str
}}
"""


class GeminiProvider(AIProvider):
    def __init__(self):
        settings = get_settings()
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Set AI_PROVIDER=mock for local dev, "
                "or provide a real key to use this provider."
            )
        self._api_key = settings.gemini_api_key

    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        import google.generativeai as genai  # imported lazily so mock mode has no dependency

        genai.configure(api_key=self._api_key)
        model = genai.GenerativeModel("gemini-1.5-pro")

        prompt = PROMPT_TEMPLATE.format(
            target_role=ctx.target_role,
            missing_skills=", ".join(ctx.missing_skills),
            ats_breakdown=json.dumps(ctx.ats_breakdown),
            raw_text=ctx.raw_text[:12000],  # keep prompt bounded
        )
        response = model.generate_content(prompt)
        data = json.loads(response.text)

        return AISuggestions(
            summary=data["summary"],
            strengths=data["strengths"],
            weaknesses=data["weaknesses"],
            suggestions=data["suggestions"],
            weak_bullet_points=data["weak_bullet_points"],
            score_explanation=data["score_explanation"],
        )

    def rewrite_bullet(self, original: str, target_role: str) -> str:
        import google.generativeai as genai

        genai.configure(api_key=self._api_key)
        model = genai.GenerativeModel("gemini-1.5-pro")
        prompt = (
            f"Rewrite this resume bullet for a {target_role} role. Make it "
            f"stronger with an action verb and structure for impact, but do "
            f"NOT invent any numbers, tools, or outcomes not implied by the "
            f"original. Return only the rewritten bullet, nothing else.\n\n"
            f"Original: {original}"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
