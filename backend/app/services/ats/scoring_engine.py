"""Deterministic ATS scoring engine.

This is intentionally rule-based with zero AI calls, per the brief:
"ATS scores must come from a deterministic ATS scoring engine... Gemini
should NOT calculate ATS scores." Every score here is reproducible from
the same input every time — that's the point of an ATS score.

Weight distribution (out of 100), matching the brief's example:
  Formatting 20 | Skills 20 | Projects 15 | Experience 15
  Grammar 10 | Readability 10 | Education 5 | Achievements 5
"""
import re
from dataclasses import dataclass, field

MAX_SCORES = {
    "formatting": 20,
    "skills": 20,
    "projects": 15,
    "experience": 15,
    "grammar": 10,
    "readability": 10,
    "education": 5,
    "achievements": 5,
}

ACTION_VERBS = {
    "built", "led", "designed", "developed", "implemented", "launched",
    "improved", "reduced", "increased", "created", "managed", "optimized",
    "architected", "shipped", "automated", "migrated", "scaled", "drove",
}

WEAK_VERBS = {"responsible for", "worked on", "helped with", "involved in", "helped"}


@dataclass
class ParsedResume:
    raw_text: str
    skills: list[str] = field(default_factory=list)
    experience_bullets: list[str] = field(default_factory=list)
    projects: list[str] = field(default_factory=list)
    education: list[str] = field(default_factory=list)
    achievements: list[str] = field(default_factory=list)
    has_email: bool = False
    has_phone: bool = False
    section_headers_found: list[str] = field(default_factory=list)


@dataclass
class ScoreBreakdown:
    formatting: int
    skills: int
    projects: int
    experience: int
    grammar: int
    readability: int
    education: int
    achievements: int
    overall: int
    missing_skills: list[str]
    weak_bullet_points: list[str]
    formatting_issues: list[str]
    strengths: list[str]
    weaknesses: list[str]

    def as_dict(self) -> dict:
        return {
            "formatting": self.formatting,
            "skills": self.skills,
            "projects": self.projects,
            "experience": self.experience,
            "grammar": self.grammar,
            "readability": self.readability,
            "education": self.education,
            "achievements": self.achievements,
            "overall": self.overall,
        }


def _score_formatting(parsed: ParsedResume) -> tuple[int, list[str]]:
    issues = []
    score = MAX_SCORES["formatting"]
    expected_sections = {"experience", "education", "skills"}
    found = {s.lower() for s in parsed.section_headers_found}
    missing_sections = expected_sections - found
    if missing_sections:
        issues.append(f"Missing standard section headers: {', '.join(sorted(missing_sections))}")
        score -= 5 * len(missing_sections)
    if not parsed.has_email:
        issues.append("No email address detected")
        score -= 4
    if not parsed.has_phone:
        issues.append("No phone number detected")
        score -= 2
    return max(score, 0), issues


def _score_skills(
    parsed: ParsedResume, required_skills: list[str], preferred_skills: list[str] | None = None
) -> tuple[int, list[str]]:
    preferred_skills = preferred_skills or []
    if not required_skills and not preferred_skills:
        return MAX_SCORES["skills"], []

    have = {s.lower() for s in parsed.skills}
    required_lower = {s.lower() for s in required_skills}
    preferred_lower = {s.lower() for s in preferred_skills} - required_lower  # avoid double-counting

    # Required skills carry 2x the weight of preferred ones — matches the
    # weighting already stored in job_role_skills (required=2, preferred=1),
    # so a missing "preferred" skill no longer costs as much as a missing
    # "required" one.
    REQUIRED_WEIGHT = 2
    PREFERRED_WEIGHT = 1

    total_weight = len(required_lower) * REQUIRED_WEIGHT + len(preferred_lower) * PREFERRED_WEIGHT
    if total_weight == 0:
        return MAX_SCORES["skills"], []

    matched_weight = (
        len(have & required_lower) * REQUIRED_WEIGHT + len(have & preferred_lower) * PREFERRED_WEIGHT
    )
    missing = sorted(required_lower - have)  # only required gaps are reported as "missing"
    return round((matched_weight / total_weight) * MAX_SCORES["skills"]), missing


