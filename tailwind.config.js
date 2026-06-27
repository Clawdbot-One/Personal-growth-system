/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        // 智慧蓝主色
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB", // 主色
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // 活力橙辅助色
        accent: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // 辅助色
          600: "#EA580C",
          700: "#C2410C",
        },
        // 薄荷绿 - 成长/成功
        mint: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
        },
        // 琥珀黄 - 成就/徽章
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
        },
        // 中性背景
        ink: {
          50: "#FAFBFC",
          100: "#F4F6F8",
          200: "#E5E9EE",
          300: "#CBD2DA",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#0B1220",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', '"Sora"', "system-ui", "sans-serif"],
        display: ['"Sora"', '"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(15, 23, 42, 0.06), 0 4px 20px -4px rgba(15, 23, 42, 0.04)",
        card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)",
        lift: "0 8px 32px -8px rgba(37, 99, 235, 0.18)",
        glow: "0 0 24px -4px rgba(37, 99, 235, 0.35)",
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
        "gradient-cool": "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
        "gradient-hero": "linear-gradient(135deg, #2563EB 0%, #1E40AF 50%, #1E3A8A 100%)",
        "mesh-soft":
          "radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(249, 115, 22, 0.06) 0px, transparent 50%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(1.1)", opacity: "0" },
          "100%": { transform: "scale(1.1)", opacity: "0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
