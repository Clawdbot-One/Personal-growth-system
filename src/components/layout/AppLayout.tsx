import { useState } from "react";
import type { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  title?: string;
  children?: ReactNode;
  hideTopBar?: boolean;
}

const ROUTE_TITLES: Record<string, string> = {
  "/": "工作台",
  "/assessment": "优势测评",
  "/growth": "成长路径",
  "/ai-companion": "AI 成长陪伴",
  "/practice": "实践库",
  "/profile": "我的",
  "/profile/archive": "成长档案",
  "/profile/settings": "账号设置",
  "/profile/membership": "会员权益",
};

export function AppLayout({ title, children, hideTopBar }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const activeTitle =
    title ??
    Object.entries(ROUTE_TITLES).find(([path]) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
    )?.[1] ??
    "";

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {!hideTopBar && <TopBar onOpenSidebar={() => setSidebarOpen(true)} title={activeTitle} />}

        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
          {children ?? <Outlet />}
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}
