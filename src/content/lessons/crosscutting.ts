import type { Lesson } from "../types";

/**
 * Cross-cutting track: the concerns every system on the Microsoft stack
 * has to answer regardless of its style. Observability, resilience,
 * security, delivery and backend testing, each as a set of decisions
 * rather than a tutorial.
 */
export const CROSSCUTTING_LESSONS: Lesson[] = [
  {
    id: "observability",
    trackId: "crosscutting",
    title: "Observability",
    tagline:
      "Logs, metrics and traces with one correlation id from the browser to the database.",
    level: 2,
    minutes: 8,
    summary:
      "Observability is the ability to ask new questions of a running system without shipping new code, built from structured logs, metrics and distributed traces. On the Microsoft stack that means OpenTelemetry in ASP.NET Core, Azure Monitor and Application Insights in production, the .NET Aspire dashboard locally, and W3C trace context carried from the React front end through every service and queue.",
    sections: [
      {
        heading: "Three signals, one question",
        body: 'Every incident investigation asks the same question: what happened to this request, and why was it different from the others? Three signals answer it together.\n\n- **Logs** are events with context: structured properties rather than sentences, so `OrderId` and `TenantId` are fields you can filter on. They answer "what did this request do?".\n- **Metrics** are numbers over time: request rate, error ratio, p95 duration, queue depth. They are cheap to store, cheap to alert on, and answer "is it normal right now?".\n- **Traces** follow one request across processes as a tree of spans, each with a duration. They answer "where did the time go?" and are the only signal that works once a request crosses a process boundary.\n\nThe thing that ties them together is a **correlation id**, in practice the W3C `traceparent` trace id, attached to every log line, every span and every message. Without it you have three dashboards; with it you have one story.',
      },
      {
        heading: "OpenTelemetry in .NET",
        body: 'OpenTelemetry is the vendor-neutral standard and .NET supports it natively: `ActivitySource` produces spans, `Meter` produces metrics and `ILogger` produces logs, all in `System.Diagnostics`. The `OpenTelemetry.Extensions.Hosting` package wires them up:\n\n```csharp\nbuilder.Services.AddOpenTelemetry()\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddSqlClientInstrumentation()\n        .AddSource("Ordering"))\n    .WithMetrics(m => m\n        .AddAspNetCoreInstrumentation()\n        .AddRuntimeInstrumentation());\n```\n\nASP.NET Core reads an incoming `traceparent` header and starts a child span; `HttpClient` propagates it outward automatically; the Azure Service Bus SDK stamps it on messages as `Diagnostic-Id` so a consumer continues the same trace. Add your own spans around the operations that matter (`activitySource.StartActivity("PlaceOrder")`) and your own counters for business events.\n\nExport goes either through OTLP to a collector or straight to Application Insights with the Azure Monitor distro (`Azure.Monitor.OpenTelemetry.AspNetCore`, one `UseAzureMonitor()` call). Use log scopes or enrich spans with tenant and user ids, never with tokens or personal data.',
      },
      {
        heading: "Azure Monitor and Application Insights",
        body: 'Application Insights is the application-level view in Azure Monitor, backed by a Log Analytics workspace. Requests, dependencies (SQL, HTTP, Service Bus), exceptions and custom traces land in tables you query with KQL; the Application Map draws the dependency graph from the dependency spans; Live Metrics shows the last minute while you deploy.\n\nIngestion is billed per gigabyte, so sampling is a design decision rather than a tuning knob. Keep 100% of errors and a fixed percentage of successful requests, set a daily cap on the workspace, and decide retention per table. A chatty Information-level log in a hot path costs more than the compute running it.\n\nAlerts come in two kinds. **Metric alerts** fire on pre-aggregated numbers (failed request percentage, server response time) within a minute or two. **Log alerts** run a KQL query on a schedule and fire on its result, which is how you alert on a business condition such as "no orders in 15 minutes". Both route through action groups to email, Teams, PagerDuty or a webhook. Availability tests ping the public endpoint from several regions and are the cheapest outside-in signal you can have.',
      },
      {
        heading: "Correlating React with ASP.NET Core",
        body: "The trace should start in the browser. The Application Insights JavaScript SDK (`@microsoft/applicationinsights-web`) records page views, JavaScript errors and every `fetch` or XHR as a dependency; with `enableCorsCorrelation` and W3C distributed tracing enabled it adds a `traceparent` header to each request, and the ASP.NET Core side continues the same trace. In Application Insights the page view, the AJAX call, the server request and its SQL dependency then share one operation id and show as one end-to-end transaction.\n\nTwo things break this in practice. The API's CORS policy must allow the `traceparent` header, and any proxy or API gateway in between must pass it through. OpenTelemetry JS with the web tracer is the vendor-neutral alternative and does the same thing through an OTLP collector.\n\nOn the front end, record what the user felt: Core Web Vitals, route-change timing, and failed queries. TanStack Query's global `QueryCache` and `MutationCache` `onError` callbacks are the single place to report a failed request with its query key, which is far more useful in a log than a stack trace from a generic error boundary.",
      },
      {
        heading: "Locally: the .NET Aspire dashboard",
        body: ".NET Aspire gives you the production shape on a laptop. The AppHost project starts the API, the worker and containers for SQL Server or the Service Bus emulator; the ServiceDefaults project every service references wires OpenTelemetry tracing, metrics and logging with OTLP export, health check endpoints and the standard HTTP resilience handler.\n\nThe Aspire dashboard receives that OTLP stream and shows structured logs, traces and metrics for every resource, so a developer can follow a request from the API into the worker through the queue without an Azure subscription. The dashboard also runs as a standalone container for applications that do not use the Aspire orchestration, which makes it a cheap way to adopt OpenTelemetry one service at a time.\n\nThe point is that the instrumentation is identical in both places; only the exporter changes. Locally the OTLP endpoint is the dashboard. In Azure it is the Azure Monitor exporter or a collector. Developers who see traces every day write better spans and notice missing correlation before production does.",
      },
      {
        heading: "What to alert on",
        body: "Page a person only for symptoms users feel and that need a human now: error rate above the SLO threshold for several minutes, p95 latency over budget, the availability test failing from more than one region, a Service Bus dead-letter count rising, queue age growing past the processing budget. Everything else (CPU, memory, a single exception) is a ticket or a dashboard, because a page that is not actionable trains people to ignore pages.\n\nCommon mistakes:\n\n- Logging everything at Information with no sampling, then turning telemetry off when the bill arrives.\n- String-concatenated log messages, so the order id is not a field and cannot be filtered.\n- Losing correlation in background work: a worker that starts a new trace per message instead of continuing the one on the message.\n- Alerting on causes (CPU at 80%) instead of symptoms.\n- No runbook link in the alert. The person paged at 3am should not be searching the wiki.",
      },
    ],
    diagram: {
      caption:
        "One trace id travels from the browser through the API, the queue and the worker; locally it lands in the Aspire dashboard, in Azure in Application Insights.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "AI JS SDK, traceparent",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "OpenTelemetry",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "dependency spans",
          col: 2,
          row: 0,
          kind: "data",
        },
        {
          id: "bus",
          label: "Service Bus",
          sub: "Diagnostic-Id on message",
          col: 1,
          row: 2,
          kind: "queue",
        },
        {
          id: "worker",
          label: "Worker",
          sub: "continues the trace",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "monitor",
          label: "Azure Monitor",
          sub: "App Insights, KQL",
          col: 3,
          row: 1,
          kind: "external",
        },
        {
          id: "aspire",
          label: "Aspire dashboard",
          sub: "OTLP, local only",
          col: 3,
          row: 2,
          kind: "external",
        },
        {
          id: "alerts",
          label: "Alerts",
          sub: "action group, on-call",
          col: 4,
          row: 1,
          kind: "external",
        },
      ],
      edges: [
        { from: "spa", to: "api", label: "traceparent header" },
        { from: "api", to: "sql" },
        { from: "api", to: "bus", label: "publish" },
        { from: "bus", to: "worker" },
        {
          from: "spa",
          to: "monitor",
          label: "page views, JS errors",
          style: "dashed",
        },
        {
          from: "api",
          to: "monitor",
          label: "Azure Monitor exporter",
          style: "dashed",
        },
        { from: "worker", to: "monitor", style: "dashed" },
        {
          from: "api",
          to: "aspire",
          label: "OTLP in development",
          style: "dashed",
        },
        { from: "monitor", to: "alerts", label: "SLO breach" },
      ],
    },
    useWhen: [
      "A request crosses more than one process (API plus worker, or several services) and nobody can say where the time went",
      'Support tickets say "it was slow at three o\'clock" and there is no way to find that request',
      "The only production signal is the App Service or Container Apps CPU chart",
      "You are about to promise a latency or availability target and need to measure it continuously",
    ],
    avoidWhen: [
      "A single-process internal tool with ten users: structured logs to Application Insights and one availability test are enough; skip custom metrics and dashboards",
      "Telemetry cost is unbounded: do not enable verbose logging and full sampling on a high-traffic API without a daily cap",
    ],
    microsoftStack: [
      {
        name: "OpenTelemetry for .NET",
        role: "`OpenTelemetry.Extensions.Hosting` with ASP.NET Core, HttpClient and SQL client instrumentation; your own spans via `ActivitySource`.",
      },
      {
        name: "Azure Monitor OpenTelemetry Distro",
        role: "`Azure.Monitor.OpenTelemetry.AspNetCore` exports traces, metrics and logs to Application Insights with one call.",
      },
      {
        name: "Application Insights and Log Analytics",
        role: "Storage, KQL queries, Application Map, Live Metrics and availability tests.",
      },
      {
        name: ".NET Aspire ServiceDefaults and dashboard",
        role: "Identical instrumentation locally, with traces and logs visible without Azure.",
      },
      {
        name: "Azure Monitor alerts and action groups",
        role: "Metric and log alerts routed to the people or systems that act on them.",
      },
      {
        name: "Azure Service Bus SDK",
        role: "Propagates the trace id on each message so consumers continue the trace.",
      },
    ],
    reactStack: [
      {
        name: "@microsoft/applicationinsights-web",
        role: "Page views, JavaScript exceptions and fetch dependencies with W3C correlation to the API.",
      },
      {
        name: "OpenTelemetry JS web tracer",
        role: "Vendor-neutral alternative that sends browser spans to a collector.",
      },
      {
        name: "TanStack Query cache callbacks",
        role: "Global `onError` handlers report failed queries and mutations with their keys.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "More packages, an exporter and a workspace to configure.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "A day of setup, less with Aspire ServiceDefaults.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Metrics show which component to scale instead of guessing.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Traces find the slow dependency; instrumentation overhead is small.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "Incidents are found and diagnosed in minutes instead of hours.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Production data shows which paths are hot before you refactor.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "The same traces show what an integration test exercised.",
      },
      {
        attribute: "operability",
        effect: 2,
        note: "The whole point: on-call can see the system.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Ingestion is billed per gigabyte; sampling and caps are mandatory.",
      },
    ],
    related: [
      "resilience",
      "aspire-dapr",
      "messaging-outbox-saga",
      "azure-compute-choices",
    ],
    checks: [
      {
        id: "observability-q1",
        prompt:
          "A customer reports that checkout was slow at 15:02. Which signal lets you find that request and see where the time went?",
        options: [
          "The CPU metric of the App Service plan",
          "A distributed trace with the operation id, including the SQL and Service Bus dependency spans",
          "The daily exception count",
          "The Container Apps replica count",
        ],
        answer: 1,
        explanation:
          "Only a trace follows one request across processes with timings per step. CPU and replica counts describe the host, and an exception count says nothing about a slow but successful request.",
      },
      {
        id: "observability-q2",
        prompt:
          "The React app's fetch calls appear in Application Insights but are not linked to the server requests. What is the most likely cause?",
        options: [
          "The server is not using OpenTelemetry",
          "CORS correlation is not enabled in the JavaScript SDK, or the API's CORS policy does not allow the traceparent header",
          "Application Insights cannot correlate browser and server telemetry",
          "Server-side sampling is too aggressive",
        ],
        answer: 1,
        explanation:
          "Browser-to-server correlation depends on the traceparent header being sent and accepted. The server would still produce its own traces without OpenTelemetry via the distro, and sampling drops whole operations rather than breaking links.",
      },
      {
        id: "observability-q3",
        prompt: "Which alert should wake someone at night?",
        options: [
          "CPU above 70% for five minutes",
          "A new Information-level log entry",
          "Failed request rate above the SLO threshold for ten minutes, or the Service Bus dead-letter count rising",
          "A deployment completed",
        ],
        answer: 2,
        explanation:
          "Pages are for symptoms users feel that need a human now. High CPU may be fine, a log line is noise, and a deployment notification belongs in a channel.",
      },
    ],
    sources: [
      {
        title: ".NET observability with OpenTelemetry",
        url: "https://learn.microsoft.com/dotnet/core/diagnostics/observability-with-otel",
      },
      {
        title: "Azure Monitor documentation",
        url: "https://learn.microsoft.com/azure/azure-monitor/",
      },
      {
        title: ".NET Aspire documentation",
        url: "https://learn.microsoft.com/dotnet/aspire/",
      },
    ],
  },
  {
    id: "resilience",
    trackId: "crosscutting",
    title: "Resilience patterns",
    tagline:
      "Timeouts, retries, breakers and bulkheads: fail fast and never amplify an outage.",
    level: 2,
    minutes: 9,
    summary:
      "Resilience is how a system behaves when a dependency is slow, flaky or gone: it bounds the damage with timeouts and bulkheads, recovers from transient faults with bounded retries, and stops hammering a failing dependency with a circuit breaker. In .NET the standard resilience handler and Polly provide the mechanics; the design decisions are which calls are safe to retry, where idempotency comes from, and how to avoid retry storms.",
    sections: [
      {
        heading: "Failure is normal",
        body: "In a system with more than one process, something is always slightly broken: Azure SQL returns a transient error during a failover, a downstream API throttles with 429, a Service Bus connection resets, a pod restarts mid-request. Most of these faults last milliseconds to seconds. Resilience design accepts that and asks three questions in order.\n\nHow do we **contain** a failure so one slow dependency does not take the whole API down? How do we **recover** from faults that will pass if we wait a moment? And how do we **degrade** when a dependency is really gone, so users get a reduced answer instead of an error page?\n\nThe patterns compose in a fixed order on every outbound call: a total timeout outermost, then a retry, then a circuit breaker, then a per-attempt timeout, with a bulkhead (concurrency limit) in front of all of it. Get the order wrong and a retry can run after the caller has given up, or a breaker can trip on timeouts it never sees.",
      },
      {
        heading: "The patterns, with their rules",
        body: "- **Timeout**: every outbound call has one, and it is short. `HttpClient` defaults to 100 seconds, which is long enough to exhaust a thread pool. Two seconds per attempt, ten in total, is a typical starting point for an API-to-API call.\n- **Retry**: only for transient faults (408, 429, 5xx, connection errors) and only for idempotent operations. At most two or three attempts, exponential backoff with jitter, and respect a `Retry-After` header when one is sent.\n- **Circuit breaker**: after a failure ratio over a window, stop calling the dependency for a break period and fail fast; then let one probe through (half-open). This protects the dependency from you and your threads from it. Scope it per dependency, or per endpoint if one endpoint of a service fails while others work.\n- **Bulkhead**: a concurrency limit per dependency, so a slow Catalog API can occupy at most, say, 50 in-flight calls and the rest of the API keeps serving.\n- **Fallback**: a cached value, a default, a feature hidden. Decided per use case, never applied globally.\n- **Hedging**: send a second request if the first is slow, for idempotent reads only.",
      },
      {
        heading: "Polly and the standard resilience handler",
        body: "`Microsoft.Extensions.Http.Resilience` adds a complete pipeline to a typed `HttpClient` in one call: rate limiter, total timeout, retry, circuit breaker and attempt timeout, in the right order, with sensible defaults you can adjust.\n\n```csharp\nbuilder.Services\n    .AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri(\"https://catalog\"))\n    .AddStandardResilienceHandler(o =>\n    {\n        o.Retry.MaxRetryAttempts = 2;\n        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);\n        o.CircuitBreaker.FailureRatio = 0.5;\n    });\n```\n\nFor anything that is not HTTP, Polly v8's `ResiliencePipelineBuilder` builds the same strategies (`AddTimeout`, `AddRetry`, `AddCircuitBreaker`) around any delegate. Two things already have resilience built in and should not be wrapped again: EF Core's execution strategy (`EnableRetryOnFailure` on the SQL Server provider) handles Azure SQL transient errors, and the Azure SDK clients for Storage, Key Vault, Cosmos DB and Service Bus retry through their own `RetryOptions`. For a Service Bus consumer, the retry mechanism is the broker: a failed handler abandons the message, the max delivery count bounds attempts, and the dead-letter queue holds what never succeeded. .NET Aspire's ServiceDefaults turns the standard handler on for every `HttpClient` by default.",
      },
      {
        heading: "Idempotency and retry storms",
        body: "A retry is only safe if the operation can run twice with the same result. `GET /items/42` is. `POST /orders` is not, unless the server makes it so: the client sends an `Idempotency-Key` header, the server stores the key with the response (a table with a unique index, or a cache entry with a TTL), and a repeat returns the stored response instead of creating a second order. Service Bus delivers at least once, so every consumer needs the same property, either naturally (set status to Shipped) or via an inbox table keyed on message id.\n\nThe opposite danger is the **retry storm**. A dependency slows down, every caller retries three times, load triples, and the dependency that was struggling is now dead; the retries caused the outage they were meant to survive. Retries also multiply across layers: if the browser, the BFF and the API each retry three times, one click can become 27 attempts.\n\nThe defences are backoff with jitter, a circuit breaker so retries stop once failure is systemic, no retries on 4xx other than 408 and 429, and retrying at one layer only, usually the one closest to the user, with the inner layers failing fast.",
      },
      {
        heading: "Resilience in the React client",
        body: 'The front end is the last retry layer and should be a careful one. TanStack Query v5 retries failed queries three times with exponential backoff by default and does not retry mutations, which is the right default for GET and POST respectively. Tune it per query rather than globally: `retry: (count, error) => isTransient(error) && count < 2`, with no retries on 401, 403 or 404, and pass the `signal` the query gives you to `fetch` so a navigation or an `AbortSignal.timeout` actually cancels the request.\n\nStale data is a fallback: a `staleTime` of a few minutes plus keeping cached data while refetching means a brief API outage shows yesterday\'s catalogue instead of an error. `networkMode` decides what happens offline. For mutations that must be retried (a form submit on a flaky connection), generate the idempotency key on the client when the form opens, so the retry carries the same key.\n\nError boundaries with `useQueryErrorResetBoundary` give a "try again" at the feature level, so a failing recommendations panel does not blank the checkout page. That is the bulkhead pattern applied to UI: isolate the failure to the part that failed.',
      },
      {
        heading: "Common mistakes",
        body: '- Retries without a timeout, so a hung connection is retried after 100 seconds, three times.\n- Wrapping Azure SDK clients or EF Core in another Polly retry, multiplying attempts.\n- One circuit breaker for a whole client when one endpoint fails and five others are healthy; the breaker takes down the healthy ones too.\n- Retrying non-idempotent POSTs "because it is only a network error", producing duplicate orders and double emails.\n- No telemetry for resilience events. The standard handler and Polly emit metrics and logs for retries and breaker state; if nobody looks at them, a dependency can be half-dead for weeks.\n- Using resilience as a substitute for capacity. If a dependency is always slow, the fix is the dependency, not a longer timeout.',
      },
    ],
    diagram: {
      caption:
        "Each hop has its own resilience: bounded retries in the browser, the standard handler and a breaker per dependency in the API, and the broker's redelivery for the worker.",
      nodes: [
        {
          id: "spa",
          label: "React app",
          sub: "TanStack Query, retry: 1",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "key",
          label: "Idempotency-Key",
          sub: "generated per form",
          col: 0,
          row: 2,
          kind: "note",
        },
        {
          id: "api",
          label: "Ordering API",
          sub: "standard resilience",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "catalog",
          label: "Catalog API",
          sub: "timeout, breaker, bulkhead",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "EF execution strategy",
          col: 2,
          row: 1,
          kind: "data",
        },
        {
          id: "bus",
          label: "Service Bus",
          sub: "max delivery, DLQ",
          col: 2,
          row: 2,
          kind: "queue",
        },
        {
          id: "worker",
          label: "Worker",
          sub: "inbox table, idempotent",
          col: 3,
          row: 2,
          kind: "service",
        },
      ],
      edges: [
        { from: "spa", to: "api", label: "2 s timeout, 1 retry" },
        { from: "key", to: "api", label: "stored with reply", style: "dashed" },
        { from: "api", to: "catalog", label: "fail fast when open" },
        { from: "api", to: "sql", label: "retry on transient" },
        { from: "api", to: "bus", label: "publish" },
        { from: "bus", to: "worker", label: "at-least-once" },
      ],
    },
    useWhen: [
      "Any synchronous call to another process: another service, Azure SQL, Service Bus or a third-party API",
      "You see sporadic 429 or 503 responses from Azure services under load",
      "One slow downstream dependency has previously taken the whole API down by exhausting connections",
      "Messages are processed at least once and the handler is not naturally idempotent",
    ],
    avoidWhen: [
      "In-process calls between modules of a monolith; a retry around a method call solves nothing",
      "Operations that are not idempotent and have no idempotency key: fail fast and let the user decide",
      "Calls that already carry built-in retry (Azure SDK clients, EF Core execution strategy); stacking another layer multiplies attempts",
    ],
    microsoftStack: [
      {
        name: "Microsoft.Extensions.Http.Resilience",
        role: "`AddStandardResilienceHandler()` gives a typed HttpClient the full pipeline in the right order.",
      },
      {
        name: "Polly v8 ResiliencePipeline",
        role: "Timeout, retry and breaker strategies around any non-HTTP call.",
      },
      {
        name: "EF Core execution strategy",
        role: "`EnableRetryOnFailure` handles Azure SQL transient errors; do not wrap it again.",
      },
      {
        name: "Azure Service Bus",
        role: "Max delivery count, dead-letter queue and duplicate detection are the consumer's retry and dedupe mechanisms.",
      },
      {
        name: "Azure SDK RetryOptions",
        role: "Built-in retry for Storage, Key Vault, Cosmos DB and Service Bus clients.",
      },
      {
        name: ".NET Aspire ServiceDefaults",
        role: "Turns on the standard resilience handler and health checks for every service by default.",
      },
    ],
    reactStack: [
      {
        name: "TanStack Query v5 retry options",
        role: "`retry`, `retryDelay` and `networkMode` per query; mutations default to no retry.",
      },
      {
        name: "AbortSignal via the query signal",
        role: "Lets `fetch` honour cancellation and `AbortSignal.timeout`.",
      },
      {
        name: "Error boundaries with useQueryErrorResetBoundary",
        role: "Confine a failing panel to itself and offer a local retry.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "More behaviours to understand: breaker states, backoff, idempotency storage.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "The standard handler is one line; idempotency keys are the real work.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Bulkheads and breakers stop one dependency from consuming all capacity.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Timeouts bound tail latency; retries add latency on the failure path.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Retries and at-least-once delivery create duplicates unless idempotency is designed in.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "Transient faults disappear from the user's view and outages stay contained.",
      },
      {
        attribute: "testability",
        effect: -1,
        note: "Failure paths need deliberate tests with fakes that time out and throw.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Breaker and retry metrics show a degrading dependency before it fails outright.",
      },
    ],
    related: [
      "observability",
      "messaging-outbox-saga",
      "react-server-state",
      "azure-messaging-choices",
    ],
    checks: [
      {
        id: "resilience-q1",
        prompt: "Which call is safe to retry automatically?",
        options: [
          "POST /orders without an idempotency key",
          "GET /catalog/items/42 that returned 503",
          "A Service Bus handler that sends an email with no dedupe check",
          "A payment capture call that timed out",
        ],
        answer: 1,
        explanation:
          "A read that failed transiently can be repeated without side effects. The other three create duplicates (orders, emails, charges) because the first attempt may have succeeded even though the caller never saw the result.",
      },
      {
        id: "resilience-q2",
        prompt:
          "During a Catalog outage the Ordering API's latency doubles and its thread pool starves, even though Catalog data is optional for placing an order. Which pattern was missing?",
        options: [
          "More retries on the Catalog call",
          "A short per-attempt timeout plus a circuit breaker on the Catalog client, and a bulkhead limiting concurrent Catalog calls",
          "A larger App Service plan",
          "Caching every Catalog response for a day",
        ],
        answer: 1,
        explanation:
          "Containment is the missing property: fail fast and cap concurrency so the optional dependency cannot hold threads. More retries worsen it, a bigger plan delays it, and a day-long cache changes correctness to solve a resilience problem.",
      },
      {
        id: "resilience-q3",
        prompt:
          "The browser, the BFF and the API each retry three times. During a two-minute outage, how much load can one user action generate on the backend?",
        options: [
          "3 attempts",
          "9 attempts",
          "Up to 27 attempts",
          "No extra load; retries are serialised",
        ],
        answer: 2,
        explanation:
          "Retries multiply across layers (3 x 3 x 3). That amplification is why retries belong at one layer and why a circuit breaker must stop them once failure is systemic.",
      },
    ],
    sources: [
      {
        title: "Building resilient cloud services with .NET",
        url: "https://learn.microsoft.com/dotnet/core/resilience/",
      },
      {
        title: "Azure Architecture Center: cloud design patterns",
        url: "https://learn.microsoft.com/azure/architecture/patterns/",
      },
      {
        title: "TanStack Query documentation",
        url: "https://tanstack.com/query/latest",
      },
    ],
  },
  {
    id: "security-architecture",
    trackId: "crosscutting",
    title: "Security architecture",
    tagline:
      "Zero trust on Azure: identity everywhere, no secrets in code, threats modelled early.",
    level: 2,
    minutes: 9,
    summary:
      "Security architecture is a handful of decisions made before the first sprint: every identity is an Entra ID identity, workloads use Managed Identity instead of secrets, the few secrets that remain live in Key Vault, PaaS services are reachable only over private endpoints, and the design has been threat modelled against its own container diagram. The OWASP basics for ASP.NET Core and React then follow from those decisions.",
    sections: [
      {
        heading: "Zero trust as a design stance",
        body: "Zero trust is three rules applied everywhere: verify explicitly, grant least privilege, assume breach. In practice it means no call is trusted because of where it comes from. A request from inside the virtual network is authenticated like one from the internet; a service reaching the database proves who it is with a token, not a shared password; and each identity can do exactly what its job requires.\n\nIdentity is the perimeter. Users sign in through Microsoft Entra ID with OpenID Connect, handled on the server by `Microsoft.Identity.Web`; workloads (the API, the worker, a Function) have Managed Identities and authenticate to Azure services with `DefaultAzureCredential`. Role assignments are scoped to the resource and to the narrowest built-in role: Service Bus Data Sender rather than Contributor.\n\nNetwork isolation still matters, as a second layer. The point of zero trust is that it is a second layer, so a misconfigured firewall rule is an inconvenience rather than a breach.",
      },
      {
        heading: "Identity and secrets",
        body: "The goal is that the application has no secrets at all. Managed Identity gets you most of the way:\n\n- **Azure SQL** accepts Entra ID authentication. Create a contained database user for the API's identity, grant `db_datareader` and `db_datawriter`, and the connection string carries no password.\n- **Storage, Service Bus, Key Vault, Cosmos DB, App Configuration** all support RBAC data-plane roles for a Managed Identity.\n- **Deployment pipelines** use workload identity federation, so GitHub Actions or an Azure DevOps service connection gets a short-lived token from Entra ID with no stored client secret.\n\nWhat remains (a third-party API key, a certificate, a legacy SQL login) goes in Azure Key Vault, read at startup through `Azure.Extensions.AspNetCore.Configuration.Secrets` or as Key Vault references in App Service and Container Apps settings. Rotation is then a Key Vault operation, not a redeploy.\n\nPrefer system-assigned identities for one-resource-one-identity simplicity, and user-assigned ones when several resources need the same access or when role assignments must exist before the resource does. Never give an application identity Contributor on a resource group; that is a password with extra steps.",
      },
      {
        heading: "Network isolation",
        body: 'Private endpoints give a PaaS service (Azure SQL, Key Vault, Storage, Service Bus Premium, Cosmos DB) a private IP in your virtual network, after which you disable its public access. App Service and Container Apps reach them through VNet integration, and private DNS zones make the service name resolve to the private address. In front, Azure Front Door or Application Gateway with the Web Application Firewall terminates TLS and filters the OWASP rule set before traffic reaches the API.\n\nThis costs money (each private endpoint and each WAF has an hourly charge), adds DNS complexity, and changes how developers work: nobody can connect to the database from a laptop any more, so you need Azure Bastion, a VPN or a jump host, and pipelines need self-hosted or VNet-connected runners.\n\nThat cost is justified for anything holding customer data or facing the internet. For a dev environment or an internal tool on sample data, Entra ID authentication plus service firewall rules is a reasonable floor; what is never reasonable is a public SQL endpoint with "allow Azure services" switched on, which allows every Azure tenant in the world.',
      },
      {
        heading: "OWASP basics for ASP.NET Core and React",
        body: "On the API: require authorisation by default with a fallback policy so an endpoint without `[Authorize]` or `RequireAuthorization()` is denied rather than open. Keep tokens out of the browser by using the BFF pattern: the server holds the tokens and the SPA gets an HttpOnly, Secure, SameSite cookie, with antiforgery on state-changing requests. Use EF Core's parameterised queries; `FromSql` with an interpolated string is safe, string concatenation into `FromSqlRaw` is injection. Set security headers (HSTS, `X-Content-Type-Options`, a Content Security Policy with `frame-ancestors`), enable the rate limiting middleware on authentication and expensive endpoints, and scan dependencies in CI.\n\nOn the React side, JSX escapes output, so cross-site scripting arrives through `dangerouslySetInnerHTML` and through third-party scripts. Sanitise any HTML you must render with DOMPurify, and ship a CSP with nonces so injected scripts cannot run. Never put tokens in `localStorage`. Remember that every `VITE_` or `NEXT_PUBLIC_` variable is shipped to the browser, and that Next.js Server Actions and Route Handlers need their own authorisation checks; the server is the trust boundary, not the component tree.",
      },
      {
        heading: "Threat modelling at design time",
        body: "Threat modelling is a two-hour exercise that pays for itself once per system. Take the C4 container diagram, mark the trust boundaries (browser to API, API to database, tenant to tenant, your network to a partner's), and walk each data flow through STRIDE: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege. The Microsoft Threat Modeling Tool automates the walk from a drawn diagram; a whiteboard and a table work as well.\n\nThe output is a list of threats, each with a mitigation, an owner and a priority, which becomes backlog items and, where possible, fitness functions: an Azure Policy that denies storage accounts with public blob access, an architecture test that every endpoint group has an authorisation policy, a pipeline step that fails on a vulnerable package.\n\nDo it when the container diagram exists and before the integrations are built, because that is when changing a boundary is cheap. Repeat when a new external integration, a new data classification or a new tenant model arrives. Record the result as an ADR; auditors and future developers both want it.",
      },
      {
        heading: "Common mistakes",
        body: '- Connection strings with passwords in `appsettings.json` or pipeline variables when Managed Identity would have worked.\n- The API\'s identity holding Contributor or Owner on the resource group.\n- A public Azure SQL endpoint with the "allow Azure services" exception enabled.\n- `AllowAnyOrigin()` together with credentials in CORS, or a wildcard origin on a cookie-authenticated API.\n- Treating the WAF as the security design while Minimal API endpoints have no authorisation policy.\n- Logging bearer tokens, cookies or personal data in request logs.\n- A shared "service account" password that several teams know and nobody rotates.',
      },
    ],
    diagram: {
      caption:
        "Identity everywhere: the browser holds a cookie, the API holds a Managed Identity, and every Azure service is reached with a token over a private endpoint.",
      nodes: [
        {
          id: "browser",
          label: "Browser (React)",
          sub: "HttpOnly cookie, CSP",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "waf",
          label: "Front Door + WAF",
          sub: "TLS, OWASP rule set",
          col: 1,
          row: 1,
          kind: "external",
        },
        {
          id: "entra",
          label: "Entra ID",
          sub: "users and workloads",
          col: 2,
          row: 0,
          kind: "external",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "BFF, Managed Identity",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "kv",
          label: "Key Vault",
          sub: "remaining secrets",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "Entra auth, no password",
          col: 3,
          row: 1,
          kind: "data",
        },
        {
          id: "bus",
          label: "Service Bus",
          sub: "Data Sender role only",
          col: 3,
          row: 2,
          kind: "queue",
        },
      ],
      edges: [
        { from: "browser", to: "waf", label: "HTTPS" },
        { from: "waf", to: "api", label: "filtered traffic" },
        {
          from: "api",
          to: "entra",
          label: "OIDC, token validation",
          style: "dashed",
        },
        { from: "api", to: "kv", label: "DefaultAzureCredential" },
        { from: "api", to: "sql", label: "token, private endpoint" },
        { from: "api", to: "bus", label: "least-privilege role" },
      ],
      groups: [
        {
          label: "Virtual network, private endpoints",
          nodeIds: ["api", "kv", "sql", "bus"],
        },
      ],
    },
    useWhen: [
      "The system handles personal, financial or health data, or is reachable from the internet",
      "Several workloads share a subscription and the blast radius of one compromised identity matters",
      "A compliance regime (ISO 27001, SOC 2, PCI DSS, GDPR) will audit how secrets and access are managed",
      "The container diagram is being drawn now; threat modelling is cheapest before the integrations exist",
    ],
    avoidWhen: [
      "A short-lived internal prototype on sample data: adopt Managed Identity and Key Vault anyway (they cost nothing), skip private endpoints and the WAF",
      "Private endpoints on every service in a dev environment that developers then cannot reach without a VPN nobody set up",
      "Adding a WAF and calling the job done while endpoints still have no authorisation policy",
    ],
    microsoftStack: [
      {
        name: "Microsoft Entra ID with Microsoft.Identity.Web",
        role: "User sign-in with OpenID Connect and token validation on the API.",
      },
      {
        name: "Managed Identity with DefaultAzureCredential",
        role: "Passwordless access from App Service, Container Apps and Functions to SQL, Key Vault, Storage and Service Bus.",
      },
      {
        name: "Azure Key Vault",
        role: "The secrets and certificates that cannot be eliminated, with RBAC and a private endpoint.",
      },
      {
        name: "Private Endpoints, Private DNS and VNet integration",
        role: "PaaS services with no public surface, reached from the application's network.",
      },
      {
        name: "Azure Front Door or Application Gateway WAF",
        role: "Edge TLS termination and the OWASP core rule set in front of the API.",
      },
      {
        name: "Microsoft Threat Modeling Tool and Defender for Cloud",
        role: "STRIDE at design time; posture and vulnerability findings at run time.",
      },
    ],
    reactStack: [
      {
        name: "BFF with HttpOnly cookies",
        role: "No access tokens in the browser; the server holds them and proxies API calls.",
      },
      {
        name: "Content Security Policy with nonces, DOMPurify",
        role: "Stops injected scripts from running and sanitises any HTML that must be rendered.",
      },
      {
        name: "VITE_ and NEXT_PUBLIC_ variables",
        role: "Anything so prefixed ships to the browser, so it can never be a secret.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "More moving parts: identities, role assignments, DNS zones, a WAF.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Role assignments and private networking take days to get right the first time.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "No expiring passwords in config means fewer outages caused by rotation.",
      },
      {
        attribute: "deployability",
        effect: -1,
        note: "Pipelines need federated identity and runners that can reach private endpoints.",
      },
      {
        attribute: "testability",
        effect: -1,
        note: "Private networks complicate test environments; local runs need emulators or dev-only access.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Adding a service is a role assignment, not a new secret to distribute.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Access is visible in Entra ID and Activity Log instead of in shared passwords.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Private endpoints, Service Bus Premium and the WAF are billed hourly.",
      },
    ],
    related: [
      "identity-and-secrets",
      "entra-id-auth",
      "azure-landing-zone-basics",
      "api-gateway-bff",
    ],
    checks: [
      {
        id: "security-architecture-q1",
        prompt:
          "The API needs to read and write Azure SQL. Which is the zero-trust choice?",
        options: [
          "A SQL login and password in appsettings.json",
          "A SQL login whose password is stored in Key Vault and read at startup",
          "A Managed Identity with a contained database user granted db_datareader and db_datawriter",
          "The server admin login, rotated monthly",
        ],
        answer: 2,
        explanation:
          "Managed Identity removes the secret entirely and scopes access to the two roles the API needs. Key Vault is the right home for a secret that cannot be eliminated, but a SQL password can be, so storing it there is the second-best answer.",
      },
      {
        id: "security-architecture-q2",
        prompt:
          "A React SPA keeps its access token in localStorage. What is the architectural fix?",
        options: [
          "Encrypt the token before storing it",
          "Move it to sessionStorage",
          "Use a BFF: the server holds the tokens and the browser gets an HttpOnly, SameSite cookie",
          "Shorten the token lifetime to five minutes",
        ],
        answer: 2,
        explanation:
          "Any script running in the page can read localStorage or sessionStorage, encrypted or not, and a five-minute token is still a stolen token. A BFF takes the token out of the browser's reach altogether.",
      },
      {
        id: "security-architecture-q3",
        prompt: "When does STRIDE threat modelling pay off most?",
        options: [
          "After the penetration test report arrives",
          "When the C4 container diagram exists and before the first sprint builds the integrations",
          "Once a year as a compliance exercise",
          "Only for internet-facing systems",
        ],
        answer: 1,
        explanation:
          "Boundaries are cheapest to change before code depends on them. A pen test finds what the model should have prevented, an annual exercise misses every new integration in between, and internal systems with tenant or data boundaries need it just as much.",
      },
    ],
    sources: [
      {
        title: "Azure Well-Architected Framework: security pillar",
        url: "https://learn.microsoft.com/azure/well-architected/security/",
      },
      {
        title: "ASP.NET Core security",
        url: "https://learn.microsoft.com/aspnet/core/security/",
      },
      {
        title: "Managed identities for Azure resources",
        url: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/",
      },
    ],
  },
  {
    id: "cicd-and-environments",
    trackId: "crosscutting",
    title: "CI/CD and environments",
    tagline:
      "Trunk-based delivery: one artifact promoted through gated environments on Azure.",
    level: 2,
    minutes: 8,
    summary:
      "A delivery pipeline is an architectural component: it decides how often you can ship, how safely you can roll back and how much environments drift. The shape that works on Azure is trunk-based development, one immutable artifact promoted through environments defined as code, progressive rollout with App Service slots or Container Apps revisions, and feature flags in Azure App Configuration to separate deploying from releasing.",
    sections: [
      {
        heading: "Trunk-based development and the pipeline shape",
        body: "Trunk-based development means short-lived branches merged to `main` within a day or two, `main` always deployable, and unfinished work hidden behind feature flags rather than parked on a long branch. Integration pain shows up in small doses instead of in a release week.\n\nThe pipeline has a fixed shape. On a pull request: build, unit and architecture tests, lint, a Bicep or Terraform `what-if`. On merge to `main`: build the artifact once (a container image pushed to Azure Container Registry tagged with the commit SHA, or a zip for App Service), then promote that same artifact through dev, staging and production. Environment differences live in configuration, never in a rebuild.\n\nDev deploys automatically. Staging and production are environments with required reviewers, so promotion is an approval rather than a new run. Release branches exist only when a regulated cadence demands a frozen candidate; even then the branch is cut from `main`, not developed on.",
      },
      {
        heading: "GitHub Actions or Azure Pipelines",
        body: "Both do the job and the choice follows where the organisation already lives. GitHub Actions uses YAML workflows, reusable workflows for shared steps, and **environments** with required reviewers, wait timers and environment-scoped secrets. Azure Pipelines (Azure DevOps) uses multi-stage YAML, **environments** with approvals and checks, service connections, Azure Artifacts and tight Boards integration.\n\nThe decision that matters in either is how the pipeline authenticates to Azure. Use workload identity federation: the `azure/login` action with OpenID Connect, or an Azure DevOps service connection of the workload identity type. The pipeline gets a short-lived token from Entra ID and no client secret is stored anywhere.\n\nHosted runners cannot reach resources behind private endpoints. For those, use self-hosted runners in the VNet, GitHub larger runners with private networking, or Azure Managed DevOps Pools. Plan this with the network design, because it is the step that stalls most first deployments to a locked-down environment.",
      },
      {
        heading: "Infrastructure as code",
        body: "Every environment is a stamp of the same template with a parameter file, which is the only way three environments stay alike. **Bicep** is Azure-native: no state file, `what-if` previews in the pull request, modules, and Azure Verified Modules for common resources. **Terraform** with the `azurerm` provider adds a state backend (an Azure Storage account), `plan` and `apply`, and works across clouds; the `azapi` provider covers features the main provider has not caught up with.\n\nPick Bicep for an Azure-only team without Terraform experience; pick Terraform when the organisation has standardised on it or spans clouds. Switching later is a rewrite, so this is a one-way door worth an ADR.\n\nKeep the application's infrastructure in the application repository for a single team, and landing-zone infrastructure (networking, identity, policy) in a platform repository. Add PSRule for Azure or Azure Policy checks to the pipeline so a template that creates a public storage account fails before it deploys. Nothing is changed in the portal; a change made by hand is drift, and `what-if` will show it next run.",
      },
      {
        heading: "Deployment strategies on Azure compute",
        body: "**App Service deployment slots**: deploy to a staging slot, warm it up, run smoke tests, then swap. The swap is near-instant and swapping back is the rollback. Mark environment-specific settings as slot settings so they stay with the slot. This is blue/green with the platform doing the work.\n\n**Azure Container Apps revisions**: each deployment creates a revision; in multiple-revision mode you can split traffic (90/10 for a canary, then 50/50, then 100) and label revisions for stable URLs. Rollback is shifting traffic back. Single-revision mode is simpler when you do not need canaries.\n\n**AKS** uses rolling updates by default and tools such as Argo Rollouts for canaries; it is the most flexible and the most to operate.\n\nDatabase changes are the hard part of any of these, because two application versions run side by side during a swap or a traffic split. Use expand and contract: add the nullable column or new table first, deploy code that handles both shapes, backfill, then remove the old shape in a later release. Run migrations as a pipeline step with a `dotnet ef migrations bundle`, not at application startup where several instances race.",
      },
      {
        heading: "Feature flags and configuration",
        body: "Deploying code and releasing a feature are different events once flags exist. **Azure App Configuration** stores feature flags with filters (percentage rollout, targeting by user or group, time window) and configuration values with a label per environment, with Key Vault references for secrets. In ASP.NET Core, `Microsoft.FeatureManagement.AspNetCore` exposes `IFeatureManager`, a `FeatureGate` attribute and a tag helper; dynamic refresh watches a sentinel key so a flag flip reaches running instances without a restart.\n\nFor React, either ask the BFF for the flags that apply to the current user or use the `@microsoft/feature-management` JavaScript package against an endpoint that serves the flag definitions. Never evaluate security-relevant flags only in the browser.\n\nFlags have a lifecycle. A release flag is removed once the feature is fully on; a flag older than a quarter is a code path nobody tests. Keep the list short and name an owner per flag.\n\nBuild-time variables (`VITE_*`) are baked into the bundle, which conflicts with build once, deploy many. Serve runtime configuration from a small endpoint or an injected `window.__config` instead.",
      },
      {
        heading: "Common mistakes",
        body: "- Building a separate artifact per environment, so what was tested is not what ships.\n- Manual portal changes that drift from the template and are overwritten by the next deploy.\n- A service principal secret in GitHub Secrets when federated identity is available.\n- A staging environment on a smaller SKU with no private networking, so it tests nothing about production behaviour.\n- Migrations at startup in a multi-instance deployment, or a swap performed before the migration.\n- Approvals on the dev environment, which only slows learning.\n- No rehearsed rollback; the first swap-back happens during an incident.",
      },
    ],
    diagram: {
      caption:
        "One artifact built from main is promoted through environments stamped from the same template; approvals gate staging and production, and flags separate deploy from release.",
      nodes: [
        {
          id: "pr",
          label: "Pull request",
          sub: "tests, what-if, lint",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "build",
          label: "Build once",
          sub: "GitHub Actions or AzDO",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "acr",
          label: "Container Registry",
          sub: "image tagged with SHA",
          col: 1,
          row: 2,
          kind: "data",
        },
        {
          id: "dev",
          label: "Dev",
          sub: "auto deploy",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "staging",
          label: "Staging",
          sub: "approval, slot or revision",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "prod",
          label: "Production",
          sub: "swap or traffic split",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "iac",
          label: "Bicep / Terraform",
          sub: "one template, 3 params",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "flags",
          label: "App Configuration",
          sub: "flags, per-env labels",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "pr", to: "build", label: "merge to main" },
        { from: "build", to: "acr", label: "push :sha" },
        { from: "acr", to: "dev", label: "same image" },
        { from: "dev", to: "staging", label: "approval" },
        { from: "staging", to: "prod", label: "approval, canary" },
        { from: "iac", to: "dev", style: "dashed" },
        {
          from: "iac",
          to: "staging",
          label: "stamps every env",
          style: "dashed",
        },
        {
          from: "flags",
          to: "prod",
          label: "release when ready",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "More than one developer merges daily and integration pain shows up as conflicts and a broken main",
      "Deployments are manual, happen outside working hours, and nobody wants to be the one running them",
      "Environments drift because someone changed a setting in the portal",
      "A release must be reversible in minutes rather than by a redeploy",
    ],
    avoidWhen: [
      "A solo developer on a personal project: one workflow that deploys main is enough; skip environments and approvals",
      "Traffic splitting between two Container Apps revisions that need different database schemas; expand and contract first",
      "A regulated release train with external sign-off: trunk-based still works, but treat the change ticket and frozen candidate as constraints rather than fighting them",
    ],
    microsoftStack: [
      {
        name: "GitHub Actions or Azure Pipelines",
        role: "Environments with approvals; `azure/login` with OIDC or a workload identity service connection, so no stored secret.",
      },
      {
        name: "Bicep (Azure Verified Modules) or Terraform azurerm",
        role: "Every environment stamped from one template with a parameter file; `what-if` or `plan` in the pull request.",
      },
      {
        name: "App Service deployment slots",
        role: "Blue/green by swap, with swap-back as the rollback.",
      },
      {
        name: "Azure Container Apps revisions",
        role: "Canary by traffic split and labelled revisions.",
      },
      {
        name: "Azure App Configuration with Microsoft.FeatureManagement",
        role: "Feature flags with targeting filters and per-environment configuration with Key Vault references.",
      },
      {
        name: "Azure Container Registry and dotnet ef migrations bundle",
        role: "Immutable images per commit, and migrations as an explicit pipeline step.",
      },
    ],
    reactStack: [
      {
        name: "Runtime configuration instead of VITE_ variables",
        role: "A `/config` endpoint or injected `window.__config` keeps build once, deploy many true for the SPA.",
      },
      {
        name: "Azure Static Web Apps preview environments",
        role: "A deployed preview per pull request for a static front end.",
      },
      {
        name: "@microsoft/feature-management or flags from the BFF",
        role: "Front-end flag evaluation that mirrors the server's App Configuration flags.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Pipelines, templates and flag lifecycle are more to maintain than a deploy script.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "After setup, shipping is a merge and an approval rather than a release week.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Environments built from one template behave alike.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "Small changes, rehearsed rollback and canaries shrink the blast radius of a bad release.",
      },
      {
        attribute: "deployability",
        effect: 2,
        note: "The whole point: deploy any merged commit, any time, with a known way back.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "The artifact tested in staging is the one running in production.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Flags let teams merge unfinished work without coordinating releases.",
      },
      {
        attribute: "operability",
        effect: 2,
        note: "No portal drift, and every change is traceable to a commit and an approval.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Slots, extra revisions, registries and VNet-connected runners add spend.",
      },
    ],
    related: [
      "fitness-functions",
      "azure-compute-choices",
      "azure-landing-zone-basics",
      "aspnet-react-hosting",
    ],
    checks: [
      {
        id: "cicd-and-environments-q1",
        prompt:
          "A new App Service version needs a new non-nullable column. What ordering avoids downtime during the slot swap?",
        options: [
          "Swap first, then run the migration",
          "Add the column as nullable (expand), deploy code that handles both shapes, backfill, then tighten it in a later release (contract)",
          "Run migrations at application startup in both slots",
          "Stop the application during the migration",
        ],
        answer: 1,
        explanation:
          "During a swap both versions run against one database, so the schema must satisfy both. Swapping first breaks the new code; migrating at startup races between instances; stopping the app is the downtime you were avoiding.",
      },
      {
        id: "cicd-and-environments-q2",
        prompt:
          "Which setup removes long-lived cloud secrets from the deployment pipeline?",
        options: [
          "Store the service principal secret in GitHub Secrets",
          "Workload identity federation between GitHub Actions (or an Azure DevOps service connection) and Entra ID",
          "Use a lead developer's personal access token",
          "Put the secret in Key Vault and fetch it in the pipeline",
        ],
        answer: 1,
        explanation:
          "Federation issues a short-lived token per run with nothing stored. GitHub Secrets and Key Vault still hold a secret that can leak or expire, and a personal token ties production to one person's account.",
      },
      {
        id: "cicd-and-environments-q3",
        prompt:
          "A team rebuilds the Docker image in each environment stage from the same commit. What is the problem?",
        options: [
          "Nothing; the commit is identical",
          "The artifact tested in staging is not the one in production; build once and promote the same immutable image",
          "Docker cannot build the same commit twice",
          "It uses too much Container Registry storage",
        ],
        answer: 1,
        explanation:
          "Rebuilds pick up different base image layers, package resolutions and build-time variables, so staging has tested something else. Storage cost is minor; the loss of confidence is the real cost.",
      },
    ],
    sources: [
      {
        title: "Bicep documentation",
        url: "https://learn.microsoft.com/azure/azure-resource-manager/bicep/",
      },
      {
        title: "Azure Container Apps documentation",
        url: "https://learn.microsoft.com/azure/container-apps/",
      },
      {
        title: "Azure App Configuration documentation",
        url: "https://learn.microsoft.com/azure/azure-app-configuration/",
      },
    ],
  },
  {
    id: "backend-testing-strategy",
    trackId: "crosscutting",
    title: "Backend testing strategy",
    tagline:
      "Hit the API through its front door, use a real database, unit test only the rules.",
    level: 2,
    minutes: 9,
    summary:
      "For an ASP.NET Core API with EF Core, the test that pays best is the slice test: HTTP in through WebApplicationFactory, real SQL Server in a Testcontainers container, state out. Unit tests cover the domain rules that branch, contract tests protect consumers of the API, architecture tests protect the structure, and a few end-to-end checks run against a deployed environment. The pyramid becomes a trophy.",
    sections: [
      {
        heading: "Pyramid or trophy",
        body: "The test pyramid says many unit tests, fewer integration tests, very few end-to-end tests, on the grounds that unit tests are fast and cheap. The testing trophy says the integration layer is where confidence per test is highest, so make it the widest.\n\nFor a .NET API the trophy fits better, for a specific reason: most production bugs in an EF Core application are in the query translation, the migration, the validation wiring, the authorisation policy or the serialisation, and none of those run in a unit test with a mocked `DbContext`. A test that sends a real HTTP request to a real endpoint and asserts a real row in SQL Server exercises all of them at once.\n\nSo the shape is: a wide band of slice tests through `WebApplicationFactory`, a narrower band of unit tests for the rules that actually branch, a thin set of contract and architecture tests, and a handful of smoke tests against a deployed staging environment. In a vertical-slice codebase, the slice test is the primary test and most handlers never get a unit test.",
      },
      {
        heading: "Integration tests with WebApplicationFactory",
        body: '`Microsoft.AspNetCore.Mvc.Testing` hosts the real application in-process with an `HttpClient` pointed at it. For Minimal APIs, add `public partial class Program {}` at the end of `Program.cs` so tests can reference it.\n\n```csharp\npublic sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime\n{\n    private readonly MsSqlContainer _sql = new MsSqlBuilder().Build();\n\n    protected override void ConfigureWebHost(IWebHostBuilder builder) =>\n        builder.ConfigureTestServices(services =>\n        {\n            services.RemoveAll<DbContextOptions<OrderingDbContext>>();\n            services.AddDbContext<OrderingDbContext>(o => o.UseSqlServer(_sql.GetConnectionString()));\n            services.AddAuthentication("Test").AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });\n        });\n\n    public async Task InitializeAsync() { await _sql.StartAsync(); /* run migrations */ }\n    public new async Task DisposeAsync() => await _sql.DisposeAsync();\n}\n```\n\nReplace only the edges: authentication with a test scheme that sets claims per request, the clock with a fake `TimeProvider`, third-party HTTP with WireMock.Net or a fake `HttpMessageHandler`, the message publisher with an in-memory recorder. Keep EF Core, validation, authorisation policies and middleware real. Share one factory per test collection with xUnit\'s `ICollectionFixture` so the container starts once.',
      },
      {
        heading: "Testcontainers for SQL Server",
        body: "The EF Core InMemory provider is not a database: it ignores constraints, transactions, `decimal` precision and SQL translation, so tests pass where production fails. SQLite is closer but still differs in types and functions. Use the engine you deploy against.\n\nTestcontainers for .NET (`Testcontainers.MsSql`) starts a SQL Server container from code, waits until it accepts connections and hands you a connection string. Start it once per test collection, apply your EF Core migrations against it (which also tests the migrations), and reset state between tests with Respawn, which deletes rows in dependency order far faster than dropping the database. GitHub-hosted and Azure Pipelines-hosted Linux agents run Docker, so this works in CI without infrastructure.\n\nThe same approach covers the rest of the stack: the Azurite container for Blob and Queue storage, the Azure Service Bus emulator container for messaging, the Cosmos DB emulator for Cosmos. If the application uses .NET Aspire, `Aspire.Hosting.Testing` can start the whole AppHost, containers included, and give you clients for each resource. Check that the images support the CPU architecture of your developers' machines before committing to them.",
      },
      {
        heading: "Contract and architecture tests",
        body: "A contract test protects the people who depend on your API. The cheapest form is a snapshot: generate the OpenAPI document from the running factory in a test and compare it with the committed file using Verify, so any change to the contract appears as a diff in the pull request. Add `oasdiff` or a similar tool in CI to classify the change as breaking or not. For the React front end, generate the TypeScript client from the same document; a breaking server change then fails the front-end type check.\n\nWhen another team consumes the API, consumer-driven contracts with Pact (PactNet on the .NET side) let them state what they rely on and let your pipeline verify it. Integration events on Service Bus need the same discipline: a schema per event version, a test that old consumers can still read new producers.\n\nArchitecture tests with NetArchTest or ArchUnitNET keep the structure honest: slices do not reference each other, nothing in the domain references `System.Net.Http`, every endpoint group has an authorisation policy. They run with the unit tests in seconds.",
      },
      {
        heading: "What to unit test in a vertical-slice codebase",
        body: "Unit test the code that has branches and no I/O: pricing and discount rules, eligibility checks, state machines (`Order.Ship()` throws when unpaid), date arithmetic, mapping with edge cases, and validators (FluentValidation's `TestValidate` makes this direct). These tests are fast, need no fakes, and are the right place for the long tail of edge cases that would make slice tests slow.\n\nDo not unit test the handler that loads an entity, calls a rule and saves; the slice test already covers it, and a unit test with a mocked `DbContext`, a mocked publisher and a mocked clock verifies the mocks rather than the behaviour. Do not unit test the `DbContext` configuration, the endpoint registration or mapping that is a straight copy.\n\nRule of thumb: if a test needs more than two fakes, write a slice test instead. Keep the rules testable by keeping them pure: inject `TimeProvider`, return results instead of throwing for expected failures, and keep the EF Core entity out of the rule's signature where you can.",
      },
      {
        heading: "Test data strategy",
        body: "Test data decides whether a suite stays readable and parallelisable. Build domain objects with builders or an Object Mother (`new OrderBuilder().Paid().WithLine(sku, 2).Build()`) so a test shows only the values that matter; Bogus fills in realistic noise where the values do not matter.\n\nReset the database between tests with Respawn rather than a fresh container per class (slow) or transaction rollback (hides commit-time behaviour). Give every test its own tenant or aggregate ids so tests can run in parallel against one container. Seed reference data (countries, roles) through migrations, the same way production gets it, and keep everything else inside the test that uses it.\n\nAnonymised production snapshots belong in performance tests and migration rehearsals, never in the PR suite: they are slow, they drift, and they leak. Aim for a PR suite under five minutes; when it grows past that, split by test collection and run collections in parallel before you start deleting tests.",
      },
    ],
    diagram: {
      caption:
        "Slice tests through WebApplicationFactory against a real SQL Server are the widest band; unit, contract and architecture tests surround them; a few smoke tests run after deployment.",
      nodes: [
        {
          id: "unit",
          label: "Unit tests",
          sub: "rules, validators",
          col: 0,
          row: 0,
          kind: "service",
        },
        {
          id: "arch",
          label: "Architecture tests",
          sub: "NetArchTest",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "contract",
          label: "Contract tests",
          sub: "OpenAPI snapshot, Pact",
          col: 0,
          row: 2,
          kind: "service",
        },
        {
          id: "slice",
          label: "Slice tests",
          sub: "WebApplicationFactory",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "fakes",
          label: "Fake edges",
          sub: "test auth, WireMock.Net",
          col: 2,
          row: 0,
          kind: "external",
        },
        {
          id: "sql",
          label: "SQL Server",
          sub: "Testcontainers, Respawn",
          col: 2,
          row: 1,
          kind: "data",
        },
        {
          id: "smoke",
          label: "Smoke tests",
          sub: "deployed staging, few",
          col: 3,
          row: 1,
          kind: "service",
        },
      ],
      edges: [
        { from: "slice", to: "sql", label: "real EF Core, migrations" },
        {
          from: "slice",
          to: "fakes",
          label: "replaced in DI",
          style: "dashed",
        },
        {
          from: "contract",
          to: "slice",
          label: "OpenAPI from factory",
          style: "dashed",
        },
        {
          from: "slice",
          to: "smoke",
          label: "after deployment",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "Runs on every pull request",
          nodeIds: ["unit", "arch", "contract", "slice", "fakes", "sql"],
        },
      ],
    },
    useWhen: [
      "An ASP.NET Core API with EF Core where past bugs came from queries, migrations and wiring rather than pure logic",
      "A vertical-slice or Minimal API codebase where handlers are thin and the behaviour is HTTP in, database state out",
      "A React front end or another team consumes the API and breaking changes have slipped through before",
      "CI runners have Docker, so a real SQL Server per test run is possible",
    ],
    avoidWhen: [
      "A library or a domain-heavy core with complex rules and little I/O; classic unit tests dominate there",
      "CI cannot run containers and no test database is reachable; use a per-branch Azure SQL database until it can, but do not fall back to the InMemory provider for query-heavy code",
      "Hundreds of browser-driven end-to-end tests against a shared staging environment; they belong at the top in small numbers",
    ],
    microsoftStack: [
      {
        name: "Microsoft.AspNetCore.Mvc.Testing",
        role: "`WebApplicationFactory<Program>` hosts the real app in-process for slice tests.",
      },
      {
        name: "Testcontainers for .NET (Testcontainers.MsSql)",
        role: "A real SQL Server per test run, locally and on hosted CI agents.",
      },
      {
        name: "Respawn",
        role: "Fast database reset between tests without recreating the container.",
      },
      {
        name: "Aspire.Hosting.Testing",
        role: "Starts the AppHost with its containers for tests that span services.",
      },
      {
        name: "WireMock.Net",
        role: "Stubs third-party HTTP APIs at the edge of the system.",
      },
      {
        name: "Verify and NetArchTest",
        role: "Snapshot tests for the OpenAPI document; structure tests for slice boundaries.",
      },
    ],
    reactStack: [
      {
        name: "Generated TypeScript client from the OpenAPI document",
        role: "A breaking server change fails the front-end type check instead of a user.",
      },
      {
        name: "MSW handlers derived from the same OpenAPI spec",
        role: "Front-end tests mock the API at the network layer with the real contract shape.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 0,
        note: "Fewer mocks to maintain, but a container and a factory to set up.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "Slower to write the first slice test, faster for every one after.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "A slice suite runs in minutes where a mocked unit suite runs in seconds.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Real SQL Server semantics (constraints, transactions, collation) are tested.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "Migrations, queries and wiring are exercised before production.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Tests pin behaviour at the HTTP boundary, so internals can be refactored freely.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "A green PR suite is a credible gate for automatic promotion.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Thin handlers and pure rules are easier to cover from both ends.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Container start-up adds CI minutes; mocked suites add maintenance hours.",
      },
    ],
    related: [
      "vertical-slices",
      "fitness-functions",
      "api-contracts-openapi",
      "react-testing-strategy",
    ],
    checks: [
      {
        id: "backend-testing-strategy-q1",
        prompt:
          "Which test gives the most confidence per line for a Minimal API endpoint that validates input, saves an order with EF Core and publishes an event?",
        options: [
          "A unit test of the handler with a mocked DbContext and a mocked publisher",
          "A WebApplicationFactory test that POSTs JSON, then asserts the row in a Testcontainers SQL Server and the message on a fake publisher",
          "A Playwright test through the React UI",
          "A test of the handler against the EF Core InMemory provider",
        ],
        answer: 1,
        explanation:
          "The slice test exercises validation, authorisation, EF Core translation, the migration and the publish in one run. The mocked unit test verifies its mocks, the InMemory provider skips relational behaviour, and the browser test is slow and tells you less about the API.",
      },
      {
        id: "backend-testing-strategy-q2",
        prompt:
          "Why avoid the EF Core InMemory provider for integration tests?",
        options: [
          "It is slower than SQL Server",
          "It does not behave like a relational database (constraints, transactions, SQL translation), so tests pass where production fails",
          "It requires a licence",
          "It cannot be used with xUnit",
        ],
        answer: 1,
        explanation:
          "The provider is a fast object store, which is exactly why it cannot catch the bugs that live in SQL translation and schema constraints. Speed and tooling are not the problem; fidelity is.",
      },
      {
        id: "backend-testing-strategy-q3",
        prompt: "What belongs in a unit test in a vertical-slice codebase?",
        options: [
          "The handler's orchestration of the repository and the publisher",
          "The pricing rule that decides discount tiers",
          "The DbContext entity configuration",
          "The endpoint route registration",
        ],
        answer: 1,
        explanation:
          "A branching rule with no I/O is cheap to test exhaustively in isolation. Orchestration, configuration and routing are only meaningful with the real pipeline around them, which is what the slice test provides.",
      },
    ],
    sources: [
      {
        title: "Integration tests in ASP.NET Core",
        url: "https://learn.microsoft.com/aspnet/core/test/integration-tests",
      },
      {
        title: "Testing EF Core applications",
        url: "https://learn.microsoft.com/ef/core/testing/",
      },
      {
        title: "Testcontainers for .NET",
        url: "https://dotnet.testcontainers.org/",
      },
    ],
  },
];
