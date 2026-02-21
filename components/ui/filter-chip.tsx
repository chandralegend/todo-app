"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  value?: string;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  value,
  onRemove,
  className,
}: FilterChipProps) {
  return (
    <span
      className={cn(
        "filter-chip inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground",
        className
      )}
    >
      {value ? (
        <>
          <span className="text-muted-foreground">{label}:</span>
          <span>{value}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
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
