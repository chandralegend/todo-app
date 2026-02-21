import { cn } from "@/lib/utils";

type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface ImportanceBadgeProps {
  importance: Importance;
  className?: string;
}

const importanceConfig: Record<
  Importance,
  { label: string; bgClass: string; textClass: string }
> = {
  LOW: {
    label: "Low",
    bgClass: "bg-importance-low/10",
    textClass: "text-importance-low",
  },
  MEDIUM: {
    label: "Medium",
    bgClass: "bg-importance-medium/10",
    textClass: "text-importance-medium",
  },
  HIGH: {
    label: "High",
    bgClass: "bg-importance-high/10",
    textClass: "text-importance-high",
  },
  CRITICAL: {
    label: "Critical",
    bgClass: "bg-importance-critical/10",
    textClass: "text-importance-critical",
  },
};

export function ImportanceBadge({
  importance,
  className,
}: ImportanceBadgeProps) {
  const config = importanceConfig[importance];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
