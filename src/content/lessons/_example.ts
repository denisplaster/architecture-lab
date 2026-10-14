import type { Lesson } from "../types";

/**
 * Reference lesson. Every other lesson follows this shape and tone:
 * concrete, opinionated, specific to the Microsoft stack and React, and
 * always answering "when would I pick this, and when not?".
 */
export const EXAMPLE_LESSON: Lesson = {
  id: "modular-monolith",
  trackId: "dotnet-styles",
  title: "Modular monolith",
  tagline:
    "One deployable, many well-fenced modules. Microservice boundaries without the network.",
  level: 2,
  minutes: 9,
  summary:
    "A modular monolith is a single ASP.NET Core deployable whose code is split into modules with explicit public contracts and private internals. It gives you most of the design benefits of microservices (clear ownership, independent evolution) while keeping one process, one database transaction, and one deployment pipeline.",
  sections: [
    {
      heading: "What it is",
      body: "The application is still one process and one deployment unit, but the solution is organised around **business capabilities** (Ordering, Catalog, Billing) rather than technical layers (Controllers, Services, Repositories). Each module owns its tables, its domain logic and its endpoints, and exposes a small public API, typically a C# interface in a `*.Contracts` project plus integration events.\n\nThe rule that makes it work: a module may only reference another module's **contracts** project, never its implementation. In .NET you enforce that with project references and `InternalsVisibleTo`, and you keep it true with an architecture test (NetArchTest or ArchUnitNET) that fails the build when someone takes a shortcut.",
    },
    {
      heading: "Why teams choose it",
      body: "Most systems that are split into microservices on day one pay for distribution (network failures, eventual consistency, per-service pipelines, distributed tracing) before they have the scale or team size that justifies it. A modular monolith defers that bill.\n\n- Refactoring across modules is a compile-time change, not a coordinated multi-service release.\n- A single SQL Server database keeps transactions simple; modules use separate **schemas** so the data boundary is visible.\n- One `dotnet publish`, one App Service or Container App, one set of logs.\n\nWhen a module later needs to scale or ship independently, its contracts project already describes the seam. Extracting it is a move, not a rewrite.",
    },
    {
      heading: "Shape of the solution",
      body: "```\nsrc/\n  Host/                      ASP.NET Core entry point, DI wiring only\n  Modules/\n    Ordering/\n      Ordering.Contracts/    public interfaces + integration events\n      Ordering/              endpoints, domain, EF Core DbContext (schema: ordering)\n      Ordering.Tests/\n    Catalog/ ...\n  Shared/                    cross-cutting: Result type, clock, messaging abstractions\n```\n\nInside a module you are free to use whatever internal style fits: a thin vertical-slice layout for CRUD-heavy modules, a richer domain model where the rules are complex. The module boundary is the architectural decision; the internals are a local one.",
    },
    {
      heading: "How modules talk",
      body: "Prefer the weakest coupling that does the job:\n\n- **Synchronous call through a contract interface** when the caller needs an answer now (Ordering asks Catalog for a price). Keep these few and read-only where possible.\n- **In-process integration events** (MediatR `INotification`, or a tiny in-memory bus) when the caller only needs to announce something (`OrderPlaced`). Billing subscribes; Ordering does not know Billing exists.\n- **Never** share a DbContext or query another module's tables. That is the shortcut that silently turns the modular monolith back into a big ball of mud.\n\nIf an event must survive a crash, write it to an outbox table in the same transaction and have a background `IHostedService` publish it. That is the same outbox pattern you would need for microservices, which is exactly why extraction later is cheap.",
    },
    {
      heading: "Common mistakes",
      body: "- Splitting by technical layer inside every module and calling it modular. The test is: can a new developer find everything about Ordering in one folder?\n- Letting EF Core navigation properties cross module boundaries. Use ids and contract calls instead.\n- Skipping the architecture test. Without it the boundaries erode within months.\n- Treating it as a stepping stone you must leave. Many products stay modular monoliths for their whole life and are better for it.",
    },
  ],
  diagram: {
    caption:
      "One process, modules fenced by contracts, one database with a schema per module.",
    nodes: [
      {
        id: "web",
        label: "React SPA",
        sub: "Vite + TanStack Query",
        col: 0,
        row: 1,
        kind: "ui",
      },
      {
        id: "host",
        label: "ASP.NET Core host",
        sub: "Minimal APIs, DI",
        col: 1,
        row: 1,
        kind: "service",
      },
      {
        id: "ordering",
        label: "Ordering",
        sub: "module",
        col: 2,
        row: 0,
        kind: "service",
      },
      {
        id: "catalog",
        label: "Catalog",
        sub: "module",
        col: 2,
        row: 1,
        kind: "service",
      },
      {
        id: "billing",
        label: "Billing",
        sub: "module",
        col: 2,
        row: 2,
        kind: "service",
      },
      {
        id: "db",
        label: "Azure SQL",
        sub: "schema per module",
        col: 3,
        row: 1,
        kind: "data",
      },
    ],
    edges: [
      { from: "web", to: "host", label: "HTTPS/JSON" },
      { from: "host", to: "ordering" },
      { from: "host", to: "catalog" },
      { from: "host", to: "billing" },
      {
        from: "ordering",
        to: "catalog",
        label: "IPricing (contract)",
        style: "dashed",
      },
      {
        from: "ordering",
        to: "billing",
        label: "OrderPlaced event",
        style: "dashed",
      },
      { from: "ordering", to: "db" },
      { from: "catalog", to: "db" },
      { from: "billing", to: "db" },
    ],
    groups: [
      {
        label: "One deployable",
        nodeIds: ["host", "ordering", "catalog", "billing"],
      },
    ],
  },
  useWhen: [
    "One team, or a few teams, who all deploy together anyway",
    "The domain has clear sub-areas but the scale does not yet demand independent scaling",
    "You want microservice-style ownership without the operational cost",
    "Transactions across sub-areas are common and must stay simple",
  ],
  avoidWhen: [
    "Separate teams need to release on their own cadence and the release train is the bottleneck",
    "One hot module needs a different runtime, language or scaling profile than the rest",
    "Regulation requires a hard process or data boundary between parts of the system",
  ],
  microsoftStack: [
    {
      name: "ASP.NET Core Minimal APIs",
      role: "Each module registers its own endpoint group in the host.",
    },
    {
      name: "EF Core with one DbContext per module",
      role: "Separate schemas in one Azure SQL database keep ownership explicit.",
    },
    {
      name: "MediatR notifications",
      role: "In-process integration events between modules.",
    },
    {
      name: "NetArchTest / ArchUnitNET",
      role: "Build-time test that modules only depend on contracts projects.",
    },
    {
      name: "Azure App Service or Container Apps",
      role: "A single deployable fits the simplest hosting options.",
    },
  ],
  reactStack: [
    {
      name: "Feature folders mirrored to modules",
      role: "`features/ordering`, `features/catalog` keep the front end aligned with backend boundaries.",
    },
    {
      name: "One OpenAPI document per module",
      role: "Generated TypeScript clients stay small and change independently.",
    },
  ],
  tradeoffs: [
    {
      attribute: "simplicity",
      effect: 1,
      note: "One process and one database, but more structure than a plain monolith.",
    },
    {
      attribute: "time-to-market",
      effect: 1,
      note: "No distributed plumbing to build before the first feature ships.",
    },
    {
      attribute: "scalability",
      effect: -1,
      note: "Scales as a unit; a hot module cannot scale alone until extracted.",
    },
    {
      attribute: "consistency",
      effect: 2,
      note: "Cross-module work can still be one SQL transaction.",
    },
    {
      attribute: "evolvability",
      effect: 2,
      note: "Contracts projects make later extraction a move, not a rewrite.",
    },
    {
      attribute: "deployability",
      effect: 0,
      note: "One pipeline; every release ships every module.",
    },
    {
      attribute: "team-autonomy",
      effect: 0,
      note: "Clear ownership, but still a shared release train.",
    },
    {
      attribute: "operability",
      effect: 2,
      note: "One log stream, one health check, one thing to page on.",
    },
    {
      attribute: "cost",
      effect: 1,
      note: "One App Service plan instead of a fleet of services.",
    },
  ],
  related: [
    "layered-monolith",
    "microservices",
    "vertical-slices",
    "strangler-fig",
  ],
  checks: [
    {
      id: "modular-monolith-q1",
      prompt:
        "Ordering needs Catalog's current price to place an order. What is the right call?",
      options: [
        "Query Catalog's tables directly from Ordering's DbContext",
        "Call an `IPricing` interface exposed by Catalog.Contracts",
        "Publish a `PriceRequested` event and wait for a reply",
        "Copy the price column into Ordering's schema and keep it in sync by hand",
      ],
      answer: 1,
      explanation:
        "A synchronous contract call is right when the caller needs an answer now. Querying another module's tables breaks the boundary; an event round-trip adds latency and complexity for a simple read.",
    },
    {
      id: "modular-monolith-q2",
      prompt:
        "Which signal most strongly suggests it is time to extract a module into its own service?",
      options: [
        "The module has more than 50 classes",
        "A different team owns it and is blocked by the shared release train",
        "The module uses a different EF Core DbContext",
        "The product manager asked for microservices",
      ],
      answer: 1,
      explanation:
        "Independent release cadence (team autonomy) and independent scaling are the two drivers that pay for distribution. Size alone and separate DbContexts are already handled inside the monolith.",
    },
  ],
  sources: [
    {
      title: "Azure Architecture Center: Modular monolith",
      url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/",
    },
    {
      title:
        "Microsoft Learn: .NET microservices architecture guide (monolith chapter)",
      url: "https://learn.microsoft.com/dotnet/architecture/microservices/",
    },
  ],
};
