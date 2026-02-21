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
        "inline-flex items-baseline gap-0.5 select-none shrink-0 tabular-nums",
        overdue ? "text-destructive" : "text-foreground",
        className
      )}
    >
      <span
        className={cn(
          "font-semibold leading-none",
          size === "xs" && "text-xs",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-xl"
        )}
      >
        {day}
      </span>
      <span
        className={cn(
          "uppercase font-medium leading-none",
          overdue ? "text-destructive/70" : "text-muted-foreground",
          size === "xs" && "text-[0.45rem]",
          size === "sm" && "text-[0.55rem]",
          size === "md" && "text-[0.6rem]",
          size === "lg" && "text-xs"
        )}
      >
        {month}
      </span>
    </div>
  );
}
