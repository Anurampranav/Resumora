"use client";

import { TrendingUp, ArrowRight, FileCheck } from "lucide-react";
import Link from "next/link";
import { VersionComparisonMetrics } from "@/lib/api";

interface ResumeImprovementProps {
  comparison: VersionComparisonMetrics | null;
  resumeCount: number;
}

export default function ResumeImprovement({ comparison, resumeCount }: ResumeImprovementProps) {
  const hasMultipleResumes = resumeCount >= 2 && comparison !== null;

  const comp = comparison || {
    oldest_resume_name: "Resume_v1.pdf",
    latest_resume_name: "Resume_v2.pdf",
    ats_score_old: 28,
    ats_score_new: 35,
    ats_score_diff: 7,
    skills_matched_old: "12/20",
    skills_matched_new: "20/20",
    skills_matched_diff: 8,
    keywords_found_old: "14/30",
    keywords_found_new: "21/30",
    keywords_found_diff: 7,
    readability_old: 62,
    readability_new: 74,
    readability_diff: 12,
    formatting_old: 68,
    formatting_new: 85,
    formatting_diff: 17,
    impact_old: 38,
    impact_new: 55,
    impact_diff: 17,
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-on-surface" />
          <h3 className="text-base font-bold text-on-surface">Resume Improvement</h3>
        </div>
        <select
          suppressHydrationWarning
          className="glass-input rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none"
        >
          <option value="all">Compare: All Resumes</option>
          <option value="latest">Latest 2 Resumes</option>
        </select>
      </div>

      {!hasMultipleResumes ? (
        <div className="my-auto py-8 text-center flex flex-col items-center justify-center bg-surface-variant/30 border border-dashed border-outline-variant/30 rounded-xl p-6">
          <div className="w-12 h-12 rounded-full bg-on-surface/10 border border-on-surface/20 flex items-center justify-center text-on-surface mb-3">
            <FileCheck size={22} />
          </div>
          <h4 className="text-sm font-semibold text-on-surface mb-1">Single Resume Analyzed</h4>
          <p className="text-xs text-on-surface-variant max-w-xs mb-4">
            Upload another resume to compare version improvements side-by-side.
          </p>
          <Link
            href="/resumes"
            className="btn-gradient text-xs font-semibold px-4 py-2 rounded-lg transition-all"
          >
            Upload Resume to Compare
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Old vs New Top Card Banner */}
          <div className="flex items-center justify-center gap-6 bg-surface-variant/30 border border-outline-variant/30 rounded-xl p-4">
            <div className="text-center">
              <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Before (Oldest)</span>
              <span className="text-2xl font-extrabold text-on-surface">{comp.ats_score_old}</span>
              <span className="text-[10px] text-on-surface-variant block font-mono">ATS Score</span>
            </div>

            <div className="text-on-surface-variant text-lg font-bold">→</div>

            <div className="text-center">
              <span className="text-[11px] font-medium text-on-surface-variant block mb-1">After (Latest)</span>
              <span className="text-2xl font-extrabold text-amber-500">{comp.ats_score_new}</span>
              <span className="text-[10px] text-on-surface-variant block font-mono">ATS Score</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-center">
              <span className="text-emerald-500 text-xs font-extrabold flex items-center justify-center gap-0.5">
                ↑ {comp.ats_score_diff}
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400/80 font-bold block uppercase tracking-wider">
                Improvement
              </span>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="space-y-3">
            {/* Skills Matched */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface w-36">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Skills Matched</span>
              </div>
              <div className="flex-1 max-w-[140px] mx-3 bg-surface-variant/50 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] w-20 text-right">
                {comp.skills_matched_old} → {comp.skills_matched_new}
              </span>
              <span className="text-emerald-500 font-bold text-[11px] w-12 text-right">
                ↑ {comp.skills_matched_diff}
              </span>
            </div>

            {/* Keywords Found */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface w-36">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Keywords Found</span>
              </div>
              <div className="flex-1 max-w-[140px] mx-3 bg-surface-variant/50 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "70%" }} />
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] w-20 text-right">
                {comp.keywords_found_old} → {comp.keywords_found_new}
              </span>
              <span className="text-emerald-500 font-bold text-[11px] w-12 text-right">
                ↑ {comp.keywords_found_diff}
              </span>
            </div>

            {/* Readability */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface w-36">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Readability</span>
              </div>
              <div className="flex-1 max-w-[140px] mx-3 bg-surface-variant/50 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${comp.readability_new}%` }} />
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] w-20 text-right">
                {comp.readability_old}% → {comp.readability_new}%
              </span>
              <span className="text-emerald-500 font-bold text-[11px] w-12 text-right">
                ↑ {comp.readability_diff}%
              </span>
            </div>

            {/* Formatted Score */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface w-36">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Formatted Score</span>
              </div>
              <div className="flex-1 max-w-[140px] mx-3 bg-surface-variant/50 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${comp.formatting_new}%` }} />
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] w-20 text-right">
                {comp.formatting_old}% → {comp.formatting_new}%
              </span>
              <span className="text-emerald-500 font-bold text-[11px] w-12 text-right">
                ↑ {comp.formatting_diff}%
              </span>
            </div>

            {/* Impact Score */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface w-36">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Impact Score</span>
              </div>
              <div className="flex-1 max-w-[140px] mx-3 bg-surface-variant/50 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${comp.impact_new}%` }} />
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] w-20 text-right">
                {comp.impact_old}% → {comp.impact_new}%
              </span>
              <span className="text-emerald-500 font-bold text-[11px] w-12 text-right">
                ↑ {comp.impact_diff}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-on-surface hover:text-on-surface-variant flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View Detailed Comparison</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
