"use client";

import { Sparkles, ChevronRight, Target, Heart, Key, Edit3, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface SuggestionItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  borderColor: string;
  whatIsWrong: string;
  whyItMatters: string;
  whereItOccurs: string;
  howToImprove: string;
  suggestedRewrite: string;
}

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    id: "sug-1",
    title: "Improve your summary for more impact",
    icon: Target,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    borderColor: "border-amber-500/30",
    whatIsWrong: "Summary statement uses passive phrasing without explicit engineering achievements.",
    whyItMatters: "Recruiters spend 6 seconds on initial scan. A weak summary reduces immediate callback interest.",
    whereItOccurs: "Header / Professional Summary section at the top of resume.",
    howToImprove: "Start with strong title, core technical competencies, and 1 high-impact quantitative achievement.",
    suggestedRewrite: "Full-Stack Software Engineer with 3+ years of experience building high-throughput FastAPI microservices and React web apps, delivering 30%+ latency reductions for 50k+ active users.",
  },
  {
    id: "sug-2",
    title: "Add measurable achievements to 3 bullets",
    icon: Heart,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    borderColor: "border-pink-500/30",
    whatIsWrong: "Work experience bullet points list duties ('worked on database') instead of measurable outcomes.",
    whyItMatters: "Quantifiable metrics (percentages, revenue, performance gains) prove real-world business impact.",
    whereItOccurs: "Experience section — Bullet points under recent developer roles.",
    howToImprove: "Use the Action Verb + Context + Quantified Metric structure.",
    suggestedRewrite: "Optimized PostgreSQL database queries and indexing strategies, decreasing average response latency by 42% across core API endpoints.",
  },
  {
    id: "sug-3",
    title: "Include more relevant keywords",
    icon: Key,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    borderColor: "border-purple-500/30",
    whatIsWrong: "Missing specific containerization and cloud infrastructure keywords (e.g. Docker, AWS, CI/CD).",
    whyItMatters: "ATS automated filtering discards resumes lacking key stack terms required by target job descriptions.",
    whereItOccurs: "Technical Skills matrix & project bullet points.",
    howToImprove: "Add a Dedicated 'Developer Tools & Cloud' row in your skills section with Docker, AWS, and Git.",
    suggestedRewrite: "Tools & Infrastructure: Docker, Kubernetes, AWS (S3, EC2), CI/CD (GitHub Actions), PostgreSQL, Git.",
  },
  {
    id: "sug-4",
    title: "Enhance project descriptions",
    icon: Edit3,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    borderColor: "border-emerald-500/30",
    whatIsWrong: "Project descriptions are short and miss architectural details or live demo links.",
    whyItMatters: "Detailed technical project breakdowns demonstrate practical engineering competence.",
    whereItOccurs: "Projects section.",
    howToImprove: "Specify the full tech stack, your personal role, and live repository links.",
    suggestedRewrite: "Architected real-time AI Resume Analyzer utilizing Next.js 14, FastAPI, PostgreSQL, and Gemini API with 98% ATS parsing accuracy.",
  },
];

export default function AiSuggestionCard({ summary }: { summary?: string }) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

  return (
    <div
      id="ai-suggestions-card"
      className="bg-[#121324]/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">AI Resume Suggestions</h3>
            <span className="bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
              AI
            </span>
          </div>
        </div>

        <div className="space-y-2.5 my-2">
          {DEFAULT_SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                suppressHydrationWarning
                onClick={() => setSelectedSuggestion(item)}
                className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 p-3 rounded-xl flex items-center justify-between text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <Link
          href="/resumes"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View All Suggestions</span>
          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Suggestion Detail Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121324] border border-violet-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              suppressHydrationWarning
              onClick={() => setSelectedSuggestion(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${selectedSuggestion.color}`}>
                <Sparkles size={16} />
              </div>
              <h3 className="text-base font-bold text-white pr-6">{selectedSuggestion.title}</h3>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <span className="text-rose-400 font-bold block mb-0.5 uppercase text-[10px]">What is wrong:</span>
                <p className="text-gray-200">{selectedSuggestion.whatIsWrong}</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                <span className="text-amber-400 font-bold block mb-0.5 uppercase text-[10px]">Why it matters:</span>
                <p className="text-gray-200">{selectedSuggestion.whyItMatters}</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-gray-400 font-bold block mb-0.5 uppercase text-[10px]">Where it occurs:</span>
                <p className="text-gray-300">{selectedSuggestion.whereItOccurs}</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <span className="text-emerald-400 font-bold block mb-0.5 uppercase text-[10px]">Suggested Rewrite:</span>
                <p className="text-emerald-200 font-medium italic mt-1">&quot;{selectedSuggestion.suggestedRewrite}&quot;</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                suppressHydrationWarning
                onClick={() => setSelectedSuggestion(null)}
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

