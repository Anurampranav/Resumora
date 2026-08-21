"use client";

import { FileSearch, ArrowRight, CheckCircle2, XCircle, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { api, JobDescriptionAnalysisResult } from "@/lib/api";

interface JobDescriptionAnalyzerProps {
  latestResumeId?: string | null;
}

export default function JobDescriptionAnalyzer({ latestResumeId }: JobDescriptionAnalyzerProps) {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobDescriptionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!jdText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeJobDescription(jdText, latestResumeId ?? undefined);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze job description. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileSearch size={18} className="text-on-surface" />
          <h3 className="text-base font-bold text-on-surface">Job Description Analyzer</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          Paste a job description and see how well your resume matches.
        </p>

        {!result ? (
          <div className="space-y-3">
            <textarea
              suppressHydrationWarning
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description here..."
              rows={4}
              className="w-full glass-input rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none resize-none transition-all"
            />
            {error && <p className="text-[11px] text-rose-500">{error}</p>}
            <button
              suppressHydrationWarning
              onClick={handleAnalyze}
              disabled={loading || !jdText.trim()}
              className="w-full btn-gradient disabled:opacity-50 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Analyzing Match...</span>
                </>
              ) : (
                <>
                  <span>Analyze Job Match</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 bg-surface-variant/30 border border-outline-variant/30 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">JOB MATCH</span>
                <div className="text-2xl font-extrabold text-emerald-500">{result.match_percentage}%</div>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setResult(null)}
                className="text-[11px] text-on-surface hover:underline font-semibold"
              >
                Analyze Another
              </button>
            </div>

            {/* Matched & Missing Skills */}
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-bold text-on-surface block mb-1">Matched Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {result.matched_skills.map((s) => (
                    <span key={s} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                      <CheckCircle2 size={10} /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {result.missing_skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-on-surface block mb-1">Missing Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.missing_skills.map((s) => (
                      <span key={s} className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                        <XCircle size={10} /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              suppressHydrationWarning
              onClick={() => {
                const el = document.getElementById("ai-suggestions-card");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full glass-card hover:bg-surface-variant/50 text-on-surface text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <Sparkles size={13} />
              <span>Improve My Resume</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
