import { useState } from "react";
import {
  FLASHCARDS,
  LESSONS,
  SCENARIOS,
  TRACKS,
  getLesson,
  lessonsOf,
} from "../../content";
import { gradeFor } from "../../lib/scoring";
import { summarise } from "../../lib/srs";
import { computeStreak, useProgress } from "../../state/progressStore";
import {
  Button,
  Card,
  Link,
  PageHeader,
  ProgressBar,
  StackPill,
} from "../common/ui";

export function ProgressView() {
  const lessonsCompleted = useProgress((s) => s.lessonsCompleted);
  const checkResults = useProgress((s) => s.checkResults);
  const scenarioResults = useProgress((s) => s.scenarioResults);
  const cards = useProgress((s) => s.cards);
  const activity = useProgress((s) => s.activity);
  const resetAll = useProgress((s) => s.resetAll);
  const [confirming, setConfirming] = useState(false);

  const now = Date.now();
  const done = LESSONS.filter((l) => lessonsCompleted[l.id]).length;
  const overall = Math.round((done / LESSONS.length) * 100);
  const deck = summarise(
    FLASHCARDS.map((c) => c.id),
    cards,
    now,
  );
  const scenariosDone = Object.keys(scenarioResults).filter((id) =>
    SCENARIOS.some((s) => s.id === id),
  );
  const strong = scenariosDone.filter(
    (id) => gradeFor(scenarioResults[id].pct) === "strong",
  ).length;
  const streak = computeStreak(activity, now);

  // Weak spots: lessons whose checks were missed most recently, or scenarios below "solid".
  const missedByLesson = new Map<string, number>();
  for (const l of LESSONS) {
    const misses = l.checks.filter(
      (c) => checkResults[c.id] && !checkResults[c.id].correct,
    ).length;
    if (misses) missedByLesson.set(l.id, misses);
  }
  const weakScenarios = SCENARIOS.filter(
    (s) =>
      scenarioResults[s.id] &&
      gradeFor(scenarioResults[s.id].pct) === "revisit",
  );
  const lapsed = Object.entries(cards)
    .filter(([, st]) => st.lapses >= 2)
    .map(([id]) => FLASHCARDS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Progress"
        title="Where you are"
        lede="Everything here is stored in this browser only."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="px-4 py-3 sm:col-span-2 lg:col-span-1">
          <div className="text-xs text-dim">Lessons completed</div>
          <div className="mt-0.5 text-[2.6rem] font-semibold leading-none">
            {overall}%
          </div>
          <div className="mt-2">
            <ProgressBar value={done} max={LESSONS.length} />
          </div>
          <div className="tabular mt-1 text-xs text-faint">
            {done} of {LESSONS.length}
          </div>
        </Card>
        <Tile
          label="Scenarios decided"
          value={`${scenariosDone.length} / ${SCENARIOS.length}`}
          hint={`${strong} strong`}
        />
        <Tile
          label="Cards mastered"
          value={`${deck.mastered} / ${deck.total}`}
          hint={`${deck.due + deck.fresh} ready now`}
        />
        <Tile
          label="Day streak"
          value={String(streak)}
          hint={streak ? "keep it going" : "do one thing today"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">By track</h2>
        <ul className="divide-y divide-line rounded-lg border border-line bg-elev">
          {TRACKS.map((t) => {
            const lessons = lessonsOf(t);
            const d = lessons.filter((l) => lessonsCompleted[l.id]).length;
            const trackCards = FLASHCARDS.filter((c) => c.trackId === t.id).map(
              (c) => c.id,
            );
            const td = summarise(trackCards, cards, now);
            return (
              <li
                key={t.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[14rem_1fr_auto_auto]"
              >
                <div className="flex items-center gap-2">
                  <StackPill stack={t.stack} />
                  <Link
                    to={{ name: "track", trackId: t.id }}
                    className="font-medium hover:underline"
                  >
                    {t.title}
                  </Link>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <ProgressBar
                    value={d}
                    max={lessons.length}
                    tone={d === lessons.length && d > 0 ? "good" : "accent"}
                  />
                </div>
                <span className="tabular text-xs text-faint">
                  {d}/{lessons.length} lessons
                </span>
                <span className="tabular text-xs text-faint">
                  {td.mastered}/{td.total} cards
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Worth another look</h2>
          {missedByLesson.size === 0 && weakScenarios.length === 0 ? (
            <p className="text-sm text-dim">
              No missed checks or weak scenarios yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {Array.from(missedByLesson.entries()).map(([id, n]) => {
                const l = getLesson(id);
                return l ? (
                  <li key={id} className="flex justify-between gap-2">
                    <Link
                      to={{ name: "lesson", lessonId: id }}
                      className="hover:underline"
                    >
                      {l.title}
                    </Link>
                    <span className="tabular shrink-0 text-xs text-warn">
                      {n} check{n > 1 ? "s" : ""} missed
                    </span>
                  </li>
                ) : null;
              })}
              {weakScenarios.map((s) => (
                <li key={s.id} className="flex justify-between gap-2">
                  <Link
                    to={{ name: "scenario", scenarioId: s.id }}
                    className="hover:underline"
                  >
                    {s.title}
                  </Link>
                  <span className="tabular shrink-0 text-xs text-warn">
                    {scenarioResults[s.id].pct}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Cards that keep slipping</h2>
          {lapsed.length === 0 ? (
            <p className="text-sm text-dim">
              Nothing has been missed twice yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {lapsed.map((c) => (
                <li key={c.id} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">{c.front}</span>
                  <span className="tabular shrink-0 text-xs text-faint">
                    {cards[c.id].lapses} misses
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        {confirming ? (
          <>
            <span className="text-sm text-dim">
              Erase all progress in this browser?
            </span>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirming(false);
              }}
            >
              Yes, erase
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            Reset progress
          </Button>
        )}
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="px-4 py-3">
      <div className="text-xs text-dim">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </Card>
  );
}
