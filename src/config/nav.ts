import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Compass,
  Target,
  Sparkles,
  BookOpen,
  User,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  matchPrefix?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "工作台",
    icon: LayoutDashboard,
    matchPrefix: ["/"],
  },
  {
    path: "/assessment",
    label: "优势测评",
    icon: Compass,
    matchPrefix: ["/assessment"],
  },
  {
    path: "/growth",
    label: "成长路径",
    icon: Target,
    matchPrefix: ["/growth"],
  },
  {
    path: "/ai-companion",
    label: "AI 陪伴",
    icon: Sparkles,
    matchPrefix: ["/ai-companion"],
  },
  {
    path: "/practice",
    label: "实践库",
    icon: BookOpen,
    matchPrefix: ["/practice"],
  },
  {
    path: "/profile",
    label: "我的",
    icon: User,
    matchPrefix: ["/profile"],
  },
];

// 移动端底部 Tab（精简到 5 项）
export const MOBILE_TAB_ITEMS: NavItem[] = [
  { path: "/", label: "工作台", icon: LayoutDashboard },
  { path: "/assessment", label: "测评", icon: Compass },
  { path: "/growth", label: "成长", icon: Target },
  { path: "/ai-companion", label: "AI", icon: Sparkles },
  { path: "/profile", label: "我的", icon: User },
];
