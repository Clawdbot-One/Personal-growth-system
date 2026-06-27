import { NavLink, useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.path === "/") return location.pathname === "/";
    return (item.matchPrefix ?? [item.path]).some((p) => location.pathname.startsWith(p));
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0",
          "bg-white dark:bg-ink-900 border-r border-ink-100 dark:border-ink-800",
          "flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* 品牌 */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100 dark:border-ink-800">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="font-serif-cn font-semibold text-ink-800 dark:text-ink-100 leading-tight">
                优伴 AI
              </div>
              <div className="text-[10px] text-ink-500 dark:text-ink-400 leading-tight">
                发现天赋 · 精准成长
              </div>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  "transition-all duration-200",
                  active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-primary-600 text-white shadow-soft"
                      : "bg-ink-100 text-ink-500 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-ink-800 dark:text-ink-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* 底部 CTA */}
        <div className="p-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-hero p-4 text-white">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-accent-500/20" />
            <div className="relative">
              <div className="text-xs font-medium opacity-90 mb-1">升级优伴 Pro</div>
              <div className="font-serif-cn text-sm font-semibold mb-2 leading-snug">
                解锁深度访谈版<br />与无限 AI 对话
              </div>
              <NavLink
                to="/profile/membership"
                onClick={onClose}
                className="inline-flex items-center text-xs bg-white text-primary-700 px-3 py-1.5 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                查看权益 →
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
