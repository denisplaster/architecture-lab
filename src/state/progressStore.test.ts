import { computeStreak, dayKey, useProgress } from "./progressStore";

const DAY = 24 * 60 * 60 * 1000;
const T0 = new Date(2026, 9, 12, 10, 0, 0).getTime(); // local 2026-10-12 10:00

beforeEach(() => {
  useProgress.getState().resetAll();
});

describe("progress store", () => {
  it("records lesson completion once and keeps the first timestamp", () => {
    const s = useProgress.getState();
    s.completeLesson("a", T0);
    s.completeLesson("a", T0 + DAY);
    expect(useProgress.getState().lessonsCompleted.a).toBe(T0);
    expect(useProgress.getState().activity[dayKey(T0)]).toBe(1);
    expect(useProgress.getState().activity[dayKey(T0 + DAY)]).toBe(1);
  });

  it("keeps the best scenario attempt", () => {
    const s = useProgress.getState();
    s.recordScenario("sc", 50, { d1: "a" }, T0);
    s.recordScenario("sc", 83, { d1: "b" }, T0 + 1);
    s.recordScenario("sc", 40, { d1: "c" }, T0 + 2);
    expect(useProgress.getState().scenarioResults.sc.pct).toBe(83);
    expect(useProgress.getState().scenarioResults.sc.picks).toEqual({
      d1: "b",
    });
  });

  it("schedules flashcards through the Leitner boxes", () => {
    const s = useProgress.getState();
    s.reviewCard("c1", true, T0);
    expect(useProgress.getState().cards.c1.box).toBe(1);
    s.reviewCard("c1", false, T0 + DAY);
    expect(useProgress.getState().cards.c1).toMatchObject({
      box: 0,
      lapses: 1,
      seen: 2,
    });
  });

  it("resets everything", () => {
    const s = useProgress.getState();
    s.completeLesson("a", T0);
    s.setTheme("dark");
    s.resetAll();
    expect(useProgress.getState().lessonsCompleted).toEqual({});
    expect(useProgress.getState().theme).toBe("system");
  });
});

describe("computeStreak", () => {
  it("counts consecutive active days ending today", () => {
    const activity = {
      [dayKey(T0)]: 1,
      [dayKey(T0 - DAY)]: 2,
      [dayKey(T0 - 2 * DAY)]: 1,
    };
    expect(computeStreak(activity, T0)).toBe(3);
  });

  it("survives a day with no activity yet", () => {
    const activity = { [dayKey(T0 - DAY)]: 1, [dayKey(T0 - 2 * DAY)]: 1 };
    expect(computeStreak(activity, T0)).toBe(2);
  });

  it("breaks on a gap", () => {
    const activity = { [dayKey(T0)]: 1, [dayKey(T0 - 2 * DAY)]: 1 };
    expect(computeStreak(activity, T0)).toBe(1);
    expect(computeStreak({}, T0)).toBe(0);
  });
});
