import { useMemo, useState } from "react";
import { TRACKS, cardsOf, getLesson, getTrack } from "../../content";
import type { Flashcard } from "../../content/types";
import { navigate } from "../../lib/router";
import { buildSession, summarise } from "../../lib/srs";
import { useProgress } from "../../state/progressStore";
import { Markdown } from "../common/Markdown";
import { Button, Card, Link, PageHeader, StackPill } from "../common/ui";

const SESSION_SIZE = 15;

export function DrillView({ trackId }: { trackId?: string }) {
  const track = trackId ? getTrack(trackId) : undefined;
  const cards = useMemo(() => cardsOf(track?.id), [track]);
  const states = useProgress((s) => s.cards);
  const now = Date.now();
  const deck = summarise(
    cards.map((c) => c.id),
    states,
    now,
  );
  const [sessionKey, setSessionKey] = useState(0);
  const [queue, setQueue] = useState<string[] | null>(null);

  const start = () => {
    setQueue(
      buildSession(
        cards.map((c) => c.id),
        useProgress.getState().cards,
        Date.now(),
        SESSION_SIZE,
      ),
    );
    setSessionKey((k) => k + 1);
  };

  if (queue) {
    return (
      <Session
        key={sessionKey}
        cards={cards}
        initialQueue={queue}
        scopeLabel={track?.title ?? "All tracks"}
        onDone={() => setQueue(null)}
      />
    );
  }

  const ready = deck.due + deck.fresh;

  return (
    <div>
      <PageHeader
        eyebrow="Drill"
        title="Flashcards"
        lede="Short recall practice with spaced repetition. Cards you miss come back today; cards you know come back later and later."
      />
      <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Scope</span>
            <span className="font-medium">{track?.title ?? "All tracks"}</span>
            {track && <StackPill stack={track.stack} />}
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Due" value={deck.due} />
            <Stat label="New" value={deck.fresh} />
            <Stat label="Mastered" value={deck.mastered} />
            <Stat label="Total" value={deck.total} />
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={start} disabled={ready === 0}>
              {ready === 0
                ? "Nothing due"
                : `Start session (${Math.min(ready, SESSION_SIZE)} cards)`}
            </Button>
            {ready === 0 && deck.total > 0 && (
              <span className="text-sm text-faint">
                Everything is scheduled for later. Come back tomorrow.
              </span>
            )}
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="eyebrow mb-2">Choose a scope</h2>
          <ul className="flex flex-col gap-1 text-sm">
            <li>
              <ScopeLink
                active={!track}
                label="All tracks"
                count={cardsOf().length}
              />
            </li>
            {TRACKS.map((t) => (
              <li key={t.id}>
                <ScopeLink
                  active={track?.id === t.id}
                  label={t.title}
                  count={cardsOf(t.id).length}
                  trackId={t.id}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ScopeLink({
  active,
  label,
  count,
  trackId,
}: {
  active: boolean;
  label: string;
  count: number;
  trackId?: string;
}) {
  return (
    <Link
      to={{ name: "drill", trackId }}
      className={`flex items-center justify-between rounded-md px-2 py-1.5 ${active ? "bg-accent-soft font-medium" : "hover:bg-sunken"}`}
    >
      <span>{label}</span>
      <span className="tabular text-xs text-faint">{count}</span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-dim">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  );
}

function Session({
  cards,
  initialQueue,
  scopeLabel,
  onDone,
}: {
  cards: Flashcard[];
  initialQueue: string[];
  scopeLabel: string;
  onDone: () => void;
}) {
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const reviewCard = useProgress((s) => s.reviewCard);
  const [queue, setQueue] = useState(initialQueue);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ known: 0, missed: 0 });
  const total = initialQueue.length;
  const answered = stats.known + stats.missed;

  const current = queue[0] ? byId.get(queue[0]) : undefined;

  const answer = (known: boolean) => {
    if (!current) return;
    reviewCard(current.id, known);
    setStats((s) =>
      known ? { ...s, known: s.known + 1 } : { ...s, missed: s.missed + 1 },
    );
    setRevealed(false);
    // A missed card goes to the back of the queue so it is seen again this session.
    setQueue((q) => (known ? q.slice(1) : [...q.slice(1), current.id]));
  };

  if (!current) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader eyebrow="Drill" title="Session complete" />
        <Card className="flex flex-col gap-4 p-5">
          <dl className="grid grid-cols-3 gap-3">
            <Stat label="Cards" value={total} />
            <Stat label="Known" value={stats.known} />
            <Stat label="Missed" value={stats.missed} />
          </dl>
          <p className="text-sm text-dim">
            Missed cards are back in box 0 and due again today. Known cards come
            back in one to thirty days depending on how often you have got them
            right.
          </p>
          <div className="flex gap-2">
            <Button onClick={onDone}>Back to drill</Button>
            <Button variant="ghost" onClick={() => navigate({ name: "home" })}>
              Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const lesson = current.lessonId ? getLesson(current.lessonId) : undefined;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="eyebrow">
          {scopeLabel} · {answered} answered · {queue.length} left
        </span>
        <Button variant="ghost" onClick={onDone}>
          End session
        </Button>
      </div>
      <Card className="flex min-h-[18rem] flex-col p-6">
        <div className="eyebrow mb-3">Question</div>
        <p className="text-lg font-medium leading-snug">{current.front}</p>
        {revealed ? (
          <div className="mt-5 border-t border-line pt-4">
            <div className="eyebrow mb-2">Answer</div>
            <Markdown source={current.back} />
            {lesson && (
              <p className="mt-3 text-xs text-faint">
                From{" "}
                <Link
                  to={{ name: "lesson", lessonId: lesson.id }}
                  className="text-accent hover:underline"
                >
                  {lesson.title}
                </Link>
              </p>
            )}
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {revealed ? (
            <>
              <Button variant="secondary" onClick={() => answer(false)}>
                Did not know
              </Button>
              <Button onClick={() => answer(true)}>Knew it</Button>
            </>
          ) : (
            <Button onClick={() => setRevealed(true)}>Show answer</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
