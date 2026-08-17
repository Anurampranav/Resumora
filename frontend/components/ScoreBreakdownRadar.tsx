"use client";

import { useState } from "react";

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

export default function ScoreBreakdownRadar({
  categories = DEFAULT_CATEGORIES,
}: {
  categories?: CategoryScore[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Calculate overall total score from raw numbers (e.g. "5/20" -> 5)
  const totalEarned = categories.reduce((sum, c) => {
    const earned = parseInt(c.raw.split("/")[0] || "0", 10);
    return sum + (isNaN(earned) ? 0 : earned);
  }, 0);

  const totalMax = categories.reduce((sum, c) => {
    const maxVal = parseInt(c.raw.split("/")[1] || "0", 10);
    return sum + (isNaN(maxVal) ? 0 : maxVal);
  }, 0) || 100;

  const overallPercent = Math.round((totalEarned / totalMax) * 100);

  // Circle geometry for segmented ring
  const size = 200;
  const center = size / 2;
  const radius = 76;
  const strokeWidth = 10;
  const hoveredStrokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const count = categories.length || 8;
  const anglePerSegment = 360 / count;
  const gapAngle = 5; // degrees gap between segments
  const usableAngle = anglePerSegment - gapAngle;
  const segmentLength = (usableAngle / 360) * circumference;

  const activeCategory = hoveredIdx !== null ? categories[hoveredIdx] : null;

  return (
    <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Score Breakdown</h3>
        <span className="text-[11px] font-semibold text-on-surface-variant/80 bg-surface-glass/40 px-2.5 py-1 rounded-full border border-surface-glass/60">
          8 Categories
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Interactive Circular Multi-Segment Chart */}
        <div className="relative w-52 h-52 flex items-center justify-center my-2 select-none">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full transform -rotate-90 filter drop-shadow-sm transition-all duration-300"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {categories.map((c, i) => {
              const startAngle = i * anglePerSegment + gapAngle / 2;
              const fillRatio = Math.max(0, Math.min(1, c.value / 100));
              const fillLength = fillRatio * segmentLength;
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={c.label}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Background segment track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-variant/30 dark:text-surface-variant/50"
                    strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={0}
                    transform={`rotate(${startAngle} ${center} ${center})`}
                    strokeLinecap="round"
                  />

                  {/* Filled score segment */}
                  {fillLength > 0 && (
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={isHovered ? hoveredStrokeWidth : strokeWidth}
                      strokeDasharray={`${fillLength} ${circumference - fillLength}`}
                      strokeDashoffset={0}
                      transform={`rotate(${startAngle} ${center} ${center})`}
                      strokeLinecap="round"
                      filter={isHovered ? "url(#glow)" : undefined}
                      className="transition-all duration-300"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Central Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeCategory ? (
              <div className="animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[120px]"
                  style={{ color: activeCategory.color }}
                >
                  {activeCategory.label}
                </span>
                <span className="text-[26px] font-black leading-tight text-on-surface">
                  {activeCategory.raw}
                </span>
                <span className="text-[11px] font-semibold text-on-surface-variant">
                  {activeCategory.value}% match
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Overall
                </span>
                <span className="text-[32px] font-black leading-none text-on-surface my-0.5">
                  {totalEarned}
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  out of {totalMax}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend Grid */}
        <div className="w-full grid grid-cols-2 gap-x-3 gap-y-2 mt-4 pt-4 border-t border-surface-glass/30 text-[12px]">
          {categories.map((c, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={c.label}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                  isHovered
                    ? "bg-surface-glass/50 shadow-sm ring-1 ring-primary/30"
                    : "hover:bg-surface-glass/20"
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: c.color,
                      transform: isHovered ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                  <span
                    className={`truncate transition-colors ${
                      isHovered ? "font-bold text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {c.label}
                  </span>
                </div>
                <span className="font-bold text-on-surface flex-shrink-0 ml-1">{c.raw}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