def _score_projects(parsed: ParsedResume) -> int:
    n = len(parsed.projects)
    if n == 0:
        return 0
    return min(MAX_SCORES["projects"], 5 + n * 3)


def _score_experience(parsed: ParsedResume) -> int:
    n = len(parsed.experience_bullets)
    if n == 0:
        return 0
    return min(MAX_SCORES["experience"], n * 2)


def _score_grammar(parsed: ParsedResume) -> tuple[int, list[str]]:
    weak_bullets = [
        b for b in parsed.experience_bullets
        if any(w in b.lower() for w in WEAK_VERBS)
    ]
    penalty = min(len(weak_bullets) * 2, MAX_SCORES["grammar"])
    return MAX_SCORES["grammar"] - penalty, weak_bullets


def _score_readability(parsed: ParsedResume) -> int:
    bullets = parsed.experience_bullets
    if not bullets:
        return 0
    avg_len = sum(len(b.split()) for b in bullets) / len(bullets)
    # sweet spot: 12-22 words per bullet
    if 12 <= avg_len <= 22:
        return MAX_SCORES["readability"]
    distance = min(abs(avg_len - 12), abs(avg_len - 22))
    return max(MAX_SCORES["readability"] - round(distance / 2), 0)


def _score_education(parsed: ParsedResume) -> int:
    return MAX_SCORES["education"] if parsed.education else 0


def _score_achievements(parsed: ParsedResume) -> int:
    n = len(parsed.achievements)
    return min(MAX_SCORES["achievements"], n * 2)


def score_resume(
    parsed: ParsedResume, required_skills: list[str], preferred_skills: list[str] | None = None
) -> ScoreBreakdown:
    formatting, formatting_issues = _score_formatting(parsed)
    skills, missing_skills = _score_skills(parsed, required_skills, preferred_skills)
    projects = _score_projects(parsed)
    experience = _score_experience(parsed)
    grammar, weak_bullets = _score_grammar(parsed)
    readability = _score_readability(parsed)
    education = _score_education(parsed)
    achievements = _score_achievements(parsed)

    overall = (
        formatting + skills + projects + experience
        + grammar + readability + education + achievements
    )

    strengths, weaknesses = [], []
    for label, value, maximum in [
        ("formatting", formatting, MAX_SCORES["formatting"]),
        ("skills", skills, MAX_SCORES["skills"]),
        ("projects", projects, MAX_SCORES["projects"]),
        ("experience", experience, MAX_SCORES["experience"]),
        ("grammar", grammar, MAX_SCORES["grammar"]),
        ("readability", readability, MAX_SCORES["readability"]),
        ("education", education, MAX_SCORES["education"]),
        ("achievements", achievements, MAX_SCORES["achievements"]),
    ]:
        ratio = value / maximum if maximum else 1
        if ratio >= 0.8:
            strengths.append(label)
        elif ratio <= 0.4:
            weaknesses.append(label)

    return ScoreBreakdown(
        formatting=formatting,
        skills=skills,
        projects=projects,
        experience=experience,
        grammar=grammar,
        readability=readability,
        education=education,
        achievements=achievements,
        overall=min(overall, 100),
        missing_skills=missing_skills,
        weak_bullet_points=weak_bullets,
        formatting_issues=formatting_issues,
        strengths=strengths,
        weaknesses=weaknesses,
    )


def match_percentage(parsed: ParsedResume, required_skills: list[str]) -> int:
    if not required_skills:
        return 100
    have = {s.lower() for s in parsed.skills}
    required_lower = {s.lower() for s in required_skills}
    matched = have & required_lower
    return round(len(matched) / len(required_lower) * 100)
