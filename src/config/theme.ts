// 优伴 AI · 主题配置
export const THEME = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  accent: "#F97316",
  mint: "#10B981",
  amber: "#F59E0B",
  ink: "#0B1220",
  bg: "#FAFBFC",
} as const;

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)",
  "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
  "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
  "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
  "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
];

export function pickAvatarGradient(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}
