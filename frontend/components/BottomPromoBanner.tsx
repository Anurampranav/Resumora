"use client";

import { Rocket, Crown } from "lucide-react";
import Link from "next/link";

export default function BottomPromoBanner() {
  return (
    <div className="bg-gradient-to-r from-[#161333] via-[#1a1542] to-[#12112b] border border-violet-500/30 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-400/30 flex items-center justify-center text-violet-400 shrink-0 shadow-lg">
          <Rocket size={24} className="text-violet-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-0.5">Want to beat the competition?</h3>
          <p className="text-xs text-gray-300">
            Unlock Premium and get AI-powered recommendations to land your dream job.
          </p>
        </div>
      </div>

      <Link
        href="/resumes"
        className="relative z-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 shrink-0 active:scale-95"
      >
        <Crown size={15} className="text-amber-300" />
        <span>Upgrade to Premium</span>
      </Link>
    </div>
  );
}
