"""Every AI call in the app goes through this interface. Nothing outside
`services/ai/` should import google.generativeai, openai, or anthropic
directly — that's the whole point of the abstraction the brief asked for.

Scope reminder: this layer explains and suggests. It never produces the
ATS score — that's `services/ats/scoring_engine.py`, which is deterministic
and has no AI dependency at all.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ResumeContext:
    """Everything the AI layer is allowed to see about one resume + its score."""
    raw_text: str
    parsed_skills: list[str]
    target_role: str
    ats_breakdown: dict  # the deterministic engine's category scores
    missing_skills: list[str]


@dataclass
class AISuggestions:
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    weak_bullet_points: list[dict]  # [{"original": ..., "suggested": ...}]
    score_explanation: str  # why the deterministic score landed where it did


class AIProvider(ABC):
    @abstractmethod
    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        """Explain the score and suggest improvements. Must not invent
        experience, projects, or certifications not present in raw_text."""
        ...

    @abstractmethod
    def rewrite_bullet(self, original: str, target_role: str) -> str:
        """Premium feature: rewrite one bullet point to be stronger, without
        adding unverifiable claims."""
        ...


import logging

logger = logging.getLogger(__name__)

def get_ai_provider(provider_name: str) -> AIProvider:
    """Factory — the only place that branches on provider name. Falls back to MockProvider on error."""
    try:
        if provider_name == "gemini":
            from app.services.ai.gemini_provider import GeminiProvider
            return GeminiProvider()
        if provider_name == "openai":
            from app.services.ai.openai_provider import OpenAIProvider
            return OpenAIProvider()
        if provider_name == "claude":
            from app.services.ai.claude_provider import ClaudeProvider
            return ClaudeProvider()
    except Exception as exc:
        logger.warning(f"Failed to initialize AI provider '{provider_name}': {exc}. Falling back to mock provider.")

    from app.services.ai.mock_provider import MockProvider
    return MockProvider()
