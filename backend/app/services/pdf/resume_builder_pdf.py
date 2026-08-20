import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

def generate_builder_resume_pdf(resume_data: dict, template_id: str = "modern-professional") -> bytes:
    """Generate a vector PDF with selectable text from structured resume data for 4 templates.
    Templates:
      - 'ats-minimal'
      - 'modern-professional'
      - 'technical'
      - 'executive'
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()

    # Theme colors based on selected template
    if template_id == "ats-minimal":
        primary_color = colors.HexColor("#1E293B")  # Slate dark
        secondary_color = colors.HexColor("#475569")
        header_font = "Helvetica-Bold"
        body_font = "Helvetica"
        divider_color = colors.HexColor("#CBD5E1")
    elif template_id == "technical":
        primary_color = colors.HexColor("#0F766E")  # Teal
        secondary_color = colors.HexColor("#334155")
        header_font = "Helvetica-Bold"
        body_font = "Helvetica"
        divider_color = colors.HexColor("#0F766E")
    elif template_id == "executive":
        primary_color = colors.HexColor("#1E1B4B")  # Deep Indigo
        secondary_color = colors.HexColor("#4338CA")
        header_font = "Times-Bold"
        body_font = "Times-Roman"
        divider_color = colors.HexColor("#4338CA")
    else:  # modern-professional (default)
        primary_color = colors.HexColor("#4F46E5")  # Indigo/Purple accent
        secondary_color = colors.HexColor("#1F2937")
        header_font = "Helvetica-Bold"
        body_font = "Helvetica"
        divider_color = colors.HexColor("#6366F1")

    # Base Styles
    name_style = ParagraphStyle(
        "CandidateName",
        parent=styles["Normal"],
        fontName=header_font,
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=2,
    )

    title_style = ParagraphStyle(
        "CandidateTitle",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=11,
        leading=14,
        textColor=secondary_color,
        spaceAfter=4,
    )

    contact_style = ParagraphStyle(
        "ContactInfo",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=6,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName=header_font,
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    )

    item_title = ParagraphStyle(
        "ItemTitle",
        parent=styles["Normal"],
        fontName=header_font,
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#111827"),
    )

    item_subtitle = ParagraphStyle(
        "ItemSubtitle",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#4B5563"),
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=styles["Normal"],
        fontName=body_font,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1F2937"),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2,
    )

    story = []

    # Personal Info Header
    p_info = resume_data.get("personal_info") or resume_data.get("personalInfo") or {}
    full_name = p_info.get("full_name") or p_info.get("fullName") or "Candidate Name"
    prof_title = p_info.get("professional_title") or p_info.get("professionalTitle") or ""
    email = p_info.get("email") or ""
    phone = p_info.get("phone") or ""
    location = p_info.get("location") or ""
    linkedin = p_info.get("linkedin") or ""
    github = p_info.get("github") or ""
    portfolio = p_info.get("portfolio") or p_info.get("website") or ""

    contact_parts = [p for p in [email, phone, location, linkedin, github, portfolio] if p]
    contact_str = "  •  ".join(contact_parts)

    story.append(Paragraph(full_name, name_style))
    if prof_title:
        story.append(Paragraph(prof_title, title_style))
    if contact_str:
        story.append(Paragraph(contact_str, contact_style))

    story.append(HRFlowable(width="100%", thickness=1.5, color=divider_color, spaceBefore=2, spaceAfter=8))

    # Helper function for section titles
    def add_section_header(title_text):
        story.append(Paragraph(title_text.upper(), section_heading))
        if template_id != "ats-minimal":
            story.append(HRFlowable(width="100%", thickness=0.5, color=divider_color, spaceBefore=1, spaceAfter=4))
        else:
            story.append(Spacer(1, 2))

    # Dynamic Section Order
    section_order = resume_data.get("section_order") or resume_data.get("sectionOrder") or [
        "summary", "experience", "projects", "skills", "education", "certifications", "achievements"
    ]

    for section_key in section_order:
        sec_clean = section_key.lower()

        # SUMMARY
        if sec_clean == "summary":
            summary_text = resume_data.get("summary")
            if isinstance(summary_text, dict):
                summary_text = summary_text.get("generated_summary") or summary_text.get("self_description") or ""
            if summary_text and str(summary_text).strip():
                add_section_header("Professional Summary")
                story.append(Paragraph(str(summary_text).strip(), body_style))
                story.append(Spacer(1, 4))

        # EXPERIENCE
        elif sec_clean in ["experience", "work_experience"]:
            exp_list = resume_data.get("experience") or []
            if exp_list:
                add_section_header("Work Experience")
                for exp in exp_list:
                    company = exp.get("company") or ""
                    title = exp.get("job_title") or exp.get("jobTitle") or ""
                    loc = exp.get("location") or ""
                    s_date = exp.get("start_date") or exp.get("startDate") or ""
                    e_date = exp.get("end_date") or exp.get("endDate") or ("Present" if exp.get("is_current") else "")
                    dates_str = f"{s_date} - {e_date}" if (s_date or e_date) else ""

                    header_text = f"<b>{title}</b> — <i>{company}</i>" if company else f"<b>{title}</b>"
                    story.append(Paragraph(header_text, item_title))
                    if loc or dates_str:
                        sub_text = f"{loc} | {dates_str}".strip(" |")
                        story.append(Paragraph(sub_text, item_subtitle))

                    bullets = exp.get("bullets") or []
                    if not bullets and exp.get("responsibilities"):
                        bullets = [b.strip("-• ").strip() for b in exp["responsibilities"].split("\n") if b.strip()]

                    for b in bullets:
                        story.append(Paragraph(f"• {b}", bullet_style))

                    story.append(Spacer(1, 4))

        # INTERNSHIPS
        elif sec_clean == "internships":
            intern_list = resume_data.get("internships") or []
            if intern_list:
                add_section_header("Internships")
                for intern in intern_list:
                    company = intern.get("company") or ""
                    role = intern.get("role") or ""
                    duration = intern.get("duration") or ""
                    story.append(Paragraph(f"<b>{role}</b> — <i>{company}</i> ({duration})", item_title))
                    bullets = intern.get("bullets") or []
                    if not bullets and intern.get("responsibilities"):
                        bullets = [b.strip("-• ").strip() for b in intern["responsibilities"].split("\n") if b.strip()]
                    for b in bullets:
                        story.append(Paragraph(f"• {b}", bullet_style))
                    story.append(Spacer(1, 4))

        # PROJECTS
        elif sec_clean == "projects":
            proj_list = resume_data.get("projects") or []
            if proj_list:
                add_section_header("Key Projects")
                for proj in proj_list:
                    name = proj.get("name") or ""
                    tech = proj.get("technologies") or ""
                    github_url = proj.get("github_url") or proj.get("githubUrl") or ""
                    live_url = proj.get("live_url") or proj.get("liveUrl") or ""

                    links = [l for l in [github_url, live_url] if l]
                    links_str = f" ({', '.join(links)})" if links else ""
                    tech_str = f" | Tech: {tech}" if tech else ""

                    story.append(Paragraph(f"<b>{name}</b>{tech_str}{links_str}", item_title))

                    bullets = proj.get("bullets") or []
                    if not bullets and (proj.get("what_built") or proj.get("problem_solved")):
                        built = proj.get("what_built") or proj.get("problem_solved") or ""
                        bullets = [b.strip("-• ").strip() for b in built.split("\n") if b.strip()]

                    for b in bullets:
                        story.append(Paragraph(f"• {b}", bullet_style))

                    story.append(Spacer(1, 4))

        # SKILLS
        elif sec_clean == "skills":
            skills_data = resume_data.get("skills") or {}
            skills_paras = []
            if isinstance(skills_data, dict):
                for cat, items in skills_data.items():
                    if isinstance(items, list) and items:
                        cat_label = cat.replace("_", " ").title()
                        skills_paras.append(f"<b>{cat_label}:</b> {', '.join(items)}")
            elif isinstance(skills_data, str) and skills_data.strip():
                skills_paras.append(skills_data.strip())

            if skills_paras:
                add_section_header("Technical Skills")
                for sp in skills_paras:
                    story.append(Paragraph(sp, body_style))
                story.append(Spacer(1, 4))

        # EDUCATION
        elif sec_clean == "education":
            edu_list = resume_data.get("education") or []
            if edu_list:
                add_section_header("Education")
                for edu in edu_list:
                    degree = edu.get("degree") or ""
                    field = edu.get("field_of_study") or edu.get("fieldOfStudy") or ""
                    inst = edu.get("institution") or ""
                    loc = edu.get("location") or ""
                    s_yr = edu.get("start_year") or edu.get("startYear") or ""
                    e_yr = edu.get("end_year") or edu.get("endYear") or ""
                    grade = edu.get("grade") or ""

                    deg_str = f"{degree} in {field}" if field else degree
                    yrs_str = f" ({s_yr} - {e_yr})" if (s_yr or e_yr) else ""
                    grade_str = f" | GPA/Grade: {grade}" if grade else ""

                    story.append(Paragraph(f"<b>{deg_str}</b> — {inst}{yrs_str}{grade_str}", item_title))
                    if edu.get("coursework"):
                        story.append(Paragraph(f"Relevant Coursework: {edu['coursework']}", item_subtitle))
                    story.append(Spacer(1, 3))

        # CERTIFICATIONS
        elif sec_clean == "certifications":
            cert_list = resume_data.get("certifications") or []
            if cert_list:
                add_section_header("Certifications")
                for cert in cert_list:
                    c_name = cert.get("name") or ""
                    issuer = cert.get("issuer") or ""
                    c_date = cert.get("issue_date") or cert.get("issueDate") or ""
                    c_url = cert.get("credential_url") or cert.get("credentialUrl") or ""

                    line = f"• <b>{c_name}</b>"
                    if issuer:
                        line += f" — {issuer}"
                    if c_date:
                        line += f" ({c_date})"
                    if c_url:
                        line += f" | {c_url}"
                    story.append(Paragraph(line, body_style))
                story.append(Spacer(1, 4))

        # ACHIEVEMENTS
        elif sec_clean == "achievements":
            ach_list = resume_data.get("achievements") or []
            if ach_list:
                add_section_header("Achievements & Honors")
                for ach in ach_list:
                    title = ach.get("title") or ""
                    desc = ach.get("description") or ""
                    date = ach.get("date") or ""
                    line = f"• <b>{title}</b>" + (f" ({date})" if date else "") + (f": {desc}" if desc else "")
                    story.append(Paragraph(line, body_style))
                story.append(Spacer(1, 4))

        # LEADERSHIP
        elif sec_clean == "leadership":
            lead_list = resume_data.get("leadership") or []
            if lead_list:
                add_section_header("Leadership & Activities")
                for lead in lead_list:
                    pos = lead.get("position") or lead.get("role") or ""
                    org = lead.get("organization") or ""
                    dur = lead.get("duration") or ""
                    desc = lead.get("description") or ""
                    story.append(Paragraph(f"<b>{pos}</b> — {org} ({dur})", item_title))
                    if desc:
                        story.append(Paragraph(desc, body_style))
                story.append(Spacer(1, 4))

        # LANGUAGES
        elif sec_clean == "languages":
            lang_list = resume_data.get("languages") or []
            if lang_list:
                add_section_header("Languages")
                lang_strs = [f"{l.get('language')} ({l.get('proficiency')})" if l.get('proficiency') else l.get('language') for l in lang_list if l.get('language')]
                if lang_strs:
                    story.append(Paragraph(" • ".join(lang_strs), body_style))
                story.append(Spacer(1, 4))

        # INTERESTS
        elif sec_clean == "interests":
            interests = resume_data.get("interests") or []
            if interests:
                add_section_header("Hobbies & Interests")
                if isinstance(interests, list):
                    story.append(Paragraph(", ".join(interests), body_style))
                else:
                    story.append(Paragraph(str(interests), body_style))
                story.append(Spacer(1, 4))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
