"use client";

import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ResumesAnalyzedCardProps {
  count: number;
}

export default function ResumesAnalyzedCard({ count }: ResumesAnalyzedCardProps) {
  const displayCount = count !== undefined ? count : 3;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
          <FileText size={16} className="text-cyan-500" />
          Resumes Analyzed
        </h3>
      </div>

      <div className="my-2">
        <div className="text-3xl font-extrabold text-on-surface mb-1 tracking-tight">
          {displayCount}
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {displayCount === 1
            ? "1 Resume analyzed this month."
            : `${displayCount} Resumes analyzed this month.`}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-outline-variant/30">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View All</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
