import { mockGoals, getGoalById, getTodayTasks } from "@/mock/goal";
import type { GrowthGoal, Task, GoalCategory } from "@/types";
import { delay, uid } from "@/lib/utils";

export async function fetchGoals(): Promise<GrowthGoal[]> {
  await delay(300);
  return [...mockGoals].sort((a, b) => a.priority - b.priority);
}

export async function fetchGoalById(id: string): Promise<GrowthGoal | undefined> {
  await delay(250);
  return getGoalById(id);
}

export async function fetchTodayTaskList(): Promise<Task[]> {
  await delay(200);
  return getTodayTasks();
}

export async function createGoal(input: {
  title: string;
  description: string;
  category: GoalCategory;
  expectedPeriodWeeks: number;
  expectedOutcome: string;
  currentBaseline: string;
  priority: 1 | 2 | 3;
}): Promise<GrowthGoal> {
  await delay(500);
  const newGoal: GrowthGoal = {
    id: uid("g"),
    userId: "u_001",
    title: input.title,
    description: input.description,
    category: input.category,
    expectedPeriodWeeks: input.expectedPeriodWeeks,
    expectedOutcome: input.expectedOutcome,
    currentBaseline: input.currentBaseline,
    priority: input.priority,
    status: "active",
    progress: 0,
    createdAt: new Date().toISOString(),
    milestones: [
      {
        id: uid("m"),
        goalId: "",
        title: "阶段一：建立认知",
        acceptanceCriteria: "待 AI 细化",
        order: 1,
        status: "pending",
        tasks: [],
      },
    ],
  };
  newGoal.milestones[0].goalId = newGoal.id;
  mockGoals.unshift(newGoal);
  return newGoal;
}

export async function toggleTask(taskId: string, goals: GrowthGoal[]): Promise<GrowthGoal[]> {
  await delay(150);
  const updated = goals.map((g) => ({
    ...g,
    milestones: g.milestones.map((m) => ({
      ...m,
      tasks: m.tasks.map((t) => {
        if (t.id === taskId) {
          const completed = t.status === "completed";
          return {
            ...t,
            status: completed ? "pending" : "completed",
            completedAt: completed ? undefined : new Date().toISOString(),
          } as Task;
        }
        return t;
      }),
    })),
  }));
  return updated;
}
