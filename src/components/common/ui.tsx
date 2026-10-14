import type { ReactNode } from "react";
import { LEVEL_LABEL, STACK_LABEL } from "../../content";
import type { Level, Stack } from "../../content/types";
import { toHash, type Route } from "../../lib/router";

/* Small, boring building blocks shared by every view. */

export function Link({
  to,
  className = "",
  children,
  ...rest
}: {
  to: Route;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a href={toHash(to)} className={className} {...rest}>
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const look = {
    primary: "bg-accent text-accent-fg hover:brightness-110",
    secondary: "bg-elev border border-line-strong text-fg hover:bg-sunken",
    ghost: "text-dim hover:bg-sunken hover:text-fg",
    danger: "bg-bad-soft text-bad border border-bad/30 hover:brightness-95",
  }[variant];
  return (
    <button
      type="button"
      className={`${base} ${look} ${className}`}
      {...rest}
    />
  );
}

export function LinkButton({
  to,
  variant = "primary",
  className = "",
  children,
}: {
  to: Route;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors";
  const look = {
    primary: "bg-accent text-accent-fg hover:brightness-110",
    secondary: "bg-elev border border-line-strong text-fg hover:bg-sunken",
    ghost: "text-dim hover:bg-sunken hover:text-fg",
  }[variant];
  return (
    <Link to={to} className={`${base} ${look} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-lg border border-line bg-elev ${className}`}>
      {children}
    </div>
  );
}

export function StackPill({ stack }: { stack: Stack }) {
  return (
    <span
      data-stack={stack}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elev px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-dim"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--stack)" }}
        aria-hidden
      />
      {STACK_LABEL[stack]}
    </span>
  );
}

export function LevelPill({ level }: { level: Level }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-wider text-faint">
      <span aria-hidden className="inline-flex gap-px">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-2 w-1 rounded-sm ${n <= level ? "bg-dim" : "bg-line"}`}
          />
        ))}
      </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "accent",
}: {
  value: number;
  max: number;
  tone?: "accent" | "good";
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-sunken"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full ${tone === "good" ? "bg-good" : "bg-accent"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow?: ReactNode;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
          {title}
        </h1>
        {lede && <p className="mt-2 max-w-[62ch] text-dim">{lede}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong p-6 text-center text-dim">
      {children}
    </div>
  );
}

export function Check({ done }: { done: boolean }) {
  return (
    <span
      aria-label={done ? "completed" : "not completed"}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] ${
        done
          ? "border-good bg-good text-accent-fg"
          : "border-line-strong text-transparent"
      }`}
    >
      ✓
    </span>
  );
}
