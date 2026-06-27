import { create } from "zustand";
import type { AssessmentMode, AssessmentQuestion, AssessmentResult } from "@/types";
import {
  fetchQuestions,
  fetchHistory,
  fetchResultById,
  generateResult,
  loadSavedProgress,
  saveCurrentProgress,
  clearSavedProgress,
  type SavedProgress,
} from "@/services/assessmentService";
import type { StrengthDimensions } from "@/types";

interface AssessmentState {
  mode: AssessmentMode | null;
  questions: AssessmentQuestion[];
  currentIndex: number;
  answers: Record<string, number | string>;
  startedAt: number | null;
  history: AssessmentResult[];
  currentResult: AssessmentResult | null;
  loading: boolean;
  submitting: boolean;

  startAssessment: (mode: AssessmentMode) => Promise<void>;
  resumeIfNeeded: () => boolean;
  answer: (questionId: string, value: number | string) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  submit: () => Promise<AssessmentResult | null>;
  loadHistory: () => Promise<void>;
  loadResult: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  mode: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  startedAt: null,
  history: [],
  currentResult: null,
  loading: false,
  submitting: false,

  startAssessment: async (mode) => {
    set({ mode, loading: true, currentIndex: 0, answers: {}, startedAt: Date.now() });
    try {
      const qs = await fetchQuestions(mode);
      set({ questions: qs });
    } finally {
      set({ loading: false });
    }
  },

  resumeIfNeeded: () => {
    const saved = loadSavedProgress() as SavedProgress | null;
    if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
      set({
        mode: saved.mode,
        currentIndex: saved.currentIndex,
        answers: saved.answers,
        startedAt: saved.startedAt,
      });
      return true;
    }
    return false;
  },

  answer: (questionId, value) => {
    const answers = { ...get().answers, [questionId]: value };
    set({ answers });
    const { mode, currentIndex, startedAt } = get();
    if (mode && startedAt) {
      saveCurrentProgress({
        mode,
        currentIndex,
        answers,
        startedAt,
        updatedAt: Date.now(),
      });
    }
  },

  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1) })),
  prev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  goTo: (index) => set({ currentIndex: index }),

  submit: async () => {
    const { mode, answers, startedAt, questions } = get();
    if (!mode || !startedAt) return null;
    set({ submitting: true });
    try {
      // 基于答案简单计算四维分数（演示用）
      const dims: StrengthDimensions = { talent: 0, skill: 0, personality: 0, values: 0 };
      const counts: StrengthDimensions = { talent: 0, skill: 0, personality: 0, values: 0 };
      questions.forEach((q) => {
        const v = answers[q.id];
        if (typeof v === "number") {
          dims[q.dimension] += v;
          counts[q.dimension] += 1;
        }
      });
      (Object.keys(dims) as Array<keyof StrengthDimensions>).forEach((k) => {
        if (counts[k] > 0) dims[k] = Math.round((dims[k] / counts[k]) * 18);
      });
      // 归一化到 0-100
      const max = Math.max(...(Object.values(dims) as number[]), 60);
      (Object.keys(dims) as Array<keyof StrengthDimensions>).forEach((k) => {
        dims[k] = Math.round(((dims[k] as number) / max) * 88 + 8);
      });

      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      const result = await generateResult(mode, dims, durationSeconds);
      set({ currentResult: result });
      clearSavedProgress();
      return result;
    } finally {
      set({ submitting: false });
    }
  },

  loadHistory: async () => {
    set({ loading: true });
    try {
      const history = await fetchHistory();
      set({ history });
    } finally {
      set({ loading: false });
    }
  },

  loadResult: async (id) => {
    set({ loading: true });
    try {
      const result = await fetchResultById(id);
      set({ currentResult: result });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({
      mode: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      startedAt: null,
      currentResult: null,
    });
  },
}));
