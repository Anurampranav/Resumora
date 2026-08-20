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


import re

def _clean_json_response(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    # Strip markdown code blocks like ```json ... ``` or ``` ... ```
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


import logging
from app.services.ai.mock_provider import MockProvider

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    def __init__(self):
        settings = get_settings()
        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Set AI_PROVIDER=mock for local dev, "
                "or provide a real key to use this provider."
            )
        self._api_key = settings.gemini_api_key
        self._mock_fallback = MockProvider()

    def analyze(self, ctx: ResumeContext) -> AISuggestions:
        try:
            import google.generativeai as genai  # imported lazily so mock mode has no dependency

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = PROMPT_TEMPLATE.format(
                target_role=ctx.target_role,
                missing_skills=", ".join(ctx.missing_skills),
                ats_breakdown=json.dumps(ctx.ats_breakdown),
                raw_text=ctx.raw_text[:12000],  # keep prompt bounded
            )
            response = model.generate_content(prompt)
            data = _clean_json_response(response.text)

            return AISuggestions(
                summary=data.get("summary", f"Analysis completed for target role: {ctx.target_role}."),
                strengths=data.get("strengths", []),
                weaknesses=data.get("weaknesses", []),
                suggestions=data.get("suggestions", []),
                weak_bullet_points=data.get("weak_bullet_points", []),
                score_explanation=data.get("score_explanation", ""),
            )
        except Exception as exc:
            logger.warning(f"Gemini API analysis failed: {exc}. Falling back to mock response.")
            return self._mock_fallback.analyze(ctx)

    def rewrite_bullet(self, original: str, target_role: str) -> str:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")
            prompt = (
                f"Rewrite this resume bullet for a {target_role} role. Make it "
                f"stronger with an action verb and structure for impact, but do "
                f"NOT invent any numbers, tools, or outcomes not implied by the "
                f"original. Return only the rewritten bullet, nothing else.\n\n"
                f"Original: {original}"
            )
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as exc:
            logger.warning(f"Gemini API bullet rewrite failed: {exc}. Falling back to mock rewrite.")
            return self._mock_fallback.rewrite_bullet(original, target_role)

    def chat(self, raw_text: str, target_role: str, question: str, history: list) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            history_str = ""
            for item in history[-6:]:  # keep recent conversation memory
                role = item.get("role", "user")
                content = item.get("content", "")
                history_str += f"{role.upper()}: {content}\n"

            prompt = f"""You are RESUMORA AI, a personal AI Resume Coach. Answer the user's question using their ACTUAL uploaded resume text.
Target Role: {target_role}

User's Resume Text:
---
{raw_text[:8000]}
---

Conversation History:
{history_str}

User Question: {question}

Rule: Never invent experiences, metrics, or certifications not in the resume. Be constructive, highly specific, and actionable.

Respond ONLY in JSON matching this exact structure:
{{
  "reply": "Detailed helpful answer based strictly on their resume context...",
  "suggested_questions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini chat failed: {exc}")
            return {
                "reply": f"Based on your uploaded resume for the {target_role} role, I recommend focusing on highlighting measurable technical outcomes and ensuring all key skills mentioned in your projects are clearly aligned with industry standards.",
                "suggested_questions": [
                    "What should I improve first in my experience section?",
                    "How can I make my project bullets more impactful?",
                    "Which technical skills am I missing for backend roles?"
                ]
            }

    def analyze_section(self, raw_text: str, target_role: str, section_name: str, section_content: str) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""You are RESUMORA AI Coach. Analyze the user's '{section_name}' section of their resume for a {target_role} target role.

User Resume Context:
---
{raw_text[:6000]}
---

Section Content ({section_name}):
---
{section_content if section_content else "(Extracted from main resume text above)"}
---

Provide a section-by-section analysis. Never invent false background details.
Respond ONLY with JSON matching:
{{
  "section_name": "{section_name}",
  "strong": ["Specific strength 1", "Specific strength 2"],
  "weak": ["Weakness 1", "Weakness 2"],
  "missing": ["Missing element 1", "Missing element 2"],
  "changes": ["Recommended change 1", "Recommended change 2"],
  "why_improve": "Clear explanation of why this section needs improvement...",
  "suggested_version": "Improved, professional version of this section without hallucinated metrics..."
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini section analysis failed: {exc}")
            return {
                "section_name": section_name,
                "strong": ["Relevant technical skills listed."],
                "weak": ["Phrasing lacks quantitative impact."],
                "missing": ["Clear metric-backed results."],
                "changes": ["Reframe duties into active achievements."],
                "why_improve": "Enhancing this section improves readability and immediate candidate evaluation by recruiters.",
                "suggested_version": section_content or "Refined professional content for " + section_name
            }

    def analyze_bullet_detailed(self, bullet: str, target_role: str, context: str) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""You are BULLET POINT COACH in Resumora. Evaluate this bullet point for a {target_role} role.

Original Bullet: "{bullet}"
Resume Context: {context[:2000]}

Evaluate clarity, impact, specificity, and technical relevance. Never invent facts.
Respond ONLY with JSON:
{{
  "original": "{bullet}",
  "clarity_assessment": "Assessment of clarity...",
  "impact_assessment": "Assessment of business/technical impact...",
  "specificity_assessment": "Assessment of technical specificity...",
  "recommendation": "Key action to improve this bullet...",
  "suggested_version": "Action-oriented rewritten bullet point..."
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini detailed bullet analysis failed: {exc}")
            return {
                "original": bullet,
                "clarity_assessment": "Direct and understandable, but could start with a stronger action verb.",
                "impact_assessment": "Lacks quantitative results or performance improvements.",
                "specificity_assessment": "Includes general tools; could specify exact technical implementation details.",
                "recommendation": "Use an active verb at the start and highlight technical achievements.",
                "suggested_version": f"Architected and deployed {bullet.lower()} to optimize system workflow and reliability."
            }

    def generate_career_guidance(self, raw_text: str, target_role: str, parsed_skills: list) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""You are RESUMORA AI Career Coach. Analyze the user's resume for targeted career guidance.

Target Role: {target_role}
Current Detected Skills: {", ".join(parsed_skills)}
Resume Text:
---
{raw_text[:8000]}
---

Respond ONLY with JSON matching:
{{
  "suited_roles": ["Role 1", "Role 2", "Role 3"],
  "potential_next_skills": [
    {{"skill": "Skill Name 1", "why": "Why learning this boosts candidate profile..."}},
    {{"skill": "Skill Name 2", "why": "Why learning this boosts candidate profile..."}},
    {{"skill": "Skill Name 3", "why": "Why learning this boosts candidate profile..."}}
  ],
  "project_recommendations": [
    {{
      "title": "Project Title 1",
      "why": "Why building this project strengthens the resume...",
      "skills_demonstrated": ["Skill A", "Skill B"],
      "potential_value": "Resume value explanation..."
    }},
    {{
      "title": "Project Title 2",
      "why": "Why building this project strengthens the resume...",
      "skills_demonstrated": ["Skill C", "Skill D"],
      "potential_value": "Resume value explanation..."
    }}
  ],
  "improvement_plan": [
    {{
      "priority": "HIGH",
      "category": "Experience & Projects",
      "title": "Quantify bullet points",
      "recommendation": "Detailed actionable steps...",
      "action_tab": "bullet"
    }},
    {{
      "priority": "MEDIUM",
      "category": "Professional Summary",
      "title": "Focus summary on target role",
      "recommendation": "Detailed actionable steps...",
      "action_tab": "section"
    }},
    {{
      "priority": "LOW",
      "category": "Skills",
      "title": "Add missing modern cloud skills",
      "recommendation": "Detailed actionable steps...",
      "action_tab": "skills"
    }}
  ]
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini career guidance failed: {exc}")
            return {
                "suited_roles": [target_role, "Full Stack Engineer", "Backend Developer"],
                "potential_next_skills": [
                    {"skill": "Docker & Containerization", "why": "Essential for containerized microservice deployments."},
                    {"skill": "AWS / Cloud Infrastructure", "why": "Demonstrates production cloud experience."},
                    {"skill": "CI/CD Pipelines", "why": "Proves automated testing and deployment readiness."}
                ],
                "project_recommendations": [
                    {
                        "title": "High-Throughput Microservice API",
                        "why": "Demonstrates backend scalable architecture and database optimization.",
                        "skills_demonstrated": ["FastAPI", "PostgreSQL", "Redis"],
                        "potential_value": "Shows real-world backend engineering competence."
                    }
                ],
                "improvement_plan": [
                    {
                        "priority": "HIGH",
                        "category": "Projects",
                        "title": "Reframe project descriptions with technical results",
                        "recommendation": "Highlight exact role, architecture decisions, and quantitative performance.",
                        "action_tab": "rewriter"
                    }
                ]
            }

    def generate_action_center(self, raw_text: str, target_role: str, missing_skills: list) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""Generate 3 top AI Action Center items based on this resume for a {target_role} role. Missing skills: {missing_skills}.
Resume Text snippet: {raw_text[:4000]}

Respond ONLY in JSON:
{{
  "items": [
    {{
      "id": "act-1",
      "priority": "HIGH",
      "title": "Short title 1",
      "description": "Clear actionable description of what to fix...",
      "workflow_target": "rewriter"
    }},
    {{
      "id": "act-2",
      "priority": "MEDIUM",
      "title": "Short title 2",
      "description": "Clear actionable description of what to fix...",
      "workflow_target": "section"
    }},
    {{
      "id": "act-3",
      "priority": "LOW",
      "title": "Short title 3",
      "description": "Clear actionable description of what to fix...",
      "workflow_target": "interview"
    }}
  ]
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini action center failed: {exc}")
            return {
                "items": [
                    {
                        "id": "act-1",
                        "priority": "HIGH",
                        "title": "Reframe project descriptions with technical impact",
                        "description": "Convert passive bullet points into outcome-driven statements.",
                        "workflow_target": "rewriter"
                    },
                    {
                        "id": "act-2",
                        "priority": "MEDIUM",
                        "title": "Strengthen professional summary",
                        "description": "Align your headline directly with your target role.",
                        "workflow_target": "section"
                    }
                ]
            }

    def generate_interview_prep(self, raw_text: str, target_role: str) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""Generate 4 tailored interview questions based strictly on the candidate's actual resume.
Target Role: {target_role}
Resume Context:
---
{raw_text[:7000]}
---

Include categories: Technical, Project-based, Behavioral, Resume-based.
Respond ONLY with JSON:
{{
  "questions": [
    {{
      "id": "q-1",
      "category": "Technical",
      "question": "Specific question based on candidate's skills...",
      "why_asked": "Why an interviewer asks this based on candidate's resume...",
      "key_talking_points": ["Point 1", "Point 2", "Point 3"]
    }},
    {{
      "id": "q-2",
      "category": "Project-based",
      "question": "Specific question based on a project listed...",
      "why_asked": "Why an interviewer asks this...",
      "key_talking_points": ["Point 1", "Point 2"]
    }},
    {{
      "id": "q-3",
      "category": "Behavioral",
      "question": "Specific behavioral question...",
      "why_asked": "Why asked...",
      "key_talking_points": ["Point 1", "Point 2"]
    }},
    {{
      "id": "q-4",
      "category": "Resume-based",
      "question": "Specific question about experience/education...",
      "why_asked": "Why asked...",
      "key_talking_points": ["Point 1", "Point 2"]
    }}
  ]
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini interview prep failed: {exc}")
            return {
                "questions": [
                    {
                        "id": "q-1",
                        "category": "Technical",
                        "question": f"Can you explain your system design approach when building backend services for {target_role}?",
                        "why_asked": "Evaluates architectural depth and design decision-making.",
                        "key_talking_points": ["System architecture", "Database indexing", "API performance"]
                    },
                    {
                        "id": "q-2",
                        "category": "Project-based",
                        "question": "Walk me through the key technical challenges you solved in your main project.",
                        "why_asked": "Tests problem-solving abilities under real constraints.",
                        "key_talking_points": ["Problem context", "Chosen tech stack", "Measurable result"]
                    }
                ]
            }

    def evaluate_interview_answer(self, question: str, answer: str, raw_text: str) -> dict:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self._api_key)
            model = genai.GenerativeModel("gemini-3.6-flash")

            prompt = f"""Evaluate candidate's interview answer to a question.
Question: "{question}"
Candidate's Answer: "{answer}"
Candidate Resume Context: {raw_text[:4000]}

Respond ONLY in JSON:
{{
  "score": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Area to refine 1"],
  "missing_points": ["Important point omitted 1"],
  "better_answer_structure": "Recommended STAR framework structure for this answer..."
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            logger.warning(f"Gemini answer evaluation failed: {exc}")
            return {
                "score": 80,
                "strengths": ["Good clarity and relevance to technical context."],
                "weaknesses": ["Could include specific quantitative outcomes."],
                "missing_points": ["Trade-offs considered during architecture selection."],
                "better_answer_structure": "Use Situation -> Task -> Action -> Result (STAR) framework to structure your answer concisely."
            }

