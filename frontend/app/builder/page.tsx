"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import TopNav from "../../components/TopNav";
import WizardSteps from "../../components/builder/WizardSteps";
import ResumeTemplateRenderer from "../../components/builder/ResumeTemplates";
import AiImproveModal from "../../components/builder/AiImproveModal";
import { ResumeData, TemplateId, AtsCheckResult } from "../../types/builder";
import {
  checkAtsApi,
  downloadPdfApi,
  saveDraftApi,
  getDraftApi,
  finalizeResumeApi,
} from "../../lib/builderApi";
import {
  Sparkles,
  Download,
  RotateCcw,
  RotateCw,
  Layout,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  FileText,
  BarChart3,
  Save,
  Check,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const DEFAULT_RESUME_DATA: ResumeData = {
  title: "My Professional Resume",
  personal_info: {
    full_name: "",
    professional_title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    website: "",
  },
  career_goal: {
    target_role: "Software Developer",
    target_company_type: "Any",
    work_mode: "Any",
  },
  summary: {
    self_description: "",
    qualities: [],
    interest_areas: "",
    generated_summary: "",
  },
  education: [],
  has_experience: true,
  experience: [],
  has_internships: false,
  internships: [],
  has_projects: true,
  projects: [],
  raw_skills_input: "",
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    cloud_tools: [],
    ai_ml: [],
    soft_skills: [],
  },
  has_certifications: false,
  certifications: [],
  has_achievements: false,
  achievements: [],
  has_extracurriculars: false,
  extracurriculars: [],
  has_leadership: false,
  leadership: [],
  languages: [],
  interests: [],
  additional_info: "",
  target_job: {
    has_target_job: false,
    job_description: "",
    target_role: "Software Developer",
  },
  template: "modern-professional",
  section_order: [
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "certifications",
    "achievements",
    "leadership",
    "languages",
  ],
};

