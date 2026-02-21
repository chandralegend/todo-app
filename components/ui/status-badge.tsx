import { cn } from "@/lib/utils";

type TaskStatus = "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  DRAFT: {
    label: "Draft",
    bgClass: "bg-status-draft/10",
    textClass: "text-status-draft",
    dotClass: "bg-status-draft",
  },
  TODO: {
    label: "Todo",
    bgClass: "bg-status-todo/10",
    textClass: "text-status-todo",
    dotClass: "bg-status-todo",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bgClass: "bg-status-in-progress/10",
    textClass: "text-status-in-progress",
    dotClass: "bg-status-in-progress",
  },
  COMPLETED: {
    label: "Completed",
    bgClass: "bg-status-completed/10",
    textClass: "text-status-completed",
    dotClass: "bg-status-completed",
  },
  FAILED: {
    label: "Failed",
    bgClass: "bg-status-failed/10",
    textClass: "text-status-failed",
    dotClass: "bg-status-failed",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
