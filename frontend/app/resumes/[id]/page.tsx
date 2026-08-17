"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Wand2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import CircularScore from "@/components/CircularScore";
import ScoreBreakdownRadar, { type CategoryScore } from "@/components/ScoreBreakdownRadar";
import { api, type ResumeDetail } from "@/lib/api";

const CATEGORY_META: { key: keyof NonNullable<ResumeDetail["latest_analysis"]>["breakdown"]; label: string; max: number; color: string }[] = [
  { key: "formatting", label: "Formatting", max: 20, color: "#6366F1" },
  { key: "skills", label: "Skills", max: 20, color: "#3B82F6" },
  { key: "experience", label: "Experience", max: 15, color: "#06B6D4" },
  { key: "projects", label: "Projects", max: 15, color: "#10B981" },
  { key: "education", label: "Education", max: 5, color: "#F59E0B" },
  { key: "readability", label: "Readability", max: 10, color: "#8B5CF6" },
  { key: "grammar", label: "Grammar", max: 10, color: "#EC4899" },
  { key: "achievements", label: "Achievements", max: 5, color: "#14B8A6" },
];

export default function ResumeReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rewrites, setRewrites] = useState<Record<number, { text: string; loading: boolean }>>({});

  async function handleRewrite(index: number, original: string) {
    setRewrites((prev) => ({ ...prev, [index]: { text: "", loading: true } }));
    try {
      const result = await api.rewriteBullet(id, original);
      setRewrites((prev) => ({ ...prev, [index]: { text: result.suggested, loading: false } }));
    } catch {
      setRewrites((prev) => ({ ...prev, [index]: { text: "Couldn't generate a rewrite — try again.", loading: false } }));
    }
  }

  async function load() {
    try {
      const data = await api.getResume(id);
      setResume(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleReanalyze() {
    setBusy(true);
    try {
      await api.reanalyzeResume(id);
      await load();
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to re-analyze resume");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await api.deleteResume(id);
      router.push("/resumes");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete resume");
      setBusy(false);
    }
  }

  async function handleDownload() {
    try {
      await api.downloadResume(resume!.id, resume!.file_name);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to download resume");
    }
  }

  const a = resume?.latest_analysis;

  return (
    <>
      <Sidebar />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 px-container-padding pb-section-margin pt-4 flex flex-col gap-section-margin">
          <button suppressHydrationWarning
            onClick={() => router.push("/resumes")}
            className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-primary w-fit"
          >
            <ArrowLeft size={16} /> Back to My Resumes
          </button>

          {loading ? (
            <div className="flex justify-center py-20 text-on-surface-variant">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : error || !resume ? (
            <div className="glass-panel p-8 rounded-[24px] text-center text-on-surface-variant">
              {error ?? "Resume not found."}
            </div>
          ) : (
            <>
              {actionError && (
                <p className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                  {actionError}
                </p>
              )}
              <section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display-lg text-display-lg text-on-surface mb-1">{resume.file_name}</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    {resume.role_name ? `Analyzed against ${resume.role_name}` : "General analysis (no target role set)"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button suppressHydrationWarning
                    onClick={handleReanalyze}
                    disabled={busy}
                    className="flex items-center gap-2 bg-surface-glass/60 border border-surface-glass/60 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-on-surface hover:bg-surface-glass/90 transition-colors disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Re-analyze
                  </button>
                  <button suppressHydrationWarning
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-surface-glass/60 border border-surface-glass/60 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-on-surface hover:bg-surface-glass/90 transition-colors"
                  >
                    <Download size={16} /> Download
                  </button>
                  <button suppressHydrationWarning
                    onClick={handleDelete}
                    disabled={busy}
                    className="flex items-center gap-2 bg-surface-glass/60 border border-surface-glass/60 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-error hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </section>

              {!a ? (
                <div className="glass-panel p-8 rounded-[24px] text-center text-on-surface-variant">
                  No analysis available yet for this resume.
                </div>
              ) : (
                <>
                  {/* Hero scores */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="glass-panel p-6 rounded-[24px] flex items-center gap-6">
                      <CircularScore value={a.overall_score} color="#6C63FF" size={96} />
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">Overall ATS Score</p>
                        <p className="text-[12px] text-on-surface-variant mt-1">
                          {a.overall_score >= 80
                            ? "Strong resume — minor polish left."
                            : a.overall_score >= 60
                              ? "Solid base, room to improve."
                              : "Several gaps to close before this passes ATS filters."}
                        </p>
                      </div>
                    </div>
                    <div className="glass-panel p-6 rounded-[24px] flex items-center gap-6">
                      <CircularScore value={a.match_percentage} color="#10b981" size={96} suffix="%" />
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">Match: {a.target_role}</p>
                        <p className="text-[12px] text-on-surface-variant mt-1">
                          {a.missing_skills.length > 0
                            ? `Missing ${a.missing_skills.length} required skill${a.missing_skills.length > 1 ? "s" : ""}.`
                            : "All required skills present."}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Category breakdown */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <ScoreBreakdownRadar
                      categories={CATEGORY_META.map<CategoryScore>((c) => ({
                        label: c.label,
                        value: Math.round((a.breakdown[c.key] / c.max) * 100),
                        raw: `${a.breakdown[c.key]}/${c.max}`,
                        color: c.color,
                      }))}
                    />

                    <div className="glass-panel p-6 rounded-[24px] lg:col-span-2">
                      <h3 className="font-headline-md text-[18px] font-bold text-on-surface mb-4">
                        Section-wise Scores
                      </h3>
                      <div className="space-y-4">
                        {CATEGORY_META.map((c) => {
                          const value = a.breakdown[c.key];
                          const pct = Math.round((value / c.max) * 100);
                          return (
                            <div key={c.key}>
                              <div className="flex justify-between text-[12px] mb-1">
                                <span className="font-semibold text-on-surface">{c.label}</span>
                                <span className="text-on-surface-variant">
                                  {value}/{c.max}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-surface-glass/50 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%`, backgroundColor: c.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* Strengths / Weaknesses / Missing skills */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <div className="glass-panel p-6 rounded-[24px]">
                      <h3 className="font-headline-md text-[15px] font-bold text-on-surface mb-3 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" /> Strengths
                      </h3>
                      {a.strengths.length === 0 ? (
                        <p className="text-[13px] text-on-surface-variant">None flagged yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {a.strengths.map((s, i) => (
                            <li key={i} className="text-[13px] text-on-surface-variant capitalize">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="glass-panel p-6 rounded-[24px]">
                      <h3 className="font-headline-md text-[15px] font-bold text-on-surface mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" /> Weaknesses
                      </h3>
                      {a.weaknesses.length === 0 ? (
                        <p className="text-[13px] text-on-surface-variant">None flagged.</p>
                      ) : (
                        <ul className="space-y-2">
                          {a.weaknesses.map((s, i) => (
                            <li key={i} className="text-[13px] text-on-surface-variant capitalize">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="glass-panel p-6 rounded-[24px]">
                      <h3 className="font-headline-md text-[15px] font-bold text-on-surface mb-3">Missing Skills</h3>
                      {a.missing_skills.length === 0 ? (
                        <p className="text-[13px] text-on-surface-variant">None — full coverage.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {a.missing_skills.map((s) => (
                            <span
                              key={s}
                              className="text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full capitalize"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Weak bullet points — rewrites are generated on demand, not automatically */}
                  {a.weak_bullet_points.length > 0 && (
                    <section className="glass-panel p-6 rounded-[24px]">
                      <h3 className="font-headline-md text-[18px] font-bold text-on-surface mb-1">
                        Weak Bullet Points
                      </h3>
                      <p className="text-[12px] text-on-surface-variant mb-4">
                        Click &quot;Rewrite with AI&quot; on any bullet to generate a stronger version.
                      </p>
                      <div className="space-y-4">
                        {a.weak_bullet_points.map((b, i) => {
                          const rewrite = rewrites[i];
                          const suggestedText = rewrite?.text || b.suggested;
                          return (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                                  Original
                                </p>
                                <p className="text-[13px] text-on-surface">{b.original}</p>
                              </div>
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                                  Suggested
                                </p>
                                {rewrite?.loading ? (
                                  <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
                                    <Loader2 size={14} className="animate-spin" /> Generating…
                                  </div>
                                ) : suggestedText ? (
                                  <p className="text-[13px] text-on-surface">{suggestedText}</p>
                                ) : (
                                  <button suppressHydrationWarning
                                    onClick={() => handleRewrite(i, b.original)}
                                    className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-500 hover:text-emerald-400 w-fit"
                                  >
                                    <Wand2 size={14} /> Rewrite with AI
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Formatting issues */}
                  {a.formatting_issues.length > 0 && (
                    <section className="glass-panel p-6 rounded-[24px]">
                      <h3 className="font-headline-md text-[15px] font-bold text-on-surface mb-3">
                        Formatting Issues
                      </h3>
                      <ul className="space-y-1.5">
                        {a.formatting_issues.map((issue, i) => (
                          <li key={i} className="text-[13px] text-on-surface-variant">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* AI suggestions */}
                  <section className="glass-panel p-6 rounded-[24px] bg-gradient-to-br from-surface-glass/70 to-surface-glass/30">
                    <h3 className="font-headline-md text-[16px] font-bold text-on-surface mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" /> AI Suggestions
                    </h3>
                    <p className="text-[13px] text-on-surface-variant italic mb-4">{a.ai_summary}</p>
                    <ul className="space-y-2">
                      {a.ai_suggestions.map((s, i) => (
                        <li key={i} className="text-[13px] text-on-surface flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
