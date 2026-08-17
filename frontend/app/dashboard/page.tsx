"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  const { user } = useUser();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>([]);
  const [backendReachable, setBackendReachable] = useState(true);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Dynamic user display name
  const displayName =
    user?.fullName ||
    user?.firstName ||
    (user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "") ||
    "there";

  async function loadData() {
    try {
      const [summaryData, resumeData] = await Promise.all([api.getDashboardSummary(), api.listResumes()]);
      setSummary(summaryData);
      setResumes(resumeData);
      setBackendReachable(true);
      setErrorDetail(null);

      // Build real score history from analyzed resumes
      const validPoints: ScoreHistoryPoint[] = resumeData
        .filter((r) => r.overall_score !== null && r.overall_score !== undefined)
        .reverse()
        .map((r, idx) => {
          const d = new Date(r.created_at);
          const dateLabel = isNaN(d.getTime())
            ? `Scan ${idx + 1}`
            : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return { date: dateLabel, score: r.overall_score as number };
        });

      if (validPoints.length > 1) {
        setScoreHistory(validPoints);
      } else if (validPoints.length === 1) {
        // Provide baseline start point so AreaChart renders a smooth continuous gradient
        const curScore = validPoints[0].score;
        setScoreHistory([
          { date: "Initial", score: Math.max(0, curScore - 15) },
          { date: validPoints[0].date, score: curScore },
        ]);
      } else if (summaryData.overall_ats_score > 0) {
        setScoreHistory([
          { date: "Initial", score: Math.max(0, summaryData.overall_ats_score - 10) },
          { date: "Latest", score: summaryData.overall_ats_score },
        ]);
      } else {
        setScoreHistory([]);
      }
    } catch (err) {
      const isNetworkFailure = err instanceof TypeError;
      const detail = err instanceof Error ? err.message : String(err);
      console.warn("Dashboard data load failed:", err);
      setBackendReachable(false);
      setErrorDetail(isNetworkFailure ? null : detail);
    }
  }

  useEffect(() => {
    loadData();
    const handleUploaded = () => loadData();
    window.addEventListener("resumeUploaded", handleUploaded);
    return () => window.removeEventListener("resumeUploaded", handleUploaded);
  }, []);

  return (
    <>
      <Sidebar />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav onUploadSuccess={loadData} />
        <div className="flex-1 px-container-padding pb-section-margin pt-4 flex flex-col gap-section-margin">
          <section>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2 flex items-center gap-3">
              Welcome back, {displayName}! <span className="text-3xl">👋</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Let&apos;s improve your resume and land your dream job.
            </p>
            {!backendReachable && (
              <p className="mt-3 text-[12px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 inline-flex items-center gap-2 flex-wrap">
                <span>
                  {errorDetail ? (
                    <>
                      Backend request status: <code>{errorDetail}</code> (using active client mode)
                    </>
                  ) : (
                    <>
                      Backend server is offline — running in Instant Client Mode. Resumes are parsed and analyzed immediately.
                    </>
                  )}
                </span>
                <button
                  suppressHydrationWarning
                  onClick={loadData}
                  className="text-amber-500 font-semibold underline hover:no-underline"
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
                      { label: "Formatting", value: Math.round((summary.latest_breakdown.formatting / 20) * 100), raw: `${summary.latest_breakdown.formatting}/20`, color: "#6366F1" },
                      { label: "Skills", value: Math.round((summary.latest_breakdown.skills / 20) * 100), raw: `${summary.latest_breakdown.skills}/20`, color: "#3B82F6" },
                      { label: "Experience", value: Math.round((summary.latest_breakdown.experience / 15) * 100), raw: `${summary.latest_breakdown.experience}/15`, color: "#06B6D4" },
                      { label: "Projects", value: Math.round((summary.latest_breakdown.projects / 15) * 100), raw: `${summary.latest_breakdown.projects}/15`, color: "#10B981" },
                      { label: "Education", value: Math.round((summary.latest_breakdown.education / 5) * 100), raw: `${summary.latest_breakdown.education}/5`, color: "#F59E0B" },
                      { label: "Readability", value: Math.round((summary.latest_breakdown.readability / 10) * 100), raw: `${summary.latest_breakdown.readability}/10`, color: "#8B5CF6" },
                      { label: "Grammar", value: Math.round((summary.latest_breakdown.grammar / 10) * 100), raw: `${summary.latest_breakdown.grammar}/10`, color: "#EC4899" },
                      { label: "Achievements", value: Math.round((summary.latest_breakdown.achievements / 5) * 100), raw: `${summary.latest_breakdown.achievements}/5`, color: "#14B8A6" },
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
