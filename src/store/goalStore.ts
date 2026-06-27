import { create } from "zustand";
import type { GrowthGoal, Task } from "@/types";
import { fetchGoals, fetchGoalById, fetchTodayTaskList, createGoal, toggleTask } from "@/services/goalService";
import type { GoalCategory } from "@/types";

interface GoalState {
  goals: GrowthGoal[];
  currentGoal: GrowthGoal | null;
  todayTasks: Task[];
  loading: boolean;

  loadGoals: () => Promise<void>;
  loadGoal: (id: string) => Promise<void>;
  loadTodayTasks: () => Promise<void>;
  addGoal: (input: {
    title: string;
    description: string;
    category: GoalCategory;
    expectedPeriodWeeks: number;
    expectedOutcome: string;
    currentBaseline: string;
    priority: 1 | 2 | 3;
  }) => Promise<GrowthGoal>;
  completeTask: (taskId: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  currentGoal: null,
  todayTasks: [],
  loading: false,

  loadGoals: async () => {
    set({ loading: true });
    try {
      const goals = await fetchGoals();
      set({ goals });
    } finally {
      set({ loading: false });
    }
  },

  loadGoal: async (id) => {
    set({ loading: true });
    try {
      const goal = await fetchGoalById(id);
      set({ currentGoal: goal ?? null });
    } finally {
      set({ loading: false });
    }
  },

  loadTodayTasks: async () => {
    const tasks = await fetchTodayTaskList();
    set({ todayTasks: tasks });
  },

  addGoal: async (input) => {
    const newGoal = await createGoal(input);
    set({ goals: [newGoal, ...get().goals] });
    return newGoal;
  },

  completeTask: async (taskId) => {
    const updated = await toggleTask(taskId, get().goals);
    set({ goals: updated });
    // 同步更新 todayTasks
    const todayTasks: Task[] = [];
    updated.forEach((g) =>
      g.milestones.forEach((m) =>
        m.tasks.forEach((t) => {
          if (t.isToday || (t.status === "pending" && new Date(t.dueDate) <= new Date())) {
            todayTasks.push({ ...t, isToday: true });
          }
        })
      )
    );
    set({ todayTasks });
  },
}));
