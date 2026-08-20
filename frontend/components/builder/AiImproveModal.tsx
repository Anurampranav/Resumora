"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { AiImproveResult } from "../../types/builder";
import { improveTextApi } from "../../lib/builderApi";

interface AiImproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  targetRole: string;
  originalText: string;
  context?: string;
  onAccept: (newText: string) => void;
}

export default function AiImproveModal({
  isOpen,
  onClose,
  sectionType,
  targetRole,
  originalText,
  context = "",
  onAccept,
}: AiImproveModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiImproveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && originalText) {
      handleFetchImprovement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, originalText]);

  const handleFetchImprovement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await improveTextApi({
        current_text: originalText,
        section_type: sectionType,
        target_role: targetRole,
        context,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to get AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-6 rounded-2xl glass-panel bg-white/90 dark:bg-[#0c0d1e]/90 border border-violet-500/30 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 text-white bg-gradient-to-tr from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                ✨ Resumora AI Enhancement
              </h3>
              <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                Target Role: {targetRole || "General"} • {sectionType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Analyzing & Refining with Gemini AI...
            </p>
            <p className="text-xs text-gray-400">
              Enhancing phrasing without fabricating facts or metrics.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Comparison */}
        {!loading && result && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* CURRENT (Original) */}
            <div className="p-3.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <span className="text-[11px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                CURRENT VERSION
              </span>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                {result.original || originalText}
              </p>
            </div>

            {/* WHY IMPROVE */}
            <div className="p-3.5 rounded-xl bg-violet-500/10 dark:bg-violet-900/20 border border-violet-500/30 text-xs text-violet-800 dark:text-violet-300 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-violet-600 dark:text-violet-400">
                WHY IMPROVE (AI EXPLANATION)
              </span>
              <p className="leading-relaxed">{result.why_improve}</p>
            </div>

            {/* SUGGESTED */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                SUGGESTED VERSION
              </span>
              <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed">
                {result.suggested}
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        {!loading && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={handleFetchImprovement}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <RefreshCw size={14} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  if (result?.suggested) {
                    onAccept(result.suggested);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Check size={14} />
                <span>Accept Improvement</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
