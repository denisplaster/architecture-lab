import { cardsOf, getTrack, lessonsOf } from "../../content";
import { useProgress } from "../../state/progressStore";
import {
  Check,
  Empty,
  LevelPill,
  Link,
  LinkButton,
  PageHeader,
  ProgressBar,
  StackPill,
} from "../common/ui";

export function TrackView({ trackId }: { trackId: string }) {
  const track = getTrack(trackId);
  const lessonsCompleted = useProgress((s) => s.lessonsCompleted);
  if (!track) return <Empty>That track does not exist.</Empty>;
  const lessons = lessonsOf(track);
  const done = lessons.filter((l) => lessonsCompleted[l.id]).length;
  const next = lessons.find((l) => !lessonsCompleted[l.id]);
  const cardCount = cardsOf(track.id).length;

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <Link to={{ name: "learn" }} className="hover:underline">
              Learn
            </Link>
            <span>/</span>
            <StackPill stack={track.stack} />
          </span>
        }
        title={track.title}
        lede={track.summary}
        actions={
          <>
            {next && (
              <LinkButton to={{ name: "lesson", lessonId: next.id }}>
                {done ? "Continue" : "Start"}
              </LinkButton>
            )}
            {cardCount > 0 && (
              <LinkButton
                to={{ name: "drill", trackId: track.id }}
                variant="secondary"
              >
                Drill {cardCount} cards
              </LinkButton>
            )}
          </>
        }
      />
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar
          value={done}
          max={lessons.length}
          tone={done === lessons.length ? "good" : "accent"}
        />
        <span className="tabular shrink-0 text-xs text-faint">
          {done}/{lessons.length}
        </span>
      </div>
      <ol className="divide-y divide-line rounded-lg border border-line bg-elev">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <Link
              to={{ name: "lesson", lessonId: l.id }}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-sunken"
            >
              <span className="tabular mt-0.5 w-5 shrink-0 font-mono text-xs text-faint">
                {i + 1}
              </span>
              <Check done={!!lessonsCompleted[l.id]} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{l.title}</div>
                <div className="text-sm text-dim">{l.tagline}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <LevelPill level={l.level} />
                  <span className="text-xs text-faint">{l.minutes} min</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
