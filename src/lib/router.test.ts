import { parseHash, toHash, type Route } from "./router";

describe("router", () => {
  const routes: Route[] = [
    { name: "home" },
    { name: "learn" },
    { name: "track", trackId: "react" },
    { name: "lesson", lessonId: "modular-monolith" },
    { name: "decide" },
    { name: "scenario", scenarioId: "startup-mvp" },
    { name: "drill" },
    { name: "drill", trackId: "azure-data" },
    { name: "advisors" },
    { name: "advisor", advisorId: "backend-style" },
    { name: "compare" },
    { name: "progress" },
  ];

  it.each(routes)("round-trips %o", (route) => {
    expect(parseHash(toHash(route))).toEqual(route);
  });

  it("treats empty, bare and unknown hashes as home", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#/nonsense/x")).toEqual({ name: "home" });
  });

  it("tolerates trailing slashes and missing ids", () => {
    expect(parseHash("#/learn/")).toEqual({ name: "learn" });
    expect(parseHash("#/lesson")).toEqual({ name: "learn" });
    expect(parseHash("#/advisor/")).toEqual({ name: "advisors" });
  });
});
