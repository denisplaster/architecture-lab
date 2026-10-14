/**
 * Minimal browser shims so the zustand stores (which reference window/
 * localStorage for autosave timers and preferences) can be unit-tested in
 * node without a full DOM.
 */

const g = globalThis as Record<string, unknown>;

if (typeof g.window === "undefined") {
  g.window = globalThis;
}
if (typeof g.localStorage === "undefined") {
  const data = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  };
}
