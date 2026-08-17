"use client";

import { Sparkles, Quote } from "lucide-react";

export default function AiSuggestionCard({ summary }: { summary?: string }) {
  const text =
    summary ||
    "Upload and analyze a resume to get a personalized AI suggestion based on your ATS score breakdown.";

  return (
    <div className="glass-panel p-6 rounded-[24px] relative overflow-hidden bg-gradient-to-br from-surface-glass/70 to-surface-glass/30 border border-surface-glass/80">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full blur-[30px]" />
      <h3 className="font-headline-md text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2 relative z-10">
        <Sparkles size={20} className="text-primary" /> AI Suggestion for You
      </h3>
      <div className="flex gap-4 relative z-10 h-full flex-col justify-between">
        <div className="bg-surface-glass/50 backdrop-blur-sm p-4 rounded-xl border border-surface-glass/60 shadow-sm relative">
          <Quote size={36} className="absolute -top-3 -left-2 text-primary/30 rotate-180" />
          <p className="text-[13px] text-on-surface-variant leading-relaxed relative z-10 indent-4 italic">
            {text}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button suppressHydrationWarning className="bg-surface-glass/70 hover:bg-surface-container-highest text-primary border border-primary/20 px-4 py-2 rounded-xl font-label-md text-[12px] flex items-center gap-2 transition-colors shadow-sm backdrop-blur-md">
            <Sparkles size={16} /> Improve with AI
          </button>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl">
            <Sparkles size={28} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
