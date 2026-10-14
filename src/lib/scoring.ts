import type {
  Advisor,
  AdvisorOption,
  Decision,
  DecisionOption,
  Scenario,
} from "../content/types";

/* ---------------------------------------------------------------- scenarios */

export type Grade = "strong" | "solid" | "revisit";

export interface DecisionResult {
  decision: Decision;
  picked: DecisionOption | undefined;
  best: DecisionOption;
}

export interface ScenarioResult {
  score: number;
  max: number;
  /** 0..100 */
  pct: number;
  grade: Grade;
  perDecision: DecisionResult[];
}

export const BEST_SCORE = 3;

export function gradeFor(pct: number): Grade {
  if (pct >= 85) return "strong";
  if (pct >= 60) return "solid";
  return "revisit";
}

export function bestOption(decision: Decision): DecisionOption {
  return decision.options.reduce((a, b) => (b.score > a.score ? b : a));
}

export function scoreScenario(
  scenario: Scenario,
  picks: Record<string, string | undefined>,
): ScenarioResult {
  const perDecision = scenario.decisions.map((decision) => ({
    decision,
    picked: decision.options.find((o) => o.id === picks[decision.id]),
    best: bestOption(decision),
  }));
  const score = perDecision.reduce((sum, d) => sum + (d.picked?.score ?? 0), 0);
  const max = scenario.decisions.length * BEST_SCORE;
  const pct = max === 0 ? 0 : Math.round((score / max) * 100);
  return { score, max, pct, grade: gradeFor(pct), perDecision };
}

/* ----------------------------------------------------------------- advisors */

export interface Reason {
  question: string;
  answer: string;
  delta: number;
}

export interface RankedOption {
  option: AdvisorOption;
  score: number;
  reasons: Reason[];
}

/**
 * Sum the chosen answers' weights per option. Reasons are the individual
 * contributions, strongest first, so the UI can explain the ranking.
 */
export function rankAdvisor(
  advisor: Advisor,
  answers: Record<string, string | undefined>,
): RankedOption[] {
  const ranked = advisor.options.map<RankedOption>((option) => ({
    option,
    score: option.baseline ?? 0,
    reasons: [],
  }));
  const byId = new Map(ranked.map((r) => [r.option.id, r]));
  for (const q of advisor.questions) {
    const a = q.answers.find((x) => x.id === answers[q.id]);
    if (!a) continue;
    for (const [optionId, delta] of Object.entries(a.weights)) {
      const r = byId.get(optionId);
      if (!r || delta === 0) continue;
      r.score += delta;
      r.reasons.push({ question: q.prompt, answer: a.label, delta });
    }
  }
  for (const r of ranked)
    r.reasons.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  return ranked.sort(
    (x, y) => y.score - x.score || x.option.label.localeCompare(y.option.label),
  );
}

export function answeredCount(
  advisor: Advisor,
  answers: Record<string, string | undefined>,
): number {
  return advisor.questions.filter((q) =>
    q.answers.some((a) => a.id === answers[q.id]),
  ).length;
}
