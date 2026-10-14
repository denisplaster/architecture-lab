/**
 * Content validation. These tests are the safety net for the data modules:
 * every id referenced anywhere must resolve, every diagram must be drawable,
 * every scenario must be scoreable, and the catalogue must match the tracks.
 */
import {
  ADVISORS,
  FLASHCARDS,
  LESSONS,
  SCENARIOS,
  TRACKS,
  getLesson,
} from "./index";
import { QUALITY_ATTRIBUTES } from "./types";
import { wordCount } from "../lib/markdown";

const lessonIds = new Set(LESSONS.map((l) => l.id));

function unique(ids: string[], what: string) {
  const seen = new Set<string>();
  for (const id of ids) {
    expect(seen.has(id), `duplicate ${what} id: ${id}`).toBe(false);
    seen.add(id);
  }
}

describe("tracks", () => {
  it("list every lesson exactly once and nothing else", () => {
    const listed = TRACKS.flatMap((t) => t.lessonIds);
    unique(listed, "track lesson");
    expect(new Set(listed)).toEqual(lessonIds);
    for (const t of TRACKS)
      for (const id of t.lessonIds)
        expect(getLesson(id)?.trackId, `${id} track`).toBe(t.id);
  });

  it("have unique ids", () =>
    unique(
      TRACKS.map((t) => t.id),
      "track",
    ));
});

