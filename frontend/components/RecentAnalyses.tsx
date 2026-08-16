"use client";

import { useState } from "react";
import { FileText, ArrowRight, Download, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import type { ResumeListItem } from "@/lib/api";
import { api } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

  const recent = resumes.slice(0, 5);

  return (
    <div className="lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Recent Analyses</h3>
        <Link
          href="/resumes"
          className="text-primary font-label-md text-[13px] flex items-center gap-1 hover:underline"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <p className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 w-fit">
          {error}
        </p>
      )}

      {recent.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl text-center text-on-surface-variant text-sm">
          No resumes analyzed yet. Upload one to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((r) => (
            <div
              key={r.id}
              className="glass-panel p-4 rounded-xl flex items-center justify-between hover:bg-surface-glass/50 transition-colors group border border-surface-glass/60"
            >
              <div className="flex items-center gap-4 w-2/5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-body-md text-[14px] font-semibold text-on-surface truncate">{r.file_name}</p>
                  <p className="text-[12px] text-on-surface-variant truncate">{r.role_name ?? "No role set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {r.overall_score !== null && (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary font-bold text-[12px]">
                      {r.overall_score}
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">Score</p>
                  </div>
                )}
                {r.match_percentage !== null && (
                  <div className="text-center hidden sm:block">
                    <p className="font-bold text-on-surface text-[14px]">{r.match_percentage}%</p>
                    <p className="text-[10px] text-on-surface-variant">Match</p>
                  </div>
                )}
                <p className="text-[12px] text-on-surface-variant hidden sm:block">{formatDate(r.created_at)}</p>
                <button suppressHydrationWarning
                  onClick={() => handleDelete(r.id)}
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-colors shadow-sm"
                  aria-label="Delete resume"
                >
                  <Trash2 size={16} />
                </button>
                <button suppressHydrationWarning
                  onClick={() => handleDownload(r.id, r.file_name)}
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm"
                  aria-label="Download resume"
                >
                  <Download size={16} />
                </button>
                <Link
                  href={`/resumes/${r.id}`}
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm"
                  aria-label="View report"
                >
                  <Eye size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
