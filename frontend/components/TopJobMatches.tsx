"use client";

import { Briefcase, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { TopJobMatch } from "@/lib/api";

interface TopJobMatchesProps {
  matches: TopJobMatch[];
}

export default function TopJobMatches({ matches }: TopJobMatchesProps) {
  const displayMatches = matches?.length
    ? matches
    : [
        { name: "Software Developer", slug: "software-developer", match_percentage: 91, color: "#10B981" },
        { name: "Backend Developer", slug: "backend-developer", match_percentage: 86, color: "#3B82F6" },
        { name: "Python Developer", slug: "python-developer", match_percentage: 84, color: "#8B5CF6" },
        { name: "Full Stack Developer", slug: "full-stack-developer", match_percentage: 78, color: "#EC4899" },
        { name: "Data Analyst", slug: "data-analyst", match_percentage: 67, color: "#F59E0B" },
      ];

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase size={18} className="text-cyan-600 dark:text-cyan-400" />
          Top Job Matches
        </h3>
        <Link
          href="/job-roles"
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Role List */}
      <div className="space-y-3.5 my-2">
        {displayMatches.map((role) => (
          <div key={role.slug} className="group">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {role.name}
              </span>
              <span className="font-extrabold text-gray-900 dark:text-white text-xs">{role.match_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${role.match_percentage}%`,
                  backgroundColor: role.color || "#6366F1",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
        <Link
          href="/job-roles"
          className="w-full glass-card hover:bg-violet-600/10 dark:hover:bg-violet-600/20 text-gray-800 dark:text-gray-200 hover:text-violet-700 dark:hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group"
        >
          <span>Find More Job Matches</span>
          <Sparkles size={14} className="text-violet-600 dark:text-violet-400 group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
