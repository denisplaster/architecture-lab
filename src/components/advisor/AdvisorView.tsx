import { useMemo, useState } from "react";
import { getAdvisor, getLesson } from "../../content";
import { answeredCount, rankAdvisor } from "../../lib/scoring";
import { Button, Card, Empty, Link, PageHeader } from "../common/ui";

export function AdvisorView({ advisorId }: { advisorId: string }) {
  const advisor = getAdvisor(advisorId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);
  const ranked = useMemo(
    () => (advisor ? rankAdvisor(advisor, answers) : []),
    [advisor, answers],
  );
  if (!advisor) return <Empty>That advisor does not exist.</Empty>;

  const n = answeredCount(advisor, answers);
  const total = advisor.questions.length;
  const top = ranked[0];
  const runnerUp = ranked[1];
  const close = top && runnerUp && top.score - runnerUp.score <= 1;

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to={{ name: "advisors" }} className="hover:underline">
            Advise
          </Link>
        }
        title={advisor.title}
        lede={advisor.intro}
        actions={
          n > 0 ? (
            <Button variant="ghost" onClick={() => setAnswers({})}>
              Clear answers
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          {advisor.questions.map((q, i) => (
            <fieldset
              key={q.id}
              className="rounded-lg border border-line bg-elev p-4"
            >
              <legend className="px-1 font-medium">
                <span className="mr-2 font-mono text-xs text-faint">
                  {i + 1}
                </span>
                {q.prompt}
              </legend>
              {q.help && <p className="mt-1 text-sm text-dim">{q.help}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {q.answers.map((a) => {
                  const on = answers[q.id] === a.id;
                  return (
                    <label
                      key={a.id}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        on
                          ? "border-accent bg-accent-soft font-medium"
                          : "border-line hover:border-line-strong hover:bg-sunken"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`${advisor.id}-${q.id}`}
                        id={`${advisor.id}-${q.id}-${a.id}`}
                        value={a.id}
                        checked={on}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: a.id }))
                        }
                      />
                      {a.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-semibold">Ranking</h2>
              <span className="tabular text-xs text-faint">
                {n}/{total} answered
              </span>
            </div>
            {n === 0 ? (
              <p className="text-sm text-dim">
                Answer a question to see options move.
              </p>
            ) : (
              <>
                {close && (
                  <p className="mb-3 rounded-md bg-sunken px-3 py-2 text-xs text-dim">
                    The top two are within a point. Either is defensible; read
                    both lessons and decide on the reasons below.
                  </p>
                )}
                <ol className="flex flex-col gap-2">
                  {ranked.map((r, i) => {
                    const lesson = getLesson(r.option.lessonId);
                    const max = Math.max(
                      1,
                      ...ranked.map((x) => Math.abs(x.score)),
                    );
                    const w = Math.round((Math.abs(r.score) / max) * 100);
                    const isOpen = open === r.option.id;
                    return (
                      <li
                        key={r.option.id}
                        className={`rounded-md border p-3 ${i === 0 ? "border-accent" : "border-line"}`}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left"
                          onClick={() => setOpen(isOpen ? null : r.option.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="tabular w-4 font-mono text-xs text-faint">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium">
                            {r.option.label}
                          </span>
                          <span
                            className={`tabular font-mono text-xs ${r.score > 0 ? "text-good" : r.score < 0 ? "text-bad" : "text-faint"}`}
                          >
                            {r.score > 0 ? "+" : ""}
                            {r.score}
                          </span>
                        </button>
                        <div className="mt-2 h-1 w-full rounded-full bg-sunken">
                          <div
                            className={`h-full rounded-full ${r.score >= 0 ? "bg-accent" : "bg-bad"}`}
                            style={{ width: `${w}%` }}
                          />
                        </div>
                        {isOpen && (
                          <div className="mt-3 flex flex-col gap-2 text-xs">
                            <p className="text-dim">{r.option.summary}</p>
                            {r.reasons.length > 0 && (
                              <ul className="flex flex-col gap-1">
                                {r.reasons.slice(0, 5).map((reason, j) => (
                                  <li key={j} className="flex gap-2">
                                    <span
                                      className={`tabular w-6 shrink-0 font-mono ${reason.delta > 0 ? "text-good" : "text-bad"}`}
                                    >
                                      {reason.delta > 0 ? "+" : ""}
                                      {reason.delta}
                                    </span>
                                    <span className="text-dim">
                                      {reason.answer}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {lesson && (
                              <Link
                                to={{ name: "lesson", lessonId: lesson.id }}
                                className="text-accent hover:underline"
                              >
                                Read: {lesson.title}
                              </Link>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
