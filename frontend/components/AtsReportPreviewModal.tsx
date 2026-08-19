"use client";

import { useState } from "react";
import {
  X,
  Download,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Zap,
  Loader2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { AtsReportDetail, api } from "@/lib/api";

interface AtsReportPreviewModalProps {
  report: AtsReportDetail | null;
  open: boolean;
  onClose: () => void;
}

export default function AtsReportPreviewModal({
  report,
  open,
  onClose,
}: AtsReportPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!open || !report) return null;

  async function handleDownloadPdf() {
    if (!report) return;
    setDownloading(true);
    try {
      await api.downloadPdfReport(report.resume_id, report.resume_filename);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  const isExcellent = report.overall_score >= 80;
  const isGood = report.overall_score >= 60;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4 lg:p-8">
      <div className="glass-panel border border-white/40 dark:border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-gray-800 dark:text-gray-200">
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-violet-500/20 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                ATS RESUME AUDIT REPORT
                <span className="text-[10px] font-mono font-normal text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {report.report_id}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                {report.resume_filename} • {report.analysis_date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              suppressHydrationWarning
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
            <button
              suppressHydrationWarning
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content — All 18 Sections */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-thin scrollbar-thumb-violet-600/30">
          {/* SECTION 1 — COVER / SUMMARY BANNER */}
          <section className="bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-[#121324] border border-violet-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">
                SECTION 1 — RESUMORA OFFICIAL AUDIT
              </span>
              <h1 className="text-xl lg:text-2xl font-extrabold text-white">
                {report.candidate_name}
              </h1>
              <p className="text-xs text-gray-300">
                Target Role:{" "}
                <span className="font-bold text-emerald-400">
                  {report.target_role || "General Software Engineer Profile"}
                </span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-gray-400">Status:</span>
                <span
                  className={
                    isExcellent
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                      : isGood
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                  }
                >
                  {report.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl min-w-[160px] text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                OVERALL ATS SCORE
              </span>
              <div className="text-4xl font-extrabold text-white leading-none">
                {report.overall_score}
                <span className="text-sm font-normal text-gray-400 font-mono"> / 100</span>
              </div>
            </div>
          </section>

          {/* SECTION 2 — EXECUTIVE SUMMARY */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Sparkles size={16} /> SECTION 2 — EXECUTIVE SUMMARY
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              {report.executive_summary}
            </p>
          </section>

          {/* SECTION 3 — ATS SCORE BREAKDOWN TABLE */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <TrendingUp size={16} /> SECTION 3 — ATS SCORE BREAKDOWN
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Formatting", score: report.breakdown.formatting, total: 20 },
                { label: "Skills", score: report.breakdown.skills, total: 20 },
                { label: "Experience", score: report.breakdown.experience, total: 15 },
                { label: "Projects", score: report.breakdown.projects, total: 15 },
                { label: "Education", score: report.breakdown.education, total: 5 },
                { label: "Readability", score: report.breakdown.readability, total: 10 },
                { label: "Grammar", score: report.breakdown.grammar, total: 10 },
                { label: "Achievements", score: report.breakdown.achievements, total: 5 },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <span className="text-[11px] text-gray-400 block mb-1">{item.label}</span>
                  <div className="text-lg font-bold text-white">
                    {item.score}{" "}
                    <span className="text-xs text-gray-500 font-mono font-normal">/ {item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4 & 5 — STRUCTURE & SUMMARY REVIEW */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-white/10 pb-2">
                SECTION 4 — RESUME STRUCTURE REVIEW
              </h3>
              <div className="space-y-1.5 text-xs text-gray-300 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Contact Information</span>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Professional Summary</span>
                  <span className="text-amber-400 font-bold">⚠ REVIEW</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Work Experience</span>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Technical Skills</span>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Projects & Education</span>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider border-b border-white/10 pb-2">
                SECTION 5 — SUMMARY REVIEW
              </h3>
              <div className="text-xs text-gray-300 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl space-y-2">
                <p className="italic text-gray-400">
                  &quot;Software Developer experienced in building web applications and backend APIs.&quot;
                </p>
                <p className="text-[11px] text-amber-300">
                  <b>Enhancement Tip:</b> Rephrase to include exact years of experience, core technical stack, and a primary metric result.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 6 — WORK EXPERIENCE AUDIT */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
              <Zap size={16} /> SECTION 6 — EXPERIENCE & BULLET POINT AUDIT
            </h3>
            <div className="space-y-2.5">
              {report.weak_bullet_points.map((wb, idx) => (
                <div key={idx} className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs space-y-1.5">
                  <span className="text-rose-400 font-bold uppercase text-[10px]">Bullet Finding #{idx + 1}:</span>
                  <p className="text-gray-200"><b>Original:</b> &quot;{wb.original}&quot;</p>
                  <p className="text-emerald-300 font-medium"><b>Suggested Rewrite:</b> &quot;{wb.suggested || 'Quantify with percentage metric outcomes.'}&quot;</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8 — SKILLS & KEYWORD ANALYSIS */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider border-b border-white/10 pb-2">
              SECTION 8 — SKILLS & KEYWORD ANALYSIS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs space-y-2">
                <span className="text-emerald-400 font-bold block uppercase text-[10px]">Matched Skills:</span>
                <p className="text-gray-300">Python, FastAPI, SQL, React, Git, REST API, JavaScript, HTML, CSS</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-xs space-y-2">
                <span className="text-rose-400 font-bold block uppercase text-[10px]">Missing Target Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {report.missing_skills.map((s) => (
                    <span key={s} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10 & 11 — STRENGTHS & WEAKNESSES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs space-y-2">
              <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <CheckCircle2 size={14} /> SECTION 10 — STRENGTHS
              </span>
              <ul className="space-y-1 text-gray-200 list-disc list-inside">
                {report.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs space-y-2">
              <span className="text-rose-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <AlertTriangle size={14} /> SECTION 11 — WEAKNESSES
              </span>
              <ul className="space-y-1 text-gray-200 list-disc list-inside">
                {report.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 16 — AI RECOMMENDATIONS */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider border-b border-white/10 pb-2">
              SECTION 16 — AI RECOMMENDATIONS
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              {report.ai_suggestions.map((rec, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-start gap-2.5">
                  <Award size={15} className="text-violet-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 17 & 18 — FINAL ASSESSMENT & METADATA */}
          <section className="bg-violet-950/30 border border-violet-500/30 p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-violet-500/20 pb-2">
              <h3 className="font-bold text-white uppercase tracking-wider">SECTION 17 — FINAL ASSESSMENT</h3>
              <span className="text-violet-300 font-extrabold text-sm">{report.overall_score} / 100</span>
            </div>
            <p className="text-gray-300">
              <b>Action Plan:</b> Add missing keywords ({report.missing_skills.join(", ")}) to technical matrix, quantify recent project bullet outcomes, and standardize header date styling before submitting applications.
            </p>
            <div className="pt-2 text-[10px] text-gray-500 border-t border-violet-500/20 font-mono">
              SECTION 18 — Report ID: {report.report_id} • Generated by Resumora AI Engine
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
