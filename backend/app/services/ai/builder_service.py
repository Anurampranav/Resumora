import json
import logging
import re
from app.core.config import get_settings

logger = logging.getLogger(__name__)

def _clean_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)

class ResumeBuilderAIService:
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.gemini_api_key

    def _get_model(self):
        if not self.api_key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            for model_name in ["gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash"]:
                try:
                    return genai.GenerativeModel(model_name)
                except Exception:
                    continue
            return genai.GenerativeModel("gemini-3.6-flash")
        except Exception as exc:
            logger.warning(f"Failed to initialize Gemini model: {exc}")
            return None

    def generate_summary(self, self_description: str, qualities: list[str], interest_areas: str, target_role: str) -> str:
        """Generate a professional resume summary from questionnaire answers strictly grounded in user facts."""
        model = self._get_model()
        if not model:
            qualities_str = ", ".join(qualities) if qualities else "problem-solving and software engineering"
            return f"Motivated candidate interested in {target_role or 'software development'}. Experienced in {interest_areas or 'building software applications'} with strong focus on {qualities_str}."

        prompt = f"""You are RESUMORA AI Resume Generator.
Write a 3-4 sentence professional resume summary for a candidate targeting the role of: '{target_role or 'Software Engineer'}'.

STRICT RULES:
1. Base the summary ONLY on the facts provided below.
2. DO NOT invent previous job titles, years of experience, companies, degrees, tools, metrics, or achievements.
3. If information is brief, create a clean, truthful summary emphasizing their enthusiasm and declared skills.

User Provided Information:
- About self: {self_description}
- Strongest qualities: {", ".join(qualities) if qualities else "Not specified"}
- Interested work/areas: {interest_areas}

Return ONLY the summary text, nothing else. No quotation marks or markdown blocks."""
        try:
            res = model.generate_content(prompt)
            return res.text.strip().strip('"')
        except Exception as exc:
            logger.warning(f"Gemini generate_summary failed: {exc}")
            qualities_str = ", ".join(qualities) if qualities else "problem-solving and software engineering"
            return f"Motivated candidate targeting {target_role or 'Software Development'} roles. Focuses on {interest_areas or 'software engineering'} with strong skills in {qualities_str}."

    def transform_bullets(self, raw_input: str, role_title: str, section_type: str, target_role: str) -> list[str]:
        """Transform natural language experience or project descriptions into strong ATS resume bullet points strictly preserving facts."""
        if not raw_input or not raw_input.strip():
            return []

        model = self._get_model()
        if not model:
            lines = [l.strip("-•* ").strip() for l in raw_input.split("\n") if l.strip()]
            return lines if lines else [raw_input.strip()]

        prompt = f"""You are RESUMORA AI Bullet Generator.
Transform the candidate's raw notes into 2 to 4 high-impact, professional resume bullet points for a {section_type} (Role/Project: '{role_title}', Target Role: '{target_role}').

STRICT NO-FABRICATION RULE:
- NEVER invent numbers, percentages, user counts, performance gains, revenue, dates, or tools not present in the input.
- Reframe passive statements into active statements starting with strong action verbs (e.g. Architected, Developed, Designed, Implemented, Integrated, Spearheaded).
- Keep exact technical tools and facts provided by the candidate.

Raw Candidate Notes:
---
{raw_input}
---

Return ONLY a JSON array of string bullets, e.g.:
["Developed...", "Implemented...", "Engineered..."]"""

        try:
            res = model.generate_content(prompt)
            data = _clean_json(res.text)
            if isinstance(data, list):
                return [str(b).strip() for b in data if str(b).strip()]
            return [raw_input.strip()]
        except Exception as exc:
            logger.warning(f"Gemini transform_bullets failed: {exc}")
            lines = [l.strip("-•* ").strip() for l in raw_input.split("\n") if l.strip()]
            return lines if lines else [raw_input.strip()]

    def improve_text(self, current_text: str, section_type: str, target_role: str, context: str = "") -> dict:
        """Improve a text snippet with AI rationale, preserving 100% of facts without hallucinating metrics."""
        model = self._get_model()
        if not model:
            return {
                "original": current_text,
                "why_improve": "Starts with action verb and streamlines technical impact for ATS readability.",
                "suggested": f"Engineered and optimized {current_text.lower() if current_text else 'key responsibilities'} for improved reliability and performance."
            }

        prompt = f"""You are RESUMORA AI Resume Coach. Analyze and improve this {section_type} text snippet for a {target_role} resume.

Original Snippet:
"{current_text}"

Context / Section: {context}

RULES:
1. NEVER fabricate metrics, numbers, percentages, or tools not implied in the original text.
2. Rewrite with strong action verbs, active voice, and crisp technical phrasing.
3. Explain WHY the change improves ATS parsing and recruiter impact.

Respond ONLY in JSON with this exact structure:
{{
  "original": "{current_text}",
  "why_improve": "Explanation of why this improvement makes the text stronger...",
  "suggested": "The improved version..."
}}"""

        try:
            res = model.generate_content(prompt)
            data = _clean_json(res.text)
            return {
                "original": data.get("original", current_text),
                "why_improve": data.get("why_improve", "Enhances action-oriented phrasing and clarity for ATS scanners."),
                "suggested": data.get("suggested", current_text)
            }
        except Exception as exc:
            logger.warning(f"Gemini improve_text failed: {exc}")
            return {
                "original": current_text,
                "why_improve": "Refines phrasing using strong action verbs and technical clarity.",
                "suggested": current_text
            }

    def organize_skills(self, raw_skills: str) -> dict:
        """Organize free-form skills input into categorized skill buckets without adding new skills."""
        if not raw_skills or not raw_skills.strip():
            return {
                "languages": [],
                "frameworks": [],
                "databases": [],
                "cloud_tools": [],
                "ai_ml": [],
                "soft_skills": []
            }

        model = self._get_model()
        if not model:
            tokens = [s.strip() for s in raw_skills.replace("\n", ",").split(",") if s.strip()]
            return {
                "languages": tokens,
                "frameworks": [],
                "databases": [],
                "cloud_tools": [],
                "ai_ml": [],
                "soft_skills": []
            }

        prompt = f"""You are RESUMORA Skill Categorizer.
Given the candidate's raw list of skills, organize them strictly into categories.
DO NOT ADD ANY SKILL THAT IS NOT IN THE INPUT LIST.

Raw Input Skills:
"{raw_skills}"

Categories:
- languages (e.g. Python, Java, C++, JavaScript)
- frameworks (e.g. React, FastAPI, Django, Node.js)
- databases (e.g. PostgreSQL, MongoDB, SQL, Redis)
- cloud_tools (e.g. AWS, Docker, Git, Kubernetes, Linux)
- ai_ml (e.g. PyTorch, TensorFlow, OpenCV, YOLOv8)
- soft_skills (e.g. Leadership, Teamwork, Communication)

Respond ONLY with JSON matching:
{{
  "languages": [...],
  "frameworks": [...],
  "databases": [...],
  "cloud_tools": [...],
  "ai_ml": [...],
  "soft_skills": [...]
}}"""

        try:
            res = model.generate_content(prompt)
            data = _clean_json(res.text)
            return {
                "languages": data.get("languages", []),
                "frameworks": data.get("frameworks", []),
                "databases": data.get("databases", []),
                "cloud_tools": data.get("cloud_tools", []),
                "ai_ml": data.get("ai_ml", []),
                "soft_skills": data.get("soft_skills", [])
            }
        except Exception as exc:
            logger.warning(f"Gemini organize_skills failed: {exc}")
            tokens = [s.strip() for s in raw_skills.replace("\n", ",").split(",") if s.strip()]
            return {
                "languages": tokens,
                "frameworks": [],
                "databases": [],
                "cloud_tools": [],
                "ai_ml": [],
                "soft_skills": []
            }
