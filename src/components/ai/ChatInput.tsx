import { useState, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, disabled, streaming, onStop }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-white dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800">
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="问优伴 AI 任何成长问题... (Enter 发送, Shift+Enter 换行)"
          className={cn(
            "w-full resize-none rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 px-4 py-2.5 pr-12",
            "text-sm text-ink-800 dark:text-ink-100 placeholder:text-ink-400",
            "focus:outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-ink-900 transition-colors",
            "max-h-32 min-h-[44px]"
          )}
          style={{ height: "auto" }}
        />
      </div>
      {streaming ? (
        <button
          onClick={onStop}
          className="h-11 w-11 shrink-0 rounded-xl bg-ink-800 text-white hover:bg-ink-900 flex items-center justify-center transition-colors"
          aria-label="停止生成"
        >
          <Square className="h-4 w-4" fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className={cn(
            "h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all",
            value.trim() && !disabled
              ? "bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-lift active:scale-95"
              : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-600 cursor-not-allowed"
          )}
          aria-label="发送"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
