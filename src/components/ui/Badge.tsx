import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Color = "primary" | "accent" | "mint" | "amber" | "gray";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
  size?: "sm" | "md";
}

const colorClasses: Record<Color, string> = {
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  accent: "bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  mint: "bg-mint-50 text-mint-600 dark:bg-mint-500/15 dark:text-mint-500",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-500",
  gray: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

export function Badge({ color = "gray", size = "sm", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClasses[color],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
