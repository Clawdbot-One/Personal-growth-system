import { create } from "zustand";
import type { User, StrengthProfile, DailyQuote } from "@/types";
import {
  fetchUser,
  fetchProfile,
  fetchDailyQuote,
  fetchDashboardOverview,
  type DashboardOverview,
} from "@/services/userService";

interface UserState {
  user: User | null;
  profile: StrengthProfile | null;
  quote: DailyQuote | null;
  overview: DashboardOverview | null;
  loading: boolean;
  loadAll: () => Promise<void>;
  toggleTheme: () => void;
  isDark: boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  quote: null,
  overview: null,
  loading: false,
  isDark: false,
  loadAll: async () => {
    set({ loading: true });
    try {
      const [user, profile, quote, overview] = await Promise.all([
        fetchUser(),
        fetchProfile(),
        fetchDailyQuote(),
        fetchDashboardOverview(),
      ]);
      set({ user, profile, quote, overview });
    } finally {
      set({ loading: false });
    }
  },
  toggleTheme: () => {
    const next = !get().isDark;
    document.documentElement.classList.toggle("dark", next);
    set({ isDark: next });
  },
}));
