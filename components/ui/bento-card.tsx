import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
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
        "rounded-2xl border border-border bg-card p-4",
        interactive && "bento-card cursor-pointer",
        accent === "coral" && "border-l-[3px] border-l-coral",
        accent === "destructive" && "border-l-[3px] border-l-destructive",
        accent === "success" && "border-l-[3px] border-l-status-completed",
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
        "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
