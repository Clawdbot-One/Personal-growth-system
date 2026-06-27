import { getQuestionsByMode, mockAssessmentHistory, ASSESSMENT_MODES } from "@/mock/assessment";
import { mockProfile } from "@/mock/user";
import type { AssessmentMode, AssessmentQuestion, AssessmentResult, StrengthDimensions } from "@/types";
import { delay, loadProgress, saveProgress, clearProgress, uid } from "@/lib/utils";

const PROGRESS_KEY = "youban_assessment_progress";

export const assessmentModes = ASSESSMENT_MODES;

export async function fetchQuestions(mode: AssessmentMode): Promise<AssessmentQuestion[]> {
  await delay(400);
  return getQuestionsByMode(mode);
}

export async function fetchHistory(): Promise<AssessmentResult[]> {
  await delay(300);
  return [...mockAssessmentHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function fetchResultById(id: string): Promise<AssessmentResult | undefined> {
  await delay(250);
  const found = mockAssessmentHistory.find((r) => r.id === id);
  if (found) {
    return {
      ...found,
      topStrengths: mockProfile.topStrengths,
      recommendedDirections: mockProfile.recommendedDirections,
    };
  }
  return undefined;
}

// 生成最新报告（基于当前画像）
export async function generateResult(
  mode: AssessmentMode,
  dimensions: StrengthDimensions,
  durationSeconds: number
): Promise<AssessmentResult> {
  await delay(800);
  return {
    id: uid("ar"),
    userId: "u_001",
    mode,
    dimensions,
    topStrengths: mockProfile.topStrengths,
    blindSpots: mockProfile.blindSpots,
    recommendedDirections: mockProfile.recommendedDirections,
    durationSeconds,
    createdAt: new Date().toISOString(),
  };
}

// ============ 断点续答 ============
export interface SavedProgress {
  mode: AssessmentMode;
  currentIndex: number;
  answers: Record<string, number | string>;
  startedAt: number;
  updatedAt: number;
}

export function loadSavedProgress(): SavedProgress | null {
  return loadProgress(PROGRESS_KEY) as SavedProgress | null;
}

export function saveCurrentProgress(progress: SavedProgress): void {
  saveProgress(PROGRESS_KEY, { ...progress, updatedAt: Date.now() });
}

export function clearSavedProgress(): void {
  clearProgress(PROGRESS_KEY);
}
