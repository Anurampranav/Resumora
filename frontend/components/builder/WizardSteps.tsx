"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Wand2,
  FileText,
  Clock,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Code2,
  Award,
  Trophy,
  Users,
  Globe,
  Heart,
  FileCheck2,
  AlertCircle,
  Building2,
  BookOpen,
} from "lucide-react";
import {
  ResumeData,
  EducationItem,
  ExperienceItem,
  InternshipItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
  ExtracurricularItem,
  LeadershipItem,
  LanguageItem,
} from "../../types/builder";
import { generateSummaryApi, transformBulletsApi, organizeSkillsApi } from "../../lib/builderApi";
import clsx from "clsx";

interface WizardStepsProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  currentStep: number;
  setStep: (step: number) => void;
  onOpenAiImprove: (sectionType: string, text: string, context?: string) => void;
  onNavigateToUpload: () => void;
}

const TOTAL_STEPS = 18; // Steps 0 through 17

const ROLE_OPTIONS = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Python Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "UI/UX Designer",
  "Cybersecurity Engineer",
  "Product Manager",
];

const QUALITIES_OPTIONS = [
  "Problem solving",
  "Teamwork",
  "Communication",
  "Leadership",
  "Fast Learner",
  "Adaptability",
  "Critical Thinking",
  "Attention to Detail",
];

