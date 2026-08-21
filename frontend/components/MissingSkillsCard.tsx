"use client";

import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface MissingSkillsCardProps {
  missingCount: number;
  criticalCount?: number;
}

export default function MissingSkillsCard({ missingCount, criticalCount = 0 }: MissingSkillsCardProps) {
  const displayCount = missingCount !== undefined ? missingCount : 0;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          Missing Skills
        </h3>
      </div>

      <div className="my-2">
        <div className="text-3xl font-extrabold text-on-surface mb-1 tracking-tight">
          {displayCount}
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {displayCount === 0
            ? "Great! No critical skills are missing."
            : criticalCount > 0
            ? `${criticalCount} critical skill${criticalCount > 1 ? "s" : ""} missing for your role.`
            : `${displayCount} recommended skill${displayCount > 1 ? "s" : ""} can be added.`}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-outline-variant/30">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View Details</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