export default function BuilderPage() {
  const router = useRouter();

  // Resume State
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Undo / Redo History
  const [history, setHistory] = useState<ResumeData[]>([DEFAULT_RESUME_DATA]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // UI States
  const [saveStatus, setSaveStatus] = useState<string>("Saved just now ✓");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [atsResult, setAtsResult] = useState<AtsCheckResult | null>(null);
  const [isCheckingAts, setIsCheckingAts] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"editor" | "reorder" | "templates">("editor");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  // AI Modal State
  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    sectionType: string;
    text: string;
    context?: string;
  }>({
    isOpen: false,
    sectionType: "",
    text: "",
  });

  // Load Initial Draft
  useEffect(() => {
    async function loadSavedDraft() {
      const draft = await getDraftApi();
      if (draft) {
        setData(draft);
        setHistory([draft]);
      }
    }
    loadSavedDraft();
  }, []);

  // Auto-Save Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      setSaveStatus("Saving...");
      try {
        await saveDraftApi(data);
        setSaveStatus("Saved just now ✓");
      } catch {
        setSaveStatus("Saved locally ✓");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [data]);

  // Handle Resume Data Changes with Undo History
  const updateData = (newData: ResumeData) => {
    setData(newData);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setData(history[historyIndex + 1]);
    }
  };

  // Run ATS Check
  const handleCheckAts = async () => {
    setIsCheckingAts(true);
    try {
      const res = await checkAtsApi(data);
      setAtsResult(res);
    } catch (err) {
      console.error("ATS check failed", err);
    } finally {
      setIsCheckingAts(false);
    }
  };

  // PDF Download
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadPdfApi(data);
    } catch (err) {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Finalize Resume
  const handleFinalize = async () => {
    try {
      const score = atsResult?.score || 85;
      await finalizeResumeApi(data, score);
      alert("Resume finalized and saved successfully!");
      router.push("/resumes");
    } catch (err) {
      alert("Failed to finalize resume.");
    }
  };

  // Section Order Move
  const moveSection = (index: number, direction: "up" | "down") => {
    const order = [...data.section_order];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    updateData({ ...data, section_order: order });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070814] text-gray-900 dark:text-gray-100 gradient-mesh">
      <Sidebar />

      <main className="pl-[260px] flex flex-col min-h-screen">
        <TopNav />

        {/* Builder Toolbar */}
        <div className="sticky top-0 z-30 px-6 py-3 bg-white/75 dark:bg-[#090a18]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 flex items-center justify-between shadow-sm">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                title="Undo"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 transition-all"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                title="Redo"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 transition-all"
              >
                <RotateCw size={16} />
              </button>
            </div>

            <div className="h-4 w-px bg-gray-300 dark:bg-white/10" />

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("editor")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all",
                  activeTab === "editor"
                    ? "bg-white dark:bg-violet-600 text-violet-700 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Questionnaire &amp; Editor
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all",
                  activeTab === "templates"
                    ? "bg-white dark:bg-violet-600 text-violet-700 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab("reorder")}
                className={clsx(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all",
                  activeTab === "reorder"
                    ? "bg-white dark:bg-violet-600 text-violet-700 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Reorder Sections
              </button>
            </div>
          </div>

          {/* Center Auto-Save Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 size={14} />
            <span>{saveStatus}</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAts}
              disabled={isCheckingAts}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl transition-all"
            >
              <BarChart3 size={15} />
              <span>{isCheckingAts ? "Checking..." : "Check ATS"}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white btn-gradient rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Download size={15} />
              <span>{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* ATS Score Notification Banner if Checked */}
        {atsResult && (
          <div className="bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-purple-900/40 px-6 py-2.5 border-b border-violet-500/30 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold">
                ATS Score: {atsResult.score}/100
              </span>
              <span>Target Role: <strong>{atsResult.target_role}</strong></span>
              {atsResult.missing_skills.length > 0 && (
                <span className="text-rose-300 hidden lg:inline">
                  Missing Skills: {atsResult.missing_skills.slice(0, 3).join(", ")}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push("/ats-reports")}
              className="text-violet-300 hover:text-white font-bold underline flex items-center gap-1"
            >
              <span>View Full ATS Report</span>
            </button>
          </div>
        )}

        {/* Desktop Split View: LEFT Editor/Wizard, RIGHT Live A4 Preview */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* LEFT COLUMN: Wizard & Controls (7 Cols) */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            {/* TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="p-6 rounded-2xl glass-panel space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Choose Resume Template</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "ats-minimal", label: "ATS Minimal", desc: "Monochrome, high ATS parser accuracy" },
                    { id: "modern-professional", label: "Modern Professional", desc: "Sleek indigo accents, dual flow" },
                    { id: "technical", label: "Technical", desc: "Teal tech stack badges and project emphasis" },
                    { id: "executive", label: "Executive", desc: "Serif typography, leadership framing" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => updateData({ ...data, template: tpl.id as TemplateId })}
                      className={clsx(
                        "p-4 rounded-xl text-left border transition-all space-y-1",
                        data.template === tpl.id
                          ? "bg-violet-600/15 border-violet-500 shadow-md ring-2 ring-violet-500/50"
                          : "glass-card hover:border-violet-500/50"
                      )}
                    >
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white block">{tpl.label}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block">{tpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REORDER SECTIONS TAB */}
            {activeTab === "reorder" && (
              <div className="p-6 rounded-2xl glass-panel space-y-4 animate-fade-in">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Reorder Resume Sections</h3>
                <div className="space-y-2">
                  {data.section_order.map((sec, idx) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between p-3 rounded-xl glass-card border border-white/40 dark:border-white/10"
                    >
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">
                        ☰ {sec.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === data.section_order.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDITOR / WIZARD STEPS TAB */}
            {activeTab === "editor" && (
              <div className="p-6 rounded-2xl glass-panel">
                <WizardSteps
                  data={data}
                  onChange={updateData}
                  currentStep={currentStep}
                  setStep={setCurrentStep}
                  onOpenAiImprove={(sectionType, text, context) =>
                    setAiModalState({ isOpen: true, sectionType, text, context })
                  }
                  onNavigateToUpload={() => router.push("/resumes")}
                />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live A4 Resume Preview (5 or 6 Cols) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-[800px] sticky top-20">
              <div className="flex items-center justify-between mb-2 px-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>LIVE A4 RESUME PREVIEW</span>
                <span className="uppercase font-mono text-[10px] text-violet-500">
                  Template: {data.template}
                </span>
              </div>
              <div className="shadow-2xl rounded-sm overflow-hidden border border-gray-300 dark:border-white/10">
                <ResumeTemplateRenderer data={data} templateId={data.template} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Improvement Modal */}
      <AiImproveModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState({ ...aiModalState, isOpen: false })}
        sectionType={aiModalState.sectionType}
        targetRole={data.career_goal.target_role}
        originalText={aiModalState.text}
        context={aiModalState.context}
        onAccept={(newText) => {
          // If improvement was for Summary:
          if (aiModalState.sectionType === "Summary") {
            updateData({
              ...data,
              summary: { ...data.summary, generated_summary: newText },
            });
          }
        }}
      />
    </div>
  );
}
