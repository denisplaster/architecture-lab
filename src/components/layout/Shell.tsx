import { useEffect, type ReactNode } from "react";
import { sectionOf, useRoute } from "../../lib/router";
import { useProgress, type ThemeChoice } from "../../state/progressStore";
import { Link } from "../common/ui";
import { Icons } from "./icons";

const NAV = [
  { section: "home", label: "Home", icon: "home", to: { name: "home" } },
  { section: "learn", label: "Learn", icon: "learn", to: { name: "learn" } },
  {
    section: "decide",
    label: "Decide",
    icon: "decide",
    to: { name: "decide" },
  },
  { section: "drill", label: "Drill", icon: "drill", to: { name: "drill" } },
  {
    section: "advisor",
    label: "Advise",
    icon: "advisor",
    to: { name: "advisors" },
  },
  {
    section: "compare",
    label: "Compare",
    icon: "compare",
    to: { name: "compare" },
  },
  {
    section: "progress",
    label: "Progress",
    icon: "progress",
    to: { name: "progress" },
  },
] as const;

const THEME_ORDER: ThemeChoice[] = ["system", "light", "dark"];

function ThemeToggle() {
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const Icon =
    theme === "light" ? Icons.sun : theme === "dark" ? Icons.moon : Icons.auto;
  const next =
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={`Theme: ${theme}. Switch to ${next}.`}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-dim hover:bg-sunken hover:text-fg"
    >
      <Icon />
      <span className="hidden text-xs capitalize lg:inline">{theme}</span>
    </button>
  );
}

function useApplyTheme() {
  const theme = useProgress((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
}

export function Shell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const route = useRoute();
  const active = sectionOf(route);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[232px_1fr]">
      {/* Rail (wide screens) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-elev lg:flex">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <Wordmark />
        </div>
        <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
          {NAV.map((n) => {
            const Icon = Icons[n.icon];
            const on = active === n.section;
            return (
              <Link
                key={n.section}
                to={n.to}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  on
                    ? "bg-accent-soft font-medium text-fg"
                    : "text-dim hover:bg-sunken hover:text-fg"
                }`}
              >
                <Icon />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between px-4 pb-5">
          <span className="eyebrow">Phase 1 · .NET, Azure, React</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Top bar (narrow screens) */}
      <header
        className="sticky z-10 flex items-center justify-between border-b border-line bg-elev px-4 py-3 lg:hidden"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <Wordmark />
        <ThemeToggle />
      </header>

      <main className="min-w-0 px-4 pb-24 pt-6 sm:px-8 lg:px-12 lg:pb-16 lg:pt-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>

      {/* Bottom tabs (narrow screens) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-line bg-elev lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV.map((n) => {
          const Icon = Icons[n.icon];
          const on = active === n.section;
          return (
            <Link
              key={n.section}
              to={n.to}
              aria-current={on ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[0.62rem] ${
                on ? "text-accent" : "text-faint"
              }`}
            >
              <Icon />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Wordmark() {
  return (
    <Link to={{ name: "home" }} className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-md bg-accent font-mono text-[0.8rem] font-medium text-accent-fg"
      >
        A
      </span>
      <span className="text-[0.95rem] font-semibold tracking-tight">
        Architecture Lab
      </span>
    </Link>
  );
}
