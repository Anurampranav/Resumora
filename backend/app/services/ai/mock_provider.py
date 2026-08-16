from app.services.ai.base import AIProvider, AISuggestions, ResumeContext


class MockProvider(AIProvider):
    """Deterministic, offline stand-in for a real LLM. Used when AI_PROVIDER
    is unset or a real key isn't available. Lets Phases 1-3 run and be
    demoed without any external API dependency."""

    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        missing = ctx.missing_skills[:5]
        return AISuggestions(
            summary=(
                f"This resume covers {len(ctx.parsed_skills)} identified skills "
                f"against the {ctx.target_role} role profile."
            ),
            strengths=["Skills section is present and parseable"] if ctx.parsed_skills else [],
            weaknesses=[f"Missing skill: {s}" for s in missing] or ["No major gaps detected"],
            suggestions=[
                "Add quantifiable outcomes (%, $, time saved) to experience bullets.",
                "Lead bullets with strong action verbs (built, shipped, reduced).",
                *[f"Consider adding: {s}" for s in missing],
            ],
            weak_bullet_points=[],
            score_explanation=(
                "Score computed by the deterministic ATS engine from formatting, "
                "skill-match, project depth, experience depth, grammar, readability, "
                "education, and achievements — see ats/scoring_engine.py."
            ),
        )

    def rewrite_bullet(self, original: str, target_role: str) -> str:
        cleaned = original.strip().rstrip(".")
        if cleaned and not cleaned[0].isupper():
            cleaned = cleaned[0].upper() + cleaned[1:]
        return f"{cleaned} — quantify the outcome here (%, $, time, or scale)."
