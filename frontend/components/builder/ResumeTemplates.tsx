"use client";

import React from "react";
import { ResumeData, TemplateId } from "../../types/builder";
import clsx from "clsx";

interface ResumeTemplateProps {
  data: ResumeData;
  templateId?: TemplateId;
}

export default function ResumeTemplateRenderer({ data, templateId }: ResumeTemplateProps) {
  const activeTemplate = templateId || data.template || "modern-professional";
  const { personal_info, summary, education, experience, internships, projects, skills, certifications, achievements, extracurriculars, leadership, languages, interests } = data;

  const sectionOrder = data.section_order || [
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "certifications",
    "achievements",
    "leadership",
    "extracurriculars",
    "languages",
    "interests",
  ];

  // Helper for contact details string
  const contactParts = [
    personal_info.email,
    personal_info.phone,
    personal_info.location,
    personal_info.linkedin,
    personal_info.github,
    personal_info.portfolio || personal_info.website,
  ].filter(Boolean);

  // Template Theme Configs
  const isAtsMinimal = activeTemplate === "ats-minimal";
  const isTechnical = activeTemplate === "technical";
  const isExecutive = activeTemplate === "executive";

  const mainHeaderColor = isAtsMinimal
    ? "text-slate-900 border-slate-300 dark:text-slate-100"
    : isTechnical
    ? "text-teal-700 border-teal-600 dark:text-teal-400"
    : isExecutive
    ? "text-indigo-950 border-indigo-900 dark:text-indigo-300"
    : "text-indigo-600 border-indigo-500 dark:text-indigo-400"; // modern-professional

  const titleFont = isExecutive ? "font-serif" : "font-sans";

  return (
    <div className="w-full bg-white text-gray-900 min-h-[1050px] p-8 shadow-2xl rounded-sm border border-gray-200 select-text text-sm font-sans relative">
      {/* Header Section */}
      <header className="mb-6 pb-4 border-b border-gray-300">
        <h1 className={clsx("text-2xl font-bold tracking-tight text-gray-900 mb-1", titleFont)}>
          {personal_info.full_name || "YOUR NAME"}
        </h1>
        {personal_info.professional_title && (
          <p className="text-base font-semibold text-gray-700 mb-2">
            {personal_info.professional_title}
          </p>
        )}
        {contactParts.length > 0 && (
          <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
            {contactParts.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span className="text-gray-400">•</span>}
                <span>{item}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Dynamic Sections */}
      <div className="space-y-5">
        {sectionOrder.map((sectionKey) => {
          const key = sectionKey.toLowerCase();

          // SUMMARY
          if (key === "summary") {
            const summaryText = summary?.generated_summary || summary?.self_description;
            if (!summaryText || !summaryText.trim()) return null;
            return (
              <section key={sectionKey} className="space-y-1.5">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Professional Summary
                </h2>
                <p className="text-xs text-gray-800 leading-relaxed">{summaryText}</p>
              </section>
            );
          }

          // EXPERIENCE
          if (key === "experience" || key === "work_experience") {
            if (!data.has_experience || !experience || experience.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-3">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Work Experience
                </h2>
                {experience.map((exp) => (
                  <div key={exp.id || exp.company} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-gray-900">
                        {exp.job_title} <span className="font-normal text-gray-600">— {exp.company}</span>
                      </h3>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                      </span>
                    </div>
                    {exp.location && <p className="text-[11px] text-gray-500 italic">{exp.location}</p>}

                    {exp.bullets && exp.bullets.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5 pl-1">
                        {exp.bullets.map((b, idx) => (
                          <li key={idx} className="leading-normal">{b}</li>
                        ))}
                      </ul>
                    ) : exp.responsibilities ? (
                      <p className="text-xs text-gray-800">{exp.responsibilities}</p>
                    ) : null}
                  </div>
                ))}
              </section>
            );
          }

          // INTERNSHIPS
          if (key === "internships") {
            if (!data.has_internships || !internships || internships.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-3">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Internships
                </h2>
                {internships.map((intern) => (
                  <div key={intern.id || intern.company} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-gray-900">
                        {intern.role} <span className="font-normal text-gray-600">— {intern.company}</span>
                      </h3>
                      <span className="text-[11px] text-gray-500">{intern.duration}</span>
                    </div>
                    {intern.bullets && intern.bullets.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5 pl-1">
                        {intern.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </section>
            );
          }

          // PROJECTS
          if (key === "projects") {
            if (!data.has_projects || !projects || projects.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-3">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Projects
                </h2>
                {projects.map((proj) => (
                  <div key={proj.id || proj.name} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-gray-900">
                        {proj.name}
                        {proj.technologies && (
                          <span className="font-normal text-gray-600 text-[11px]"> | Tech: {proj.technologies}</span>
                        )}
                      </h3>
                      <div className="text-[11px] text-gray-500 flex gap-2">
                        {proj.github_url && <a href={proj.github_url} className="text-indigo-600 hover:underline">GitHub</a>}
                        {proj.live_url && <a href={proj.live_url} className="text-indigo-600 hover:underline">Live Demo</a>}
                      </div>
                    </div>
                    {proj.bullets && proj.bullets.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5 pl-1">
                        {proj.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    ) : proj.what_built ? (
                      <p className="text-xs text-gray-800">{proj.what_built}</p>
                    ) : null}
                  </div>
                ))}
              </section>
            );
          }

          // SKILLS
          if (key === "skills") {
            const hasCatSkills = skills && (
              skills.languages?.length > 0 ||
              skills.frameworks?.length > 0 ||
              skills.databases?.length > 0 ||
              skills.cloud_tools?.length > 0 ||
              skills.ai_ml?.length > 0 ||
              skills.soft_skills?.length > 0
            );
            if (!hasCatSkills && !data.raw_skills_input) return null;

            return (
              <section key={sectionKey} className="space-y-1.5">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Technical & Professional Skills
                </h2>
                {hasCatSkills ? (
                  <div className="text-xs text-gray-800 space-y-1">
                    {skills.languages?.length > 0 && (
                      <p><strong>Languages:</strong> {skills.languages.join(", ")}</p>
                    )}
                    {skills.frameworks?.length > 0 && (
                      <p><strong>Frameworks/Libraries:</strong> {skills.frameworks.join(", ")}</p>
                    )}
                    {skills.databases?.length > 0 && (
                      <p><strong>Databases:</strong> {skills.databases.join(", ")}</p>
                    )}
                    {skills.cloud_tools?.length > 0 && (
                      <p><strong>Tools & Cloud:</strong> {skills.cloud_tools.join(", ")}</p>
                    )}
                    {skills.ai_ml?.length > 0 && (
                      <p><strong>AI / Machine Learning:</strong> {skills.ai_ml.join(", ")}</p>
                    )}
                    {skills.soft_skills?.length > 0 && (
                      <p><strong>Soft Skills:</strong> {skills.soft_skills.join(", ")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-800">{data.raw_skills_input}</p>
                )}
              </section>
            );
          }

          // EDUCATION
          if (key === "education") {
            if (!education || education.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-2">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu.id || edu.institution} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-gray-900">
                        {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                        <span className="font-normal text-gray-600"> — {edu.institution}</span>
                      </h3>
                      <span className="text-[11px] text-gray-500">
                        {edu.start_year && edu.end_year ? `${edu.start_year} – ${edu.end_year}` : edu.end_year}
                      </span>
                    </div>
                    {edu.grade && <p className="text-[11px] text-gray-600">GPA/Percentage: {edu.grade}</p>}
                    {edu.coursework && <p className="text-[11px] text-gray-600">Relevant Coursework: {edu.coursework}</p>}
                  </div>
                ))}
              </section>
            );
          }

          // CERTIFICATIONS
          if (key === "certifications") {
            if (!data.has_certifications || !certifications || certifications.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-1.5">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Certifications
                </h2>
                <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5">
                  {certifications.map((cert) => (
                    <li key={cert.id || cert.name}>
                      <strong>{cert.name}</strong> {cert.issuer && `— ${cert.issuer}`} {cert.issue_date && `(${cert.issue_date})`}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          // ACHIEVEMENTS
          if (key === "achievements") {
            if (!data.has_achievements || !achievements || achievements.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-1.5">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Achievements & Honors
                </h2>
                <ul className="list-disc list-inside text-xs text-gray-800 space-y-0.5">
                  {achievements.map((ach) => (
                    <li key={ach.id || ach.title}>
                      <strong>{ach.title}</strong> {ach.date && `(${ach.date})`} {ach.description && `— ${ach.description}`}
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          // LEADERSHIP
          if (key === "leadership") {
            if (!data.has_leadership || !leadership || leadership.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-2">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Leadership
                </h2>
                {leadership.map((lead) => (
                  <div key={lead.id || lead.organization} className="text-xs text-gray-800">
                    <strong>{lead.position}</strong> — {lead.organization} ({lead.duration})
                    {lead.description && <p className="text-[11px] text-gray-600 mt-0.5">{lead.description}</p>}
                  </div>
                ))}
              </section>
            );
          }

          // EXTRACURRICULAR
          if (key === "extracurriculars") {
            if (!data.has_extracurriculars || !extracurriculars || extracurriculars.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-1.5">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Extracurricular Activities
                </h2>
                {extracurriculars.map((extra) => (
                  <div key={extra.id || extra.organization} className="text-xs text-gray-800">
                    <strong>{extra.role}</strong> — {extra.organization}
                    {extra.description && <p className="text-[11px] text-gray-600 mt-0.5">{extra.description}</p>}
                  </div>
                ))}
              </section>
            );
          }

          // LANGUAGES
          if (key === "languages") {
            if (!languages || languages.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-1">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Languages
                </h2>
                <p className="text-xs text-gray-800">
                  {languages.map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(" • ")}
                </p>
              </section>
            );
          }

          // INTERESTS
          if (key === "interests") {
            if (!interests || interests.length === 0) return null;
            return (
              <section key={sectionKey} className="space-y-1">
                <h2 className={clsx("text-xs font-bold uppercase tracking-wider border-b pb-0.5", mainHeaderColor)}>
                  Hobbies & Interests
                </h2>
                <p className="text-xs text-gray-800">
                  {Array.isArray(interests) ? interests.join(", ") : interests}
                </p>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
