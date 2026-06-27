import { mockUser, mockProfile, getDailyQuote } from "@/mock/user";
import { mockAssessmentHistory } from "@/mock/assessment";
import { getTodayTasks } from "@/mock/goal";
import { getRecommendedPractices } from "@/mock/practice";
import type { User, StrengthProfile, DailyQuote } from "@/types";
import { delay } from "@/lib/utils";

export async function fetchUser(): Promise<User> {
  await delay(200);
  return mockUser;
}

export async function fetchProfile(): Promise<StrengthProfile> {
  await delay(300);
  return mockProfile;
}

export async function fetchDailyQuote(): Promise<DailyQuote> {
  await delay(100);
  return getDailyQuote();
}

export interface DashboardOverview {
  streakDays: number;
  totalGrowthMinutes: number;
  completedTasksCount: number;
  assessmentCount: number;
  strengthProgress: number;
  todayTaskCount: number;
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  await delay(300);
  const todayTasks = getTodayTasks();
  return {
    streakDays: mockUser.streakDays,
    totalGrowthMinutes: mockUser.totalGrowthMinutes,
    completedTasksCount: mockAssessmentHistory.length * 12 + 18,
    assessmentCount: mockAssessmentHistory.length,
    strengthProgress: mockProfile.dimensions.talent,
    todayTaskCount: todayTasks.length,
  };
}

export async function fetchRecommendedPractices() {
  await delay(200);
  return getRecommendedPractices(3);
}

export async function fetchTodayTasks() {
  await delay(200);
  return getTodayTasks();
}
