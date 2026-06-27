import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============ 日期工具 ============
export function formatDate(
  date: string | Date | number,
  format: "YYYY-MM-DD" | "YYYY-MM-DD HH:mm" | "MM-DD" | "relative" = "YYYY-MM-DD"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());

  if (format === "YYYY-MM-DD") return `${y}-${m}-${day}`;
  if (format === "YYYY-MM-DD HH:mm") return `${y}-${m}-${day} ${h}:${min}`;
  if (format === "MM-DD") return `${m}-${day}`;
  if (format === "relative") return relativeTime(d);
  return `${y}-${m}-${day}`;
}

export function relativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  if (hour < 24) return `${hour} 小时前`;
  if (day < 7) return `${day} 天前`;
  return formatDate(date, "YYYY-MM-DD");
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function daysBetween(a: string | Date, b: string | Date = new Date()): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// ============ 数据工具 ============
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分`;
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ============ localStorage 断点续答 ============
export function loadProgress(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProgress(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // 容量满或隐私模式，忽略
  }
}

export function clearProgress(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ============ 颜色与图表 ============
export const DIMENSION_LABELS: Record<string, string> = {
  talent: "天赋优势",
  skill: "技能优势",
  personality: "性格特质",
  values: "价值取向",
};

export const DIMENSION_COLORS: Record<string, string> = {
  talent: "#2563EB",
  skill: "#F97316",
  personality: "#10B981",
  values: "#F59E0B",
};

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  career: "职业发展",
  skill: "技能提升",
  "side-project": "副业探索",
  "self-cognition": "自我认知",
  habit: "习惯养成",
};

export const GOAL_CATEGORY_ICONS: Record<string, string> = {
  career: "💼",
  skill: "🎯",
  "side-project": "🚀",
  "self-cognition": "🧭",
  habit: "🌱",
};

export const PRACTICE_CATEGORY_LABELS: Record<string, string> = {
  workplace: "职场应用",
  "side-project": "副业探索",
  skill: "技能练习",
  project: "项目实战",
  habit: "习惯养成",
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "入门",
  2: "进阶",
  3: "挑战",
};
