import { useMemo } from "react";
import { parseMarkdown, type Inline } from "../../lib/markdown";

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.type === "strong" ? (
          <strong key={i}>{p.text}</strong>
        ) : p.type === "code" ? (
          <code key={i}>{p.text}</code>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export function Markdown({
  source,
  className = "",
}: {
  source: string;
  className?: string;
}) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return (
    <div className={`prose ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === "p")
          return (
            <p key={i}>
              <Inlines parts={b.inlines} />
            </p>
          );
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j}>
                  <Inlines parts={item} />
                </li>
              ))}
            </ul>
          );
        return (
          <pre key={i} data-lang={b.lang}>
            <code>{b.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
