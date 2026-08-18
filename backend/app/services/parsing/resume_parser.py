"""Resume parsing: real text extraction from PDF/DOCX (via PyMuPDF and
python-docx — both work fully offline, no external service needed), plus
heuristic section splitting to feed the ATS engine and AI layer.

Note on scope: extraction of clean structured fields (skills, experience,
projects, etc.) from arbitrary resume layouts is a hard, iterative NLP
problem in practice. What's here is a working heuristic baseline —
section-header detection + regex for contact info — good enough to
exercise the full pipeline end to end. Expect to iterate on this file
against real resumes in Phase 2.
"""
import io
import re

import pymupdf as fitz  # PyMuPDF
from docx import Document

from app.services.ats.scoring_engine import ParsedResume

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-().]{8,}\d)")

SECTION_ALIASES = {
    "experience": {"experience", "work experience", "employment history", "professional experience"},
    "education": {"education", "academic background"},
    "skills": {"skills", "technical skills", "core competencies"},
    "projects": {"projects", "personal projects", "key projects"},
    "achievements": {"achievements", "awards", "accomplishments"},
    "certifications": {"certifications", "licenses"},
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        return "\n".join(page.get_text() for page in doc)


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)


def extract_text(file_bytes: bytes, file_type: str) -> str:
    if file_type == "pdf":
        return extract_text_from_pdf(file_bytes)
    if file_type == "docx":
        return extract_text_from_docx(file_bytes)
    raise ValueError(f"Unsupported file type: {file_type}")


def _split_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {}
    current = "header"
    sections[current] = []

    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower().rstrip(":")
        matched_section = None
        for canonical, aliases in SECTION_ALIASES.items():
            if lowered in aliases:
                matched_section = canonical
                break
        if matched_section:
            current = matched_section
            sections.setdefault(current, [])
            continue
        if stripped:
            sections.setdefault(current, []).append(stripped)

    return sections


def _extract_bullets(lines: list[str]) -> list[str]:
    bullets = []
    for line in lines:
        cleaned = re.sub(r"^[•\-*▪◦]\s*", "", line).strip()
        if cleaned:
            bullets.append(cleaned)
    return bullets


def _extract_skills(lines: list[str]) -> list[str]:
    joined = " ".join(lines)
    # Skills sections are usually comma/pipe/bullet separated, not full sentences
    parts = re.split(r"[,|•·]", joined)
    return [p.strip() for p in parts if p.strip() and len(p.strip()) < 40]


def parse_resume(raw_text: str) -> ParsedResume:
    lines = raw_text.splitlines()
    sections = _split_sections(lines)

    email_match = EMAIL_RE.search(raw_text)
    phone_match = PHONE_RE.search(raw_text)

    return ParsedResume(
        raw_text=raw_text,
        skills=_extract_skills(sections.get("skills", [])),
        experience_bullets=_extract_bullets(sections.get("experience", [])),
        projects=_extract_bullets(sections.get("projects", [])),
        education=_extract_bullets(sections.get("education", [])),
        achievements=_extract_bullets(
            sections.get("achievements", []) + sections.get("certifications", [])
        ),
        has_email=bool(email_match),
        has_phone=bool(phone_match),
        section_headers_found=[k for k in sections if k != "header"],
    )
