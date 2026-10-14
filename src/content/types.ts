/**
 * Content schema for Architecture Lab.
 *
 * Everything the learner sees is data in this shape: tracks of lessons,
 * decision scenarios, flashcards, and advisor models. The UI never special-
 * cases a topic, so adding a stack later (Java, Go, …) means adding content
 * modules, not components.
 *
 * Prose fields accept "markdown-lite" (see lib/markdown.ts): paragraphs
 * separated by blank lines, `- ` bullets, `**bold**`, `inline code`, and
 * fenced ``` code blocks.
 */

/** Which part of the stack a piece of content belongs to. */
export type Stack = "general" | "dotnet" | "azure" | "data" | "react";

/** 1 = foundations, 2 = working knowledge, 3 = advanced judgement. */
export type Level = 1 | 2 | 3;

/**
 * The quality attributes every trade-off is scored against. Keep this list
 * small and stable: the comparison view puts them side by side.
 */
export type QualityAttribute =
  | "simplicity"
  | "time-to-market"
  | "scalability"
  | "performance"
  | "consistency"
  | "reliability"
  | "evolvability"
  | "deployability"
  | "testability"
  | "team-autonomy"
  | "operability"
  | "cost";

export const QUALITY_ATTRIBUTES: readonly QualityAttribute[] = [
  "simplicity",
  "time-to-market",
  "scalability",
  "performance",
  "consistency",
  "reliability",
  "evolvability",
  "deployability",
  "testability",
  "team-autonomy",
  "operability",
  "cost",
];

export interface Track {
  id: string;
  title: string;
  /** One sentence shown on the track card. */
  summary: string;
  stack: Stack;
  /** Lesson ids in reading order. Every id must exist in LESSONS. */
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  trackId: string;
  title: string;
  /** One line under the title: the pattern in a sentence. */
  tagline: string;
  level: Level;
  /** Estimated reading time. */
  minutes: number;
  /** Two or three sentences: what it is and the one situation it is for. */
  summary: string;
  /** Headed prose blocks, in order. 3–6 sections of 80–250 words each. */
  sections: LessonSection[];
  diagram?: Diagram;
  /** Concrete signals in a situation that point TOWARD this choice. */
  useWhen: string[];
  /** Concrete signals that point AWAY from it. */
  avoidWhen: string[];
  /** How this is realised on the Microsoft stack: services, libraries, templates. */
  microsoftStack: StackNote[];
  /** How this shows up on the React side (optional for backend-only topics). */
  reactStack?: StackNote[];
  /** Effect on each quality attribute, relative to the obvious alternative. */
  tradeoffs: Tradeoff[];
  /** Lesson ids worth reading next. */
  related: string[];
  /** Two or three quick checks shown at the end of the lesson. */
  checks: CheckQuestion[];
  /** Official references (Microsoft Learn, Azure Architecture Center, react.dev). */
  sources?: Source[];
}

export interface LessonSection {
  heading: string;
  /** markdown-lite */
  body: string;
}

export interface StackNote {
  /** The product, library or feature, e.g. "Azure Service Bus", "MediatR". */
  name: string;
  /** What role it plays in this pattern, in one sentence. */
  role: string;
}

export interface Tradeoff {
  attribute: QualityAttribute;
  /** -2 much worse … 0 neutral … +2 much better than the plain alternative. */
  effect: -2 | -1 | 0 | 1 | 2;
  /** Why, in one short sentence. */
  note: string;
}

export interface CheckQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into options. */
  answer: number;
  explanation: string;
}

export interface Source {
  title: string;
  url: string;
}

/* ------------------------------------------------------------------------ */
/* Diagrams: declarative box-and-arrow drawings rendered by components/diagram */

export type NodeKind =
  | "ui" // browser / mobile / client
  | "service" // process, API, function
  | "data" // database, store, cache
  | "queue" // broker, topic, event stream
  | "external" // third-party or out-of-scope system
  | "note"; // a text-only annotation

export interface DiagramNode {
  id: string;
  label: string;
  /** Second line, smaller: the technology, e.g. "ASP.NET Core". */
  sub?: string;
  /** Grid column, 0-based, left to right. */
  col: number;
  /** Grid row, 0-based, top to bottom. */
  row: number;
  kind?: NodeKind;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed";
  bidirectional?: boolean;
}

export interface DiagramGroup {
  label: string;
  nodeIds: string[];
}

export interface Diagram {
  caption?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
}

/* ------------------------------------------------------------------------ */
/* Scenarios: "given this situation, what would you choose?" */

export interface Scenario {
  id: string;
  title: string;
  stacks: Stack[];
  level: Level;
  /** The story, markdown-lite. Concrete: team, users, scale, deadline, constraints. */
  situation: string;
  /** Hard facts pulled out as bullets, e.g. "Team: 4 developers, no ops". */
  constraints: string[];
  /** 2–4 decisions, each with 3–5 options. */
  decisions: Decision[];
  /** The recommended overall shape and why, markdown-lite. Shown after answering. */
  debrief: string;
  relatedLessons: string[];
}

export interface Decision {
  id: string;
  prompt: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  label: string;
  /** 3 = best fit, 2 = defensible, 1 = weak, 0 = poor fit for THIS situation. */
  score: 0 | 1 | 2 | 3;
  /** Why this option fits or fails here. Specific to the scenario, 1–3 sentences. */
  feedback: string;
}

/* ------------------------------------------------------------------------ */
/* Flashcards for spaced repetition */

export interface Flashcard {
  id: string;
  trackId: string;
  /** The question or prompt. */
  front: string;
  /** The answer, markdown-lite, 1–4 sentences. */
  back: string;
  lessonId?: string;
}

/* ------------------------------------------------------------------------ */
/* Advisors: answer questions about YOUR situation, get ranked options */

export interface Advisor {
  id: string;
  title: string;
  /** What this advisor decides, one or two sentences. */
  intro: string;
  options: AdvisorOption[];
  questions: AdvisorQuestion[];
}

export interface AdvisorOption {
  id: string;
  label: string;
  /** One sentence. */
  summary: string;
  /** Lesson to read for this option. */
  lessonId: string;
  /** Starting score before any answers (use to express a sensible default). */
  baseline?: number;
}

export interface AdvisorQuestion {
  id: string;
  prompt: string;
  help?: string;
  answers: AdvisorAnswer[];
}

export interface AdvisorAnswer {
  id: string;
  label: string;
  /** Score deltas per option id, -3 … +3. Omitted options are unaffected. */
  weights: Record<string, number>;
}
