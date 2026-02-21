import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Display size */
  size?: "sm" | "md" | "lg";
  /** Show percentage label */
  showLabel?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  size = "md",
  showLabel = true,
  className,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const dimensions = {
    sm: { size: 40, stroke: 3, radius: 16, font: "text-[0.6rem]" },
    md: { size: 56, stroke: 4, radius: 22, font: "text-xs" },
    lg: { size: 72, stroke: 5, radius: 28, font: "text-sm" },
  };

  const d = dimensions[size];
  const circumference = 2 * Math.PI * d.radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = d.size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: d.size, height: d.size }}
    >
      <svg width={d.size} height={d.size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={d.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={d.stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={d.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={d.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            "absolute font-semibold text-foreground",
            d.font
          )}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
