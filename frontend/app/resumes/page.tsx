"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FileType2, Download, RefreshCw, Trash2, Loader2, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { api, type ResumeListItem } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  analyzed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  uploaded: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  parsing: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  failed: "bg-red-500/10 text-red-500 border border-red-500/20",
};

export default function MyResumesPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.listResumes();
      setResumes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handleUploaded = () => load();
    window.addEventListener("resumeUploaded", handleUploaded);
    return () => window.removeEventListener("resumeUploaded", handleUploaded);
  }, []);

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await api.deleteResume(id);
      await load();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReanalyze(id: string) {
    setBusyId(id);
    try {
      await api.reanalyzeResume(id);
      await load();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-analyze resume");
    } finally {
      setBusyId(null);
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

  return (
    <>
      <Sidebar />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav onUploadSuccess={load} />
        <div className="flex-1 px-container-padding pb-section-margin pt-4 flex flex-col gap-section-margin">
          <section>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">My Resumes</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Every resume you&apos;ve uploaded, its ATS score, and role match.
            </p>
          </section>

          {error && (
            <p className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block w-fit">
              {error}
            </p>
          )}

          <section className="glass-panel rounded-[24px] overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center text-on-surface-variant">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant text-sm">
                No resumes yet. Use &quot;Upload Resume&quot; above to analyze your first one.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-glass/40 text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <th className="px-6 py-4 font-semibold">Resume</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">ATS Score</th>
                    <th className="px-6 py-4 font-semibold">Match %</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Uploaded</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => (
                    <tr key={r.id} className="border-b border-surface-glass/30 last:border-0 hover:bg-surface-glass/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              r.file_type === "pdf" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {r.file_type === "pdf" ? <FileText size={18} /> : <FileType2 size={18} />}
                          </div>
                          <span className="text-[14px] font-semibold text-on-surface truncate">{r.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{r.role_name ?? "—"}</td>
                      <td className="px-6 py-4">
                        {r.overall_score !== null ? (
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-primary text-primary font-bold text-[12px]">
                            {r.overall_score}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant text-[13px]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-semibold text-on-surface">
                        {r.match_percentage !== null ? `${r.match_percentage}%` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                            STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/resumes/${r.id}`}
                            title="View Report"
                            className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm"
                          >
                            <Eye size={15} />
                          </Link>
                          <button suppressHydrationWarning
                            onClick={() => handleReanalyze(r.id)}
                            disabled={busyId === r.id}
                            title="Re-analyze"
                            className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm disabled:opacity-50"
                          >
                            {busyId === r.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <RefreshCw size={15} />
                            )}
                          </button>
                          <button suppressHydrationWarning
                            onClick={() => handleDownload(r.id, r.file_name)}
                            title="Download"
                            className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors shadow-sm"
                          >
                            <Download size={15} />
                          </button>
                          <button suppressHydrationWarning
                            onClick={() => handleDelete(r.id)}
                            disabled={busyId === r.id}
                            title="Delete"
                            className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
