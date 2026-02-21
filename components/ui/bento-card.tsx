import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show hover scale effect */
  interactive?: boolean;
  /** Add a colored left accent bar */
  accent?: "coral" | "destructive" | "success" | "none";
}

export function BentoCard({
  className,
  interactive = true,
  accent = "none",
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 ring-1 ring-border/50",
        interactive && "bento-card cursor-pointer",
        accent === "coral" && "border-l-3 border-l-primary",
        accent === "destructive" && "border-l-3 border-l-destructive",
        accent === "success" && "border-l-3 border-l-status-completed",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoGrid({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
