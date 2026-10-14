import { ADVISORS } from "./advisors";
import { FLASHCARDS } from "./flashcards";
import { AZURE_DATA_LESSONS } from "./lessons/azureData";
import { CROSSCUTTING_LESSONS } from "./lessons/crosscutting";
import { DOTNET_DISTRIBUTED_LESSONS } from "./lessons/dotnetDistributed";
import { DOTNET_STYLES_LESSONS } from "./lessons/dotnetStyles";
import { FOUNDATIONS_LESSONS } from "./lessons/foundations";
import { FULLSTACK_LESSONS } from "./lessons/fullstack";
import { REACT_LESSONS } from "./lessons/react";
import { SCENARIOS } from "./scenarios";
import { TRACKS } from "./tracks";
import type {
  Advisor,
  Flashcard,
  Lesson,
  Scenario,
  Stack,
  Track,
} from "./types";

export const LESSONS: Lesson[] = [
  ...FOUNDATIONS_LESSONS,
  ...DOTNET_STYLES_LESSONS,
  ...DOTNET_DISTRIBUTED_LESSONS,
  ...AZURE_DATA_LESSONS,
  ...REACT_LESSONS,
  ...FULLSTACK_LESSONS,
  ...CROSSCUTTING_LESSONS,
];

export { ADVISORS, FLASHCARDS, SCENARIOS, TRACKS };

const lessonById = new Map(LESSONS.map((l) => [l.id, l]));
const trackById = new Map(TRACKS.map((t) => [t.id, t]));
const scenarioById = new Map(SCENARIOS.map((s) => [s.id, s]));
const advisorById = new Map(ADVISORS.map((a) => [a.id, a]));

export const getLesson = (id: string): Lesson | undefined => lessonById.get(id);
export const getTrack = (id: string): Track | undefined => trackById.get(id);
export const getScenario = (id: string): Scenario | undefined =>
  scenarioById.get(id);
export const getAdvisor = (id: string): Advisor | undefined =>
  advisorById.get(id);

export function lessonsOf(track: Track): Lesson[] {
  return track.lessonIds
    .map((id) => lessonById.get(id))
    .filter((l): l is Lesson => !!l);
}

export function cardsOf(trackId?: string): Flashcard[] {
  return trackId ? FLASHCARDS.filter((c) => c.trackId === trackId) : FLASHCARDS;
}

/** The lesson after `lessonId` in its track, if any. */
export function nextLesson(lessonId: string): Lesson | undefined {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return undefined;
  const track = trackById.get(lesson.trackId);
  if (!track) return undefined;
  const idx = track.lessonIds.indexOf(lessonId);
  return idx >= 0 ? lessonById.get(track.lessonIds[idx + 1] ?? "") : undefined;
}

export const STACK_LABEL: Record<Stack, string> = {
  general: "General",
  dotnet: ".NET",
  azure: "Azure",
  data: "Data",
  react: "React",
};

export const LEVEL_LABEL: Record<1 | 2 | 3, string> = {
  1: "Foundations",
  2: "Working knowledge",
  3: "Advanced",
};
