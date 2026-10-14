import {
  FLASHCARDS,
  LESSONS,
  SCENARIOS,
  TRACKS,
  getLesson,
  lessonsOf,
} from "../../content";
import { summarise } from "../../lib/srs";
import { computeStreak, useProgress } from "../../state/progressStore";
import { Card, Link, LinkButton, ProgressBar, StackPill } from "../common/ui";

export function HomeView() {
  const lessonsCompleted = useProgress((s) => s.lessonsCompleted);
  const scenarioResults = useProgress((s) => s.scenarioResults);
  const cards = useProgress((s) => s.cards);
  const activity = useProgress((s) => s.activity);
  const lastLessonId = useProgress((s) => s.lastLessonId);

  const now = Date.now();
  const doneCount = LESSONS.filter((l) => lessonsCompleted[l.id]).length;
  const deck = summarise(
    FLASHCARDS.map((c) => c.id),
    cards,
    now,
  );
  const scenariosDone = SCENARIOS.filter((s) => scenarioResults[s.id]).length;
  const streak = computeStreak(activity, now);

  const resume =
    (lastLessonId && getLesson(lastLessonId)) ||
    LESSONS.find((l) => !lessonsCompleted[l.id]) ||
    LESSONS[0];
  const resumeDone = !!lessonsCompleted[resume.id];
  const nextScenario =
    SCENARIOS.find((s) => !scenarioResults[s.id]) ?? SCENARIOS[0];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="eyebrow mb-2">Software architecture, by situation</div>
        <h1 className="max-w-[20ch] text-3xl font-semibold leading-tight sm:text-4xl">
          Learn which architecture fits which problem.
        </h1>
        <p className="mt-3 max-w-[60ch] text-dim">
          Short lessons on the .NET, Azure and React ways of building systems,
          then scenarios where you choose and get told why. Progress stays in
          this browser.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Lessons completed"
          value={`${doneCount} / ${LESSONS.length}`}
        />
        <Stat
          label="Cards due now"
          value={String(deck.due + deck.fresh)}
          hint={deck.fresh ? `${deck.fresh} new` : undefined}
        />
        <Stat
          label="Scenarios decided"
          value={`${scenariosDone} / ${SCENARIOS.length}`}
        />
        <Stat label="Day streak" value={String(streak)} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3 p-5">
          <div className="eyebrow">
            {resumeDone
              ? "Read again"
              : lastLessonId
                ? "Pick up where you left off"
                : "Start here"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{resume.title}</h2>
            <p className="mt-1 text-sm text-dim">{resume.tagline}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <LinkButton to={{ name: "lesson", lessonId: resume.id }}>
              Open lesson
            </LinkButton>
            <span className="text-xs text-faint">
              {resume.minutes} min read
            </span>
          </div>
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <div className="eyebrow">Make a call</div>
          <div>
            <h2 className="text-lg font-semibold">{nextScenario.title}</h2>
            <p className="mt-1 text-sm text-dim">
              {nextScenario.decisions.length} decisions. You pick, the lab
              explains what fits this situation and why.
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <LinkButton
              to={{ name: "scenario", scenarioId: nextScenario.id }}
              variant="secondary"
            >
              Try the scenario
            </LinkButton>
            <LinkButton to={{ name: "advisors" }} variant="ghost">
              Or ask an advisor
            </LinkButton>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <Link
            to={{ name: "learn" }}
            className="text-sm text-accent hover:underline"
          >
            All lessons
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => {
            const lessons = lessonsOf(t);
            const done = lessons.filter((l) => lessonsCompleted[l.id]).length;
            return (
              <Link
                key={t.id}
                to={{ name: "track", trackId: t.id }}
                className="flex flex-col gap-3 rounded-lg border border-line bg-elev p-4 transition-colors hover:border-line-strong"
              >
                <div className="flex items-center justify-between gap-2">
                  <StackPill stack={t.stack} />
                  <span className="tabular text-xs text-faint">
                    {done}/{lessons.length}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-dim">{t.summary}</p>
                </div>
                <ProgressBar
                  value={done}
                  max={lessons.length}
                  tone={done === lessons.length ? "good" : "accent"}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
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
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {hint && <span className="text-xs text-faint">{hint}</span>}
      </div>
    </Card>
  );
}
