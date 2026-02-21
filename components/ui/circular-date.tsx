import { cn } from "@/lib/utils";

interface CircularDateProps {
  date: Date;
  overdue?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function CircularDate({
  date,
  overdue = false,
  size = "md",
  className,
}: CircularDateProps) {
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];

  return (
    <div
      className={cn(
        "circular-date border-2 select-none",
        size === "xs" && "!w-7 !h-7",
        size === "sm" && "!w-10 !h-10",
        size === "md" && "!w-14 !h-14",
        size === "lg" && "!w-20 !h-20",
        overdue
          ? "border-destructive bg-destructive/5 text-destructive"
          : "border-border bg-card text-foreground",
        className
      )}
    >
      <span
        className={cn(
          "font-bold leading-none",
          size === "xs" && "text-[0.6rem]",
          size === "sm" && "text-sm",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl"
        )}
      >
        {day}
      </span>
      <span
        className={cn(
          "uppercase tracking-wider leading-none",
          overdue ? "text-destructive/70" : "text-muted-foreground",
          size === "xs" && "text-[0.35rem]",
          size === "sm" && "text-[0.45rem]",
          size === "md" && "text-[0.6rem]",
          size === "lg" && "text-xs"
        )}
      >
        {month}
      </span>
    </div>
  );
}
