"use client";

import { useState } from "react";
import { FileText, ArrowRight, Download, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import type { ResumeListItem } from "@/lib/api";
import { api } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " • " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function RecentAnalyses({
  resumes,
  onDeleted,
}: {
  resumes: ResumeListItem[];
  onDeleted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await api.deleteResume(id);
      onDeleted();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume");
    }
  }

  async function handleDownload(id: string, fileName: string) {
    try {
      await api.downloadResume(id, fileName);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download resume");
    }
  }

  const recent = resumes.slice(0, 4);

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Analyses</h3>
          <Link
            href="/resumes"
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {error && (
          <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {recent.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
            No resume analyzed yet. Upload one to see analysis history.
          </div>
        ) : (
          <div className="space-y-2.5 my-2">
            {recent.map((r, idx) => (
              <div
                key={r.id}
                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                        {r.file_name}
                      </p>
                      {idx === 0 && (
                        <span className="bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {r.overall_score !== null && (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-extrabold text-violet-400 leading-none">
                        {r.overall_score}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">ATS Score</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/resumes/${r.id}`}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <Eye size={15} />
                    </Link>
                    <button
                      suppressHydrationWarning
                      onClick={() => handleDownload(r.id, r.file_name)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Download File"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      suppressHydrationWarning
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View All Resumes</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

