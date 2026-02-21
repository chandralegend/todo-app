"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  value?: string;
  onRemove?: () => void;
  active?: boolean;
  className?: string;
}

export function FilterChip({
  label,
  value,
  onRemove,
  active = false,
  className,
}: FilterChipProps) {
  return (
    <span
      className={cn(
        "filter-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground",
        className
      )}
    >
      {value ? (
        <>
          <span className={active ? "text-background/60" : "text-muted-foreground"}>{label}</span>
          <span>{value}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            "ml-0.5 rounded-full p-0.5 transition-colors cursor-pointer",
            active ? "hover:bg-background/20" : "hover:bg-muted"
          )}
          aria-label={`Remove ${label} filter`}
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

interface FilterChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterChipGroup({ children, className }: FilterChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}
