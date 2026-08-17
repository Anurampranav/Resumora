interface CircularScoreProps {
  value: number; // 0-100
  color: string;
  size?: number;
  suffix?: string;
}

export default function CircularScore({ value, color, size = 80, suffix = "" }: CircularScoreProps) {
  const dash = `${value}, 100`;
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          className="stroke-surface-variant/40 dark:stroke-surface-variant/70"
          strokeWidth="3.8"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeDasharray={dash}
        />
        <text
          x="18"
          y="20.35"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className="text-on-surface fill-current font-headline-md font-bold"
          fontSize="8"
          style={{ fill: "rgb(var(--on-surface))" }}
        >
          {value}
          {suffix}
        </text>
      </svg>
    </div>
  );
}

