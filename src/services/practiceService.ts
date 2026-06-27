import { mockPractices, getPracticeById, getRecommendedPractices } from "@/mock/practice";
import type { PracticeProject, PracticeCategory, PracticeCheckIn } from "@/types";
import { delay, uid } from "@/lib/utils";

export async function fetchPractices(filter?: {
  category?: PracticeCategory;
  difficulty?: number;
  keyword?: string;
}): Promise<PracticeProject[]> {
  await delay(300);
  let list = [...mockPractices];
  if (filter?.category) list = list.filter((p) => p.category === filter.category);
  if (filter?.difficulty) list = list.filter((p) => p.difficulty === filter.difficulty);
  if (filter?.keyword) {
    const k = filter.keyword.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(k) ||
        p.description.toLowerCase().includes(k) ||
        p.tags.some((t) => t.toLowerCase().includes(k))
    );
  }
  return list;
}

export async function fetchPracticeById(id: string): Promise<PracticeProject | undefined> {
  await delay(250);
  return getPracticeById(id);
}

export async function fetchRecommended(limit = 3): Promise<PracticeProject[]> {
  await delay(200);
  return getRecommendedPractices(limit);
}

export async function checkIn(input: {
  projectId: string;
  content: string;
  reflection: string;
  isPublic: boolean;
}): Promise<PracticeCheckIn> {
  await delay(500);
  const checkIn: PracticeCheckIn = {
    id: uid("ci"),
    userId: "u_001",
    projectId: input.projectId,
    content: input.content,
    images: [],
    reflection: input.reflection,
    isPublic: input.isPublic,
    createdAt: new Date().toISOString(),
  };
  const practice = mockPractices.find((p) => p.id === input.projectId);
  if (practice) practice.checkInsCount += 1;
  return checkIn;
}
