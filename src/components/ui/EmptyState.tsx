import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-xl opacity-60" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-cool flex items-center justify-center text-primary-600 dark:text-primary-400">
          {icon ?? <Sparkles className="h-7 w-7" />}
        </div>
      </div>
      <h3 className="font-serif-cn text-base font-semibold text-ink-700 dark:text-ink-200 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
