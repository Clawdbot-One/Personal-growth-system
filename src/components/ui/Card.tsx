import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ hover, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-card",
        hover && "transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5",
        padded && "p-5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function SectionTitle({ title, subtitle, action, icon }: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="shrink-0 text-primary-600">{icon}</span>}
        <div className="min-w-0">
          <h3 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
