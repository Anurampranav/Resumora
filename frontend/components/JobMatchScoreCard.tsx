"use client";

import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";

interface JobMatchScoreCardProps {
  matchPercent: number | null;
  targetRoleName?: string | null;
  hasTargetJob: boolean;
}

export default function JobMatchScoreCard({
  matchPercent,
  targetRoleName,
  hasTargetJob,
}: JobMatchScoreCardProps) {
  const isConfigured = hasTargetJob && matchPercent !== null && matchPercent > 0;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Target size={16} className="text-emerald-500 dark:text-emerald-400" />
          Job Match Score
        </h3>
      </div>

      {isConfigured ? (
        <div className="flex items-center gap-5 my-2">
          {/* Circular Progress */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="7"
                className="text-emerald-200/50 dark:text-emerald-950/60"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#10B981"
                strokeWidth="7"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * matchPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{matchPercent}%</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {targetRoleName || "Target Role Match"}
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Your profile match for this specific job position.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 my-2">
          {/* Empty Circular Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                className="text-emerald-500/20"
                fill="transparent"
                strokeDasharray="4 4"
              />
            </svg>
            <span className="absolute text-gray-400 font-bold text-xs">%</span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">No target job set</h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
              Select a job role or paste a job description to see your match score.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
        <Link
          href="/job-roles"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>{isConfigured ? "Manage Target Job" : "Set Target Job"}</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
