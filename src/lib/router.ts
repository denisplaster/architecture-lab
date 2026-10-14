import { useSyncExternalStore } from "react";

/**
 * A hash router with typed routes. Hash routing keeps the app working from
 * a static host, a file path, or an embedded single-file build, with no
 * server-side fallback needed.
 */
export type Route =
  | { name: "home" }
  | { name: "learn" }
  | { name: "track"; trackId: string }
  | { name: "lesson"; lessonId: string }
  | { name: "decide" }
  | { name: "scenario"; scenarioId: string }
  | { name: "drill"; trackId?: string }
  | { name: "advisors" }
  | { name: "advisor"; advisorId: string }
  | { name: "compare" }
  | { name: "progress" };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  const [head, ...rest] = clean.split("/").map(decodeURIComponent);
  const arg = rest[0];
  switch (head) {
    case "":
    case undefined:
      return { name: "home" };
    case "learn":
      return arg ? { name: "track", trackId: arg } : { name: "learn" };
    case "lesson":
      return arg ? { name: "lesson", lessonId: arg } : { name: "learn" };
    case "decide":
      return arg ? { name: "scenario", scenarioId: arg } : { name: "decide" };
    case "drill":
      return arg ? { name: "drill", trackId: arg } : { name: "drill" };
    case "advisor":
      return arg ? { name: "advisor", advisorId: arg } : { name: "advisors" };
    case "compare":
      return { name: "compare" };
    case "progress":
      return { name: "progress" };
    default:
      return { name: "home" };
  }
}

export function toHash(route: Route): string {
  const e = encodeURIComponent;
  switch (route.name) {
    case "home":
      return "#/";
    case "learn":
      return "#/learn";
    case "track":
      return `#/learn/${e(route.trackId)}`;
    case "lesson":
      return `#/lesson/${e(route.lessonId)}`;
    case "decide":
      return "#/decide";
    case "scenario":
      return `#/decide/${e(route.scenarioId)}`;
    case "drill":
      return route.trackId ? `#/drill/${e(route.trackId)}` : "#/drill";
    case "advisors":
      return "#/advisor";
    case "advisor":
      return `#/advisor/${e(route.advisorId)}`;
    case "compare":
      return "#/compare";
    case "progress":
      return "#/progress";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

function getSnapshot() {
  return window.location.hash;
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => "");
  return parseHash(hash);
}

export function navigate(route: Route) {
  window.location.hash = toHash(route);
}

/** Section of the app a route belongs to, for nav highlighting. */
export function sectionOf(
  route: Route,
): "home" | "learn" | "decide" | "drill" | "advisor" | "compare" | "progress" {
  switch (route.name) {
    case "learn":
    case "track":
    case "lesson":
      return "learn";
    case "decide":
    case "scenario":
      return "decide";
    case "drill":
      return "drill";
    case "advisors":
    case "advisor":
      return "advisor";
    case "compare":
      return "compare";
    case "progress":
      return "progress";
    default:
      return "home";
  }
}
