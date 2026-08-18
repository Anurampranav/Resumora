"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import OverallAtsCard from "@/components/OverallAtsCard";
import JobMatchScoreCard from "@/components/JobMatchScoreCard";
import MissingSkillsCard from "@/components/MissingSkillsCard";
import ResumesAnalyzedCard from "@/components/ResumesAnalyzedCard";
import ResumeImprovement from "@/components/ResumeImprovement";
import SkillGapAnalysis from "@/components/SkillGapAnalysis";
import TopJobMatches from "@/components/TopJobMatches";
import JobDescriptionAnalyzer from "@/components/JobDescriptionAnalyzer";
import AiSuggestionCard from "@/components/AiSuggestionCard";
import RecentAnalyses from "@/components/RecentAnalyses";
import BottomPromoBanner from "@/components/BottomPromoBanner";
import { api, DashboardSummary, ResumeListItem } from "@/lib/api";

const EMPTY_SUMMARY: DashboardSummary = {
  overall_ats_score: 35,
  resume_match_percent: null,
  target_role_name: null,
  has_target_job: false,
  missing_skills_count: 0,
  critical_missing_count: 0,
  resumes_analyzed_this_month: 3,
  latest_resume_id: null,
  latest_breakdown: null,
  latest_ai_summary: null,
  skill_gap: null,
  top_job_matches: [],
  version_comparison: null,
};

export default function DashboardPage() {
  const { user } = useUser();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [backendReachable, setBackendReachable] = useState(true);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Dynamic user display name
  const displayName =
    user?.fullName ||
    user?.firstName ||
    (user?.primaryEmailAddress?.emailAddress ? user.primaryEmailAddress.emailAddress.split("@")[0] : "") ||
    "Anuram Pranav";

  async function loadData() {
    try {
      const [summaryData, resumeData] = await Promise.all([
        api.getDashboardSummary(),
        api.listResumes(),
      ]);
      setSummary(summaryData);
      setResumes(resumeData);
      setBackendReachable(true);
      setErrorDetail(null);
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
    <div className="min-h-screen bg-[#070814] text-gray-100 font-sans selection:bg-violet-500/30 selection:text-white">
      <Sidebar />
      <main className="ml-[260px] min-h-screen flex flex-col">
        <TopNav onUploadSuccess={loadData} />
        <div className="flex-1 px-8 pb-12 pt-2 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          {/* Welcome Header */}
          <section>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-2.5">
              Welcome back, <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{displayName}</span>! 👋
            </h2>
            <p className="text-xs lg:text-sm text-gray-400 font-medium">
              Let&apos;s improve your resume and land your dream job.
            </p>
            {!backendReachable && (
              <p className="mt-3 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 inline-flex items-center gap-2 flex-wrap">
                <span>
                  {errorDetail ? (
                    <>Backend status: <code>{errorDetail}</code> (using active client mode)</>
                  ) : (
                    <>Backend offline — running in Instant Client Mode. Resumes parse &amp; analyze immediately.</>
                  )}
                </span>
                <button
                  suppressHydrationWarning
                  onClick={loadData}
                  className="text-amber-400 font-bold underline hover:no-underline"
                >
                  Retry
                </button>
              </p>
            )}
          </section>

          {/* Top Summary Cards (4 Columns) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <OverallAtsCard
              score={summary.overall_ats_score}
              latestResumeId={summary.latest_resume_id}
            />
            <JobMatchScoreCard
              matchPercent={summary.resume_match_percent}
              targetRoleName={summary.target_role_name}
              hasTargetJob={summary.has_target_job}
            />
            <MissingSkillsCard
              missingCount={summary.missing_skills_count}
              criticalCount={summary.critical_missing_count}
            />
            <ResumesAnalyzedCard
              count={summary.resumes_analyzed_this_month}
            />
          </section>

          {/* Main Feature Row (3 Columns) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ResumeImprovement
              comparison={summary.version_comparison}
              resumeCount={resumes.length}
            />
            <SkillGapAnalysis skillGap={summary.skill_gap} />
            <TopJobMatches matches={summary.top_job_matches} />
          </section>

          {/* Secondary Feature Row (3 Columns) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <JobDescriptionAnalyzer latestResumeId={summary.latest_resume_id} />
            <AiSuggestionCard summary={summary.latest_ai_summary ?? undefined} />
            <RecentAnalyses resumes={resumes} onDeleted={loadData} />
          </section>

          {/* Bottom Banner */}
          <section>
            <BottomPromoBanner />
          </section>
        </div>
      </main>
    </div>
  );
}

