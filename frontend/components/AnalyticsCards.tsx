"use client";

import Link from "next/link";
import { TrendingUp, Briefcase, Zap, FileText, ArrowRight } from "lucide-react";
import CircularScore from "./CircularScore";
import type { DashboardSummary } from "@/lib/api";

export default function AnalyticsCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
      <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Overall ATS Score</h3>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CircularScore value={summary.overall_ats_score} color="#6C63FF" />
          <div>
            <p className="font-label-md text-[13px] text-on-surface mb-1">
              {summary.overall_ats_score >= 80 ? "Great Score! 🎉" : summary.overall_ats_score > 0 ? "Keep improving" : "No resumes yet"}
            </p>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              {summary.overall_ats_score > 0 ? "Your resume is strong." : "Upload a resume to get scored."}
            </p>
          </div>
        </div>
        {summary.latest_resume_id ? (
          <Link
            href={`/resumes/${summary.latest_resume_id}`}
            className="mt-4 text-primary font-label-md text-[12px] flex items-center gap-1 hover:underline"
          >
            View Full Report <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="mt-4 text-on-surface-variant/50 font-label-md text-[12px]">No report yet</span>
        )}
      </div>

      <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Resume Match</h3>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Briefcase size={18} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CircularScore value={summary.resume_match_percent ?? 0} color="#10b981" suffix="%" />
          <div>
            <p className="font-label-md text-[13px] text-on-surface mb-1">
              {(summary.resume_match_percent ?? 0) >= 70 ? "Good Match" : "Needs Work"}
            </p>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              You match {summary.resume_match_percent ?? 0}% of the skills for this role.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-[20px]" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Missing Skills</h3>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Zap size={18} />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[36px] font-extrabold text-on-surface leading-none mb-2">{summary.missing_skills_count}</p>
          <p className="text-[12px] text-on-surface-variant mb-4">Important skills are missing.</p>
        </div>
        {summary.latest_resume_id ? (
          <Link
            href={`/resumes/${summary.latest_resume_id}`}
            className="text-amber-600 font-label-md text-[12px] flex items-center gap-1 hover:underline relative z-10"
          >
            Improve Now <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="text-on-surface-variant/50 font-label-md text-[12px] relative z-10">Upload a resume</span>
        )}
      </div>

      <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-[20px]" />
        <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Resumes Analyzed</h3>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <FileText size={18} />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[36px] font-extrabold text-on-surface leading-none mb-2">{summary.resumes_analyzed_this_month}</p>
          <p className="text-[12px] text-on-surface-variant mb-4">Resumes analyzed this month.</p>
        </div>
        <Link
          href="/resumes"
          className="text-blue-600 font-label-md text-[12px] flex items-center gap-1 hover:underline relative z-10"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
