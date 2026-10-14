import type { Advisor, Scenario } from "../content/types";
import { answeredCount, gradeFor, rankAdvisor, scoreScenario } from "./scoring";

const scenario: Scenario = {
  id: "s",
  title: "S",
  stacks: ["dotnet"],
  level: 1,
  situation: "x",
  constraints: [],
  decisions: [
    {
      id: "d1",
      prompt: "?",
      options: [
        { id: "a", label: "A", score: 3, feedback: "" },
        { id: "b", label: "B", score: 1, feedback: "" },
      ],
    },
    {
      id: "d2",
      prompt: "?",
      options: [
        { id: "c", label: "C", score: 0, feedback: "" },
        { id: "d", label: "D", score: 3, feedback: "" },
      ],
    },
  ],
  debrief: "",
  relatedLessons: [],
};

describe("scoreScenario", () => {
  it("sums picked scores against the best possible", () => {
    const r = scoreScenario(scenario, { d1: "b", d2: "d" });
    expect(r.score).toBe(4);
    expect(r.max).toBe(6);
    expect(r.pct).toBe(67);
    expect(r.grade).toBe("solid");
    expect(r.perDecision[0].best.id).toBe("a");
    expect(r.perDecision[1].picked?.id).toBe("d");
  });

  it("counts an unanswered decision as zero", () => {
    expect(scoreScenario(scenario, {}).score).toBe(0);
  });

  it("grades on thresholds", () => {
    expect(gradeFor(100)).toBe("strong");
    expect(gradeFor(85)).toBe("strong");
    expect(gradeFor(84)).toBe("solid");
    expect(gradeFor(59)).toBe("revisit");
  });
});

const advisor: Advisor = {
  id: "adv",
  title: "Adv",
  intro: "",
  options: [
    { id: "mono", label: "Monolith", summary: "", lessonId: "l", baseline: 1 },
    { id: "micro", label: "Microservices", summary: "", lessonId: "l" },
  ],
  questions: [
    {
      id: "team",
      prompt: "Team size?",
      answers: [
        { id: "small", label: "Under 10", weights: { mono: 2, micro: -2 } },
        { id: "large", label: "Over 50", weights: { mono: -1, micro: 3 } },
      ],
    },
    {
      id: "ops",
      prompt: "Ops maturity?",
      answers: [
        { id: "low", label: "Low", weights: { micro: -2 } },
        { id: "high", label: "High", weights: { micro: 1 } },
      ],
    },
  ],
};

describe("rankAdvisor", () => {
  it("ranks by baseline plus answer weights and explains why", () => {
    const r = rankAdvisor(advisor, { team: "large", ops: "high" });
    expect(r.map((x) => x.option.id)).toEqual(["micro", "mono"]);
    expect(r[0].score).toBe(4);
    expect(r[0].reasons[0]).toEqual({
      question: "Team size?",
      answer: "Over 50",
      delta: 3,
    });
    expect(r[1].score).toBe(0);
  });

  it("uses baselines alone when nothing is answered", () => {
    const r = rankAdvisor(advisor, {});
    expect(r[0].option.id).toBe("mono");
    expect(answeredCount(advisor, {})).toBe(0);
    expect(answeredCount(advisor, { team: "small", ops: "nope" })).toBe(1);
  });
});
