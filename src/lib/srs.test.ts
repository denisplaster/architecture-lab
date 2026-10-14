import { buildSession, DAY_MS, isDue, MAX_BOX, review, summarise } from "./srs";

const NOW = 1_700_000_000_000;

describe("review", () => {
  it("promotes a new card to box 1, due tomorrow", () => {
    const s = review(undefined, true, NOW);
    expect(s).toEqual({ box: 1, due: NOW + DAY_MS, seen: 1, lapses: 0 });
  });

  it("caps at the top box", () => {
    let s = review(undefined, true, NOW);
    for (let i = 0; i < 10; i++) s = review(s, true, NOW);
    expect(s.box).toBe(MAX_BOX);
    expect(s.due).toBe(NOW + 30 * DAY_MS);
  });

  it("drops a missed card to box 0, due now, and counts the lapse", () => {
    const s = review({ box: 3, due: NOW, seen: 4, lapses: 0 }, false, NOW);
    expect(s).toEqual({ box: 0, due: NOW, seen: 5, lapses: 1 });
    expect(isDue(s, NOW)).toBe(true);
  });
});

describe("buildSession", () => {
  const states = {
    a: { box: 2, due: NOW - 2 * DAY_MS, seen: 3, lapses: 0 }, // most overdue
    b: { box: 1, due: NOW - DAY_MS, seen: 1, lapses: 0 },
    c: { box: 4, due: NOW + 5 * DAY_MS, seen: 6, lapses: 0 }, // not due
  };

  it("orders due cards by how overdue they are, then unseen cards", () => {
    expect(buildSession(["c", "b", "d", "a", "e"], states, NOW, 10)).toEqual([
      "a",
      "b",
      "d",
      "e",
    ]);
  });

  it("respects the limit", () => {
    expect(buildSession(["c", "b", "d", "a", "e"], states, NOW, 2)).toEqual([
      "a",
      "b",
    ]);
  });

  it("summarises a deck", () => {
    expect(summarise(["a", "b", "c", "d"], states, NOW)).toEqual({
      total: 4,
      due: 2,
      fresh: 1,
      mastered: 1,
    });
  });
});
