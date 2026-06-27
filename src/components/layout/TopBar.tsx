import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { pickAvatarGradient } from "@/config/theme";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onOpenSidebar: () => void;
  title?: string;
}

export function TopBar({ onOpenSidebar, title }: TopBarProps) {
  const user = useUserStore((s) => s.user);
  const [showBell, setShowBell] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-b border-ink-100 dark:border-ink-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden rounded-lg p-2 text-ink-600 hover:bg-ink-100"
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="font-serif-cn text-lg font-semibold text-ink-800 dark:text-ink-100 truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-ink-50 dark:bg-ink-800 text-ink-400 text-sm hover:bg-ink-100 transition-colors"
            aria-label="搜索"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">搜索功能、目标、实践...</span>
            <kbd className="hidden md:inline ml-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-400 border border-ink-200">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setShowBell(!showBell)}
            className="relative rounded-lg p-2 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="通知"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-ink-900" />
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-ink-100 dark:border-ink-800">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-soft"
                style={{ background: pickAvatarGradient(user.id) }}
              >
                {user.nickname.slice(0, 1)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-ink-800 dark:text-ink-100 leading-tight">
                  {user.nickname}
                </div>
                <div className="text-[11px] text-ink-500 leading-tight">
                  连续成长 {user.streakDays} 天
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBell && (
        <div className="absolute right-4 top-14 w-80 rounded-xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-lift p-3 z-30">
          <div className="text-xs font-medium text-ink-500 mb-2 px-1">今日提醒</div>
          <div className="space-y-2">
            <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-3">
              <div className="text-sm font-medium text-primary-700 dark:text-primary-300">
                完成今日 3 项成长任务
              </div>
              <div className="text-xs text-ink-500 mt-0.5">包括：增长假设实验设计</div>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-500">
                周日复盘提醒
              </div>
              <div className="text-xs text-ink-500 mt-0.5">本周日 20:00 开启周复盘</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
