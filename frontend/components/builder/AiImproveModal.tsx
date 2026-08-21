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
      <div className="relative w-full max-w-xl p-6 rounded-2xl glass-panel border border-outline-variant/30 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 text-on-surface bg-surface-variant/50 border border-outline-variant/30 rounded-xl shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-on-surface">
                ✨ Resumora AI Enhancement
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Target Role: {targetRole || "General"} • {sectionType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-on-surface border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-on-surface">
              Analyzing & Refining with Gemini AI...
            </p>
            <p className="text-xs text-on-surface-variant">
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
            <div className="p-3.5 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
              <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                CURRENT VERSION
              </span>
              <p className="mt-1 text-sm text-on-surface leading-relaxed font-sans">
                {result.original || originalText}
              </p>
            </div>

            {/* WHY IMPROVE */}
            <div className="p-3.5 rounded-xl bg-surface-variant/40 border border-outline-variant/30 text-xs text-on-surface space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-on-surface-variant">
                WHY IMPROVE (AI EXPLANATION)
              </span>
              <p className="leading-relaxed">{result.why_improve}</p>
            </div>

            {/* SUGGESTED */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[11px] font-bold tracking-wider text-emerald-500 uppercase">
                SUGGESTED VERSION
              </span>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-300 font-medium leading-relaxed">
                {result.suggested}
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        {!loading && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/30">
            <button
              onClick={handleFetchImprovement}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-variant/50 transition-all"
            >
              <RefreshCw size={14} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface rounded-xl transition-all"
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
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95"
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
