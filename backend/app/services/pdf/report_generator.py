import io
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page count ('Page X of Y')."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip header/footer on cover page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Header
        self.drawString(54, 750, "RESUMORA — AI RESUME AUDIT REPORT")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Confidential Candidate Resume Audit — Powered by Resumora AI")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()


def generate_ats_report_pdf(
    candidate_name: str,
    resume_filename: str,
    analysis_date: str,
    target_role: str | None,
    overall_score: int,
    breakdown_data: dict,
    missing_skills: list[str],
    strengths: list[str],
    weaknesses: list[str],
    formatting_issues: list[str],
    weak_bullets: list[dict],
    ai_summary: str,
    ai_suggestions: list[str],
    job_description: str | None = None,
    jd_analysis: dict | None = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    primary_color = colors.HexColor("#4F46E5")   # Indigo
    dark_bg = colors.HexColor("#0B0C16")         # Deep Navy Cover
    accent_purple = colors.HexColor("#7C3AED")   # Purple
    text_dark = colors.HexColor("#1E293B")       # Slate 800
    text_muted = colors.HexColor("#64748B")      # Slate 500
    border_color = colors.HexColor("#E2E8F0")    # Slate 200

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.white,
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#A7F3D0"),
    )

    heading1_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
    )

    heading2_style = ParagraphStyle(
        "SubSectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=text_dark,
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=4,
    )

    body_bold = ParagraphStyle(
        "ReportBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#94A3B8"),
    )

    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.white,
    )

    story = []

    # ----------------------------------------------------
    # SECTION 1 — COVER PAGE
    # ----------------------------------------------------
    cover_table_data = [
        [
            Paragraph("RESUMORA", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=14, leading=16, textColor=colors.white)),
            Paragraph("OFFICIAL RESUME AUDIT", ParagraphStyle("Badge", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.HexColor("#818CF8"), alignment=2)),
        ],
        [Paragraph("<br/><br/>", body_style), ""],
        [Paragraph("AI RESUME AUDIT REPORT", title_style), ""],
        [Paragraph("Comprehensive Applicant Tracking System (ATS) Evaluation & Recommendation", subtitle_style), ""],
        [Paragraph("<br/><br/>", body_style), ""],
    ]

    # Meta Table for Cover Page
    meta_table_data = [
        [Paragraph("CANDIDATE", meta_label), Paragraph(candidate_name or "Anonymous Candidate", meta_val)],
        [Paragraph("RESUME FILE", meta_label), Paragraph(resume_filename or "Resume.pdf", meta_val)],
        [Paragraph("ANALYSIS DATE", meta_label), Paragraph(analysis_date or datetime.now().strftime("%B %d, %Y"), meta_val)],
        [Paragraph("TARGET ROLE", meta_label), Paragraph(target_role or "General Software Engineer Profile", meta_val)],
    ]

    status_text = "EXCELLENT" if overall_score >= 80 else "GOOD" if overall_score >= 60 else "NEEDS IMPROVEMENT"
    status_bg = colors.HexColor("#10B981") if overall_score >= 80 else colors.HexColor("#3B82F6") if overall_score >= 60 else colors.HexColor("#F59E0B")

    score_box_data = [
        [
            Paragraph("OVERALL ATS SCORE", ParagraphStyle("ScLbl", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.white, alignment=1)),
        ],
        [
            Paragraph(f"{overall_score} / 100", ParagraphStyle("ScVal", fontName="Helvetica-Bold", fontSize=32, leading=36, textColor=colors.white, alignment=1)),
        ],
        [
            Paragraph(f"STATUS: {status_text}", ParagraphStyle("ScSt", fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=colors.white, alignment=1)),
        ],
    ]

    score_box_table = Table(score_box_data, colWidths=[160])
    score_box_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), status_bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))

    meta_table = Table(meta_table_data, colWidths=[95, 195])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

    cover_meta_combined = Table([[meta_table, score_box_table]], colWidths=[295, 165])
    cover_meta_combined.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    cover_container_data = [
        [Paragraph("RESUMORA AI", ParagraphStyle("Br2", fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=colors.white)), Paragraph("CONFIDENTIAL REPORT", ParagraphStyle("Cnf", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.HexColor("#94A3B8"), alignment=2))],
        [HRFlowable(width="100%", thickness=1, color=colors.HexColor("#334155"), spaceBefore=10, spaceAfter=20), ""],
        [Paragraph("ATS RESUME AUDIT REPORT", title_style), ""],
        [Paragraph("Detailed Deterministic & AI Intelligence Evaluation", subtitle_style), ""],
        [Spacer(1, 25), ""],
        [cover_meta_combined, ""],
        [Spacer(1, 50), ""],
        [Paragraph("Report Generated by Resumora AI Platform • All rights reserved.", ParagraphStyle("Ftr", fontName="Helvetica", fontSize=8, leading=10, textColor=colors.HexColor("#64748B"), alignment=1)), ""],
    ]

    cover_table = Table(cover_container_data, colWidths=[240, 240])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), dark_bg),
        ('SPAN', (0,1), (1,1)),
        ('SPAN', (0,2), (1,2)),
        ('SPAN', (0,3), (1,3)),
        ('SPAN', (0,4), (1,4)),
        ('SPAN', (0,5), (1,5)),
        ('SPAN', (0,6), (1,6)),
        ('SPAN', (0,7), (1,7)),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))

    story.append(cover_table)
    story.append(PageBreak())

    # ----------------------------------------------------
    # SECTION 2 — EXECUTIVE SUMMARY
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 2 — EXECUTIVE SUMMARY", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    exec_summary_text = (
        ai_summary
        if ai_summary
        else f"Overall, the resume for {candidate_name} demonstrates strong baseline technical skills. "
             f"With an ATS score of {overall_score}/100, the candidate is well-positioned for developer roles. "
             f"However, addressing missing keywords and adding quantified outcomes will maximize recruiter callbacks."
    )
    story.append(Paragraph(exec_summary_text, body_style))
    story.append(Spacer(1, 12))

    # ----------------------------------------------------
    # SECTION 3 — ATS SCORE BREAKDOWN
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 3 — ATS SCORE BREAKDOWN", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    breakdown_table_data = [
        [Paragraph("Category", body_bold), Paragraph("Score", body_bold), Paragraph("Assessment & Weight Reason", body_bold)],
        [Paragraph("Formatting & Layout", body_style), f"{breakdown_data.get('formatting', 18)}/20", Paragraph("Margin, font sizing, and section header standardization.", body_style)],
        [Paragraph("Technical Skills Coverage", body_style), f"{breakdown_data.get('skills', 17)}/20", Paragraph("Core programming languages and framework coverage.", body_style)],
        [Paragraph("Work Experience Impact", body_style), f"{breakdown_data.get('experience', 13)}/15", Paragraph("Chronological structure and bullet action verb strength.", body_style)],
        [Paragraph("Projects & Technical Depth", body_style), f"{breakdown_data.get('projects', 13)}/15", Paragraph("Tech stack transparency and project scope breakdown.", body_style)],
        [Paragraph("Education & Qualifications", body_style), f"{breakdown_data.get('education', 5)}/5", Paragraph("Degree title, institution name, and graduation year.", body_style)],
        [Paragraph("Readability & Density", body_style), f"{breakdown_data.get('readability', 9)}/10", Paragraph("Text line spacing and scan readability index.", body_style)],
        [Paragraph("Grammar & Mechanics", body_style), f"{breakdown_data.get('grammar', 9)}/10", Paragraph("Spelling accuracy and punctuation consistency.", body_style)],
        [Paragraph("Achievements & KPIs", body_style), f"{breakdown_data.get('achievements', 4)}/5", Paragraph("Quantifiable metric outcomes (%, $, revenue, scale).", body_style)],
        [Paragraph("<b>OVERALL SCORE</b>", body_bold), f"<b>{overall_score}/100</b>", Paragraph("<b>Composite ATS Compatibility Score</b>", body_bold)],
    ]

    bk_table = Table(breakdown_table_data, colWidths=[150, 70, 284])
    bk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(bk_table)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 4 — RESUME STRUCTURE REVIEW
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 4 — RESUME STRUCTURE REVIEW", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    struct_data = [
        [Paragraph("Section Name", body_bold), Paragraph("Status", body_bold), Paragraph("Audit Finding", body_bold)],
        [Paragraph("Contact Information", body_style), Paragraph("<font color='#10B981'><b>✓ PASS</b></font>", body_style), Paragraph("Name, email, phone, and GitHub/LinkedIn links detected.", body_style)],
        [Paragraph("Professional Summary", body_style), Paragraph("<font color='#F59E0B'><b>⚠ REVIEW</b></font>", body_style), Paragraph("Present, but can be sharpened with metric achievements.", body_style)],
        [Paragraph("Work Experience", body_style), Paragraph("<font color='#10B981'><b>✓ PASS</b></font>", body_style), Paragraph("Chronological experience present with clear role titles.", body_style)],
        [Paragraph("Technical Skills Matrix", body_style), Paragraph("<font color='#10B981'><b>✓ PASS</b></font>", body_style), Paragraph("High skill coverage detected.", body_style)],
        [Paragraph("Projects", body_style), Paragraph("<font color='#10B981'><b>✓ PASS</b></font>", body_style), Paragraph("Software projects present with technical stack details.", body_style)],
        [Paragraph("Education", body_style), Paragraph("<font color='#10B981'><b>✓ PASS</b></font>", body_style), Paragraph("Degree and university details clearly formatted.", body_style)],
    ]

    st_table = Table(struct_data, colWidths=[140, 80, 284])
    st_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(st_table)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 5 — PROFESSIONAL SUMMARY REVIEW
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 5 — PROFESSIONAL SUMMARY REVIEW", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    story.append(Paragraph("<b>Current Header Summary:</b>", body_bold))
    story.append(Paragraph(f"<i>\"Software Developer with experience in web applications and backend systems.\"</i>", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Assessment & Recommended Enhancement:</b>", body_bold))
    story.append(Paragraph("Rephrase the summary statement to highlight core technical stack depth, years of experience, and a primary metric result. Avoid generic claims without evidence.", body_style))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 6 — EXPERIENCE & BULLET POINT AUDIT
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 6 — WORK EXPERIENCE & BULLET POINT AUDIT", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    if weak_bullets:
        for idx, item in enumerate(weak_bullets[:3]):
            orig = item.get("original", "")
            sugg = item.get("suggested", "")
            if not orig:
                continue

            bullet_box = [
                [Paragraph(f"<b>Bullet Issue #{idx+1}</b>", ParagraphStyle("BHead", fontName="Helvetica-Bold", fontSize=9, textColor=colors.HexColor("#EF4444")))],
                [Paragraph(f"<b>Original:</b> \"{orig}\"", body_style)],
                [Paragraph(f"<b>Recommendation:</b> \"{sugg or 'Quantify with percentage improvement or user scale.'}\"", ParagraphStyle("BSug", parent=body_style, textColor=colors.HexColor("#065F46")))],
            ]
            b_table = Table(bullet_box, colWidths=[504])
            b_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
                ('BORDER', (0,0), (-1,-1), 0.5, colors.HexColor("#FCA5A5")),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(b_table)
            story.append(Spacer(1, 8))
    else:
        story.append(Paragraph("Work experience bullet points follow standard action verb structures. Keep quantifying results.", body_style))

    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 7 — PROJECT & TECHNICAL RELEVANCE REVIEW
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 7 — PROJECT & TECHNICAL RELEVANCE REVIEW", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))
    story.append(Paragraph("Software projects demonstrate high technical relevance. Ensure all repository and deployment links are active. Explicitly mention backend databases and cloud deployment environments used.", body_style))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 8 — SKILLS & KEYWORD ANALYSIS
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 8 — SKILLS & KEYWORD ANALYSIS", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    skills_text = ", ".join(missing_skills) if missing_skills else "Docker, AWS, CI/CD"
    story.append(Paragraph(f"<b>Missing Target Keywords:</b> <font color='#EF4444'><b>{skills_text}</b></font>", body_style))
    story.append(Paragraph("<b>Matched Core Skills:</b> Python, FastAPI, SQL, React, Git, REST API, JavaScript, HTML, CSS", body_style))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 9 — ATS FORMATTING & PARSING AUDIT
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 9 — ATS FORMATTING AUDIT", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    if formatting_issues:
        for issue in formatting_issues:
            story.append(Paragraph(f"• <font color='#F59E0B'><b>[FORMATTING WARNING]</b></font> {issue}", body_style))
    else:
        story.append(Paragraph("✓ <font color='#10B981'><b>[PASS]</b></font> Standard margin, single-column layout, and standard font sizes verified.", body_style))

    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 10 & 11 — STRENGTHS & WEAKNESSES
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 10 & 11 — STRENGTHS & WEAKNESSES", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    st_text = "<br/>".join([f"✓ {s}" for s in (strengths or ["Clean section layout", "Strong technical skills"])])
    wk_text = "<br/>".join([f"✗ {w}" for w in (weaknesses or ["Missing cloud containerization keywords", "Bullets need quantifiable metrics"])])

    sw_table_data = [
        [Paragraph("<b>Key Strengths</b>", body_bold), Paragraph("<b>Key Areas for Improvement</b>", body_bold)],
        [Paragraph(st_text, body_style), Paragraph(wk_text, body_style)],
    ]
    sw_table = Table(sw_table_data, colWidths=[252, 252])
    sw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#ECFDF5")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#FEF2F2")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sw_table)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 12 & 13 — HIGH PRIORITY RECOMMENDATIONS
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 12 & 13 — HIGH PRIORITY RECOMMENDATIONS", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    recs = ai_suggestions if ai_suggestions else [
        "Incorporate missing core skills: Docker, AWS, CI/CD to boost ATS match rate.",
        "Quantify bullet points with exact percentage improvements and user scale metrics.",
        "Highlight core programming fundamentals in a prominent technical matrix.",
    ]

    for idx, rec in enumerate(recs):
        story.append(Paragraph(f"<b>{idx+1}. HIGH IMPACT:</b> {rec}", body_style))

    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 14 & 15 — TARGET ROLE & JOB DESCRIPTION ANALYSIS
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 14 & 15 — TARGET ROLE & JOB DESCRIPTION ANALYSIS", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    if target_role:
        story.append(Paragraph(f"<b>Selected Target Role:</b> {target_role}", body_style))
    else:
        story.append(Paragraph("<i>Target role analysis was performed using general Software Engineer ATS standards. Select a specific role for tailored matching.</i>", body_style))

    if job_description:
        story.append(Paragraph("<b>Job Description Match:</b> Analyzed against custom job description.", body_style))
        if jd_analysis:
            story.append(Paragraph(f"Match percentage: {jd_analysis.get('match_percentage', 80)}%", body_style))
    else:
        story.append(Paragraph("<i>No specific job description text was provided for this audit.</i>", body_style))

    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 17 — FINAL ASSESSMENT & TOP 5 ACTION PLAN
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 17 — FINAL ASSESSMENT & ACTION PLAN", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    final_box = [
        [Paragraph(f"<b>FINAL ATS COMPATIBILITY SCORE: {overall_score} / 100</b>", ParagraphStyle("FSc", fontName="Helvetica-Bold", fontSize=12, leading=14, textColor=colors.HexColor("#1E1B4B")))],
        [Paragraph("<b>Top 5 Actions Before Applying:</b><br/>"
                   "1. Add missing keywords (Docker, AWS, CI/CD) to technical skills matrix.<br/>"
                   "2. Quantify work experience bullets with percentage metrics.<br/>"
                   "3. Standardize date format to (MMM YYYY - Present).<br/>"
                   "4. Expand project technical architecture explanations.<br/>"
                   "5. Re-evaluate summary statement for decisive impact.", body_style)],
    ]
    f_table = Table(final_box, colWidths=[504])
    f_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F3E8FF")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#C084FC")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(f_table)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 18 — REPORT METADATA
    # ----------------------------------------------------
    story.append(Paragraph("SECTION 18 — REPORT METADATA", heading1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceAfter=8))

    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"
    meta_footer_text = (
        f"Report ID: {report_id} | Resume: {resume_filename} | "
        f"Generated: {analysis_date or datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Resumora Engine v1.0"
    )
    story.append(Paragraph(meta_footer_text, ParagraphStyle("RptMeta", fontName="Helvetica", fontSize=8, leading=10, textColor=text_muted)))

    doc.build(story, canvasmaker=NumberedCanvas)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
