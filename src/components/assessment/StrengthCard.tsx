import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import type { Strength } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DIMENSION_LABELS, DIMENSION_COLORS, cn } from "@/lib/utils";

interface StrengthCardProps {
  strength: Strength;
  rank: number;
  defaultOpen?: boolean;
}

export function StrengthCard({ strength, rank, defaultOpen }: StrengthCardProps) {
  const [open, setOpen] = useState(defaultOpen ?? rank <= 2);

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-bold text-white text-sm shadow-soft"
          style={{ background: DIMENSION_COLORS[strength.category] }}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100">
              {strength.name}
            </h4>
            <Badge color="gray">{DIMENSION_LABELS[strength.category]}</Badge>
          </div>
          <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">{strength.definition}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-display text-sm font-semibold"
            style={{ color: DIMENSION_COLORS[strength.category] }}
          >
            {strength.score}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ink-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-ink-100 dark:border-ink-800 pt-3">
          <div>
            <div className="text-[11px] font-medium text-ink-500 mb-1.5">行为表现</div>
            <ul className="space-y-1">
              {strength.behaviors.map((b, i) => (
                <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-medium text-ink-500 mb-1.5">典型场景</div>
            <div className="flex flex-wrap gap-1.5">
              {strength.scenarios.map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-500">
                强化建议
              </span>
            </div>
            <ul className="space-y-1">
              {strength.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-ink-700 dark:text-ink-200 flex items-start gap-2">
                  <span className="text-amber-600 mt-1">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
