"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Sparkles,
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

  async function handleDelete(resumeId: string) {
    if (!confirm("Are you sure you want to delete this resume report?")) return;
    try {
      await api.deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  }

  return (
    <div className="bg-[#070814] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav />

        <div className="flex-1 p-6 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-violet-500/20 pb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
                <FileText className="text-violet-400" size={28} />
                ATS RESUME REPORTS
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Official AI Resume Audit Documents &amp; Vector PDF Downloads
              </p>
            </div>

            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all self-start md:self-auto"
            >
              <Plus size={16} />
              <span>Upload New Resume</span>
            </Link>
          </div>

          {/* Report List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="animate-spin text-violet-400" size={32} />
              <p className="text-xs">Loading ATS Audit Reports...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-[#121324]/50 border border-violet-500/20 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-white">No ATS reports yet.</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Analyze your resume to generate your first professional report and vector PDF download.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all"
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
                    className="bg-[#121324]/80 border border-violet-500/20 hover:border-violet-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-violet-900/10"
                  >
                    <div className="space-y-4">
                      {/* Top status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-violet-400" />
                          ATS AUDIT REPORT
                        </span>
                        <span
                          className={
                            isExcellent
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                              : isGood
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                          }
                        >
                          {isExcellent ? "EXCELLENT" : isGood ? "GOOD" : "NEEDS WORK"}
                        </span>
                      </div>

                      {/* File details */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                          {r.file_name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Role: <span className="text-gray-200">{r.role_name || "General Software Engineer"}</span>
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Analyzed on {dateStr}
                        </p>
                      </div>

                      {/* Score display */}
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">ATS Audit Score</span>
                        <div className="text-2xl font-extrabold text-white">
                          {score}
                          <span className="text-xs font-normal text-gray-400 font-mono"> / 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/5">
                      <button
                        suppressHydrationWarning
                        onClick={() => handleOpenReport(r.id)}
                        disabled={loadingReportId === r.id}
                        className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        {loadingReportId === r.id ? (
                          <Loader2 size={14} className="animate-spin text-violet-400" />
                        ) : (
                          <Eye size={14} className="text-violet-400" />
                        )}
                        <span>View Report</span>
                      </button>

                      <button
                        suppressHydrationWarning
                        onClick={() => handleDownloadPdf(r.id, r.file_name)}
                        className="bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
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
