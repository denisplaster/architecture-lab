import { useEffect } from "react";
import { LEVEL_LABEL, getLesson, getTrack, nextLesson } from "../../content";
import type { Tradeoff } from "../../content/types";
import { navigate } from "../../lib/router";
import { useProgress } from "../../state/progressStore";
import { Markdown } from "../common/Markdown";
import { Button, Empty, Link, LinkButton, StackPill } from "../common/ui";
import { Diagram } from "../diagram/Diagram";
import { Quiz } from "./Quiz";

export function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const openLesson = useProgress((s) => s.openLesson);
  const completeLesson = useProgress((s) => s.completeLesson);
  const uncompleteLesson = useProgress((s) => s.uncompleteLesson);
  const completedAt = useProgress((s) => s.lessonsCompleted[lessonId]);

  useEffect(() => {
    if (lesson) openLesson(lesson.id);
  }, [lesson, openLesson]);

  if (!lesson) return <Empty>That lesson does not exist.</Empty>;
  const track = getTrack(lesson.trackId);
  const next = nextLesson(lesson.id);

  return (
    <article className="flex flex-col gap-10">
      <header>
        <div className="eyebrow mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {track && (
            <Link
              to={{ name: "track", trackId: track.id }}
              className="hover:underline"
            >
              {track.title}
            </Link>
          )}
          <span>·</span>
          <span>{LEVEL_LABEL[lesson.level]}</span>
          <span>·</span>
          <span>{lesson.minutes} min</span>
          {track && <StackPill stack={track.stack} />}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-[60ch] text-lg text-dim">{lesson.tagline}</p>
        <p className="mt-5 max-w-[68ch] border-l-2 border-accent pl-4 text-[1.02rem] leading-relaxed">
          {lesson.summary}
        </p>
      </header>

      {lesson.diagram && <Diagram diagram={lesson.diagram} id={lesson.id} />}

      <div className="flex flex-col gap-8">
        {lesson.sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-2.5 text-xl font-semibold">{s.heading}</h2>
            <Markdown source={s.body} />
          </section>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <SignalList
          title="Reach for it when"
          items={lesson.useWhen}
          tone="good"
        />
        <SignalList
          title="Think twice when"
          items={lesson.avoidWhen}
          tone="warn"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <StackList
          title="On the Microsoft stack"
          items={lesson.microsoftStack}
        />
        {lesson.reactStack && lesson.reactStack.length > 0 && (
          <StackList title="On the React side" items={lesson.reactStack} />
        )}
      </section>

      <section>
        <h2 className="mb-1 text-xl font-semibold">Trade-offs</h2>
        <p className="mb-3 text-sm text-dim">
          Compared with the plain alternative. Right is better.
        </p>
        <TradeoffList tradeoffs={lesson.tradeoffs} />
      </section>

      {lesson.related.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-semibold">Read next</h2>
          <div className="flex flex-wrap gap-2">
            {lesson.related.map((id) => {
              const r = getLesson(id);
              return r ? (
                <Link
                  key={id}
                  to={{ name: "lesson", lessonId: id }}
                  className="rounded-full border border-line bg-elev px-3 py-1 text-sm hover:border-line-strong"
                >
                  {r.title}
                </Link>
              ) : null;
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-xl font-semibold">Check yourself</h2>
        <p className="mb-3 text-sm text-dim">
          Pick an answer; the explanation appears straight away.
        </p>
        <Quiz questions={lesson.checks} />
      </section>

      {lesson.sources && lesson.sources.length > 0 && (
        <section>
          <h2 className="mb-2 text-base font-semibold">Sources</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lesson.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {completedAt ? (
          <>
            <span className="text-sm text-good">Completed</span>
            <Button variant="ghost" onClick={() => uncompleteLesson(lesson.id)}>
              Mark as not done
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              completeLesson(lesson.id);
            }}
          >
            Mark complete
          </Button>
        )}
        <span className="flex-1" />
        {next ? (
          <LinkButton
            to={{ name: "lesson", lessonId: next.id }}
            variant="secondary"
          >
            Next: {next.title}
          </LinkButton>
        ) : track ? (
          <Button
            variant="secondary"
            onClick={() => navigate({ name: "track", trackId: track.id })}
          >
            Back to {track.title}
          </Button>
        ) : null}
      </footer>
    </article>
  );
}

function SignalList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${tone === "good" ? "border-good/40 bg-good-soft/40" : "border-warn/40 bg-warn-soft/40"}`}
    >
      <h3
        className={`mb-2 text-sm font-semibold ${tone === "good" ? "text-good" : "text-warn"}`}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span
              aria-hidden
              className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60"
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackList({
  title,
  items,
}: {
  title: string;
  items: { name: string; role: string }[];
}) {
  return (
    <div>
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <dl className="divide-y divide-line rounded-lg border border-line bg-elev">
        {items.map((it) => (
          <div key={it.name} className="px-4 py-2.5">
            <dt className="font-mono text-[0.8rem] font-medium">{it.name}</dt>
            <dd className="mt-0.5 text-sm text-dim">
              <Markdown source={it.role} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function TradeoffList({ tradeoffs }: { tradeoffs: Tradeoff[] }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-elev">
      {tradeoffs.map((t) => (
        <li
          key={t.attribute}
          className="grid grid-cols-[7.5rem_5rem_1fr] items-center gap-3 px-4 py-2 sm:grid-cols-[9rem_6rem_1fr]"
        >
          <span className="font-mono text-[0.78rem]">
            {t.attribute.replaceAll("-", " ")}
          </span>
          <EffectBar effect={t.effect} />
          <span className="text-sm text-dim">{t.note}</span>
        </li>
      ))}
    </ul>
  );
}

export function EffectBar({ effect }: { effect: number }) {
  const w = Math.abs(effect) * 25; // percent of half width
  const color = effect > 0 ? "bg-good" : effect < 0 ? "bg-bad" : "bg-faint";
  return (
    <span
      className="relative block h-2 w-full rounded-full bg-sunken"
      aria-label={`effect ${effect > 0 ? "+" : ""}${effect}`}
    >
      <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
      {effect !== 0 ? (
        <span
          className={`absolute inset-y-0 rounded-full ${color}`}
          style={
            effect > 0
              ? { left: "50%", width: `${w}%` }
              : { right: "50%", width: `${w}%` }
          }
        />
      ) : (
        <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-faint" />
      )}
    </span>
  );
}
