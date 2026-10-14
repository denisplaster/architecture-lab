import { useMemo, useState } from "react";
import { LESSONS, TRACKS, getLesson } from "../../content";
import {
  QUALITY_ATTRIBUTES,
  type Lesson,
  type QualityAttribute,
} from "../../content/types";
import { Link, PageHeader } from "../common/ui";
import { EffectBar } from "../learn/LessonView";

const DEFAULTS = [
  "modular-monolith",
  "microservices",
  "serverless-durable-functions",
];
const SLOTS = [0, 1, 2] as const;

export function CompareView() {
  const comparable = useMemo(
    () => LESSONS.filter((l) => l.tradeoffs.length > 0),
    [],
  );
  const [picked, setPicked] = useState<(string | "")[]>(() =>
    SLOTS.map((i) =>
      comparable.some((l) => l.id === DEFAULTS[i]) ? DEFAULTS[i] : "",
    ),
  );
  const [openRow, setOpenRow] = useState<QualityAttribute | null>(null);
  const lessons = picked.map((id) => (id ? getLesson(id) : undefined));
  const shown = lessons.filter((l): l is Lesson => !!l);

  const effectOf = (l: Lesson, attr: QualityAttribute) =>
    l.tradeoffs.find((t) => t.attribute === attr);

  return (
    <div>
      <PageHeader
        eyebrow="Compare"
        title="Trade-offs side by side"
        lede="Pick up to three options and see how each scores on the same quality attributes. Click a row to read the reasoning."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {SLOTS.map((i) => (
          <label key={i} className="flex flex-col gap-1 text-sm">
            <span className="eyebrow">Option {i + 1}</span>
            <select
              id={`compare-slot-${i}`}
              value={picked[i]}
              onChange={(e) =>
                setPicked((p) =>
                  p.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
              className="rounded-md border border-line-strong bg-elev px-2 py-2"
            >
              <option value="">None</option>
              {TRACKS.map((t) => (
                <optgroup key={t.id} label={t.title}>
                  {t.lessonIds
                    .map((id) => comparable.find((l) => l.id === id))
                    .filter((l): l is Lesson => !!l)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-dim">Choose at least one option above.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-elev">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="eyebrow px-4 py-3 font-normal">Attribute</th>
                {shown.map((l) => (
                  <th key={l.id} className="px-4 py-3 font-semibold">
                    <Link
                      to={{ name: "lesson", lessonId: l.id }}
                      className="hover:underline"
                    >
                      {l.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUALITY_ATTRIBUTES.filter((attr) =>
                shown.some((l) => effectOf(l, attr)),
              ).map((attr) => {
                const isOpen = openRow === attr;
                return (
                  <tr
                    key={attr}
                    className="cursor-pointer border-b border-line align-top last:border-b-0 hover:bg-sunken/60"
                    onClick={() => setOpenRow(isOpen ? null : attr)}
                  >
                    <td className="px-4 py-3 font-mono text-[0.78rem]">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        className="text-left"
                      >
                        {attr.replaceAll("-", " ")}
                      </button>
                    </td>
                    {shown.map((l) => {
                      const t = effectOf(l, attr);
                      return (
                        <td key={l.id} className="px-4 py-3">
                          {t ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-24 shrink-0 sm:w-28">
                                  <EffectBar effect={t.effect} />
                                </span>
                                <span className="tabular font-mono text-xs text-dim">
                                  {t.effect > 0 ? "+" : ""}
                                  {t.effect}
                                </span>
                              </div>
                              {isOpen && (
                                <span className="text-xs text-dim">
                                  {t.note}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-faint">
                              not rated
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
