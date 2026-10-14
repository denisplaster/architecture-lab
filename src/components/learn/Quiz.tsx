import { useState } from "react";
import type { CheckQuestion } from "../../content/types";
import { useProgress } from "../../state/progressStore";

export function Quiz({ questions }: { questions: CheckQuestion[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <li key={q.id}>
          <Question q={q} index={i + 1} />
        </li>
      ))}
    </ol>
  );
}

function Question({ q, index }: { q: CheckQuestion; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const recordCheck = useProgress((s) => s.recordCheck);
  const previous = useProgress((s) => s.checkResults[q.id]);
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    recordCheck(q.id, i === q.answer);
  };

  return (
    <div className="rounded-lg border border-line bg-elev p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="tabular mt-0.5 font-mono text-xs text-faint">
          {index}
        </span>
        <p className="font-medium">{q.prompt}</p>
        {previous && !answered && (
          <span
            className={`ml-auto shrink-0 text-xs ${previous.correct ? "text-good" : "text-warn"}`}
          >
            {previous.correct ? "Got it last time" : "Missed last time"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2" role="group" aria-label={q.prompt}>
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          let look = "border-line hover:border-line-strong hover:bg-sunken";
          if (answered) {
            if (isAnswer) look = "border-good bg-good-soft";
            else if (isPicked) look = "border-bad bg-bad-soft";
            else look = "border-line opacity-60";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              aria-pressed={isPicked}
              className={`flex items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${look}`}
            >
              <span className="mt-0.5 font-mono text-xs text-faint">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 flex items-start gap-2 text-sm">
          <span
            className={`shrink-0 font-medium ${picked === q.answer ? "text-good" : "text-bad"}`}
          >
            {picked === q.answer ? "Right." : "Not quite."}
          </span>
          <span className="text-dim">{q.explanation}</span>
        </div>
      )}
    </div>
  );
}
