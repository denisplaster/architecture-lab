import type { Lesson } from "../types";

/**
 * Track: ASP.NET Core + React. Five lessons on putting the two halves
 * together: hosting, Blazor versus React, API contracts, Entra ID auth and
 * real-time with SignalR.
 */
export const FULLSTACK_LESSONS: Lesson[] = [
  {
    id: "aspnet-react-hosting",
    trackId: "fullstack",
    title: "Hosting ASP.NET Core with React",
    tagline:
      "Same origin or split origins, SPA or Next.js, and where the BFF sits: decide once, early.",
    level: 2,
    minutes: 7,
    summary:
      "There are four common ways to host a React front end with an ASP.NET Core backend, and the choice decides your CORS story, your auth pattern and your deploy pipeline. This lesson compares the SPA proxy, Static Web Apps with a separate API, Next.js in front of an API, and the official templates, then shows how .NET Aspire wires them together.",
    sections: [
      {
        heading: "The four options",
        body: '- **ASP.NET Core serves the Vite SPA**. In development the `Microsoft.AspNetCore.SpaProxy` package launches the Vite dev server and proxies to it; in production `vite build` output lands in `wwwroot` and `MapFallbackToFile("index.html")` serves it. One deployable, one origin, no CORS. This is what the `dotnet new react` style templates in Visual Studio and the `React and ASP.NET Core` project template produce.\n- **Azure Static Web Apps plus a separate API**. The SPA lives on the CDN; the API is an App Service or Container App. The SWA **linked backend** proxies `/api` so the browser still sees one origin. Two pipelines, independent releases.\n- **Next.js in front of ASP.NET Core**. Next.js on App Service or Container Apps renders pages, handles routing and can call the .NET API from server components and route handlers. The API is never public to the browser if you do not want it to be. Right when SEO, streaming or server components matter.\n- **Split origins with CORS**. `app.yourco.com` and `api.yourco.com`, CORS configured on the API. Simple to reason about, but now tokens must live in the browser or a BFF must be added.',
      },
      {
        heading: "Same origin versus CORS",
        body: "Same origin is worth protecting. When the SPA and API share an origin, cookies work, `SameSite=Strict` works, there is no preflight latency, and the BFF cookie pattern for Entra ID is available without a second host. Static Web Apps' linked backend and the SPA proxy both give you this; Azure Front Door with path-based routing gives it for any pair of hosts.\n\nCORS is correct when the API genuinely serves several front ends or third parties, or when a mobile app already requires bearer tokens. Configure it with named policies and explicit origins, never `AllowAnyOrigin` with credentials, and remember that CORS protects the browser, not the API: authorisation still happens per request.\n\nThe practical rule: pick same origin unless you have a second client. If you later add one, you can add CORS; it is harder to go the other way once tokens are in local storage.",
      },
      {
        heading: "Where the BFF sits",
        body: "A **backend for frontend** in this context is the server that terminates the browser's session and holds tokens, so the SPA never sees an access token. On the Microsoft stack it is usually the ASP.NET Core app itself, using `Microsoft.Identity.Web` with cookie authentication and the Entra ID auth code flow, forwarding calls downstream with the user's token. In the SPA-proxy layout the BFF and the API are the same process. In the Static Web Apps layout the built-in auth or the linked backend plays that role. In the Next.js layout, Next.js route handlers are the BFF and ASP.NET Core is a pure API behind it.\n\nIf you have a separate API gateway (YARP, Azure API Management), the BFF sits between the browser and that gateway, not behind it. Keep one BFF per front end; a BFF shared by web and mobile is a gateway with a confusing name.",
      },
      {
        heading: "How .NET Aspire wires a React app",
        body: 'Aspire\'s app host treats the front end as a resource. `AddNpmApp("web", "../web")` (or `AddViteApp` from the community toolkit) starts the Vite dev server, and `.WithReference(api)` injects the API\'s address as an environment variable such as `services__api__https__0`, which the Vite config reads to set up its dev proxy. Aspire\'s dashboard then shows logs and traces for both halves, and `azd up` deploys the API to Container Apps and the SPA as a container or, with a small amount of configuration, to Static Web Apps.\n\n```csharp\nvar api = builder.AddProject<Projects.Api>("api");\nbuilder.AddNpmApp("web", "../web", "dev")\n    .WithReference(api)\n    .WithHttpEndpoint(env: "PORT")\n    .WithExternalHttpEndpoints();\n```\n\nThis replaces the SPA proxy for local development with something that also handles databases, queues and emulators, which is why new full-stack .NET projects should start from the Aspire starter rather than the older template.',
      },
      {
        heading: "How to decide",
        body: "- One team, one web client, no SEO needs, wants the simplest pipeline: **ASP.NET Core serves the SPA**, with Aspire for local orchestration.\n- Front-end and backend ship on different cadences, or you want PR preview environments for the UI: **Static Web Apps with a linked backend**.\n- Public, content-heavy pages, SEO, or server components: **Next.js in front of ASP.NET Core**, and accept a Node runtime to operate.\n- Several clients including mobile, or a public API product: **split origins with CORS** and bearer tokens, with a BFF for the web client if it handles money or health data.\n\nTwo mistakes recur. Teams choose Next.js for an internal line-of-business app that nobody will ever search for, and pay the SSR tax forever. And teams split origins by default, then spend weeks on token storage questions that same origin would have made moot.",
      },
    ],
    diagram: {
      caption:
        "Two common shapes: Static Web Apps proxying /api to the API (same origin), or Next.js acting as the BFF in front of a private API.",
      nodes: [
        {
          id: "browser",
          label: "Browser",
          sub: "React 19",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "swa",
          label: "Static Web Apps",
          sub: "SPA + linked backend",
          col: 1,
          row: 0,
          kind: "ui",
        },
        {
          id: "next",
          label: "Next.js",
          sub: "Container Apps, BFF",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "Minimal APIs",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "aspire",
          label: ".NET Aspire app host",
          sub: "local orchestration",
          col: 2,
          row: 3,
          kind: "note",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "",
          col: 4,
          row: 1,
          kind: "data",
        },
      ],
      edges: [
        { from: "browser", to: "swa", label: "same origin" },
        { from: "browser", to: "next", label: "same origin" },
        { from: "swa", to: "api", label: "/api proxied" },
        { from: "next", to: "api", label: "server-side, private" },
        { from: "api", to: "sql" },
        { from: "aspire", to: "api", label: "WithReference", style: "dashed" },
        { from: "aspire", to: "next", label: "AddNpmApp", style: "dashed" },
      ],
    },
    useWhen: [
      "One team ships UI and API together and wants one origin and one pipeline: serve the SPA from ASP.NET Core",
      "UI and API release independently and PR previews for the UI matter: Static Web Apps with a linked backend",
      "Public pages need SEO or server components: Next.js in front of the .NET API",
      "Local development involves databases and queues as well as the SPA: Aspire app host",
    ],
    avoidWhen: [
      "Choosing Next.js for an internal app with no SEO or SSR need",
      "Splitting origins and storing tokens in the browser when a same-origin BFF was available",
      "Serving a React build from an API's wwwroot when the UI team needs its own release cadence",
    ],
    microsoftStack: [
      {
        name: "Microsoft.AspNetCore.SpaProxy",
        role: "Launches and proxies the Vite dev server from the ASP.NET Core project in development.",
      },
      {
        name: "Azure Static Web Apps linked backend",
        role: "Routes /api to App Service or Container Apps so the SPA stays same-origin.",
      },
      {
        name: ".NET Aspire AddNpmApp",
        role: "Runs the React app as an orchestrated resource with service discovery and tracing.",
      },
      {
        name: "Azure Front Door",
        role: "Path-based routing to combine any SPA host and API host under one origin.",
      },
      {
        name: "YARP",
        role: "In-process reverse proxy when the BFF must forward to several downstream APIs.",
      },
    ],
    reactStack: [
      {
        name: "Vite server.proxy",
        role: "Forwards /api to the ASP.NET Core address injected by Aspire or the SPA proxy in development.",
      },
      {
        name: "Next.js route handlers",
        role: "Act as the BFF, calling the .NET API server-side and keeping tokens off the browser.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 2,
        note: "Same origin removes CORS, preflights and most token-storage debate.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Templates and Aspire give a running full stack in minutes.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "CDN-hosted SPA shells load fast; Next.js adds SSR cost and SSR benefit.",
      },
      {
        attribute: "deployability",
        effect: -1,
        note: "One deployable is easiest; split hosting means two pipelines to keep in step.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Static Web Apps lets the UI team release without the API team.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Adding a second client later only needs CORS on an API already behind a BFF.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Aspire's dashboard traces both halves; Next.js adds a Node runtime to watch.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Static Web Apps' free and standard tiers host the SPA for less than a plan.",
      },
    ],
    related: [
      "azure-compute-choices",
      "entra-id-auth",
      "api-gateway-bff",
      "react-rendering-strategies",
    ],
    checks: [
      {
        id: "aspnet-react-hosting-q1",
        prompt:
          "An internal dashboard built with Vite and an ASP.NET Core API, one team, no SEO. Which hosting shape?",
        options: [
          "Next.js on Container Apps calling the API",
          "ASP.NET Core serving the SPA from wwwroot, same origin, Aspire locally",
          "Split origins with CORS and tokens in local storage",
          "Blazor Server",
        ],
        answer: 1,
        explanation:
          "One team and no SEO means the simplest same-origin layout wins. Next.js adds SSR operations for nothing, and split origins with browser tokens add security work the situation does not require.",
      },
      {
        id: "aspnet-react-hosting-q2",
        prompt:
          "What does the Static Web Apps linked backend give you that a CORS-enabled API on its own does not?",
        options: [
          "Faster database queries",
          "The SPA and API share one origin, so cookies and SameSite work and no preflight is needed",
          "Automatic OpenAPI generation",
          "Server-side rendering of React",
        ],
        answer: 1,
        explanation:
          "The linked backend proxies /api under the SPA's origin. CORS lets a different origin call the API but keeps the two origins distinct, which complicates cookie-based auth.",
      },
      {
        id: "aspnet-react-hosting-q3",
        prompt:
          "In an Aspire app host, what does `.WithReference(api)` on the npm app do?",
        options: [
          "Bundles the API into the React build",
          "Injects the API's address as an environment variable the Vite config can use for its proxy",
          "Generates a TypeScript client from the API",
          "Deploys the API to Static Web Apps",
        ],
        answer: 1,
        explanation:
          "References are service discovery: the app host passes the resolved endpoint to the front end's process. Client generation and deployment are separate concerns handled by Kiota and azd.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core: Use React with ASP.NET Core",
        url: "https://learn.microsoft.com/aspnet/core/client-side/spa/react",
      },
      {
        title: ".NET Aspire documentation",
        url: "https://learn.microsoft.com/dotnet/aspire/",
      },
      {
        title: "Azure Static Web Apps documentation",
        url: "https://learn.microsoft.com/azure/static-web-apps/",
      },
    ],
  },
  {
    id: "blazor-vs-react",
    trackId: "fullstack",
    title: "Blazor versus React",
    tagline:
      "Team skills decide more than the framework does. Know what each render mode costs.",
    level: 2,
    minutes: 7,
    summary:
      "A .NET shop choosing a front end has Blazor Server, Blazor WebAssembly and the auto render mode on one side, React on the other. The honest comparison is about who will build and maintain it, then about interactivity, SEO, offline needs and ecosystem. This lesson gives the cases where Blazor wins, the cases where a .NET team should still pick React, and the hybrids that work.",
    sections: [
      {
        heading: "The Blazor render modes, plainly",
        body: "Blazor is one component model with several ways to run it:\n\n- **Static server rendering**: components render to HTML on the request with no interactivity, like Razor Pages. Fast, SEO-friendly, no circuit, enhanced navigation makes it feel app-like.\n- **Interactive Server**: the component runs on the server and the browser holds a thin client connected by a SignalR **circuit**. Every click is a round trip; state lives in server memory per user. Needs sticky sessions or Azure SignalR Service to scale, and a flaky connection shows as a frozen UI.\n- **Interactive WebAssembly**: the .NET runtime downloads to the browser and the component runs there. No per-user server state, works offline once loaded, but a multi-megabyte first load even with AOT and trimming.\n- **Interactive Auto**: Server on first visit while the WebAssembly bundle downloads in the background, WebAssembly on later visits. Introduced in .NET 8, and what people mean by Blazor United.\n\nRender mode is chosen per component or per page, which is both the strength and the source of most confusion: a component tree that mixes modes has boundaries where parameters must be serialisable and state does not flow.",
      },
      {
        heading: "What React brings",
        body: "React is the largest front-end ecosystem by every measure: component libraries, TanStack Query, form libraries, charting, testing tools, design-system tooling and a hiring pool that any city can supply. React 19 with Server Components and Actions via Next.js covers static, streamed and fully interactive rendering in one model, and a Vite SPA remains the simplest possible setup for an internal app.\n\nThe cost for a .NET shop is a second language and toolchain: TypeScript, npm, Vite or Next.js, ESLint, a separate testing stack, and a contract between the two halves that must be generated and kept honest (the OpenAPI lesson). That cost is real but bounded, and it buys access to every front-end library ever written. Blazor's third-party component market is smaller and its interop with JavaScript libraries, while workable through `IJSRuntime`, is where many Blazor projects spend their most frustrating weeks.",
      },
      {
        heading: "Comparing on the things that matter",
        body: "- **Team skills**: a team of C# developers with no front-end specialist ships a Blazor internal app faster and maintains it with less fear. A team with React experience, or a product that will need front-end hires, is better served by React. This single factor outweighs the rest in most decisions.\n- **Interactivity**: both handle rich UIs. Blazor Server adds latency per interaction; drag-and-drop, drawing and editors feel better in WebAssembly or React.\n- **SEO and first load**: Blazor static SSR and Next.js are equal; Blazor WebAssembly and a plain SPA both need pre-rendering help.\n- **Offline and PWA**: Blazor WebAssembly and React PWAs both work; Blazor Server cannot.\n- **Ecosystem**: React, by a wide margin.\n- **Scale**: Blazor Server holds state per connected user; React and Blazor WebAssembly push that to the client. For thousands of concurrent users, Blazor Server needs capacity planning and Azure SignalR Service.\n- **Public products**: customers judge load time and polish; React (or Blazor static SSR with small interactive islands) is the safer bet.",
      },
      {
        heading: "When a .NET shop should still pick React",
        body: "Blazor is a fine choice for internal line-of-business apps, admin portals and dashboards built by C# teams. A .NET shop should still pick React when:\n\n- The product is customer-facing and competes on front-end polish, where the component ecosystem and design tooling matter.\n- The company will hire front-end developers, who will expect React.\n- Mobile is in scope and React Native or a shared TypeScript domain layer is attractive.\n- A micro-frontend or design-system strategy across several teams already exists in React.\n- The app needs JavaScript libraries without first-class Blazor wrappers (rich editors, maps, charts), and the team does not want to maintain interop shims.\n\nThe reverse holds: a small C# team building an internal tool should not adopt React just because it is popular. Blazor with the auto render mode, MudBlazor or Fluent UI Blazor components, and the same ASP.NET Core backend is the shorter path.",
      },
      {
        heading: "Hybrids that work and ones that do not",
        body: "Hybrids that pay off:\n\n- Blazor static SSR for the marketing and content pages with a React or Blazor WebAssembly island for the one complex screen.\n- A shared ASP.NET Core API behind both a Blazor admin portal (internal, C# team) and a React customer app (external, front-end team). The API contract keeps them honest.\n- .NET MAUI Blazor Hybrid for a desktop or mobile shell reusing Blazor components, beside a React web app.\n\nHybrids that do not: mixing React and Blazor components on the same page through interop, and running two front-end stacks in one team with the same people switching daily. Pick one per product surface and document the reason in an ADR, because this is the decision people argue about most and remember least.",
      },
    ],
    diagram: {
      caption:
        "One ASP.NET Core API serving a Blazor internal portal and a React customer app; the Blazor circuit scales through Azure SignalR Service.",
      nodes: [
        {
          id: "staff",
          label: "Staff browser",
          sub: "Blazor Interactive Auto",
          col: 0,
          row: 0,
          kind: "ui",
        },
        {
          id: "cust",
          label: "Customer browser",
          sub: "React 19 SPA",
          col: 0,
          row: 2,
          kind: "ui",
        },
        {
          id: "blazor",
          label: "Blazor Web App",
          sub: "App Service, circuits",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "sigr",
          label: "Azure SignalR Service",
          sub: "circuit scale-out",
          col: 2,
          row: 1,
          kind: "external",
        },
        {
          id: "swa",
          label: "Static Web Apps",
          sub: "CDN, linked backend",
          col: 1,
          row: 2,
          kind: "ui",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "OpenAPI contract",
          col: 3,
          row: 1,
          kind: "service",
        },
        { id: "db", label: "Azure SQL", sub: "", col: 4, row: 1, kind: "data" },
      ],
      edges: [
        { from: "staff", to: "blazor", label: "SSR then WASM" },
        { from: "blazor", to: "sigr", label: "circuit", style: "dashed" },
        { from: "blazor", to: "api", label: "typed HttpClient" },
        { from: "cust", to: "swa", label: "static assets" },
        { from: "swa", to: "api", label: "/api, generated client" },
        { from: "api", to: "db" },
      ],
    },
    useWhen: [
      "A C# team with no front-end specialist is building an internal portal or dashboard: Blazor Interactive Auto",
      "A customer-facing product competes on polish and will hire front-end developers: React",
      "Mobile via React Native or a shared TypeScript layer is planned: React",
      "Content pages need SEO with small interactive islands: Blazor static SSR or Next.js, matched to the team",
    ],
    avoidWhen: [
      "Blazor Server for an app with thousands of concurrent users and no plan for circuit scale-out",
      "React for a small internal tool when the whole team writes C# and nobody will maintain the TypeScript",
      "Mixing React and Blazor components on the same page through JavaScript interop",
    ],
    microsoftStack: [
      {
        name: "Blazor Web App template (.NET 10)",
        role: "Per-component render modes: static SSR, Interactive Server, WebAssembly and Auto.",
      },
      {
        name: "Azure SignalR Service",
        role: "Scales Blazor Server circuits beyond one instance without sticky sessions.",
      },
      {
        name: "MudBlazor / Fluent UI Blazor",
        role: "Component libraries that cover most internal-app UI needs.",
      },
      {
        name: ".NET MAUI Blazor Hybrid",
        role: "Reuses Blazor components in desktop and mobile shells.",
      },
      {
        name: "ASP.NET Core Minimal APIs with OpenAPI",
        role: "The shared backend contract that lets Blazor and React coexist.",
      },
    ],
    reactStack: [
      {
        name: "React 19 with Vite or Next.js",
        role: "The default for customer-facing products and teams with front-end hiring plans.",
      },
      {
        name: "Generated TypeScript client (Kiota or openapi-typescript)",
        role: "Keeps the React app honest against the same API Blazor consumes.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "One language and toolchain for a C# team, versus two with React.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "C# teams ship internal Blazor apps faster; React teams ship React faster.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "Blazor Server adds a round trip per interaction; WebAssembly has a heavy first load.",
      },
      {
        attribute: "scalability",
        effect: -1,
        note: "Server circuits hold per-user state and need SignalR Service to scale out.",
      },
      {
        attribute: "reliability",
        effect: -1,
        note: "A dropped circuit freezes a Blazor Server UI until it reconnects.",
      },
      {
        attribute: "evolvability",
        effect: -1,
        note: "A smaller ecosystem means more custom code for unusual UI needs.",
      },
      {
        attribute: "team-autonomy",
        effect: 0,
        note: "One team can own both halves in Blazor; React lets a front-end team own its half.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "bUnit for Blazor and Testing Library for React are comparable.",
      },
    ],
    related: [
      "aspnet-react-hosting",
      "react-rendering-strategies",
      "api-contracts-openapi",
      "realtime-signalr",
    ],
    checks: [
      {
        id: "blazor-vs-react-q1",
        prompt:
          "Four C# developers, no front-end specialist, an internal approvals portal for 200 staff. Which front end?",
        options: [
          "React with Next.js for SEO",
          "Blazor Web App with Interactive Auto render mode",
          "Blazor WebAssembly with AOT for performance",
          "React Native for future mobile",
        ],
        answer: 1,
        explanation:
          "Team skill is the main driver and the audience is small and internal, so Blazor Auto gives a fast first visit and no second toolchain. SEO is irrelevant internally, and AOT WebAssembly adds first-load weight for no benefit here.",
      },
      {
        id: "blazor-vs-react-q2",
        prompt:
          "Which property of Blazor Interactive Server most limits it for a public app with many concurrent users?",
        options: [
          "It cannot render HTML for search engines",
          "Each connected user holds a circuit with state in server memory",
          "It requires WebAssembly support in the browser",
          "It cannot call REST APIs",
        ],
        answer: 1,
        explanation:
          "Per-user circuits mean memory and connection capacity scale with concurrent users, and scale-out needs Azure SignalR Service. Server mode renders fine for crawlers, needs no WebAssembly, and calls APIs like any .NET code.",
      },
      {
        id: "blazor-vs-react-q3",
        prompt:
          "A .NET shop is building a customer-facing product and plans to hire front-end developers. What is the strongest reason to choose React?",
        options: [
          "React is faster at rendering tables",
          "Blazor cannot be deployed to Azure",
          "The hiring pool, ecosystem and design tooling the product will depend on are React-centred",
          "React does not need an API",
        ],
        answer: 2,
        explanation:
          "For a product competing on front-end quality with front-end hires, the ecosystem and talent pool decide it. Rendering speed is comparable, Blazor deploys anywhere ASP.NET Core does, and both need an API.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core Blazor documentation",
        url: "https://learn.microsoft.com/aspnet/core/blazor/",
      },
      {
        title: "ASP.NET Core Blazor render modes",
        url: "https://learn.microsoft.com/aspnet/core/blazor/components/render-modes",
      },
      {
        title: "React: Start a new React project",
        url: "https://react.dev/learn/start-a-new-react-project",
      },
    ],
  },
  {
    id: "api-contracts-openapi",
    trackId: "fullstack",
    title: "API contracts with OpenAPI",
    tagline:
      "Generated document, generated client, and no silent breaking changes.",
    level: 2,
    minutes: 8,
    summary:
      "The contract between an ASP.NET Core API and a React app should be a generated OpenAPI document with a generated TypeScript client, so a breaking change fails a build rather than a user. This lesson covers OpenAPI generation in .NET 9 and 10, client generation with Kiota and openapi-typescript, versioning and breaking-change rules, contract tests, and when GraphQL with Hot Chocolate or gRPC fit better.",
    sections: [
      {
        heading: "Generating the document from Minimal APIs",
        body: 'Since .NET 9, `Microsoft.AspNetCore.OpenApi` generates the document in-process: `AddOpenApi()` and `MapOpenApi()` serve `/openapi/v1.json`, with document and operation transformers for security schemes and custom metadata. .NET 10 adds OpenAPI 3.1 output and XML doc comment support, so a `/// <summary>` on an endpoint delegate or DTO flows into the document. The `dotnet build` step can emit the document to disk with the `Microsoft.Extensions.ApiDescription.Server` package, which is what you commit or publish for client generation.\n\nTidy endpoints produce tidy documents:\n\n```csharp\ngroup.MapGet("/orders/{id:guid}", GetOrder)\n    .WithName("GetOrder")\n    .Produces<OrderDto>()\n    .ProducesProblem(StatusCodes.Status404NotFound);\n```\n\nName every operation with `WithName`, declare every response with `Produces`, use `TypedResults` so return types are inferred, and return `ProblemDetails` for errors. Swashbuckle and NSwag still work and still add a UI; the built-in generator is the default for new projects, with Scalar or Swagger UI added for browsing.',
      },
      {
        heading: "Generating the TypeScript client",
        body: "Two mainstream choices on the React side:\n\n- **openapi-typescript** generates types only, and **openapi-fetch** gives a tiny typed `fetch` wrapper over them. Zero runtime dependencies beyond fetch, path and query parameters typed, and it slots directly under TanStack Query. The right default for a SPA.\n- **Kiota** (from Microsoft) generates a full client with request builders, serialisation, authentication providers and middleware. It is heavier and shines when the same API is consumed from TypeScript, C# and other languages with one tool, or when the API uses OData-style conventions.\n\nEither way the generation runs in the front-end build (`npm run generate` from the checked-in document or from the running API in Aspire), and the generated code is either committed, so diffs show contract changes in review, or regenerated in CI. The point is that a renamed property fails `tsc` in the React project before anything ships.",
      },
      {
        heading: "Versioning and breaking-change rules",
        body: "Define breaking before deciding how to version. Breaking: removing or renaming a field, changing a type, making an optional request field required, removing an enum value a client may send, changing a status code clients branch on. Non-breaking: adding an optional field, adding an endpoint, adding an enum value clients only receive (if they handle unknown values).\n\nFor an API with one React client you own, **no versioning** is the correct default: deploy the API first with additive changes, then the client, and remove old fields a release later. A two-step expand-and-contract keeps both deployable at any moment.\n\nWhen third parties consume the API, use **URL segment versioning** (`/v2/orders`) through `Asp.Versioning.Http`, which integrates with the OpenAPI generator to emit one document per version. Header and query-string versioning are supported but harder for integrators to see. Support at most two versions at once and publish a sunset date in the `Sunset` header.\n\nRecord the rules in the repository. A `CHANGELOG` entry per contract change and a required reviewer for `openapi.json` changes cost nothing and prevent most accidents.",
      },
      {
        heading: "Contract tests",
        body: "A contract test checks that the implementation still matches the document and that the document still matches what clients rely on.\n\n- **Snapshot the document**: a test in the API project that generates `openapi.json` and compares it with the committed one (Verify or a plain file diff). Any change needs the snapshot updated in the same pull request, which makes contract changes visible.\n- **Breaking-change diff**: run `oasdiff` or Optic in CI against the previous release's document and fail on breaking changes outside a major version bump.\n- **Consumer-driven tests**: with several teams, Pact lets the React team record what it uses and the API build verify it. For one team this is more ceremony than it returns; the snapshot plus a typed client covers it.\n- **Integration tests** with `WebApplicationFactory` exercise the endpoints the client depends on with the real serialisation, which catches a `[JsonIgnore]` or naming-policy change the document alone would not.\n\nTreat the document as the artefact: publish it with each release, and let Static Web Apps or the SPA build consume the exact version it was built against.",
      },
      {
        heading: "GraphQL and gRPC as alternatives",
        body: "**GraphQL with Hot Chocolate** fits when many screens need different slices of a rich object graph and the front-end team wants to shape queries without waiting for new endpoints. Hot Chocolate on ASP.NET Core is mature, supports EF Core projections, DataLoader batching, subscriptions and schema stitching through Fusion. The cost is a new query engine to operate, caching that no longer maps to HTTP, N+1 risks unless DataLoaders are used consistently, and authorisation per field rather than per endpoint. For a single product with a known set of screens, REST with OpenAPI stays simpler.\n\n**gRPC** fits service-to-service calls inside the backend: strongly typed contracts via protobuf, streaming, and much lower overhead than JSON over HTTP. ASP.NET Core supports it natively and Aspire wires it easily. Browsers cannot speak gRPC directly, so for the React app you would use gRPC-Web or, more commonly, keep REST at the edge and gRPC between services.\n\nDecision: REST plus OpenAPI for the React-facing API by default; GraphQL when the front end needs query flexibility across a graph; gRPC between .NET services where latency and typed contracts matter.",
      },
    ],
    diagram: {
      caption:
        "The OpenAPI document is generated from Minimal APIs, snapshotted and diffed in CI, and used to generate the TypeScript client the React app builds against.",
      nodes: [
        {
          id: "api",
          label: "Minimal APIs",
          sub: "AddOpenApi, TypedResults",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "doc",
          label: "openapi.json",
          sub: "committed artefact",
          col: 1,
          row: 1,
          kind: "note",
        },
        {
          id: "ci",
          label: "CI contract checks",
          sub: "snapshot + oasdiff",
          col: 1,
          row: 3,
          kind: "external",
        },
        {
          id: "gen",
          label: "Client generation",
          sub: "openapi-typescript / Kiota",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "client",
          label: "Typed client",
          sub: "openapi-fetch",
          col: 3,
          row: 1,
          kind: "ui",
        },
        {
          id: "spa",
          label: "React SPA",
          sub: "TanStack Query hooks",
          col: 4,
          row: 1,
          kind: "ui",
        },
        {
          id: "tsc",
          label: "tsc fails on break",
          sub: "before deploy",
          col: 3,
          row: 3,
          kind: "note",
        },
      ],
      edges: [
        { from: "api", to: "doc", label: "build emits" },
        {
          from: "doc",
          to: "ci",
          label: "diff vs last release",
          style: "dashed",
        },
        { from: "doc", to: "gen", label: "npm run generate" },
        { from: "gen", to: "client" },
        { from: "client", to: "spa", label: "imported" },
        { from: "client", to: "tsc", style: "dashed" },
        { from: "spa", to: "api", label: "HTTPS/JSON" },
      ],
    },
    useWhen: [
      "A React app consumes an ASP.NET Core API and renamed fields should fail a build rather than a user",
      "Several clients or teams consume the API and need a published, diffable contract",
      "Third parties integrate and need explicit versions with sunset dates",
      "Internal services talk to each other at high rate and want typed, low-overhead calls: gRPC",
    ],
    avoidWhen: [
      "Adopting GraphQL for a single product with a fixed set of screens and one team",
      "URL versioning an API with one client you own, when expand-and-contract would do",
      "Hand-writing TypeScript types for API responses when a generator is one command away",
    ],
    microsoftStack: [
      {
        name: "Microsoft.AspNetCore.OpenApi",
        role: "Built-in document generation with transformers, OpenAPI 3.1 and XML comments in .NET 10.",
      },
      {
        name: "Microsoft.Extensions.ApiDescription.Server",
        role: "Emits the OpenAPI document at build time for commit and client generation.",
      },
      {
        name: "Asp.Versioning.Http",
        role: "URL, header or query versioning with one document per version.",
      },
      {
        name: "Kiota",
        role: "Multi-language client generation from the document, including C# and TypeScript.",
      },
      {
        name: "Hot Chocolate",
        role: "GraphQL server for ASP.NET Core with DataLoaders, EF Core projections and Fusion.",
      },
      {
        name: "ASP.NET Core gRPC",
        role: "Protobuf contracts and streaming for service-to-service calls.",
      },
    ],
    reactStack: [
      {
        name: "openapi-typescript + openapi-fetch",
        role: "Typed paths, params and responses with a tiny fetch wrapper under TanStack Query.",
      },
      {
        name: "TanStack Query queryOptions",
        role: "Wrap generated calls in reusable query definitions keyed by endpoint and parameters.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "One generated client replaces hand-written fetch code and type guesses.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Regenerating a client after an endpoint change takes seconds.",
      },
      {
        attribute: "consistency",
        effect: 2,
        note: "Front end and API cannot drift unnoticed when the client is generated from the document.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "Snapshot and diff tests make contract changes explicit in review.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Clear breaking-change rules let the API grow additively with confidence.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "Expand-and-contract keeps API and client independently deployable.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "A published contract lets front-end and backend work in parallel against it.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "REST with JSON is adequate at the edge; gRPC improves service-to-service calls.",
      },
    ],
    related: [
      "aspnet-react-hosting",
      "react-server-state",
      "api-gateway-bff",
      "backend-testing-strategy",
    ],
    checks: [
      {
        id: "api-contracts-openapi-q1",
        prompt:
          "An API has one React client owned by the same team. A field must be renamed. What is the right process?",
        options: [
          "Rename it and deploy API and client at the same moment",
          "Add the new field, deploy the API, update and deploy the client, remove the old field in a later release",
          "Create /v2 of the endpoint",
          "Keep both names forever",
        ],
        answer: 1,
        explanation:
          "Expand-and-contract keeps every deploy safe without version sprawl. Simultaneous deploys are never truly simultaneous, and a new URL version is overhead for a client you control.",
      },
      {
        id: "api-contracts-openapi-q2",
        prompt:
          "Which change to an OpenAPI document is NOT breaking for existing clients?",
        options: [
          "Making a previously optional request field required",
          "Adding a new optional property to a response",
          "Changing a numeric id to a string",
          "Removing an endpoint",
        ],
        answer: 1,
        explanation:
          "Additive optional response fields are ignored by clients that do not know them. The other three change what a client must send, what it receives, or what exists, so existing code fails.",
      },
      {
        id: "api-contracts-openapi-q3",
        prompt:
          "When does GraphQL with Hot Chocolate justify its extra operational cost over REST with OpenAPI?",
        options: [
          "Whenever the React team prefers it",
          "When many screens need different slices of a rich object graph and new endpoints would be a bottleneck",
          "When the API must be consumed by a mobile app",
          "When the backend uses EF Core",
        ],
        answer: 1,
        explanation:
          "Query flexibility across a graph is the GraphQL payoff. Mobile apps and EF Core work fine with REST, and preference alone does not cover the cost of a query engine, field-level authorisation and N+1 discipline.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core: OpenAPI documents",
        url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/",
      },
      {
        title: "Kiota documentation",
        url: "https://learn.microsoft.com/openapi/kiota/",
      },
      {
        title: "Azure Architecture Center: RESTful web API design",
        url: "https://learn.microsoft.com/azure/architecture/best-practices/api-design",
      },
    ],
  },
  {
    id: "entra-id-auth",
    trackId: "fullstack",
    title: "Entra ID auth for React and ASP.NET Core",
    tagline:
      "MSAL in the browser or cookies via a BFF: one is quicker to start, the other is safer.",
    level: 3,
    minutes: 8,
    summary:
      "A React app backed by ASP.NET Core can sign users in with Entra ID in two ways: MSAL.js running the authorisation code flow with PKCE in the browser, or a BFF that owns the session in a cookie and keeps tokens server-side. This lesson explains both, token validation in ASP.NET Core, scopes and app roles, Entra External ID for consumers, silent renewal, and why high-value apps should use the BFF.",
    sections: [
      {
        heading: "Pattern one: MSAL.js in the SPA",
        body: "`@azure/msal-browser` with `@azure/msal-react` runs the OAuth 2.0 **authorization code flow with PKCE** entirely in the browser. The SPA redirects (or pops up) to Entra ID, receives a code, exchanges it for an ID token, access token and refresh token, and attaches `Authorization: Bearer` to API calls. The API is a resource server with its own app registration exposing a scope such as `api://orders/Orders.ReadWrite`.\n\nIt is quick to set up, works with any API host and any CORS setup, and is the pattern Microsoft's SPA samples show. The costs: tokens are in browser memory or session storage, where any cross-site scripting bug can read them; refresh tokens for SPAs are short-lived by policy; and silent renewal through hidden iframes breaks under third-party cookie blocking, so MSAL falls back to the refresh token and eventually to an interactive prompt.\n\nConfigure the cache as `sessionStorage` or memory rather than `localStorage`, request the smallest scopes, and never put tokens into TanStack Query cache or Zustand stores that persist.",
      },
      {
        heading: "Pattern two: BFF with cookies",
        body: "In the **backend for frontend** pattern the ASP.NET Core app signs the user in with `Microsoft.Identity.Web` (`AddMicrosoftIdentityWebApp` with `EnableTokenAcquisitionToCallDownstreamApi`), stores tokens server-side in a token cache (distributed, in Redis), and issues the browser an `HttpOnly`, `Secure`, `SameSite` cookie. The React app calls `/api/...` on the same origin; the BFF validates the cookie, acquires a token for the downstream API with `ITokenAcquisition` or `IDownstreamApi`, and forwards.\n\nThe browser never holds an access token, so XSS cannot exfiltrate it; refresh is invisible, handled by the server's token cache; and logout is a real server-side session end. The costs: same origin is required (the hosting lesson), CSRF protection must be in place (`SameSite=Strict` plus an antiforgery token for non-GET requests), and the BFF is a stateful component that needs a distributed cache when it scales out.\n\nFor Blazor Server this is the only sensible pattern, and the .NET templates with `Microsoft.Identity.Web` produce it directly. For React it is a small amount of extra setup and the recommended shape for anything handling money, health or admin privileges.",
      },
      {
        heading: "Validating tokens in ASP.NET Core",
        body: 'Whichever pattern, the API validates bearer tokens with `AddMicrosoftIdentityWebApi` (or plain `AddJwtBearer` with the Entra authority). It downloads signing keys from the OpenID Connect metadata, checks signature, issuer, audience and expiry, and maps claims. Then:\n\n- **Scopes** describe what the client app is allowed to do on the user\'s behalf: `RequireScope("Orders.ReadWrite")` or `[RequiredScope]`. They are delegated permissions.\n- **App roles** describe what the user is: `roles` claim, checked with `RequireRole`. Assign them to groups in Entra for manageability.\n- **Application permissions** (`roles` on a client credentials token) are for daemon clients with no user; check `azp` or `appid` and the roles claim.\n\nCombine as policies: `builder.Services.AddAuthorizationBuilder().AddPolicy("ApproveOrders", p => p.RequireScope("Orders.ReadWrite").RequireRole("Orders.Approver"))`. Keep fine-grained, per-record rules in your own authorisation handlers backed by data, as in the identity lesson.\n\nOne registration per API and one per client. Sharing one app registration for both is common in demos and wrong in production, because it conflates the audience the API must check.',
      },
      {
        heading: "External ID, refresh and silent renewal",
        body: "For consumer apps, **Entra External ID** uses the same flows with a different authority (`https://<tenant>.ciamlogin.com/`), self-service sign-up user flows, and social providers. `Microsoft.Identity.Web` and MSAL support it with a configuration change, so the two patterns above apply unchanged. Custom claims from sign-up attributes arrive in the token.\n\n**Refresh and silent renewal** differ by pattern. In MSAL, `acquireTokenSilent` returns a cached token or uses the refresh token; when that fails it throws `InteractionRequiredAuthError` and the app must call `acquireTokenRedirect` or `acquireTokenPopup`. Wrap this once in a function TanStack Query's `queryFn` uses, not in every component. In the BFF, Microsoft.Identity.Web refreshes using the server-side cache, and a session that cannot be refreshed results in a 401 that the React app handles by redirecting to `/signin`.\n\nShort access-token lifetimes are fine in both; what matters is that renewal is automatic and that a revoked session stops working within minutes. Continuous Access Evaluation support in MSAL and Microsoft.Identity.Web shortens that further for critical events.",
      },
      {
        heading: "How to decide",
        body: "Choose **BFF with cookies** when:\n\n- The app handles money, health data, personal data at scale or admin functions.\n- You control the hosting and can keep the SPA and BFF same-origin.\n- A security review or a customer questionnaire will ask where tokens are stored.\n\nChoose **MSAL in the SPA** when:\n\n- The app is low-risk internal tooling, or a quick prototype.\n- The API is hosted on another origin you do not control, or several SPAs on different hosts share it.\n- The team already has a CORS-based layout and no stateful server for the front end.\n\nMistakes to avoid: storing tokens in `localStorage`, requesting broad Graph scopes on first sign-in instead of incrementally, putting a user id from the client into a request body and trusting it (always take identity from the validated token), and forgetting that Static Web Apps' built-in auth is a separate, simpler system that can replace both patterns for small apps.",
      },
    ],
    diagram: {
      caption:
        "The BFF pattern: the browser holds a cookie, the ASP.NET Core BFF holds tokens in a Redis-backed cache and calls the API on the user's behalf.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "cookie only, no tokens",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "entra",
          label: "Entra ID / External ID",
          sub: "auth code + PKCE",
          col: 1,
          row: 0,
          kind: "external",
        },
        {
          id: "bff",
          label: "ASP.NET Core BFF",
          sub: "Microsoft.Identity.Web",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "cache",
          label: "Token cache",
          sub: "Azure Cache for Redis",
          col: 2,
          row: 3,
          kind: "data",
        },
        {
          id: "api",
          label: "Orders API",
          sub: "validates bearer token",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "msal",
          label: "MSAL.js variant",
          sub: "tokens in browser",
          col: 0,
          row: 3,
          kind: "note",
        },
      ],
      edges: [
        { from: "spa", to: "bff", label: "same-origin cookie" },
        { from: "bff", to: "entra", label: "sign-in, refresh" },
        { from: "bff", to: "cache", label: "ITokenAcquisition" },
        { from: "bff", to: "api", label: "Bearer, scope" },
        {
          from: "msal",
          to: "api",
          label: "Bearer from browser",
          style: "dashed",
        },
        {
          from: "msal",
          to: "entra",
          label: "acquireTokenSilent",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "The app handles money, health or admin privileges and tokens must stay out of the browser: BFF with cookies",
      "SPA and API can be same-origin via the SPA proxy, Static Web Apps or Front Door: BFF is available",
      "A low-risk internal tool or prototype on a CORS layout needs sign-in quickly: MSAL.js with PKCE",
      "Consumers sign up with email or social accounts: Entra External ID with either pattern",
    ],
    avoidWhen: [
      "MSAL.js with tokens in localStorage for an app with any sensitive data",
      "A BFF without CSRF protection, or one that scales out with an in-memory token cache",
      "One shared app registration for both the SPA and the API",
    ],
    microsoftStack: [
      {
        name: "Microsoft.Identity.Web",
        role: "Cookie sign-in, token acquisition and downstream API calls for the BFF; bearer validation for the API.",
      },
      {
        name: "Microsoft Entra ID app registrations",
        role: "One for the client, one for the API exposing scopes and app roles.",
      },
      {
        name: "Microsoft Entra External ID",
        role: "Consumer sign-up and social providers with the same libraries and flows.",
      },
      {
        name: "Distributed token cache on Azure Cache for Redis",
        role: "Lets the BFF scale out without losing sessions.",
      },
      {
        name: "ASP.NET Core authorization policies",
        role: "Combine RequireScope and RequireRole; delegate per-record checks to handlers.",
      },
    ],
    reactStack: [
      {
        name: "@azure/msal-browser and @azure/msal-react",
        role: "Auth code with PKCE, MsalProvider, useMsal and acquireTokenSilent for the SPA pattern.",
      },
      {
        name: "A single authenticated fetch wrapper",
        role: "Handles 401 by redirecting to sign-in (BFF) or acquiring a token (MSAL) so queries stay simple.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "A BFF adds server-side session state compared with tokens in the SPA.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Same-origin hosting and CSRF setup take longer than dropping in MSAL.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Server-side refresh avoids iframe renewal failures under cookie blocking.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Logout and revocation take effect at the server rather than when a cached token expires.",
      },
      {
        attribute: "scalability",
        effect: -1,
        note: "Token caches must be distributed when the BFF scales out.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Sign-in logs in Entra cover both; the BFF adds a cache to monitor.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "Both patterns test with a fake authentication handler in WebApplicationFactory.",
      },
      {
        attribute: "team-autonomy",
        effect: -1,
        note: "The BFF couples the front end to a specific server host.",
      },
    ],
    related: [
      "identity-and-secrets",
      "aspnet-react-hosting",
      "api-gateway-bff",
      "security-architecture",
    ],
    checks: [
      {
        id: "entra-id-auth-q1",
        prompt:
          "A payments portal for business customers, React SPA with an ASP.NET Core API, same team. Which auth pattern?",
        options: [
          "MSAL.js with tokens cached in localStorage for persistence",
          "BFF with an HttpOnly cookie and tokens held server-side",
          "Basic authentication over HTTPS",
          "A long-lived API key embedded in the SPA build",
        ],
        answer: 1,
        explanation:
          "Money plus a team that controls hosting means the BFF: no token in the browser, real logout, invisible refresh. MSAL is acceptable for low-risk tools; localStorage is the worst place for tokens in any app.",
      },
      {
        id: "entra-id-auth-q2",
        prompt:
          'In an ASP.NET Core API, what does `RequireScope("Orders.ReadWrite")` check?',
        options: [
          "That the user is in an Entra group",
          "That the client app was granted delegated permission to act on the user's behalf for that scope",
          "That the API has a Managed Identity",
          "That the request came from the same origin",
        ],
        answer: 1,
        explanation:
          "Scopes are delegated permissions carried in the scp claim; they describe what the client may do for the user. Roles describe the user, Managed Identity is for the API's own outbound calls, and origin is a CORS matter.",
      },
      {
        id: "entra-id-auth-q3",
        prompt:
          "MSAL's acquireTokenSilent throws InteractionRequiredAuthError. What should the app do?",
        options: [
          "Retry silently in a loop",
          "Fall back to acquireTokenRedirect or acquireTokenPopup to let the user sign in again",
          "Use the ID token as the access token",
          "Clear localStorage and reload",
        ],
        answer: 1,
        explanation:
          "The error means Entra needs user interaction, for example consent or an expired session, so an interactive call is the only fix. Looping cannot succeed, and ID tokens are not valid for API access.",
      },
    ],
    sources: [
      {
        title: "Microsoft Entra: Microsoft identity platform documentation",
        url: "https://learn.microsoft.com/entra/identity-platform/",
      },
      {
        title: "Microsoft.Identity.Web documentation",
        url: "https://learn.microsoft.com/entra/msal/dotnet/microsoft-identity-web/",
      },
      {
        title: "ASP.NET Core: Overview of ASP.NET Core authentication",
        url: "https://learn.microsoft.com/aspnet/core/security/authentication/",
      },
    ],
  },
  {
    id: "realtime-signalr",
    trackId: "fullstack",
    title: "Real-time with SignalR",
    tagline:
      "Hubs push, Azure SignalR Service scales out, the React client updates the query cache.",
    level: 2,
    minutes: 7,
    summary:
      "SignalR gives an ASP.NET Core app a push channel to the browser with fallbacks and reconnection handled. This lesson covers hubs, groups and the scale-out options, the React client with @microsoft/signalr feeding TanStack Query, the cases where polling or server-sent events are enough, and the pattern for turning a Service Bus event into a live UI update.",
    sections: [
      {
        heading: "Hubs, groups and connections",
        body: 'A **hub** is a class on the server whose methods clients can call and which can call methods on clients. Clients connect over WebSockets (with server-sent events and long polling as fallbacks), get a connection id, and can be added to **groups** such as `order-123` or `tenant-acme` so the server can broadcast to exactly the people who care.\n\n```csharp\npublic class OrdersHub : Hub\n{\n    public Task Watch(Guid orderId) =>\n        Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");\n}\n\n// from anywhere on the server\nawait hub.Clients.Group($"order-{id}").SendAsync("OrderUpdated", dto);\n```\n\nUse `IHubContext<OrdersHub>` to push from endpoints, background services or message handlers. Strongly typed hubs (`Hub<IOrdersClient>`) catch method-name typos at compile time. Authentication is the same as the API\'s: cookies work on the same origin, and bearer tokens are passed with `accessTokenFactory` on the client and read by the JWT handler from the query string for WebSockets.\n\nKeep hubs thin: they receive and route, and business logic stays in the same handlers the REST endpoints use.',
      },
      {
        heading: "Scaling out: backplanes and Azure SignalR Service",
        body: "Connections are held in memory by the instance that accepted them, so with two instances a broadcast from one does not reach the other's clients. Two fixes:\n\n- A **Redis backplane** (`AddStackExchangeRedis`) relays every message through Azure Cache for Redis so each instance forwards to its own connections. Simple, but every instance still terminates connections and the app must support sticky sessions for the non-WebSocket fallbacks.\n- **Azure SignalR Service** takes over the connections entirely: clients connect to the service, your app connects to it once as the hub host, and the service handles fan-out, scaling to hundreds of thousands of connections, and no sticky sessions. `AddSignalR().AddAzureSignalR()` is the whole change. It also has a **serverless mode** where Azure Functions bindings publish messages with no hub host at all.\n\nFor anything on App Service or Container Apps with more than one instance, Azure SignalR Service is the default. The backplane remains reasonable for a single-region, two-instance app that already has Redis. Blazor Server circuits use the same service for the same reason.",
      },
      {
        heading: "The React client and TanStack Query",
        body: '`@microsoft/signalr` provides `HubConnectionBuilder` with automatic reconnect. Create one connection per app in a context or a module-level singleton, start it after auth is ready, and have hub messages update the **TanStack Query cache** rather than separate component state:\n\n```ts\nconnection.on("OrderUpdated", (order: OrderDto) => {\n  queryClient.setQueryData(["orders", order.id], order);\n  queryClient.invalidateQueries({ queryKey: ["orders", "list"] });\n});\n```\n\nThat way components keep using `useQuery` and the push simply makes the cache fresh. For high-frequency streams (prices, telemetry) buffer updates and apply them on an animation frame, or keep them in a Zustand store designed for that churn, because writing to the query cache hundreds of times a second re-renders everything subscribed.\n\nJoin groups in a `useEffect` keyed by the entity being viewed, and leave on cleanup. On reconnect, re-join groups and invalidate the relevant queries, because messages sent while disconnected are gone; SignalR does not persist them.',
      },
      {
        heading: "When polling or SSE is enough",
        body: "SignalR is not the first tool for every live view:\n\n- **Polling** with TanStack Query's `refetchInterval` (10 to 60 seconds) is right for dashboards where a minute of staleness is fine, for small user counts, and for anything behind a CDN or proxy that complicates WebSockets. It needs no new infrastructure and no connection management.\n- **Server-sent events** fit one-way server-to-client streams such as progress updates, AI token streaming or log tailing. ASP.NET Core 10 supports returning `ServerSentEvents` results from Minimal APIs, and the browser `EventSource` reconnects on its own. No hub, no service, no client library.\n- **SignalR** earns its place when updates must be sub-second, when the server needs to target specific users or groups, when the client also sends messages over the same channel (chat, collaborative editing), or when thousands of clients would make polling a load problem.\n\nA reasonable progression is polling first, SSE for the one progress screen, SignalR when a product requirement names live collaboration or notifications.",
      },
      {
        heading: "Event-driven updates from Service Bus to the browser",
        body: 'The common production shape is a message handler that reacts to a domain event and pushes to interested clients:\n\n- A worker (Container App or Function) consumes `OrderShipped` from a Service Bus subscription.\n- It updates its read model, then calls `IHubContext<OrdersHub>.Clients.Group("order-123").SendAsync("OrderUpdated", dto)`, or in serverless mode publishes through the Azure SignalR Service REST API or Functions output binding.\n- Azure SignalR Service fans out to every browser in the group across all instances.\n- The React handler writes the DTO into the query cache and the UI updates.\n\nKeep the message small (ids and a version, or a DTO the client already understands) and treat it as a hint: on receipt, the client can refetch the authoritative record if the payload might be stale. Authorise group membership on join, not on send, so a user who is not allowed to see order 123 cannot subscribe to it. Put the hub host behind the same authentication as the API, and never broadcast tenant data to a hub-wide group.',
      },
    ],
    diagram: {
      caption:
        "A Service Bus event handled by a worker becomes a group broadcast through Azure SignalR Service, and the React client updates the TanStack Query cache.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "@microsoft/signalr",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "qc",
          label: "TanStack Query cache",
          sub: "setQueryData",
          col: 0,
          row: 3,
          kind: "data",
        },
        {
          id: "asrs",
          label: "Azure SignalR Service",
          sub: "holds connections",
          col: 1,
          row: 1,
          kind: "external",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "OrdersHub host",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "worker",
          label: "Event worker",
          sub: "IHubContext push",
          col: 3,
          row: 2,
          kind: "service",
        },
        {
          id: "sb",
          label: "Service Bus topic",
          sub: "OrderShipped",
          col: 4,
          row: 2,
          kind: "queue",
        },
      ],
      edges: [
        { from: "spa", to: "asrs", label: "WebSocket, Watch(id)" },
        { from: "asrs", to: "api", label: "hub protocol" },
        { from: "sb", to: "worker", label: "subscription" },
        { from: "worker", to: "asrs", label: "Group(order-123)" },
        { from: "asrs", to: "spa", label: "OrderUpdated" },
        { from: "spa", to: "qc", label: "cache update", style: "dashed" },
      ],
    },
    useWhen: [
      "Users must see changes within a second, such as order status, chat or presence",
      "The server needs to target specific users or groups rather than broadcast to everyone",
      "Clients also send messages over the channel, as in collaborative editing",
      "Thousands of concurrent viewers would make polling a database load problem",
    ],
    avoidWhen: [
      "A dashboard where a 30-second refetchInterval is acceptable and the user count is small",
      "A one-way progress or token stream that server-sent events already cover",
      "A multi-instance deployment with no backplane or Azure SignalR Service, where broadcasts silently miss clients",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core SignalR",
        role: "Hubs, groups, strongly typed clients and IHubContext for pushing from anywhere.",
      },
      {
        name: "Azure SignalR Service",
        role: "Managed connection handling and fan-out across instances, plus serverless mode with Functions bindings.",
      },
      {
        name: "Redis backplane (AddStackExchangeRedis)",
        role: "The smaller scale-out option when Azure Cache for Redis is already present.",
      },
      {
        name: "Azure Service Bus subscriptions",
        role: "Source of domain events that workers turn into targeted pushes.",
      },
      {
        name: "Minimal API ServerSentEvents results",
        role: "One-way streaming without SignalR for progress and token streams.",
      },
    ],
    reactStack: [
      {
        name: "@microsoft/signalr HubConnectionBuilder",
        role: "One connection per app with automatic reconnect and accessTokenFactory.",
      },
      {
        name: "TanStack Query setQueryData and invalidateQueries",
        role: "Hub messages refresh the cache so components keep using useQuery.",
      },
      {
        name: "refetchInterval",
        role: "Polling for views where staleness of seconds to a minute is fine.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "A persistent connection and group lifecycle are more to manage than a refetch interval.",
      },
      {
        attribute: "performance",
        effect: 2,
        note: "Sub-second updates with no polling overhead.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Azure SignalR Service carries connections so the API does not.",
      },
      {
        attribute: "reliability",
        effect: -1,
        note: "Messages during a disconnect are lost; clients must re-join and refetch.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Clients converge on fresh data far sooner than with polling.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Connection counts, message rates and service units become things to watch.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Azure SignalR Service bills per unit and messages; polling costs only API calls.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "Hubs are testable with the in-process test server and a real client.",
      },
    ],
    related: [
      "azure-messaging-choices",
      "react-server-state",
      "blazor-vs-react",
      "messaging-outbox-saga",
    ],
    checks: [
      {
        id: "realtime-signalr-q1",
        prompt:
          "An API on Container Apps scales to three replicas and SignalR broadcasts reach only some users. What is the fix?",
        options: [
          "Increase the WebSocket timeout",
          "Add Azure SignalR Service (or a Redis backplane) so messages reach connections on every replica",
          "Switch the client to long polling",
          "Scale back to one replica permanently",
        ],
        answer: 1,
        explanation:
          "Each replica only knows its own connections. Azure SignalR Service holds all connections centrally; a backplane relays messages between replicas. Transport changes do not solve fan-out, and one replica defeats scaling.",
      },
      {
        id: "realtime-signalr-q2",
        prompt:
          "A progress bar for a report that takes two minutes to generate. Which mechanism is proportionate?",
        options: [
          "A SignalR hub with a group per report",
          "Server-sent events from a Minimal API endpoint consumed by EventSource",
          "A Service Bus queue the browser reads",
          "A refetchInterval of one millisecond",
        ],
        answer: 1,
        explanation:
          "One-way progress is exactly what SSE handles with no hub or service. SignalR works but is more machinery than needed, browsers cannot read Service Bus, and millisecond polling is a denial of service on your own API.",
      },
      {
        id: "realtime-signalr-q3",
        prompt:
          "Where should a React app put the DTO it receives from an OrderUpdated hub message?",
        options: [
          "In a useState inside each component that shows orders",
          "In the TanStack Query cache via setQueryData, with a list invalidation",
          "In localStorage",
          "Nowhere; call window.location.reload()",
        ],
        answer: 1,
        explanation:
          "Writing into the query cache keeps a single source of server state so every useQuery consumer updates. Per-component state duplicates and drifts, localStorage is persistence not state, and a reload throws away the benefit of push.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core SignalR documentation",
        url: "https://learn.microsoft.com/aspnet/core/signalr/introduction",
      },
      {
        title: "Azure SignalR Service documentation",
        url: "https://learn.microsoft.com/azure/azure-signalr/",
      },
      {
        title: "TanStack Query: Query invalidation",
        url: "https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation",
      },
    ],
  },
];
