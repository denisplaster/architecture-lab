import { LEVEL_LABEL, SCENARIOS } from "../../content";
import { gradeFor } from "../../lib/scoring";
import { useProgress } from "../../state/progressStore";
import { LevelPill, Link, PageHeader, StackPill } from "../common/ui";

export function DecideView() {
  const results = useProgress((s) => s.scenarioResults);
  const byLevel = [1, 2, 3] as const;
  return (
    <div>
      <PageHeader
        eyebrow="Decide"
        title="Scenarios"
        lede="A real-feeling situation with numbers, a team and a deadline. Choose the architecture; the feedback tells you what fits here and what would be fashionable but wrong."
      />
      <div className="flex flex-col gap-8">
        {byLevel.map((level) => {
          const list = SCENARIOS.filter((s) => s.level === level);
          if (!list.length) return null;
          return (
            <section key={level}>
              <h2 className="eyebrow mb-3">{LEVEL_LABEL[level]}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {list.map((s) => {
                  const r = results[s.id];
                  const grade = r ? gradeFor(r.pct) : null;
                  return (
                    <li key={s.id}>
                      <Link
                        to={{ name: "scenario", scenarioId: s.id }}
                        className="flex h-full flex-col gap-2 rounded-lg border border-line bg-elev p-4 hover:border-line-strong"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {s.stacks.map((st) => (
                            <StackPill key={st} stack={st} />
                          ))}
                          <span className="ml-auto">
                            <LevelPill level={s.level} />
                          </span>
                        </div>
                        <h3 className="font-semibold">{s.title}</h3>
                        <p className="line-clamp-2 text-sm text-dim">
                          {s.constraints[0]}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-1 text-xs">
                          <span className="text-faint">
                            {s.decisions.length} decisions
                          </span>
                          {r && grade && (
                            <span
                              className={`tabular rounded-full px-2 py-0.5 ${
                                grade === "strong"
                                  ? "bg-good-soft text-good"
                                  : grade === "solid"
                                    ? "bg-accent-soft text-fg"
                                    : "bg-warn-soft text-warn"
                              }`}
                            >
                              best {r.pct}%
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