export default function WizardSteps({
  data,
  onChange,
  currentStep,
  setStep,
  onOpenAiImprove,
  onNavigateToUpload,
}: WizardStepsProps) {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Helper updates
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personal_info: { ...data.personal_info, [field]: value },
    });
  };

  const updateCareerGoal = (field: string, value: string) => {
    onChange({
      ...data,
      career_goal: { ...data.career_goal, [field]: value },
    });
  };

  const updateSummary = (field: string, value: any) => {
    onChange({
      ...data,
      summary: { ...data.summary, [field]: value },
    });
  };

  // AI Summary Handler
  const handleGenerateSummary = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const summaryText = await generateSummaryApi({
        self_description: data.summary.self_description,
        qualities: data.summary.qualities,
        interest_areas: data.summary.interest_areas,
        target_role: data.career_goal.target_role,
      });
      updateSummary("generated_summary", summaryText);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate summary");
    } finally {
      setLoadingAi(false);
    }
  };

  // AI Organize Skills Handler
  const handleOrganizeSkills = async () => {
    if (!data.raw_skills_input.trim()) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const cat = await organizeSkillsApi(data.raw_skills_input);
      onChange({
        ...data,
        skills: {
          languages: cat.languages || [],
          frameworks: cat.frameworks || [],
          databases: cat.databases || [],
          cloud_tools: cat.cloud_tools || [],
          ai_ml: cat.ai_ml || [],
          soft_skills: cat.soft_skills || [],
        },
      });
    } catch (err: any) {
      setAiError(err.message || "Failed to organize skills");
    } finally {
      setLoadingAi(false);
    }
  };

  // URL Validation Helper
  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // STEP 0: INTRODUCTION SCREEN
  if (currentStep === 0) {
    return (
      <div className="space-y-6 text-center py-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-500/20">
          <Sparkles size={14} />
          <span>RESUMORA AI WIZARD</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Build Your Resume With AI
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
            Answer a few simple questions and Resumora will build a professional, ATS-friendly resume for you step-by-step.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-2">
          <div className="p-4 rounded-2xl glass-card text-left border border-white/40 dark:border-white/10">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
              <Clock size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Estimated Time</span>
            </div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">5–10 Minutes</p>
          </div>

          <div className="p-4 rounded-2xl glass-card text-left border border-white/40 dark:border-white/10">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <FileCheck2 size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">ATS Score</span>
            </div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">Guaranteed ATS Ready</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 max-w-md mx-auto">
          <button
            suppressHydrationWarning
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-base btn-gradient shadow-lg shadow-violet-500/25 active:scale-95 transition-all"
          >
            <span>Start Building</span>
            <ArrowRight size={18} />
          </button>

          <button
            suppressHydrationWarning
            onClick={onNavigateToUpload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <FileText size={16} />
            <span>&quot;I already have a resume&quot; (Upload &amp; Analyze)</span>
          </button>
        </div>
      </div>
    );
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Personal Information";
      case 2: return "Career Goal";
      case 3: return "Professional Summary";
      case 4: return "Education";
      case 5: return "Work Experience";
      case 6: return "Internships";
      case 7: return "Projects";
      case 8: return "Technical & Soft Skills";
      case 9: return "Certifications";
      case 10: return "Achievements & Honors";
      case 11: return "Extracurricular Activities";
      case 12: return "Leadership & Coordination";
      case 13: return "Languages";
      case 14: return "Hobbies & Interests";
      case 15: return "Additional Information";
      case 16: return "Target Job Mode";
      case 17: return "Review & Finalize";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Step {currentStep} of {TOTAL_STEPS - 1}: {getStepTitle(currentStep)}
          </span>
          <span className="font-bold text-violet-600 dark:text-violet-400">
            {Math.round((currentStep / (TOTAL_STEPS - 1)) * 100)}% Completed
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* AI Error Alert */}
      {aiError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{aiError}</span>
        </div>
      )}

      {/* STEP 1: PERSONAL INFORMATION */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provide your contact details so recruiters know how to reach you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Full Name *</label>
              <input
                type="text"
                value={data.personal_info.full_name}
                onChange={(e) => updatePersonalInfo("full_name", e.target.value)}
                placeholder="e.g. Anuram Pranav"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Professional Title</label>
              <input
                type="text"
                value={data.personal_info.professional_title}
                onChange={(e) => updatePersonalInfo("professional_title", e.target.value)}
                placeholder="e.g. Software Engineer / CS Student"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Email *</label>
              <input
                type="email"
                value={data.personal_info.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="anurampranav07@gmail.com"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={data.personal_info.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+91 9876543210"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Location</label>
              <input
                type="text"
                value={data.personal_info.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={data.personal_info.linkedin}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className={clsx(
                  "w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400",
                  !isValidUrl(data.personal_info.linkedin) && "border-rose-500"
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">GitHub Profile URL</label>
              <input
                type="text"
                value={data.personal_info.github}
                onChange={(e) => updatePersonalInfo("github", e.target.value)}
                placeholder="https://github.com/username"
                className={clsx(
                  "w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400",
                  !isValidUrl(data.personal_info.github) && "border-rose-500"
                )}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Portfolio / Website URL</label>
              <input
                type="text"
                value={data.personal_info.portfolio}
                onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                placeholder="https://myportfolio.com"
                className={clsx(
                  "w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400",
                  !isValidUrl(data.personal_info.portfolio) && "border-rose-500"
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CAREER GOAL */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Career Goal</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tell us about your target role so Gemini can tailor your resume contextually.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                What type of role are you targeting? *
              </label>
              <select
                value={ROLE_OPTIONS.includes(data.career_goal.target_role) ? data.career_goal.target_role : "Other"}
                onChange={(e) => {
                  if (e.target.value !== "Other") {
                    updateCareerGoal("target_role", e.target.value);
                  }
                }}
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
              >
                <option value="">Select a Role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Other">Custom Role / Other</option>
              </select>
            </div>

            {(!ROLE_OPTIONS.includes(data.career_goal.target_role) || data.career_goal.target_role === "Other") && (
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Enter Custom Role</label>
                <input
                  type="text"
                  value={data.career_goal.target_role}
                  onChange={(e) => updateCareerGoal("target_role", e.target.value)}
                  placeholder="e.g. AI Systems Engineer"
                  className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                What type of company are you targeting? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {["Startup", "Product Company", "Service Company", "MNC", "Government", "Any"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => updateCareerGoal("target_company_type", c)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                      data.career_goal.target_company_type === c
                        ? "bg-violet-600 text-white border-violet-600 shadow-md"
                        : "glass-pill text-gray-700 dark:text-gray-300 hover:border-violet-500"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                Where are you looking for opportunities? (Optional)
              </label>
              <div className="flex gap-2">
                {["Remote", "On-site", "Hybrid", "Any"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => updateCareerGoal("work_mode", mode)}
                    className={clsx(
                      "flex-1 py-2 rounded-xl text-xs font-medium border text-center transition-all",
                      data.career_goal.work_mode === mode
                        ? "bg-violet-600 text-white border-violet-600 shadow-md"
                        : "glass-pill text-gray-700 dark:text-gray-300 hover:border-violet-500"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROFESSIONAL SUMMARY QUESTIONNAIRE */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Summary</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Answer 3 simple questions and Gemini will draft a tailored professional summary.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                1. Tell us about yourself in a few sentences.
              </label>
              <textarea
                value={data.summary.self_description}
                onChange={(e) => updateSummary("self_description", e.target.value)}
                rows={2}
                placeholder="e.g. I'm a CS student passionate about backend systems, Python, and AI development."
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                2. What are your strongest qualities?
              </label>
              <div className="flex flex-wrap gap-2">
                {QUALITIES_OPTIONS.map((q) => {
                  const selected = data.summary.qualities.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        const next = selected
                          ? data.summary.qualities.filter((item) => item !== q)
                          : [...data.summary.qualities, q];
                        updateSummary("qualities", next);
                      }}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                        selected
                          ? "bg-violet-600 text-white border-violet-600"
                          : "glass-pill text-gray-700 dark:text-gray-300 hover:border-violet-500"
                      )}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                3. What type of work are you most interested in?
              </label>
              <input
                type="text"
                value={data.summary.interest_areas}
                onChange={(e) => updateSummary("interest_areas", e.target.value)}
                placeholder="e.g. Building microservices, REST APIs, AI features"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <button
              suppressHydrationWarning
              onClick={handleGenerateSummary}
              disabled={loadingAi}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{loadingAi ? "Generating Summary..." : "✨ Generate Summary with Gemini AI"}</span>
            </button>

            {data.summary.generated_summary && (
              <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-violet-700 dark:text-violet-300">
                  <span>AI GENERATED SUMMARY</span>
                  <button
                    suppressHydrationWarning
                    onClick={() => onOpenAiImprove("Summary", data.summary.generated_summary)}
                    className="text-[11px] underline hover:text-violet-500"
                  >
                    ✨ Improve
                  </button>
                </div>
                <textarea
                  value={data.summary.generated_summary}
                  onChange={(e) => updateSummary("generated_summary", e.target.value)}
                  rows={3}
                  className="w-full p-2 text-xs bg-white/70 dark:bg-black/30 rounded-lg text-gray-900 dark:text-white font-sans border-0 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: EDUCATION */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add your degree and academic history.
              </p>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => {
                const newItem: EducationItem = {
                  id: String(Date.now()),
                  degree: "",
                  field_of_study: "",
                  institution: "",
                  location: "",
                  start_year: "",
                  end_year: "",
                  grade: "",
                  coursework: "",
                  achievements: "",
                  level: "higher",
                };
                onChange({ ...data, education: [...data.education, newItem] });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-all"
            >
              <Plus size={14} />
              <span>Add Education</span>
            </button>
          </div>

          {data.education.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10 space-y-3">
              <GraduationCap size={32} className="mx-auto text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No education added yet</p>
              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: EducationItem = {
                    id: String(Date.now()),
                    degree: "Bachelor of Technology",
                    field_of_study: "Computer Science",
                    institution: "",
                    location: "",
                    start_year: "2021",
                    end_year: "2025",
                    grade: "",
                    coursework: "",
                    achievements: "",
                    level: "higher",
                  };
                  onChange({ ...data, education: [newItem] });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-gradient shadow-md"
              >
                + Add Degree
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={edu.id || index} className="p-4 rounded-2xl glass-card border border-white/40 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      Education #{index + 1}
                    </span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const next = data.education.filter((_, i) => i !== index);
                        onChange({ ...data, education: next });
                      }}
                      className="text-rose-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Degree *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].degree = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. B.Tech / B.E. / B.Sc"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field_of_study}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].field_of_study = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Institution / College *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].institution = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. University Institute of Technology"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Location</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].location = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. Bengaluru, India"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Start Year</label>
                      <input
                        type="text"
                        value={edu.start_year}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].start_year = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="2021"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.end_year}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].end_year = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="2025"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].grade = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. 8.8 / 10 or 85%"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Relevant Coursework</label>
                      <input
                        type="text"
                        value={edu.coursework}
                        onChange={(e) => {
                          const list = [...data.education];
                          list[index].coursework = e.target.value;
                          onChange({ ...data, education: list });
                        }}
                        placeholder="e.g. Data Structures, DBMS, Operating Systems"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: WORK EXPERIENCE */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Do you have work experience to include on your resume?
            </p>
          </div>

          <div className="flex gap-3">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_experience: true })}
              className={clsx(
                "flex-1 py-3 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2",
                data.has_experience
                  ? "bg-violet-600 text-white border-violet-600 shadow-md"
                  : "glass-pill text-gray-700 dark:text-gray-300 hover:border-violet-500"
              )}
            >
              <span>YES</span>
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_experience: false, experience: [] })}
              className={clsx(
                "flex-1 py-3 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2",
                !data.has_experience
                  ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20"
                  : "glass-pill text-gray-700 dark:text-gray-300 hover:border-violet-500"
              )}
            >
              <span>NO (SKIP)</span>
            </button>
          </div>

          {!data.has_experience ? (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-800 dark:text-violet-300">
              No problem! We&apos;ll focus on your projects, education, skills, achievements, and other experience.
            </div>
          ) : (
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={exp.id || index} className="p-4 rounded-2xl glass-card border border-white/40 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      Work Experience #{index + 1}
                    </span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const next = data.experience.filter((_, i) => i !== index);
                        onChange({ ...data, experience: next });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Company *</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const list = [...data.experience];
                          list[index].company = e.target.value;
                          onChange({ ...data, experience: list });
                        }}
                        placeholder="e.g. Acme Corp"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Job Title *</label>
                      <input
                        type="text"
                        value={exp.job_title}
                        onChange={(e) => {
                          const list = [...data.experience];
                          list[index].job_title = e.target.value;
                          onChange({ ...data, experience: list });
                        }}
                        placeholder="e.g. Software Engineer Intern"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.start_date}
                        onChange={(e) => {
                          const list = [...data.experience];
                          list[index].start_date = e.target.value;
                          onChange({ ...data, experience: list });
                        }}
                        placeholder="Jan 2024"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.end_date}
                        disabled={exp.is_current}
                        onChange={(e) => {
                          const list = [...data.experience];
                          list[index].end_date = e.target.value;
                          onChange({ ...data, experience: list });
                        }}
                        placeholder="Present"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      What did you work on &amp; accomplish? (Natural language ok!)
                    </label>
                    <textarea
                      value={exp.responsibilities}
                      onChange={(e) => {
                        const list = [...data.experience];
                        list[index].responsibilities = e.target.value;
                        onChange({ ...data, experience: list });
                      }}
                      rows={3}
                      placeholder="e.g. Built microservices with FastAPI and PostgreSQL, integrated Redis cache for fast API response times."
                      className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={async () => {
                      if (!exp.responsibilities) return;
                      setLoadingAi(true);
                      try {
                        const bullets = await transformBulletsApi({
                          raw_input: exp.responsibilities,
                          role_title: exp.job_title || "Experience",
                          section_type: "Work Experience",
                          target_role: data.career_goal.target_role,
                        });
                        const list = [...data.experience];
                        list[index].bullets = bullets;
                        onChange({ ...data, experience: list });
                      } catch (err: any) {
                        setAiError(err.message);
                      } finally {
                        setLoadingAi(false);
                      }
                    }}
                    disabled={loadingAi || !exp.responsibilities}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all disabled:opacity-50"
                  >
                    <Wand2 size={14} />
                    <span>✨ Transform to Professional ATS Bullets</span>
                  </button>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GENERATED BULLETS</span>
                      {exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start justify-between gap-2 text-xs text-gray-800 dark:text-gray-200">
                          <p>• {b}</p>
                          <button
                            suppressHydrationWarning
                            onClick={() => onOpenAiImprove("Work Experience Bullet", b)}
                            className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0"
                          >
                            ✨ Improve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: ExperienceItem = {
                    id: String(Date.now()),
                    company: "",
                    job_title: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    is_current: false,
                    responsibilities: "",
                    technologies: "",
                    accomplishments: "",
                    bullets: [],
                  };
                  onChange({ ...data, experience: [...data.experience, newItem] });
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-all"
              >
                + Add Another Experience
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 6: INTERNSHIPS */}
      {currentStep === 6 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Internships</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Have you completed or are you currently doing an internship?
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_internships: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_internships
                  ? "bg-violet-600 text-white border-violet-600 shadow-md"
                  : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE INTERNSHIPS)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_internships: false, internships: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_internships
                  ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20"
                  : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_internships && (
            <div className="space-y-4">
              {data.internships.map((intern, index) => (
                <div key={intern.id || index} className="p-4 rounded-2xl glass-card border border-white/40 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      Internship #{index + 1}
                    </span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const next = data.internships.filter((_, i) => i !== index);
                        onChange({ ...data, internships: next });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        value={intern.company}
                        onChange={(e) => {
                          const list = [...data.internships];
                          list[index].company = e.target.value;
                          onChange({ ...data, internships: list });
                        }}
                        placeholder="e.g. TechCorp Labs"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Role *</label>
                      <input
                        type="text"
                        value={intern.role}
                        onChange={(e) => {
                          const list = [...data.internships];
                          list[index].role = e.target.value;
                          onChange({ ...data, internships: list });
                        }}
                        placeholder="e.g. Web Development Intern"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Duration</label>
                      <input
                        type="text"
                        value={intern.duration}
                        onChange={(e) => {
                          const list = [...data.internships];
                          list[index].duration = e.target.value;
                          onChange({ ...data, internships: list });
                        }}
                        placeholder="e.g. Jun 2024 – Aug 2024"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Technologies Used</label>
                      <input
                        type="text"
                        value={intern.technologies}
                        onChange={(e) => {
                          const list = [...data.internships];
                          list[index].technologies = e.target.value;
                          onChange({ ...data, internships: list });
                        }}
                        placeholder="e.g. React, Node.js, SQL"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      What were your main responsibilities &amp; contributions?
                    </label>
                    <textarea
                      value={intern.responsibilities}
                      onChange={(e) => {
                        const list = [...data.internships];
                        list[index].responsibilities = e.target.value;
                        onChange({ ...data, internships: list });
                      }}
                      rows={3}
                      placeholder="e.g. Developed dashboard UI components in React and optimized REST API endpoints."
                      className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={async () => {
                      if (!intern.responsibilities) return;
                      setLoadingAi(true);
                      try {
                        const bullets = await transformBulletsApi({
                          raw_input: intern.responsibilities,
                          role_title: intern.role || "Internship",
                          section_type: "Internship",
                          target_role: data.career_goal.target_role,
                        });
                        const list = [...data.internships];
                        list[index].bullets = bullets;
                        onChange({ ...data, internships: list });
                      } catch (err: any) {
                        setAiError(err.message);
                      } finally {
                        setLoadingAi(false);
                      }
                    }}
                    disabled={loadingAi || !intern.responsibilities}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all disabled:opacity-50"
                  >
                    <Wand2 size={14} />
                    <span>✨ Transform Internship Notes to Bullets</span>
                  </button>
                </div>
              ))}

              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: InternshipItem = {
                    id: String(Date.now()),
                    company: "",
                    role: "",
                    duration: "",
                    responsibilities: "",
                    technologies: "",
                    achievements: "",
                    bullets: [],
                  };
                  onChange({ ...data, internships: [...data.internships, newItem] });
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-all"
              >
                + Add Another Internship
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 7: PROJECTS */}
      {currentStep === 7 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Highlight your software projects, repositories, and technical builds.
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_projects: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_projects
                  ? "bg-violet-600 text-white border-violet-600 shadow-md"
                  : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE PROJECTS)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_projects: false, projects: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_projects
                  ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20"
                  : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_projects && (
            <div className="space-y-4">
              {data.projects.map((proj, index) => (
                <div key={proj.id || index} className="p-4 rounded-2xl glass-card border border-white/40 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      Project #{index + 1}
                    </span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const next = data.projects.filter((_, i) => i !== index);
                        onChange({ ...data, projects: next });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Project Name *</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const list = [...data.projects];
                          list[index].name = e.target.value;
                          onChange({ ...data, projects: list });
                        }}
                        placeholder="e.g. AI CCTV Monitor"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Technologies Used</label>
                      <input
                        type="text"
                        value={proj.technologies}
                        onChange={(e) => {
                          const list = [...data.projects];
                          list[index].technologies = e.target.value;
                          onChange({ ...data, projects: list });
                        }}
                        placeholder="e.g. Python, YOLOv8, FastAPI, React"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={proj.github_url}
                        onChange={(e) => {
                          const list = [...data.projects];
                          list[index].github_url = e.target.value;
                          onChange({ ...data, projects: list });
                        }}
                        placeholder="https://github.com/user/project"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={proj.live_url}
                        onChange={(e) => {
                          const list = [...data.projects];
                          list[index].live_url = e.target.value;
                          onChange({ ...data, projects: list });
                        }}
                        placeholder="https://myproject.com"
                        className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      What problem does it solve &amp; what did you build?
                    </label>
                    <textarea
                      value={proj.what_built}
                      onChange={(e) => {
                        const list = [...data.projects];
                        list[index].what_built = e.target.value;
                        onChange({ ...data, projects: list });
                      }}
                      rows={3}
                      placeholder="e.g. Developed a real-time computer vision detection app using YOLOv8, serving predictions via FastAPI."
                      className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={async () => {
                      if (!proj.what_built) return;
                      setLoadingAi(true);
                      try {
                        const bullets = await transformBulletsApi({
                          raw_input: proj.what_built,
                          role_title: proj.name || "Project",
                          section_type: "Technical Project",
                          target_role: data.career_goal.target_role,
                        });
                        const list = [...data.projects];
                        list[index].bullets = bullets;
                        onChange({ ...data, projects: list });
                      } catch (err: any) {
                        setAiError(err.message);
                      } finally {
                        setLoadingAi(false);
                      }
                    }}
                    disabled={loadingAi || !proj.what_built}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition-all disabled:opacity-50"
                  >
                    <Wand2 size={14} />
                    <span>✨ Transform to Project Bullets with AI</span>
                  </button>

                  {proj.bullets && proj.bullets.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">PROJECT BULLETS</span>
                      {proj.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start justify-between gap-2 text-xs text-gray-800 dark:text-gray-200">
                          <p>• {b}</p>
                          <button
                            suppressHydrationWarning
                            onClick={() => onOpenAiImprove("Project Bullet", b)}
                            className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0"
                          >
                            ✨ Improve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: ProjectItem = {
                    id: String(Date.now()),
                    name: "",
                    problem_solved: "",
                    what_built: "",
                    role: "",
                    technologies: "",
                    github_url: "",
                    live_url: "",
                    start_date: "",
                    end_date: "",
                    contributions: "",
                    bullets: [],
                  };
                  onChange({ ...data, projects: [...data.projects, newItem] });
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-all"
              >
                + Add Another Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 8: SKILLS */}
      {currentStep === 8 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Technical &amp; Soft Skills</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              List the tools, languages, and frameworks you know.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Enter your skills (comma separated)
              </label>
              <textarea
                value={data.raw_skills_input}
                onChange={(e) => onChange({ ...data, raw_skills_input: e.target.value })}
                rows={3}
                placeholder="Python, React, FastAPI, PostgreSQL, SQL, Git, Docker, Data Structures, Leadership"
                className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <button
              suppressHydrationWarning
              onClick={handleOrganizeSkills}
              disabled={loadingAi || !data.raw_skills_input.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles size={16} />
              <span>{loadingAi ? "Organizing Skills..." : "✨ Organize Skills into Categories with Gemini"}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl glass-card border border-white/40 dark:border-white/10">
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1">
                  Languages
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {data.skills.languages?.length > 0 ? data.skills.languages.join(", ") : "None listed"}
                </p>
              </div>

              <div className="p-3 rounded-xl glass-card border border-white/40 dark:border-white/10">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Frameworks &amp; Libraries
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {data.skills.frameworks?.length > 0 ? data.skills.frameworks.join(", ") : "None listed"}
                </p>
              </div>

              <div className="p-3 rounded-xl glass-card border border-white/40 dark:border-white/10">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
                  Databases
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {data.skills.databases?.length > 0 ? data.skills.databases.join(", ") : "None listed"}
                </p>
              </div>

              <div className="p-3 rounded-xl glass-card border border-white/40 dark:border-white/10">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                  Tools &amp; Cloud
                </span>
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  {data.skills.cloud_tools?.length > 0 ? data.skills.cloud_tools.join(", ") : "None listed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 9: CERTIFICATIONS */}
      {currentStep === 9 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certifications</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Do you have professional certifications (e.g. AWS, Coursera, Meta)?
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_certifications: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_certifications ? "bg-violet-600 text-white border-violet-600" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE CERTIFICATIONS)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_certifications: false, certifications: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_certifications ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_certifications && (
            <div className="space-y-3">
              {data.certifications.map((cert, index) => (
                <div key={cert.id || index} className="p-3.5 rounded-xl glass-card border border-white/40 dark:border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Certification #{index + 1}</span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const list = data.certifications.filter((_, i) => i !== index);
                        onChange({ ...data, certifications: list });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const list = [...data.certifications];
                        list[index].name = e.target.value;
                        onChange({ ...data, certifications: list });
                      }}
                      placeholder="Certification Name (e.g. AWS Cloud Practitioner)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const list = [...data.certifications];
                        list[index].issuer = e.target.value;
                        onChange({ ...data, certifications: list });
                      }}
                      placeholder="Issuing Organization (e.g. Amazon Web Services)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={cert.issue_date}
                      onChange={(e) => {
                        const list = [...data.certifications];
                        list[index].issue_date = e.target.value;
                        onChange({ ...data, certifications: list });
                      }}
                      placeholder="Issue Date (e.g. 2024)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={cert.credential_url}
                      onChange={(e) => {
                        const list = [...data.certifications];
                        list[index].credential_url = e.target.value;
                        onChange({ ...data, certifications: list });
                      }}
                      placeholder="Credential URL (Optional)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: CertificationItem = {
                    id: String(Date.now()),
                    name: "",
                    issuer: "",
                    issue_date: "",
                    credential_id: "",
                    credential_url: "",
                  };
                  onChange({ ...data, certifications: [...data.certifications, newItem] });
                }}
                className="w-full py-2 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              >
                + Add Certification
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 10: ACHIEVEMENTS */}
      {currentStep === 10 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements &amp; Honors</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Highlight awards, hackathon wins, scholarships, or publications.
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_achievements: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_achievements ? "bg-violet-600 text-white border-violet-600" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE ACHIEVEMENTS)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_achievements: false, achievements: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_achievements ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_achievements && (
            <div className="space-y-3">
              {data.achievements.map((ach, index) => (
                <div key={ach.id || index} className="p-3.5 rounded-xl glass-card border border-white/40 dark:border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Achievement #{index + 1}</span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const list = data.achievements.filter((_, i) => i !== index);
                        onChange({ ...data, achievements: list });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => {
                        const list = [...data.achievements];
                        list[index].title = e.target.value;
                        onChange({ ...data, achievements: list });
                      }}
                      placeholder="Title (e.g. 1st Place - Smart India Hackathon)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={ach.date}
                      onChange={(e) => {
                        const list = [...data.achievements];
                        list[index].date = e.target.value;
                        onChange({ ...data, achievements: list });
                      }}
                      placeholder="Year / Date (e.g. 2024)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={ach.description}
                    onChange={(e) => {
                      const list = [...data.achievements];
                      list[index].description = e.target.value;
                      onChange({ ...data, achievements: list });
                    }}
                    placeholder="Short description / details"
                    className="w-full p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: AchievementItem = {
                    id: String(Date.now()),
                    title: "",
                    description: "",
                    date: "",
                    category: "other",
                  };
                  onChange({ ...data, achievements: [...data.achievements, newItem] });
                }}
                className="w-full py-2 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              >
                + Add Achievement
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 11: EXTRACURRICULAR ACTIVITIES */}
      {currentStep === 11 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Extracurricular Activities</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Clubs, volunteer work, coding communities, or student organizations.
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_extracurriculars: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_extracurriculars ? "bg-violet-600 text-white border-violet-600" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE ACTIVITIES)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_extracurriculars: false, extracurriculars: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_extracurriculars ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_extracurriculars && (
            <div className="space-y-3">
              {data.extracurriculars.map((extra, index) => (
                <div key={extra.id || index} className="p-3.5 rounded-xl glass-card border border-white/40 dark:border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Activity #{index + 1}</span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const list = data.extracurriculars.filter((_, i) => i !== index);
                        onChange({ ...data, extracurriculars: list });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={extra.organization}
                      onChange={(e) => {
                        const list = [...data.extracurriculars];
                        list[index].organization = e.target.value;
                        onChange({ ...data, extracurriculars: list });
                      }}
                      placeholder="Organization / Club (e.g. Developer Student Club)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={extra.role}
                      onChange={(e) => {
                        const list = [...data.extracurriculars];
                        list[index].role = e.target.value;
                        onChange({ ...data, extracurriculars: list });
                      }}
                      placeholder="Your Role / Contribution"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    value={extra.description}
                    onChange={(e) => {
                      const list = [...data.extracurriculars];
                      list[index].description = e.target.value;
                      onChange({ ...data, extracurriculars: list });
                    }}
                    rows={2}
                    placeholder="Brief description of what you did"
                    className="w-full p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: ExtracurricularItem = {
                    id: String(Date.now()),
                    organization: "",
                    role: "",
                    description: "",
                  };
                  onChange({ ...data, extracurriculars: [...data.extracurriculars, newItem] });
                }}
                className="w-full py-2 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              >
                + Add Activity
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 12: LEADERSHIP */}
      {currentStep === 12 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leadership Roles</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Positions of responsibility, event management, or team leadership.
            </p>
          </div>

          <div className="flex gap-3 mb-2">
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_leadership: true })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                data.has_leadership ? "bg-violet-600 text-white border-violet-600" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              YES (I HAVE LEADERSHIP ROLES)
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onChange({ ...data, has_leadership: false, leadership: [] })}
              className={clsx(
                "flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all",
                !data.has_leadership ? "bg-gray-800 text-white border-gray-800 dark:bg-white/20" : "glass-pill text-gray-700 dark:text-gray-300"
              )}
            >
              NO (SKIP)
            </button>
          </div>

          {data.has_leadership && (
            <div className="space-y-3">
              {data.leadership.map((lead, index) => (
                <div key={lead.id || index} className="p-3.5 rounded-xl glass-card border border-white/40 dark:border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Leadership #{index + 1}</span>
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        const list = data.leadership.filter((_, i) => i !== index);
                        onChange({ ...data, leadership: list });
                      }}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={lead.position}
                      onChange={(e) => {
                        const list = [...data.leadership];
                        list[index].position = e.target.value;
                        onChange({ ...data, leadership: list });
                      }}
                      placeholder="Position Title (e.g. Lead Coordinator)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={lead.organization}
                      onChange={(e) => {
                        const list = [...data.leadership];
                        list[index].organization = e.target.value;
                        onChange({ ...data, leadership: list });
                      }}
                      placeholder="Organization (e.g. Tech Fest 2024)"
                      className="p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={lead.duration}
                    onChange={(e) => {
                      const list = [...data.leadership];
                      list[index].duration = e.target.value;
                      onChange({ ...data, leadership: list });
                    }}
                    placeholder="Duration (e.g. 2023 – 2024)"
                    className="w-full p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={lead.description}
                    onChange={(e) => {
                      const list = [...data.leadership];
                      list[index].description = e.target.value;
                      onChange({ ...data, leadership: list });
                    }}
                    rows={2}
                    placeholder="Responsibilities & accomplishments"
                    className="w-full p-2 rounded-lg glass-input text-xs text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <button
                suppressHydrationWarning
                onClick={() => {
                  const newItem: LeadershipItem = {
                    id: String(Date.now()),
                    organization: "",
                    position: "",
                    duration: "",
                    description: "",
                  };
                  onChange({ ...data, leadership: [...data.leadership, newItem] });
                }}
                className="w-full py-2 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              >
                + Add Leadership Role
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 13: LANGUAGES */}
      {currentStep === 13 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Languages</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Languages you speak fluently or professionally.
            </p>
          </div>

          <div className="space-y-3">
            {data.languages.map((lang, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => {
                    const list = [...data.languages];
                    list[index].language = e.target.value;
                    onChange({ ...data, languages: list });
                  }}
                  placeholder="Language (e.g. English)"
                  className="flex-1 p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => {
                    const list = [...data.languages];
                    list[index].proficiency = e.target.value;
                    onChange({ ...data, languages: list });
                  }}
                  className="w-40 p-2.5 rounded-xl glass-input text-xs text-gray-900 dark:text-white"
                >
                  <option value="Native">Native</option>
                  <option value="Professional">Professional</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    const list = data.languages.filter((_, i) => i !== index);
                    onChange({ ...data, languages: list });
                  }}
                  className="text-rose-500 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              suppressHydrationWarning
              onClick={() => {
                const newItem: LanguageItem = { language: "", proficiency: "Professional" };
                onChange({ ...data, languages: [...data.languages, newItem] });
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/40 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
            >
              + Add Language
            </button>
          </div>
        </div>
      )}

      {/* STEP 14: HOBBIES & INTERESTS */}
      {currentStep === 14 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hobbies &amp; Interests</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Would you like to include your interests or hobbies?
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Enter your hobbies (comma separated)
            </label>
            <input
              type="text"
              value={Array.isArray(data.interests) ? data.interests.join(", ") : data.interests || ""}
              onChange={(e) => {
                const val = e.target.value;
                const items = val.split(",").map((s) => s.trim());
                onChange({ ...data, interests: items });
              }}
              placeholder="e.g. Photography, Competitive Coding, Open Source, Gaming"
              className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* STEP 15: ADDITIONAL INFORMATION */}
      {currentStep === 15 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Is there anything else you&apos;d like recruiters to know about you?
            </p>
          </div>

          <div>
            <textarea
              value={data.additional_info}
              onChange={(e) => onChange({ ...data, additional_info: e.target.value })}
              rows={5}
              placeholder="Any custom notes, security clearance, availability to join, relocate, etc."
              className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* STEP 16: TARGET JOB MODE */}
      {currentStep === 16 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Target Job Mode (Optional)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste a target job description so Gemini can analyze keyword coverage for your resume without fabricating facts.
            </p>
          </div>

          <div>
            <textarea
              value={data.target_job.job_description}
              onChange={(e) =>
                onChange({
                  ...data,
                  target_job: {
                    ...data.target_job,
                    has_target_job: Boolean(e.target.value),
                    job_description: e.target.value,
                  },
                })
              }
              rows={6}
              placeholder="Paste Job Description here..."
              className="w-full p-2.5 rounded-xl glass-input text-sm text-gray-900 dark:text-white placeholder-gray-400 font-mono"
            />
          </div>
        </div>
      )}

      {/* STEP 17: REVIEW & FINALIZE */}
      {currentStep === 17 && (
        <div className="space-y-4 text-center py-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your Resume is Ready!</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Resumora has structured and formatted your resume into a high-impact, ATS-friendly document.
          </p>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
        <button
          suppressHydrationWarning
          onClick={() => setStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all disabled:opacity-30"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
            <button
              suppressHydrationWarning
              onClick={() => setStep(currentStep + 1)}
              className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip
            </button>
          )}

          <button
            suppressHydrationWarning
            onClick={() => setStep(Math.min(TOTAL_STEPS - 1, currentStep + 1))}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md active:scale-95 transition-all"
          >
            <span>{currentStep === TOTAL_STEPS - 1 ? "Finish Resume" : "Continue"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
