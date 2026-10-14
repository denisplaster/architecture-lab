import { ADVISORS } from "../../content";
import { Link, PageHeader } from "../common/ui";

export function AdvisorsView() {
  return (
    <div>
      <PageHeader
        eyebrow="Advise"
        title="Advisors"
        lede="Describe your own situation in a few answers and get a ranked shortlist with the reasons behind it. The ranking updates as you answer."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {ADVISORS.map((a) => (
          <li key={a.id}>
            <Link
              to={{ name: "advisor", advisorId: a.id }}
              className="flex h-full flex-col gap-2 rounded-lg border border-line bg-elev p-4 hover:border-line-strong"
            >
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-dim">{a.intro}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {a.options.map((o) => (
                  <span
                    key={o.id}
                    className="rounded-full bg-sunken px-2 py-0.5 text-xs text-dim"
                  >
                    {o.label}
                  </span>
                ))}
              </div>
              <span className="text-xs text-faint">
                {a.questions.length} questions
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
