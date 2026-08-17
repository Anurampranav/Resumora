"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface ScoreHistoryPoint {
  date: string; // e.g. "May 5"
  score: number;
}

export default function AtsScoreChart({ data }: { data: ScoreHistoryPoint[] }) {
  return (
    <div className="glass-panel p-6 rounded-[24px] lg:col-span-2 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-[18px] font-bold text-on-surface">ATS Score Over Time</h3>
        <button suppressHydrationWarning className="flex items-center gap-2 bg-surface-glass/50 border border-surface-glass/60 px-3 py-1.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-glass/80 transition-colors">
          Last 30 Days
        </button>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
            No analyses yet — upload a resume to start tracking your score.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="currentColor" className="text-outline-variant" opacity={0.15} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor" }} className="text-on-surface-variant" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "currentColor" }} className="text-on-surface-variant" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--surface-container-high))",
                  color: "rgb(var(--on-surface))",
                  border: "1px solid rgb(var(--surface-glass) / 0.5)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                itemStyle={{ color: "#6C63FF", fontWeight: "bold" }}
                labelStyle={{ color: "rgb(var(--on-surface-variant))" }}
              />
              <Area type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={2} fill="url(#scoreFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
