import { cn } from "@/lib/utils";

interface CircularDateProps {
  date: Date;
  /** Whether the date is overdue */
  overdue?: boolean;
  className?: string;
}

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function CircularDate({
  date,
  overdue = false,
  className,
}: CircularDateProps) {
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];

  return (
    <div
      className={cn(
        "circular-date border-2 font-medium",
        overdue
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-foreground",
        className
      )}
    >
      <span className="text-base font-bold leading-none">{day}</span>
      <span className="text-[0.6rem] uppercase tracking-wider leading-none text-muted-foreground">
        {month}
      </span>
    </div>
  );
}
