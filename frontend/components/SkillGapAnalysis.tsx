"use client";

import { PieChart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SkillGapAnalysis as SkillGapType } from "@/lib/api";

interface SkillGapAnalysisProps {
  skillGap: SkillGapType | null;
}

export default function SkillGapAnalysis({ skillGap }: SkillGapAnalysisProps) {
  const coverage = skillGap?.skill_coverage_percent ?? 82;
  const strongSkills = skillGap?.strong_skills?.length
    ? skillGap.strong_skills
    : ["Python", "FastAPI", "SQL", "React", "Git", "C++", "JavaScript", "HTML", "CSS", "OOP", "DSA", "REST API"];

  const missingSkills = skillGap?.missing_skills?.length
    ? skillGap.missing_skills
    : [
        { name: "Docker", category: "critical" as const },
        { name: "AWS", category: "recommended" as const },
        { name: "CI/CD", category: "optional" as const },
      ];

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Skill Gap Analysis</h3>
        </div>
        <Link
          href="/job-roles"
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Skills</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Coverage & Headline */}
      <div className="flex items-center gap-5 glass-card rounded-xl p-3.5 mb-4">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="currentColor"
              strokeWidth="5.5"
              className="text-indigo-200/50 dark:text-indigo-950/60"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#6366F1"
              strokeWidth="5.5"
              strokeDasharray="163.3"
              strokeDashoffset={163.3 - (163.3 * coverage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-gray-900 dark:text-white">{coverage}%</span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Skill Coverage</h4>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
            You have strong skills! Keep growing. 💪
          </p>
        </div>
      </div>

      {/* Strong Skills Pill Section */}
      <div className="mb-4">
        <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="text-emerald-600 dark:text-emerald-400">Strong Skills</span> ({strongSkills.length})
        </h4>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {strongSkills.map((skill) => (
            <span
              key={skill}
              className="glass-pill text-emerald-700 dark:text-emerald-400 text-[11px] font-medium px-2.5 py-0.5 rounded-md hover:bg-emerald-500/20 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills Pill Section */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="text-amber-600 dark:text-amber-400">Missing Skills</span> ({missingSkills.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {missingSkills.map((item) => {
            const isCritical = typeof item === "object" ? item.category === "critical" : true;
            const name = typeof item === "object" ? item.name : item;

            return (
              <span
                key={name}
                className={
                  isCritical
                    ? "glass-pill text-amber-700 dark:text-amber-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                    : "glass-pill text-orange-700 dark:text-orange-300 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                }
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
