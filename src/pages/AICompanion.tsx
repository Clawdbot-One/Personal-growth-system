import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Trash2, Bookmark, X, Lightbulb } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { ChatInput } from "@/components/ai/ChatInput";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QUICK_COMMANDS } from "@/mock/chat";
import { cn } from "@/lib/utils";

export default function AICompanion() {
  const [searchParams] = useSearchParams();
  const interviewMode = searchParams.get("mode") === "interview";
  const { messages, streaming, streamingContent, loadWelcome, send, highlight, clear } = useChatStore();
  const [showHighlights, setShowHighlights] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWelcome();
  }, [loadWelcome]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingContent]);

  const highlightedMessages = messages.filter((m) => m.highlighted);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)] -mx-4 sm:-mx-6 -my-6">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-mint-500 ring-2 ring-white dark:ring-ink-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100">优伴 AI</h2>
              <Badge color="mint" size="sm">在线</Badge>
            </div>
            <p className="text-[11px] text-ink-500">
              {interviewMode ? "深度访谈模式 · 让我们慢慢聊聊你的故事" : "你的专属成长教练 · 已记住你的优势与目标"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {highlightedMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlights(true)}
              leftIcon={<Bookmark className="h-3.5 w-3.5" />}
            >
              重点 ({highlightedMessages.length})
            </Button>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("确定清空所有对话记录？")) clear();
              }}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              清空
            </Button>
          )}
        </div>
      </div>

      {/* 消息流 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100 mb-1">
                你好，我是优伴 AI
              </h3>
              <p className="text-sm text-ink-500 max-w-md mx-auto">
                我可以帮你解读优势、拆解目标、做本周复盘，或在焦虑时陪你聊聊。从下方快捷指令开始吧。
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={streaming && msg.id === messages[messages.length - 1]?.id && msg.role === "ai"}
              streamingContent={streaming && msg.id === messages[messages.length - 1]?.id ? streamingContent : undefined}
              onHighlight={highlight}
            />
          ))}

          {/* 快捷指令（仅消息少时显示） */}
          {messages.length <= 1 && !streaming && (
            <div className="pt-4">
              <div className="text-[11px] font-medium text-ink-500 mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> 快捷指令
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={() => send(cmd.prompt)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium",
                      "bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700",
                      "text-ink-700 dark:text-ink-200 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50",
                      "transition-all"
                    )}
                  >
                    {cmd.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 输入区 */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSend={send} disabled={streaming} streaming={streaming} />
      </div>

      {/* 重点回顾弹层 */}
      {showHighlights && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setShowHighlights(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-ink-900 rounded-t-2xl sm:rounded-2xl shadow-lift max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ink-100 dark:border-ink-800">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <h3 className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100">
                  重点回顾
                </h3>
                <Badge color="amber">{highlightedMessages.length}</Badge>
              </div>
              <button
                onClick={() => setShowHighlights(false)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {highlightedMessages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border-l-2 border-amber-400 bg-amber-50/50 dark:bg-amber-500/5 p-3"
                >
                  <div className="text-[10px] text-ink-500 mb-1">
                    {m.role === "ai" ? "优伴 AI" : "我"}
                  </div>
                  <p className="text-sm text-ink-700 dark:text-ink-200 whitespace-pre-wrap line-clamp-6">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
