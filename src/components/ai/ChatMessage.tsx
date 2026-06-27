import { useState } from "react";
import { Bookmark, BookmarkCheck, Sparkles, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types";
import { cn, relativeTime } from "@/lib/utils";
import { pickAvatarGradient } from "@/config/theme";
import { useUserStore } from "@/store/userStore";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  streamingContent?: string;
  onHighlight?: (id: string) => void;
}

export function ChatMessage({ message, isStreaming, streamingContent, onHighlight }: ChatMessageProps) {
  const isUser = message.role === "user";
  const user = useUserStore((s) => s.user);
  const [justHighlighted, setJustHighlighted] = useState(false);

  const content = isStreaming ? streamingContent ?? "" : message.content;

  return (
    <div className={cn("flex gap-3 group", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-soft",
          isUser ? "rounded-lg" : "rounded-lg bg-gradient-hero"
        )}
        style={isUser && user ? { background: pickAvatarGradient(user.id) } : undefined}
      >
        {isUser ? (
          user?.nickname?.slice(0, 1) ?? <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      <div className={cn("flex flex-col max-w-[80%] sm:max-w-[70%]", isUser && "items-end")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-ink-600 dark:text-ink-300">
            {isUser ? user?.nickname ?? "我" : "优伴 AI"}
          </span>
          <span className="text-[10px] text-ink-400">
            {relativeTime(new Date(message.createdAt))}
          </span>
        </div>
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary-600 text-white rounded-tr-md"
              : "bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 border border-ink-100 dark:border-ink-800 rounded-tl-md"
          )}
        >
          {content || (isStreaming && <span className="opacity-0">.</span>)}
          {isStreaming && !content && (
            <span className="inline-flex gap-1 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-bounce" />
            </span>
          )}
          {!isUser && !isStreaming && (
            <button
              onClick={() => {
                onHighlight?.(message.id);
                setJustHighlighted(true);
                setTimeout(() => setJustHighlighted(false), 1200);
              }}
              className={cn(
                "absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 shadow-soft flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                (message.highlighted || justHighlighted) && "opacity-100 text-amber-600"
              )}
              title={message.highlighted ? "取消标记" : "标记为重点"}
            >
              {message.highlighted ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5 text-ink-400" />
              )}
            </button>
          )}
        </div>
        {message.highlighted && !isStreaming && (
          <span className="mt-1.5 text-[10px] text-amber-600 inline-flex items-center gap-1">
            <BookmarkCheck className="h-3 w-3" /> 已标记重点
          </span>
        )}
      </div>
    </div>
  );
}
