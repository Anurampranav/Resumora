"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Loader2,
  ShieldCheck,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import AtsReportPreviewModal from "@/components/AtsReportPreviewModal";
import { api, ResumeListItem, AtsReportDetail } from "@/lib/api";

export default function AtsReportsPage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<AtsReportDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await api.listResumes();
        setResumes(list);
      } catch (err) {
        console.error("Failed to load resumes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleOpenReport(resumeId: string) {
    setLoadingReportId(resumeId);
    try {
      const detail = await api.getAtsReportDetail(resumeId);
      setActiveReport(detail);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch ATS report detail:", err);
    } finally {
      setLoadingReportId(null);
    }
  }

  async function handleDownloadPdf(resumeId: string, fileName: string) {
    try {
      await api.downloadPdfReport(resumeId, fileName);
    } catch (err) {
      console.error("Failed to download PDF report:", err);
    }
  }

  return (
    <div className="min-h-screen text-on-surface font-sans transition-colors duration-300">
      <Sidebar />

      <main className="ml-[260px] min-h-screen flex flex-col">
        <TopNav />

        <div className="flex-1 p-6 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-on-surface flex items-center gap-3">
                <FileText className="text-on-surface" size={28} />
                ATS RESUME REPORTS
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Official AI Resume Audit Documents &amp; Vector PDF Downloads
              </p>
            </div>

            <Link
              href="/dashboard"
              className="btn-gradient text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all self-start md:self-auto"
            >
              <Plus size={16} />
              <span>Upload New Resume</span>
            </Link>
          </div>

          {/* Report List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
              <Loader2 className="animate-spin text-on-surface" size={32} />
              <p className="text-xs">Loading ATS Audit Reports...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="glass-panel border border-outline-variant/30 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center text-on-surface mx-auto">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-on-surface">No ATS reports yet.</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Analyze your resume to generate your first professional report and vector PDF download.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 btn-gradient text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                <span>Analyze Your Resume</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((r) => {
                const score = r.overall_score ?? 80;
                const isExcellent = score >= 80;
                const isGood = score >= 60;
                const dateStr = new Date(r.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={r.id}
                    className="glass-card glass-card-hover border border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl"
                  >
                    <div className="space-y-4">
                      {/* Top status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-on-surface" />
                          ATS AUDIT REPORT
                        </span>
                        <span
                          className={
                            isExcellent
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                              : isGood
                              ? "bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                              : "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                          }
                        >
                          {isExcellent ? "EXCELLENT" : isGood ? "GOOD" : "NEEDS WORK"}
                        </span>
                      </div>

                      {/* File details */}
                      <div>
                        <h3 className="text-base font-bold text-on-surface transition-colors truncate">
                          {r.file_name}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Role: <span className="text-on-surface font-semibold">{r.role_name || "General Software Engineer"}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                          Analyzed on {dateStr}
                        </p>
                      </div>

                      {/* Score display */}
                      <div className="bg-surface-variant/40 border border-outline-variant/30 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface-variant">ATS Audit Score</span>
                        <div className="text-2xl font-extrabold text-on-surface">
                          {score}
                          <span className="text-xs font-normal text-on-surface-variant font-mono"> / 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-outline-variant/30">
                      <button
                        suppressHydrationWarning
                        onClick={() => handleOpenReport(r.id)}
                        disabled={loadingReportId === r.id}
                        className="glass-card hover:bg-surface-variant/50 text-on-surface text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        {loadingReportId === r.id ? (
                          <Loader2 size={14} className="animate-spin text-on-surface" />
                        ) : (
                          <Eye size={14} className="text-on-surface" />
                        )}
                        <span>View Report</span>
                      </button>

                      <button
                        suppressHydrationWarning
                        onClick={() => handleDownloadPdf(r.id, r.file_name)}
                        className="btn-gradient text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Web Preview Modal */}
      <AtsReportPreviewModal
        report={activeReport}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
