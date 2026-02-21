import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showArrow?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function PillButton({
  className,
  showArrow = true,
  variant = "primary",
  size = "md",
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer",
        variant === "primary" &&
          "bg-coral text-white hover:bg-coral-hover",
        variant === "secondary" &&
          "bg-secondary text-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:bg-muted",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-muted",
        size === "sm" && "px-4 py-1.5 text-xs",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3 text-base",
        className
      )}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className="size-4 pill-arrow" />}
    </button>
  );
}
