"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export interface CategoryScore {
  label: string;
  value: number; // as % of max, 0-100
  raw: string; // e.g. "18/20"
  color: string;
}

const DEFAULT_CATEGORIES: CategoryScore[] = [
  { label: "Formatting", value: 0, raw: "0/20", color: "#6C63FF" },
  { label: "Skills", value: 0, raw: "0/20", color: "#3b82f6" },
  { label: "Experience", value: 0, raw: "0/15", color: "#06b6d4" },
  { label: "Projects", value: 0, raw: "0/15", color: "#f59e0b" },
  { label: "Education", value: 0, raw: "0/5", color: "#ec4899" },
  { label: "Readability", value: 0, raw: "0/10", color: "#10b981" },
  { label: "Grammar", value: 0, raw: "0/10", color: "#ef4444" },
  { label: "Achievements", value: 0, raw: "0/5", color: "#8b5cf6" },
];

export default function ScoreBreakdownRadar({ categories = DEFAULT_CATEGORIES }: { categories?: CategoryScore[] }) {
  const chartData = categories.map((c) => ({ label: c.label, value: c.value }));

  return (
    <div className="glass-panel p-6 rounded-[24px] flex flex-col">
      <h3 className="font-headline-md text-[18px] font-bold text-on-surface mb-6">Score Breakdown</h3>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-48 h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="80%">
              <PolarGrid stroke="#e4e1ee" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 0 }} />
              <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.35} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full grid grid-cols-2 gap-x-2 gap-y-3 text-[12px]">
          {categories.map((c) => (
            <div key={c.label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-on-surface-variant">{c.label}</span>
              </div>
              <span className="font-bold text-on-surface">{c.raw}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
