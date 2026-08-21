"use client";

import { Rocket, Crown } from "lucide-react";
import Link from "next/link";

export default function BottomPromoBanner() {
  return (
    <div className="glass-card glass-card-hover border border-outline-variant/30 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group">
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center text-on-surface shrink-0 shadow-sm">
          <Rocket size={24} className="text-on-surface" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-0.5">Want to beat the competition?</h3>
          <p className="text-xs text-on-surface-variant">
            Unlock Premium and get AI-powered recommendations to land your dream job.
          </p>
        </div>
      </div>

      <Link
        href="/resumes"
        className="relative z-10 btn-gradient text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
      >
        <Crown size={15} className="text-amber-500" />
        <span>Upgrade to Premium</span>
      </Link>
    </div>
  );
}
