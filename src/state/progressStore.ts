import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { review, type CardState } from "../lib/srs";

export type ThemeChoice = "system" | "light" | "dark";

export interface CheckResult {
  correct: boolean;
  at: number;
}

export interface ScenarioRecord {
  /** 0..100 */
  pct: number;
  at: number;
  picks: Record<string, string>;
}

export interface ProgressState {
  theme: ThemeChoice;
  /** lessonId -> completed at (epoch ms) */
  lessonsCompleted: Record<string, number>;
  /** check question id -> last result */
  checkResults: Record<string, CheckResult>;
  /** scenarioId -> best attempt */
  scenarioResults: Record<string, ScenarioRecord>;
  /** flashcard id -> scheduling state */
  cards: Record<string, CardState>;
  /** "YYYY-MM-DD" -> number of learning events that day (drives the streak) */
  activity: Record<string, number>;
  lastLessonId?: string;

  setTheme: (theme: ThemeChoice) => void;
  openLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, now?: number) => void;
  uncompleteLesson: (lessonId: string) => void;
  recordCheck: (questionId: string, correct: boolean, now?: number) => void;
  recordScenario: (
    scenarioId: string,
    pct: number,
    picks: Record<string, string>,
    now?: number,
  ) => void;
  reviewCard: (cardId: string, known: boolean, now?: number) => void;
  resetAll: () => void;
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Consecutive days with activity ending today or yesterday. */
export function computeStreak(
  activity: Record<string, number>,
  now: number,
): number {
  const DAY = 24 * 60 * 60 * 1000;
  let cursor = now;
  // A streak survives if today has nothing yet but yesterday did.
  if (!activity[dayKey(cursor)]) cursor -= DAY;
  let streak = 0;
  while (activity[dayKey(cursor)]) {
    streak++;
    cursor -= DAY;
  }
  return streak;
}

function bump(
  activity: Record<string, number>,
  now: number,
): Record<string, number> {
  const key = dayKey(now);
  return { ...activity, [key]: (activity[key] ?? 0) + 1 };
}

const EMPTY = {
  theme: "system" as ThemeChoice,
  lessonsCompleted: {},
  checkResults: {},
  scenarioResults: {},
  cards: {},
  activity: {},
  lastLessonId: undefined,
};

/** localStorage can be absent or throw (private mode, blocked storage); never let that break the app. */
function safeStorage(): Storage {
  const memory = new Map<string, string>();
  const fallback: Storage = {
    get length() {
      return memory.size;
    },
    clear: () => memory.clear(),
    getItem: (k) => memory.get(k) ?? null,
    key: (i) => Array.from(memory.keys())[i] ?? null,
    removeItem: (k) => void memory.delete(k),
    setItem: (k, v) => void memory.set(k, v),
  };
  try {
    const ls = globalThis.localStorage;
    if (!ls) return fallback;
    const probe = "__arch_lab_probe__";
    ls.setItem(probe, "1");
    ls.removeItem(probe);
    return ls;
  } catch {
    return fallback;
  }
}

export const STORAGE_KEY = "arch-lab-progress-v1";

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setTheme: (theme) => set({ theme }),
      openLesson: (lessonId) => set({ lastLessonId: lessonId }),
      completeLesson: (lessonId, now = Date.now()) =>
        set((s) => ({
          lessonsCompleted: {
            ...s.lessonsCompleted,
            [lessonId]: s.lessonsCompleted[lessonId] ?? now,
          },
          activity: bump(s.activity, now),
        })),
      uncompleteLesson: (lessonId) =>
        set((s) => {
          const next = { ...s.lessonsCompleted };
          delete next[lessonId];
          return { lessonsCompleted: next };
        }),
      recordCheck: (questionId, correct, now = Date.now()) =>
        set((s) => ({
          checkResults: {
            ...s.checkResults,
            [questionId]: { correct, at: now },
          },
          activity: bump(s.activity, now),
        })),
      recordScenario: (scenarioId, pct, picks, now = Date.now()) =>
        set((s) => {
          const prev = s.scenarioResults[scenarioId];
          const best = prev && prev.pct > pct ? prev : { pct, at: now, picks };
          return {
            scenarioResults: { ...s.scenarioResults, [scenarioId]: best },
            activity: bump(s.activity, now),
          };
        }),
      reviewCard: (cardId, known, now = Date.now()) =>
        set((s) => ({
          cards: { ...s.cards, [cardId]: review(s.cards[cardId], known, now) },
          activity: bump(s.activity, now),
        })),
      resetAll: () => set({ ...EMPTY }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(safeStorage),
      partialize: (s) => ({
        theme: s.theme,
        lessonsCompleted: s.lessonsCompleted,
        checkResults: s.checkResults,
        scenarioResults: s.scenarioResults,
        cards: s.cards,
        activity: s.activity,
        lastLessonId: s.lastLessonId,
      }),
    },
  ),
);
