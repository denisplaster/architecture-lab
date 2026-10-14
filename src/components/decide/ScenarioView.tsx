import { useMemo, useState } from "react";
import { getLesson, getScenario } from "../../content";
import { scoreScenario } from "../../lib/scoring";
import { useProgress } from "../../state/progressStore";
import { Markdown } from "../common/Markdown";
import {
  Button,
  Empty,
  LevelPill,
  Link,
  PageHeader,
  StackPill,
} from "../common/ui";

export function ScenarioView({ scenarioId }: { scenarioId: string }) {
  const scenario = getScenario(scenarioId);
  const recordScenario = useProgress((s) => s.recordScenario);
  const best = useProgress((s) => s.scenarioResults[scenarioId]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => (scenario ? scoreScenario(scenario, picks) : null),
    [scenario, picks],
  );
  if (!scenario || !result) return <Empty>That scenario does not exist.</Empty>;

  const allAnswered = scenario.decisions.every((d) => picks[d.id]);

  const submit = () => {
    setSubmitted(true);
    recordScenario(scenario.id, result.pct, picks);
    document
      .getElementById("debrief")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const retry = () => {
    setPicks({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Link to={{ name: "decide" }} className="hover:underline">
              Decide
            </Link>
            <span>/</span>
            {scenario.stacks.map((st) => (
              <StackPill key={st} stack={st} />
            ))}
            <LevelPill level={scenario.level} />
          </span>
        }
        title={scenario.title}
        actions={
          best ? (
            <span className="tabular text-sm text-dim">
              Best so far: {best.pct}%
            </span>
          ) : undefined
        }
      />

      <section className="grid gap-5 md:grid-cols-[1fr_17rem]">
        <div>
          <h2 className="eyebrow mb-2">The situation</h2>
          <Markdown source={scenario.situation} className="text-[1.02rem]" />
        </div>
        <aside className="h-fit rounded-lg border border-line bg-elev p-4">
          <h2 className="eyebrow mb-2">Hard facts</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {scenario.constraints.map((c, i) => {
              const [label, ...rest] = c.split(":");
              const hasLabel = rest.length > 0;
              return (
                <li key={i}>
                  {hasLabel ? (
                    <>
                      <span className="font-mono text-[0.72rem] uppercase tracking-wider text-faint">
                        {label}
                      </span>
                      <div>{rest.join(":").trim()}</div>
                    </>
                  ) : (
                    c
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="eyebrow">Your decisions</h2>
        {scenario.decisions.map((d, i) => {
          const per = result.perDecision[i];
          return (
            <fieldset
              key={d.id}
              className="rounded-lg border border-line bg-elev p-4"
            >
              <legend className="px-1 font-medium">
                <span className="mr-2 font-mono text-xs text-faint">
                  {i + 1}
                </span>
                {d.prompt}
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {d.options.map((o) => {
                  const checked = picks[d.id] === o.id;
                  let look = checked
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-line-strong hover:bg-sunken";
                  if (submitted) {
                    if (o.score === 3) look = "border-good bg-good-soft";
                    else if (checked)
                      look =
                        o.score >= 2
                          ? "border-warn bg-warn-soft"
                          : "border-bad bg-bad-soft";
                    else look = "border-line opacity-70";
                  }
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer flex-col gap-1 rounded-md border px-3 py-2 text-sm transition-colors ${look}`}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={`${scenario.id}-${d.id}`}
                          id={`${scenario.id}-${d.id}-${o.id}`}
                          value={o.id}
                          checked={checked}
                          disabled={submitted}
                          onChange={() =>
                            setPicks((p) => ({ ...p, [d.id]: o.id }))
                          }
                          className="mt-1 accent-[var(--accent)]"
                        />
                        <span className="flex-1">{o.label}</span>
                        {submitted && (checked || o.score === 3) && (
                          <span className="tabular shrink-0 font-mono text-xs text-dim">
                            {o.score}/3
                          </span>
                        )}
                      </span>
                      {submitted && (checked || o.score === 3) && (
                        <span className="pl-7 text-dim">
                          <span className="mr-1 font-medium text-fg">
                            {o.score === 3
                              ? "Best fit."
                              : checked
                                ? o.score >= 2
                                  ? "Defensible."
                                  : "Weak here."
                                : ""}
                          </span>
                          {o.feedback}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {submitted && per.picked && per.picked.score !== 3 && (
                <p className="mt-3 text-sm text-dim">
                  You picked{" "}
                  <strong className="text-fg">{per.picked.label}</strong>; the
                  best fit was{" "}
                  <strong className="text-fg">{per.best.label}</strong>.
                </p>
              )}
            </fieldset>
          );
        })}
        {!submitted && (
          <div className="flex items-center gap-3">
            <Button onClick={submit} disabled={!allAnswered}>
              Check my decisions
            </Button>
            {!allAnswered && (
              <span className="text-sm text-faint">
                Answer every decision first.
              </span>
            )}
          </div>
        )}
      </section>

      {submitted && (
        <section
          id="debrief"
          className="scroll-mt-6 rounded-lg border border-line bg-elev p-5"
        >
          <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-xl font-semibold">Debrief</h2>
            <span className="tabular text-sm text-dim">
              {result.score} of {result.max} points ·{" "}
              <span
                className={
                  result.grade === "strong"
                    ? "text-good"
                    : result.grade === "solid"
                      ? "text-fg"
                      : "text-warn"
                }
              >
                {result.grade === "strong"
                  ? "Strong judgement"
                  : result.grade === "solid"
                    ? "Solid, with gaps"
                    : "Worth revisiting"}
              </span>
            </span>
          </div>
          <Markdown source={scenario.debrief} />
          {scenario.relatedLessons.length > 0 && (
            <div className="mt-4">
              <h3 className="eyebrow mb-2">Lessons behind this call</h3>
              <div className="flex flex-wrap gap-2">
                {scenario.relatedLessons.map((id) => {
                  const l = getLesson(id);
                  return l ? (
                    <Link
                      key={id}
                      to={{ name: "lesson", lessonId: id }}
                      className="rounded-full border border-line bg-bg px-3 py-1 text-sm hover:border-line-strong"
                    >
                      {l.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
            <Link
              to={{ name: "decide" }}
              className="inline-flex items-center px-3 text-sm text-accent hover:underline"
            >
              More scenarios
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
