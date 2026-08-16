"""Anthropic implementation slot — same interface as GeminiProvider."""
from app.services.ai.base import AIProvider, AISuggestions, ResumeContext


class ClaudeProvider(AIProvider):
    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        raise NotImplementedError(
            "Implement using the anthropic SDK's messages.create, "
            "reusing GeminiProvider's PROMPT_TEMPLATE shape for consistency."
        )

    def rewrite_bullet(self, original: str, target_role: str) -> str:
        raise NotImplementedError
