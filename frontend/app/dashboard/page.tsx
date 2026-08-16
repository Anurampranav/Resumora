"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import AnalyticsCards from "@/components/AnalyticsCards";
import AtsScoreChart, { ScoreHistoryPoint } from "@/components/AtsScoreChart";
import ScoreBreakdownRadar from "@/components/ScoreBreakdownRadar";
import RecentAnalyses from "@/components/RecentAnalyses";
import AiSuggestionCard from "@/components/AiSuggestionCard";
import { api, DashboardSummary, ResumeListItem } from "@/lib/api";

const EMPTY_SUMMARY: DashboardSummary = {
  overall_ats_score: 0,
  resume_match_percent: 0,
  missing_skills_count: 0,
  resumes_analyzed_this_month: 0,
  latest_resume_id: null,
  latest_breakdown: null,
  latest_ai_summary: null,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [backendReachable, setBackendReachable] = useState(true);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function loadData() {
    try {
      const [summaryData, resumeData] = await Promise.all([api.getDashboardSummary(), api.listResumes()]);
      setSummary(summaryData);
      setResumes(resumeData);
      setBackendReachable(true);
      setErrorDetail(null);
      // Score-over-time isn't a dedicated endpoint yet (Phase 3) — derive a
      // minimal series from what we have so the chart isn't empty once
      // there's at least one analysis.
      if (summaryData.overall_ats_score > 0) {
        setScoreHistory([{ date: "Latest", score: summaryData.overall_ats_score }]);
      }
    } catch (err) {
      // TypeError from fetch itself means the connection never happened at
      // all (backend not running, wrong port, or blocked by CORS) — that's
      // the common case. Anything else is a real API error with a status
      // code and body, worth showing verbatim rather than guessing.
      const isNetworkFailure = err instanceof TypeError;
      const detail = err instanceof Error ? err.message : String(err);
      console.warn("Dashboard data load failed:", err);
      setBackendReachable(false);
      setErrorDetail(isNetworkFailure ? null : detail);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Sidebar />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 px-container-padding pb-section-margin pt-4 flex flex-col gap-section-margin">
          <section>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2 flex items-center gap-3">
              Welcome back, Arjun! <span className="text-3xl">👋</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Let&apos;s improve your resume and land your dream job.
            </p>
            {!backendReachable && (
              <p className="mt-3 text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-flex items-center gap-2 flex-wrap">
                <span>
                  {errorDetail ? (
                    <>
                      Backend request failed: <code>{errorDetail}</code>
                    </>
                  ) : (
                    <>
                      Backend isn&apos;t reachable at{" "}
                      {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"} — showing empty state.
                      Start it with <code>uvicorn app.main:app --reload</code>.
                    </>
                  )}
                </span>
                <button
                  suppressHydrationWarning
                  onClick={loadData}
                  className="text-amber-700 font-semibold underline hover:no-underline"
                >
                  Retry
                </button>
              </p>
            )}
          </section>

          <AnalyticsCards summary={summary} />

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <AtsScoreChart data={scoreHistory} />
            <ScoreBreakdownRadar
              categories={
                summary.latest_breakdown
                  ? [
                      { label: "Formatting", value: Math.round((summary.latest_breakdown.formatting / 20) * 100), raw: `${summary.latest_breakdown.formatting}/20`, color: "#6C63FF" },
                      { label: "Skills", value: Math.round((summary.latest_breakdown.skills / 20) * 100), raw: `${summary.latest_breakdown.skills}/20`, color: "#3b82f6" },
                      { label: "Experience", value: Math.round((summary.latest_breakdown.experience / 15) * 100), raw: `${summary.latest_breakdown.experience}/15`, color: "#06b6d4" },
                      { label: "Projects", value: Math.round((summary.latest_breakdown.projects / 15) * 100), raw: `${summary.latest_breakdown.projects}/15`, color: "#f59e0b" },
                      { label: "Education", value: Math.round((summary.latest_breakdown.education / 5) * 100), raw: `${summary.latest_breakdown.education}/5`, color: "#ec4899" },
                      { label: "Readability", value: Math.round((summary.latest_breakdown.readability / 10) * 100), raw: `${summary.latest_breakdown.readability}/10`, color: "#10b981" },
                      { label: "Grammar", value: Math.round((summary.latest_breakdown.grammar / 10) * 100), raw: `${summary.latest_breakdown.grammar}/10`, color: "#ef4444" },
                      { label: "Achievements", value: Math.round((summary.latest_breakdown.achievements / 5) * 100), raw: `${summary.latest_breakdown.achievements}/5`, color: "#8b5cf6" },
                    ]
                  : undefined
              }
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <RecentAnalyses resumes={resumes} onDeleted={loadData} />
            <AiSuggestionCard summary={summary.latest_ai_summary ?? undefined} />
          </section>
        </div>
      </main>
    </>
  );
}
