interface CircularScoreProps {
  value: number; // 0-100
  color: string;
  size?: number;
  suffix?: string;
}

export default function CircularScore({ value, color, size = 80, suffix = "" }: CircularScoreProps) {
  const dash = `${value}, 100`;
  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e4e1ee"
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
          fill="#1b1b24"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="8"
        >
          {value}
          {suffix}
        </text>
      </svg>
    </div>
  );
}