describe("lessons", () => {
  it("have unique ids and check ids", () => {
    unique(
      LESSONS.map((l) => l.id),
      "lesson",
    );
    unique(
      LESSONS.flatMap((l) => l.checks.map((c) => c.id)),
      "check",
    );
  });

  it.each(LESSONS.map((l) => [l.id, l] as const))(
    "%s is complete and consistent",
    (_id, l) => {
      expect(l.title.length).toBeGreaterThan(3);
      expect(l.tagline.length).toBeLessThanOrEqual(110);
      expect(l.sections.length).toBeGreaterThanOrEqual(3);
      expect(l.useWhen.length).toBeGreaterThanOrEqual(2);
      expect(l.avoidWhen.length).toBeGreaterThanOrEqual(2);
      expect(l.microsoftStack.length).toBeGreaterThanOrEqual(2);
      expect(l.checks.length).toBeGreaterThanOrEqual(2);
      for (const c of l.checks) {
        expect(c.options.length).toBeGreaterThanOrEqual(3);
        expect(c.answer).toBeGreaterThanOrEqual(0);
        expect(c.answer).toBeLessThan(c.options.length);
        expect(c.explanation.length).toBeGreaterThan(20);
      }
      for (const r of l.related)
        expect(lessonIds.has(r), `${l.id} related -> ${r}`).toBe(true);
      expect(l.related.includes(l.id), `${l.id} relates to itself`).toBe(false);
      const attrs = l.tradeoffs.map((t) => t.attribute);
      unique(attrs, `${l.id} tradeoff attribute`);
      for (const a of attrs)
        expect(QUALITY_ATTRIBUTES.includes(a), `${l.id} attribute ${a}`).toBe(
          true,
        );
      expect(l.tradeoffs.length).toBeGreaterThanOrEqual(4);
      const words = l.sections.reduce((n, s) => n + wordCount(s.body), 0);
      expect(words, `${l.id} is too thin (${words} words)`).toBeGreaterThan(
        300,
      );
      for (const s of l.sources ?? []) expect(s.url).toMatch(/^https:\/\//);
    },
  );

  it.each(
    LESSONS.filter((l) => l.diagram).map((l) => [l.id, l.diagram!] as const),
  )("%s diagram is drawable", (_id, d) => {
    const ids = new Set(d.nodes.map((n) => n.id));
    expect(ids.size).toBe(d.nodes.length);
    const cells = new Set(d.nodes.map((n) => `${n.col},${n.row}`));
    expect(cells.size, "two nodes share a grid cell").toBe(d.nodes.length);
    for (const n of d.nodes) {
      expect(n.col).toBeGreaterThanOrEqual(0);
      expect(n.col).toBeLessThanOrEqual(5);
      expect(n.row).toBeGreaterThanOrEqual(0);
      expect(n.row).toBeLessThanOrEqual(4);
      expect(n.label.length, `label too long: ${n.label}`).toBeLessThanOrEqual(
        26,
      );
    }
    for (const e of d.edges) {
      expect(ids.has(e.from), `edge from ${e.from}`).toBe(true);
      expect(ids.has(e.to), `edge to ${e.to}`).toBe(true);
    }
    for (const g of d.groups ?? [])
      for (const n of g.nodeIds)
        expect(ids.has(n), `group member ${n}`).toBe(true);
  });
});

describe("scenarios", () => {
  it("have unique ids", () =>
    unique(
      SCENARIOS.map((s) => s.id),
      "scenario",
    ));

  it.each(SCENARIOS.map((s) => [s.id, s] as const))(
    "%s is scoreable",
    (_id, s) => {
      expect(s.decisions.length).toBeGreaterThanOrEqual(2);
      expect(s.constraints.length).toBeGreaterThanOrEqual(3);
      unique(
        s.decisions.map((d) => d.id),
        `${s.id} decision`,
      );
      for (const d of s.decisions) {
        expect(d.options.length).toBeGreaterThanOrEqual(3);
        unique(
          d.options.map((o) => o.id),
          `${s.id}/${d.id} option`,
        );
        const best = d.options.filter((o) => o.score === 3);
        expect(
          best.length,
          `${s.id}/${d.id} must have exactly one best option`,
        ).toBe(1);
        for (const o of d.options)
          expect(o.feedback.length).toBeGreaterThan(20);
      }
      for (const r of s.relatedLessons)
        expect(lessonIds.has(r), `${s.id} related -> ${r}`).toBe(true);
      expect(s.relatedLessons.length).toBeGreaterThanOrEqual(1);
      expect(wordCount(s.debrief)).toBeGreaterThan(40);
    },
  );
});

describe("flashcards", () => {
  it("have unique ids and resolve to tracks and lessons", () => {
    unique(
      FLASHCARDS.map((c) => c.id),
      "flashcard",
    );
    const trackIds = new Set(TRACKS.map((t) => t.id));
    for (const c of FLASHCARDS) {
      expect(trackIds.has(c.trackId), `${c.id} track`).toBe(true);
      if (c.lessonId) {
        expect(lessonIds.has(c.lessonId), `${c.id} lesson`).toBe(true);
        expect(
          getLesson(c.lessonId)?.trackId,
          `${c.id} lesson/track mismatch`,
        ).toBe(c.trackId);
      }
      expect(c.front.length).toBeGreaterThan(10);
      expect(c.back.length).toBeGreaterThan(10);
    }
  });

  it("cover every lesson", () => {
    const covered = new Set(FLASHCARDS.map((c) => c.lessonId));
    const missing = LESSONS.filter((l) => !covered.has(l.id)).map((l) => l.id);
    expect(missing, "lessons without flashcards").toEqual([]);
  });
});

describe("advisors", () => {
  it("have unique ids", () =>
    unique(
      ADVISORS.map((a) => a.id),
      "advisor",
    ));

  it.each(ADVISORS.map((a) => [a.id, a] as const))(
    "%s is well-formed",
    (_id, a) => {
      unique(
        a.options.map((o) => o.id),
        `${a.id} option`,
      );
      unique(
        a.questions.map((q) => q.id),
        `${a.id} question`,
      );
      const optionIds = new Set(a.options.map((o) => o.id));
      expect(a.options.length).toBeGreaterThanOrEqual(3);
      expect(a.questions.length).toBeGreaterThanOrEqual(5);
      for (const o of a.options)
        expect(lessonIds.has(o.lessonId), `${a.id}/${o.id} lesson`).toBe(true);
      for (const q of a.questions) {
        expect(q.answers.length).toBeGreaterThanOrEqual(2);
        unique(
          q.answers.map((x) => x.id),
          `${a.id}/${q.id} answer`,
        );
        for (const ans of q.answers) {
          const entries = Object.entries(ans.weights);
          expect(
            entries.length,
            `${a.id}/${q.id}/${ans.id} weights`,
          ).toBeGreaterThanOrEqual(1);
          for (const [opt, w] of entries) {
            expect(
              optionIds.has(opt),
              `${a.id}/${q.id}/${ans.id} -> ${opt}`,
            ).toBe(true);
            expect(Math.abs(w)).toBeLessThanOrEqual(3);
          }
        }
        // Each question must discriminate: not every option gets the same delta for a given answer.
        for (const ans of q.answers) {
          const ws = a.options.map((o) => ans.weights[o.id] ?? 0);
          expect(
            new Set(ws).size,
            `${a.id}/${q.id}/${ans.id} does not discriminate`,
          ).toBeGreaterThan(1);
        }
      }
    },
  );
});
