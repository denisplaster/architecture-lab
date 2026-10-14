import { TRACKS, lessonsOf } from "../../content";
import { useProgress } from "../../state/progressStore";
import { Check, LevelPill, Link, PageHeader, StackPill } from "../common/ui";

export function LearnView() {
  const lessonsCompleted = useProgress((s) => s.lessonsCompleted);
  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="Lessons by track"
        lede="Each lesson explains one architectural choice, when it fits, when it does not, and how it looks on the Microsoft stack and in React."
      />
      <div className="flex flex-col gap-8">
        {TRACKS.map((t) => {
          const lessons = lessonsOf(t);
          const done = lessons.filter((l) => lessonsCompleted[l.id]).length;
          return (
            <section key={t.id}>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <StackPill stack={t.stack} />
                <h2 className="text-lg font-semibold">
                  <Link
                    to={{ name: "track", trackId: t.id }}
                    className="hover:underline"
                  >
                    {t.title}
                  </Link>
                </h2>
                <span className="tabular text-xs text-faint">
                  {done}/{lessons.length} done
                </span>
              </div>
              <p className="mb-3 max-w-[70ch] text-sm text-dim">{t.summary}</p>
              <ol className="divide-y divide-line rounded-lg border border-line bg-elev">
                {lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={{ name: "lesson", lessonId: l.id }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-sunken"
                    >
                      <Check done={!!lessonsCompleted[l.id]} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{l.title}</div>
                        <div className="truncate text-sm text-dim">
                          {l.tagline}
                        </div>
                      </div>
                      <div className="hidden shrink-0 items-center gap-3 sm:flex">
                        <LevelPill level={l.level} />
                        <span className="tabular w-12 text-right text-xs text-faint">
                          {l.minutes} min
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
