import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ai.builder_service import ResumeBuilderAIService
from app.services.pdf.resume_builder_pdf import generate_builder_resume_pdf
from app.services.ats.scoring_engine import score_resume, match_percentage

def test_ai_builder_service():
    print("\n--- Testing ResumeBuilderAIService ---")
    service = ResumeBuilderAIService()

    # 1. Test Summary Generation
    summary = service.generate_summary(
        self_description="Computer Science student passionate about backend systems.",
        qualities=["Problem solving", "Teamwork"],
        interest_areas="Microservices and REST APIs",
        target_role="Backend Developer"
    )
    print("Generated Summary:\n", summary)
    assert isinstance(summary, str) and len(summary) > 10

    # 2. Test Bullet Transformation
    bullets = service.transform_bullets(
        raw_input="Made an AI CCTV project using YOLOv8, FastAPI and React.",
        role_title="AI CCTV Monitor",
        section_type="Project",
        target_role="Backend Developer"
    )
    print("Generated Bullets:\n", bullets)
    assert isinstance(bullets, list) and len(bullets) > 0

    # 3. Test Skills Organization
    skills = service.organize_skills("Python, React, FastAPI, PostgreSQL, SQL, Git, Docker")
    print("Organized Skills:\n", skills)
    assert isinstance(skills, dict)

    print("[OK] ResumeBuilderAIService passed all tests!")

def test_pdf_generation():
    print("\n--- Testing ReportLab Vector PDF Generation ---")
    sample_data = {
        "personal_info": {
            "full_name": "Anuram Pranav",
            "professional_title": "Backend Developer",
            "email": "anurampranav07@gmail.com",
            "phone": "+91 9876543210",
            "location": "Bengaluru, India",
            "linkedin": "https://linkedin.com/in/anuram",
            "github": "https://github.com/Anurampranav",
            "portfolio": "https://anuram.dev"
        },
        "career_goal": {
            "target_role": "Backend Developer"
        },
        "summary": "Motivated Backend Developer experienced in building high-throughput microservices using Python, FastAPI, and PostgreSQL.",
        "education": [
            {
                "degree": "B.Tech",
                "field_of_study": "Computer Science",
                "institution": "University Institute of Technology",
                "start_year": "2021",
                "end_year": "2025",
                "grade": "8.8/10"
            }
        ],
        "has_experience": False,
        "has_projects": True,
        "projects": [
            {
                "name": "Resumora AI Resume Platform",
                "technologies": "Python, FastAPI, Next.js, PostgreSQL",
                "bullets": [
                    "Engineered ATS scoring engine evaluating resumes against job descriptions.",
                    "Integrated Gemini 1.5 Flash AI API for contextual feedback."
                ]
            }
        ],
        "skills": {
            "languages": ["Python", "JavaScript", "SQL"],
            "frameworks": ["FastAPI", "React", "Next.js"],
            "databases": ["PostgreSQL", "Redis"],
            "cloud_tools": ["Docker", "Git", "AWS"]
        },
        "section_order": ["summary", "skills", "projects", "education"]
    }

    for template in ["ats-minimal", "modern-professional", "technical", "executive"]:
        pdf_bytes = generate_builder_resume_pdf(sample_data, template)
        assert pdf_bytes.startswith(b"%PDF-1."), f"Invalid PDF output for template {template}"
        print(f"[OK] Generated valid PDF for template '{template}' ({len(pdf_bytes)} bytes)")

if __name__ == "__main__":
    test_ai_builder_service()
    test_pdf_generation()
    print("\n[SUCCESS] ALL RESUME BUILDER BACKEND TESTS PASSED!")
