"""OpenAI implementation slot — mirrors GeminiProvider's interface exactly.
Not implemented in detail here since there's no key/network path to verify
it against in this sandbox; the point of the abstraction is that filling
this in is the ONLY file that needs to change to switch providers.
"""
from app.services.ai.base import AIProvider, AISuggestions, ResumeContext


class OpenAIProvider(AIProvider):
    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        raise NotImplementedError(
            "Implement using the openai SDK's chat.completions.create, "
            "reusing GeminiProvider's PROMPT_TEMPLATE shape for consistency."
        )

    def rewrite_bullet(self, original: str, target_role: str) -> str:
        raise NotImplementedError
