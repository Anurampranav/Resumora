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
    <div className="bg-[#121324]/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileSearch size={18} className="text-violet-400" />
          <h3 className="text-base font-bold text-white">Job Description Analyzer</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
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
              className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500/50 rounded-xl p-3 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none transition-all"
            />
            {error && <p className="text-[11px] text-rose-400">{error}</p>}
            <button
              suppressHydrationWarning
              onClick={handleAnalyze}
              disabled={loading || !jdText.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
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
          <div className="space-y-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">JOB MATCH</span>
                <div className="text-2xl font-extrabold text-emerald-400">{result.match_percentage}%</div>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setResult(null)}
                className="text-[11px] text-violet-400 hover:underline"
              >
                Analyze Another
              </button>
            </div>

            {/* Matched & Missing Skills */}
            <div className="space-y-2">
              <div>
                <span className="text-[11px] font-bold text-gray-300 block mb-1">Matched Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {result.matched_skills.map((s) => (
                    <span key={s} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={10} /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {result.missing_skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-300 block mb-1">Missing Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.missing_skills.map((s) => (
                      <span key={s} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
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
              className="w-full bg-violet-600/30 hover:bg-violet-600/40 border border-violet-500/40 text-violet-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all mt-2"
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
