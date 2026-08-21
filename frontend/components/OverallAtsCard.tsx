"use client";

import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OverallAtsCardProps {
  score: number;
  latestResumeId?: string | null;
}

export default function OverallAtsCard({ score, latestResumeId }: OverallAtsCardProps) {
  const displayScore = score > 0 ? score : 35;

  const getStatusText = (val: number) => {
    if (val >= 80) return { title: "Excellent job!", desc: "Your resume is highly optimized for ATS scanners." };
    if (val >= 60) return { title: "Good progress!", desc: "Your resume is strong, but a few targeted fixes will boost matches." };
    return { title: "Keep improving!", desc: "Your resume is good, but we found areas to make it stronger." };
  };

  const status = getStatusText(displayScore);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-on-surface-variant">Overall ATS Score</h3>
        <div className="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-on-surface">
          <TrendingUp size={15} />
        </div>
      </div>

      <div className="flex items-center gap-5 my-2">
        {/* Circular Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="currentColor"
              strokeWidth="7"
              className="text-outline-variant/30"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="url(#atsGradient)"
              strokeWidth="7"
              strokeDasharray="213.6"
              strokeDashoffset={213.6 - (213.6 * displayScore) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="atsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" className="text-on-surface" />
                <stop offset="100%" stopColor="currentColor" className="text-on-surface-variant" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-on-surface leading-none">{displayScore}</span>
            <span className="text-[10px] text-on-surface-variant font-medium font-mono mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Text Details */}
        <div>
          <h4 className="text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
            {status.title}
          </h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed pr-2">
            {status.desc}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-outline-variant/30">
        <Link
          href={latestResumeId ? `/resumes/${latestResumeId}` : "/resumes"}
          className="text-xs font-semibold text-on-surface hover:text-primary flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View Full Report</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
