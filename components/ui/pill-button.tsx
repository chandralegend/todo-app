import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show arrow icon on the right */
  showArrow?: boolean;
  /** Visual variant */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Render as a child component (e.g. wrapping a Link) */
  asChild?: boolean;
}

export function PillButton({
  className,
  showArrow = true,
  variant = "primary",
  size = "md",
  children,
  asChild,
  ...props
}: PillButtonProps) {
  const Comp = asChild ? Button : "button";
  const compProps = asChild ? { asChild: true } : {};

  return (
    <Comp
      className={cn(
        "group inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200",
        // Variants
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-coral-hover",
        variant === "secondary" &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:bg-muted",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-muted",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2 text-sm",
        size === "lg" && "px-7 py-3 text-base",
        className
      )}
      {...compProps}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className="size-4 pill-arrow" />}
    </Comp>
  );
}
