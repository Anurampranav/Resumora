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
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText size={16} className="text-cyan-500 dark:text-cyan-400" />
          Resumes Analyzed
        </h3>
      </div>

      <div className="my-2">
        <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
          {displayCount}
        </div>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
          {displayCount === 1
            ? "1 Resume analyzed this month."
            : `${displayCount} Resumes analyzed this month.`}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View All</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
