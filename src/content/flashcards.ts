import type { Flashcard } from "./types";

/**
 * Spaced-repetition cards. Two to four per lesson, ids "fc-<lessonId>-<n>".
 * Fronts are questions a working engineer should be able to answer after the
 * lesson; backs are short, precise and specific to the Microsoft stack and React.
 */
export const FLASHCARDS: Flashcard[] = [
  /* ---------------------------------------------------------------- */
  /* Foundations                                                        */

  {
    id: "fc-architecture-drivers-1",
    trackId: "foundations",
    lessonId: "architecture-drivers",
    front:
      "What is an architecture driver, and what are the three usual kinds?",
    back: "A driver is any requirement or constraint that shapes the structure of a system. The usual kinds are functional requirements that need structural support, quality attributes (performance, availability, security, evolvability) and constraints (budget, team, existing systems, regulation).",
  },
  {
    id: "fc-architecture-drivers-2",
    trackId: "foundations",
    lessonId: "architecture-drivers",
    front:
      "A stakeholder says the system must be 'fast'. What should an architect do before designing anything?",
    back: "Turn it into a measurable scenario: which operation, under what load, measured how, with what target (for example 'search returns within 300 ms at the 95th percentile with 200 concurrent users'). A quality that is not measurable cannot be designed for or tested.",
  },

  {
    id: "fc-tradeoff-thinking-1",
    trackId: "foundations",
    lessonId: "tradeoff-thinking",
    front:
      "Why does the phrase 'there are no best practices, only trade-offs' matter for architecture decisions?",
    back: "Every structural choice improves some quality attributes at the expense of others. Microservices buy team autonomy and independent scaling with consistency, simplicity and operability. The job is to pick the trade that fits the drivers and to say out loud what was given up.",
  },
  {
    id: "fc-tradeoff-thinking-2",
    trackId: "foundations",
    lessonId: "tradeoff-thinking",
    front:
      "How do you tell a real trade-off analysis from a preference dressed up as one?",
    back: "A real analysis names the alternatives, scores each against the same quality attributes, and states what the chosen option loses. If the write-up only lists the benefits of the winner, it is a preference.",
  },
  {
    id: "fc-tradeoff-thinking-3",
    trackId: "foundations",
    lessonId: "tradeoff-thinking",
    front:
      "A team wants to add a cache to speed up reads. Which quality attributes typically get worse?",
    back: "Consistency (readers may see stale data), simplicity (another component plus invalidation rules) and operability (one more thing to monitor and size). Say so in the decision record and agree a TTL the business accepts.",
  },

  {
    id: "fc-c4-and-adrs-1",
    trackId: "foundations",
    lessonId: "c4-and-adrs",
    front: "What are the four levels of the C4 model?",
    back: "Context (the system, its users and neighbouring systems), Container (the deployable units such as a React SPA, an ASP.NET Core API and an Azure SQL database), Component (the major building blocks inside one container) and Code (classes, usually generated or skipped).",
  },
  {
    id: "fc-c4-and-adrs-2",
    trackId: "foundations",
    lessonId: "c4-and-adrs",
    front: "What belongs in an Architecture Decision Record?",
    back: "Title, status, context (the forces at play), the decision, and the consequences, including what gets worse. Keep each ADR short, leave it unchanged once accepted, and supersede it with a new record rather than editing it.",
  },
  {
    id: "fc-c4-and-adrs-3",
    trackId: "foundations",
    lessonId: "c4-and-adrs",
    front:
      "Which C4 diagram should you draw first for a new ASP.NET Core and React system, and why?",
    back: "The Container diagram. It shows the deployable units (SPA, API, database, message broker, identity provider) and the protocols between them, which is the level at which most architecture decisions are made and reviewed.",
  },

  {
    id: "fc-coupling-and-cohesion-1",
    trackId: "foundations",
    lessonId: "coupling-and-cohesion",
    front:
      "What is the difference between afferent and efferent coupling, and why does it matter?",
    back: "Afferent coupling counts who depends on a module; efferent coupling counts what it depends on. High afferent coupling makes a module hard to change (many callers); high efferent coupling makes it fragile (many reasons to break). Core domain code should have high afferent and low efferent coupling.",
  },
  {
    id: "fc-coupling-and-cohesion-2",
    trackId: "foundations",
    lessonId: "coupling-and-cohesion",
    front:
      "Two modules always change together in the same pull request. What does that tell you?",
    back: "They are tightly coupled regardless of what the dependency graph says. Either merge them into one module or find the shared concept both depend on and give it a home. Change coupling from the commit history is the most honest coupling metric.",
  },
  {
    id: "fc-coupling-and-cohesion-3",
    trackId: "foundations",
    lessonId: "coupling-and-cohesion",
    front: "What does 'connascence' add that plain coupling counts do not?",
    back: "It classifies the kind of agreement two parts must keep: name, type, meaning, position, algorithm, execution order, timing, value, identity. The stronger and more distant the connascence, the more expensive the coupling, so the aim is to weaken it (for example, replace positional parameters with a named record).",
  },

  {
    id: "fc-fitness-functions-1",
    trackId: "foundations",
    lessonId: "fitness-functions",
    front: "What is an architectural fitness function?",
    back: "An automated check that measures whether the system still has a property the architecture depends on: a build that fails when a module references another module's internals, a performance test with a budget, a dependency scan. It turns an architecture principle into a test that runs in CI.",
  },
  {
    id: "fc-fitness-functions-2",
    trackId: "foundations",
    lessonId: "fitness-functions",
    front:
      "Give a .NET example of a fitness function that protects a modular monolith.",
    back: "A NetArchTest or ArchUnitNET test asserting that types in `Ordering` only depend on `Catalog.Contracts`, never on `Catalog` itself. It runs with the unit tests, so a shortcut fails the pull request instead of surfacing in a review six months later.",
  },

  /* ---------------------------------------------------------------- */
  /* .NET application styles                                            */

  {
    id: "fc-layered-monolith-1",
    trackId: "dotnet-styles",
    lessonId: "layered-monolith",
    front:
      "What is the defining rule of a layered monolith, and what does it usually get wrong?",
    back: "Dependencies point one way: presentation to business logic to data access. The common failure is that every feature touches every layer, so a change to Ordering means editing the Controllers, Services, Repositories and Entities folders, and nothing stops business rules leaking into controllers or SQL.",
  },
  {
    id: "fc-layered-monolith-2",
    trackId: "dotnet-styles",
    lessonId: "layered-monolith",
    front:
      "When is a plain layered monolith the right choice for a .NET system?",
    back: "Small team, CRUD-heavy domain with few invariants, a short expected life or a tight first deadline. One ASP.NET Core project with EF Core and a clear folder structure ships fast and is easy to hire for. Move to modules when sub-domains and separate teams start to emerge.",
  },
  {
    id: "fc-layered-monolith-3",
    trackId: "dotnet-styles",
    lessonId: "layered-monolith",
    front:
      "What is the usual first step out of a layered monolith that has become a ball of mud?",
    back: "Regroup code by business capability instead of by technical layer, one feature or module folder at a time, and add an architecture test so new code cannot cross the new boundaries. Do this before considering any split into separate services.",
  },

  {
    id: "fc-modular-monolith-1",
    trackId: "dotnet-styles",
    lessonId: "modular-monolith",
    front: "How should modules in a modular monolith reference each other?",
    back: "Only through a module's contracts project (interfaces and integration events), never its implementation project. Enforce it with project references, `InternalsVisibleTo` and an architecture test that fails the build on a violation.",
  },
  {
    id: "fc-modular-monolith-2",
    trackId: "dotnet-styles",
    lessonId: "modular-monolith",
    front:
      "How is data ownership expressed in a modular monolith on Azure SQL?",
    back: "One DbContext per module and a separate SQL schema per module (`ordering.Orders`, `catalog.Products`) in one database. Modules never query each other's tables; they call a contract or react to an event. Cross-module work can still run in one transaction when it must.",
  },
  {
    id: "fc-modular-monolith-3",
    trackId: "dotnet-styles",
    lessonId: "modular-monolith",
    front:
      "A hot module in a modular monolith needs to scale on its own. What does that signal?",
    back: "It is one of the two drivers that pay for distribution (the other is a team blocked by the shared release train). Because the module already has a contracts project and its own schema, extracting it into a separate service is a move rather than a rewrite.",
  },
  {
    id: "fc-modular-monolith-4",
    trackId: "dotnet-styles",
    lessonId: "modular-monolith",
    front:
      "In a modular monolith, when should one module call another synchronously and when should it publish an event?",
    back: "Call a contract interface when the caller needs an answer now (Ordering asks Catalog for a price), and keep those calls few and read-only. Publish an in-process notification when the caller only announces a fact (`OrderPlaced`); the publisher never knows who subscribes.",
  },

  {
    id: "fc-clean-architecture-1",
    trackId: "dotnet-styles",
    lessonId: "clean-architecture",
    front: "What is the dependency rule in Clean Architecture?",
    back: "Source code dependencies only point inward: Domain references nothing, Application depends on Domain, Infrastructure and Presentation depend on Application. The domain never knows about EF Core, ASP.NET Core or Azure. Interfaces for persistence and external services are declared inside and implemented outside.",
  },
  {
    id: "fc-clean-architecture-2",
    trackId: "dotnet-styles",
    lessonId: "clean-architecture",
    front:
      "What is the usual .NET solution layout for Clean Architecture, and what goes where?",
    back: "`Domain` (entities, value objects, domain events), `Application` (use cases, commands and queries, repository and service interfaces, validation), `Infrastructure` (EF Core DbContext, Azure SDK clients, email, implementations of the interfaces) and `Web` or `Api` (endpoints and the DI composition root).",
  },
  {
    id: "fc-clean-architecture-3",
    trackId: "dotnet-styles",
    lessonId: "clean-architecture",
    front: "When does Clean Architecture cost more than it returns?",
    back: "In CRUD-heavy applications with few business rules. Every field change then touches an entity, a DTO, a mapper, a command, a handler and a repository. Reserve the full layering for modules with real domain logic and use vertical slices with EF Core directly where the rules are thin.",
  },

  {
    id: "fc-vertical-slices-1",
    trackId: "dotnet-styles",
    lessonId: "vertical-slices",
    front: "What is a vertical slice, and what does it optimise for?",
    back: "One feature (a request and everything needed to handle it) kept together in one folder or file: endpoint, validator, handler, data access and response. It optimises for locality of change: most work touches one slice, and a slice can be deleted cleanly.",
  },
  {
    id: "fc-vertical-slices-2",
    trackId: "dotnet-styles",
    lessonId: "vertical-slices",
    front: "How do vertical slices usually look in an ASP.NET Core project?",
    back: "A `Features/Orders/PlaceOrder` folder with a Minimal API endpoint (often in a `MapGroup`), a request record, a FluentValidation validator, a MediatR handler or a plain static handler, and EF Core queries written for exactly that use case. Shared code is extracted only once two or three slices need it.",
  },
  {
    id: "fc-vertical-slices-3",
    trackId: "dotnet-styles",
    lessonId: "vertical-slices",
    front:
      "Vertical slices and Clean Architecture are often presented as rivals. How do they combine in practice?",
    back: "Use slices as the organising unit and apply layering only inside slices that need it. Keep a shared Domain project for entities with real invariants, let simple slices query EF Core directly, and route complex slices through domain services. Slices decide where code lives; layering decides how much ceremony each slice gets.",
  },

  {
    id: "fc-microservices-1",
    trackId: "dotnet-styles",
    lessonId: "microservices",
    front:
      "Which two drivers actually justify splitting a .NET system into microservices?",
    back: "Independent release cadence for separate teams, and independent scaling or runtime for a hot part of the system. Codebase size, a wish to try a new framework, or 'because it is the modern way' are not drivers and will not cover the cost of distribution.",
  },
  {
    id: "fc-microservices-2",
    trackId: "dotnet-styles",
    lessonId: "microservices",
    front: "What does 'database per service' mean, and what does it cost?",
    back: "Each service owns its data store and no other service reads it directly; integration goes through APIs or events. The cost is losing cross-service transactions and joins: you need the outbox pattern, sagas for multi-step workflows and read models that are eventually consistent.",
  },
  {
    id: "fc-microservices-3",
    trackId: "dotnet-styles",
    lessonId: "microservices",
    front:
      "Name the operational pieces a team must have in place before running microservices on Azure.",
    back: "Centralised logs, metrics and distributed traces (OpenTelemetry to Application Insights), a CI/CD pipeline per service, ingress and service discovery (Azure Container Apps, or AKS with an ingress controller), a message broker (Service Bus) and an on-call rotation that understands all of it.",
  },
  {
    id: "fc-microservices-4",
    trackId: "dotnet-styles",
    lessonId: "microservices",
    front: "What is the 'distributed monolith' failure mode?",
    back: "Services that are deployed separately but must be released together because they share a database, call each other synchronously in chains or share a library of domain types. You pay for the network and the pipelines and get none of the autonomy. The fix is to repair the boundaries, often by moving back toward a modular monolith.",
  },

  {
    id: "fc-strangler-fig-1",
    trackId: "dotnet-styles",
    lessonId: "strangler-fig",
    front: "What is the strangler fig pattern?",
    back: "Put a routing facade in front of a legacy system, build new or migrated capabilities beside it, and route traffic to the new implementation one capability at a time until the old system can be switched off. The legacy system keeps running throughout, so there is no big-bang cutover.",
  },
  {
    id: "fc-strangler-fig-2",
    trackId: "dotnet-styles",
    lessonId: "strangler-fig",
    front:
      "Which Azure and .NET options can play the facade role in a strangler fig migration?",
    back: "Azure API Management or Azure Front Door for HTTP routing by path or header, Application Gateway for in-network routing, and YARP inside an ASP.NET Core host when the routing rules need code. The facade must be able to redirect a single capability at a time.",
  },
  {
    id: "fc-strangler-fig-3",
    trackId: "dotnet-styles",
    lessonId: "strangler-fig",
    front:
      "What is the usual trap in strangler fig migrations, and how do you avoid it?",
    back: "Building the new system for a long time without retiring anything from the old one, so two systems run forever. Pick capabilities that can be fully moved, including their data, route all of their traffic to the new side, then delete the old code. Each capability retired is the only progress measure that counts.",
  },

  /* ---------------------------------------------------------------- */
  /* .NET distributed patterns                                          */

  {
    id: "fc-cqrs-1",
    trackId: "dotnet-distributed",
    lessonId: "cqrs",
    front: "What does CQRS separate, and what does it not require?",
    back: "It separates the write model (commands that enforce invariants) from the read model (queries shaped for screens). It does not require event sourcing, a second database or a message bus; the simplest form is two code paths over one SQL Server database.",
  },
  {
    id: "fc-cqrs-2",
    trackId: "dotnet-distributed",
    lessonId: "cqrs",
    front: "What is the lightest CQRS implementation on the .NET stack?",
    back: "Commands go through a handler that loads an aggregate with EF Core and saves it; queries use `AsNoTracking()` projections, Dapper or a SQL view straight into response DTOs. MediatR or a plain `ICommandHandler<T>` interface keeps the two sides from sharing code by accident.",
  },
  {
    id: "fc-cqrs-3",
    trackId: "dotnet-distributed",
    lessonId: "cqrs",
    front:
      "When does CQRS with separate read and write stores earn its complexity?",
    back: "When reads and writes have very different shapes or loads: a write model with heavy invariants and screens that need denormalised, pre-joined data at scale. Then project events into Cosmos DB, Azure AI Search or a reporting database and accept that reads are eventually consistent.",
  },

  {
    id: "fc-event-sourcing-1",
    trackId: "dotnet-distributed",
    lessonId: "event-sourcing",
    front: "What is event sourcing?",
    back: "The system of record is the ordered sequence of domain events for each aggregate rather than its current state. State is rebuilt by replaying events, and read models are projections built from the same stream, so the log doubles as a complete audit trail.",
  },
  {
    id: "fc-event-sourcing-2",
    trackId: "dotnet-distributed",
    lessonId: "event-sourcing",
    front:
      "Which problems does event sourcing solve well, and which does it create?",
    back: "It solves audit, temporal queries ('what did the account look like on 3 March') and rebuilding read models. It creates event versioning (old events never change, so upcasters are needed), snapshots for long streams, eventual consistency for every read model and a steep learning curve for the team.",
  },
  {
    id: "fc-event-sourcing-3",
    trackId: "dotnet-distributed",
    lessonId: "event-sourcing",
    front:
      "A team wants event sourcing purely for audit. What should you suggest instead?",
    back: "A domain-events or outbox table written in the same transaction as the state, or SQL Server temporal tables, gives a reliable history with none of the replay, versioning and projection work. Reserve event sourcing for domains where the events are the business model, such as ledgers and trading.",
  },

  {
    id: "fc-messaging-outbox-saga-1",
    trackId: "dotnet-distributed",
    lessonId: "messaging-outbox-saga",
    front: "What problem does the transactional outbox solve?",
    back: "Dual writes: saving to the database and publishing to a broker are two operations, and a crash between them loses the message or publishes one for a rolled-back change. The outbox writes the message into a table in the same transaction and a background relay publishes it afterwards, so the message is sent at least once.",
  },
  {
    id: "fc-messaging-outbox-saga-2",
    trackId: "dotnet-distributed",
    lessonId: "messaging-outbox-saga",
    front:
      "Outbox delivery is at-least-once. What must every consumer do about it?",
    back: "Be idempotent: keep a processed-message table keyed by message id, or design the handler so applying the same message twice has the same result. Service Bus duplicate detection helps on the sending side and does nothing for a handler that is retried.",
  },
  {
    id: "fc-messaging-outbox-saga-3",
    trackId: "dotnet-distributed",
    lessonId: "messaging-outbox-saga",
    front: "What is a saga, and what are the two ways to coordinate one?",
    back: "A saga is a multi-step business process across services, each step with a compensating action for when a later step fails. Choreography has services react to each other's events with no central coordinator; orchestration has one component (a Durable Function, a MassTransit state machine or an NServiceBus saga) drive the steps and compensations.",
  },
  {
    id: "fc-messaging-outbox-saga-4",
    trackId: "dotnet-distributed",
    lessonId: "messaging-outbox-saga",
    front:
      "Which .NET libraries implement outbox and saga patterns so you do not hand-roll them?",
    back: "MassTransit (EF Core outbox, state machine sagas, Service Bus transport), NServiceBus (outbox, sagas, Service Bus and SQL transports) and Wolverine. Azure Durable Functions covers orchestration-style sagas in the serverless model.",
  },

  {
    id: "fc-serverless-durable-functions-1",
    trackId: "dotnet-distributed",
    lessonId: "serverless-durable-functions",
    front:
      "When does Azure Functions fit a workload better than a container or App Service?",
    back: "Event-driven, bursty or infrequent work: queue and blob triggers, timers, webhooks and light HTTP APIs that can scale to zero. Steady high traffic, long-running requests or a need for full control of the host favour Container Apps or App Service.",
  },
  {
    id: "fc-serverless-durable-functions-2",
    trackId: "dotnet-distributed",
    lessonId: "serverless-durable-functions",
    front: "What does Durable Functions add to plain Azure Functions?",
    back: "Stateful orchestrations in code: function chaining, fan-out and fan-in, human interaction with timeouts, and monitors, with the orchestrator's progress checkpointed to storage so it survives restarts. Orchestrator code must be deterministic because it is replayed.",
  },
  {
    id: "fc-serverless-durable-functions-3",
    trackId: "dotnet-distributed",
    lessonId: "serverless-durable-functions",
    front:
      "What goes wrong when an Azure Functions project is used as a general-purpose API host?",
    back: "Cold starts on consumption plans, execution timeouts, a thinner middleware and DI story than ASP.NET Core, and a bill that stops being small under steady load. Use Functions for triggers and background work and host the main API in App Service or Container Apps.",
  },

  {
    id: "fc-api-gateway-bff-1",
    trackId: "dotnet-distributed",
    lessonId: "api-gateway-bff",
    front:
      "What is a Backend for Frontend, and why would a React app want one?",
    back: "A thin API tailored to one client type that aggregates and reshapes calls to downstream services. It lets the React app make one request per screen, keeps tokens and secrets off the browser, and lets the front-end team change the contract without renegotiating with every backend team.",
  },
  {
    id: "fc-api-gateway-bff-2",
    trackId: "dotnet-distributed",
    lessonId: "api-gateway-bff",
    front: "Which Microsoft options implement a gateway or BFF?",
    back: "Azure API Management for a managed gateway (policies, rate limiting, key management), YARP for a reverse proxy hosted in ASP.NET Core with code-level routing, and a plain ASP.NET Core Minimal API project when the BFF needs real aggregation logic. Azure Front Door handles global routing and WAF in front of all of them.",
  },
  {
    id: "fc-api-gateway-bff-3",
    trackId: "dotnet-distributed",
    lessonId: "api-gateway-bff",
    front: "What is the main failure mode of an API gateway?",
    back: "It becomes the place where business logic accumulates, so every team's change goes through one shared, slow-moving component. Keep gateways to routing, auth, throttling and simple aggregation, and give each client-facing team its own BFF when the shaping logic grows.",
  },

  {
    id: "fc-orleans-actors-1",
    trackId: "dotnet-distributed",
    lessonId: "orleans-actors",
    front: "What problem does the virtual actor model in Orleans solve?",
    back: "Stateful, concurrent entities at scale (devices, players, shopping carts, accounts) without you managing locks, caches or placement. A grain is activated on demand, processes messages one at a time, and the runtime decides where it lives, so the code reads like single-threaded code.",
  },
  {
    id: "fc-orleans-actors-2",
    trackId: "dotnet-distributed",
    lessonId: "orleans-actors",
    front: "When would you pick Orleans over a stateless API plus a cache?",
    back: "When many entities each hold hot, mutable state with ordering requirements, such as IoT device twins, game sessions or live pricing, and a database round-trip per operation is too slow. For ordinary CRUD, a stateless ASP.NET Core API with Azure SQL and a cache is simpler to build and run.",
  },

  {
    id: "fc-aspire-dapr-1",
    trackId: "dotnet-distributed",
    lessonId: "aspire-dapr",
    front:
      ".NET Aspire and Dapr are often mentioned together. What does each one do?",
    back: ".NET Aspire is a development-time orchestration and tooling layer: an AppHost that wires projects, containers and Azure resources together, service discovery, a dashboard with OpenTelemetry data, and deployment manifests. Dapr is a runtime sidecar that gives any service building blocks such as pub/sub, state, secrets and service invocation over a uniform API.",
  },
  {
    id: "fc-aspire-dapr-2",
    trackId: "dotnet-distributed",
    lessonId: "aspire-dapr",
    front:
      "What does Aspire change about running a multi-project .NET solution locally?",
    back: "One AppHost project starts the API, the workers, a SQL Server or Redis container and emulators, injects connection strings through service discovery, and shows logs, traces and metrics in one dashboard. It replaces hand-maintained docker-compose files and environment variables for the inner loop.",
  },
  {
    id: "fc-aspire-dapr-3",
    trackId: "dotnet-distributed",
    lessonId: "aspire-dapr",
    front: "When does adding Dapr pay off, and when is it overhead?",
    back: "It pays off when several services, possibly in different languages, need the same pub/sub, state and secrets abstractions and you want to swap Service Bus for Redis locally without code changes. It is overhead for a single-language .NET system where the Azure SDKs and MassTransit already cover those needs.",
  },

  /* ---------------------------------------------------------------- */
  /* Azure hosting and data                                             */

  {
    id: "fc-azure-compute-choices-1",
    trackId: "azure-data",
    lessonId: "azure-compute-choices",
    front:
      "What is the default Azure compute choice for a single ASP.NET Core deployable, and when do you move off it?",
    back: "Azure App Service: managed runtime, deployment slots, built-in TLS and autoscale with no container knowledge required. Move to Container Apps when you need containers, scale to zero, Dapr or KEDA-style event scaling, and to AKS when you need Kubernetes-level control or already run a platform team.",
  },
  {
    id: "fc-azure-compute-choices-2",
    trackId: "azure-data",
    lessonId: "azure-compute-choices",
    front: "When is AKS the right choice rather than Azure Container Apps?",
    back: "When you need the Kubernetes API itself: custom operators, DaemonSets, a service mesh, GPU node pools, specific networking, or a team that already runs clusters. Container Apps gives most workloads the same containers, revisions and scaling with the cluster hidden.",
  },
  {
    id: "fc-azure-compute-choices-3",
    trackId: "azure-data",
    lessonId: "azure-compute-choices",
    front:
      "Which compute option fits a public marketing site with a small API alongside it?",
    back: "Azure Static Web Apps: global static hosting for the React build, a managed Functions API under `/api`, preview environments per pull request and built-in auth. When the API outgrows Functions, link the Static Web App to an App Service or Container App instead.",
  },
  {
    id: "fc-azure-compute-choices-4",
    trackId: "azure-data",
    lessonId: "azure-compute-choices",
    front:
      "A .NET workload has bursty traffic with long idle periods. Which Azure compute options scale to zero?",
    back: "Azure Functions on the consumption plans and Azure Container Apps with minimum replicas set to zero. App Service and AKS keep at least one instance or node running, so they suit steady traffic better.",
  },

  {
    id: "fc-azure-messaging-choices-1",
    trackId: "azure-data",
    lessonId: "azure-messaging-choices",
    front:
      "Which Azure service fits ordered, session-based commands with dead-lettering?",
    back: "Azure Service Bus queues or topics with sessions enabled. Sessions give per-key ordering, dead-letter queues capture poison messages, and duplicate detection, scheduled delivery and transactions cover the rest of the enterprise messaging checklist.",
  },
  {
    id: "fc-azure-messaging-choices-2",
    trackId: "azure-data",
    lessonId: "azure-messaging-choices",
    front: "When is Event Hubs the right choice over Service Bus?",
    back: "High-throughput telemetry and event streams where consumers read partitions in order, keep their own offsets, and can replay retained events. Service Bus is for individual commands and messages that are completed or dead-lettered one by one.",
  },
  {
    id: "fc-azure-messaging-choices-3",
    trackId: "azure-data",
    lessonId: "azure-messaging-choices",
    front: "What is Azure Event Grid for?",
    back: "Push-based delivery of discrete events from Azure services and your own apps to subscribers such as Functions, webhooks, Container Apps or Service Bus. Use it when something happened and other parts should react, with filtering and fan-out handled by the platform.",
  },
  {
    id: "fc-azure-messaging-choices-4",
    trackId: "azure-data",
    lessonId: "azure-messaging-choices",
    front:
      "A team needs a cheap queue for one background worker with no ordering requirements. What fits?",
    back: "Azure Storage Queues: simple, cheap, large capacity, at-least-once delivery with visibility timeouts. Move to Service Bus when you need ordering, sessions, topics with subscriptions, dead-lettering or transactions.",
  },

  {
    id: "fc-sql-vs-cosmos-1",
    trackId: "azure-data",
    lessonId: "sql-vs-cosmos",
    front:
      "What is the default data store for a .NET business application on Azure, and why?",
    back: "Azure SQL Database. Relational modelling, transactions across tables, ad hoc queries, mature tooling and EF Core support fit the typical domain with many related entities and reporting needs. Cosmos DB is the choice when a specific workload needs its properties.",
  },
  {
    id: "fc-sql-vs-cosmos-2",
    trackId: "azure-data",
    lessonId: "sql-vs-cosmos",
    front: "Which workload properties point to Cosmos DB?",
    back: "Global distribution with multi-region writes, very high write throughput with predictable low latency at any scale, a document shape that matches the access pattern, and a clear partition key. Choose it for that workload's drivers and keep the rest of the system on SQL.",
  },
  {
    id: "fc-sql-vs-cosmos-3",
    trackId: "azure-data",
    lessonId: "sql-vs-cosmos",
    front: "What is the most common Cosmos DB design mistake?",
    back: "Choosing a partition key that creates hot partitions or forces cross-partition queries, such as a date for append-heavy data or a tenant id when one tenant is huge. Model documents around the queries and pick a key with high cardinality that appears in the most frequent queries.",
  },

  {
    id: "fc-ef-core-patterns-1",
    trackId: "azure-data",
    lessonId: "ef-core-patterns",
    front:
      "Should an ASP.NET Core application wrap EF Core in a generic repository?",
    back: "Usually no. `DbContext` already is a unit of work and `DbSet<T>` already is a repository. Use EF Core directly in slices and handlers, and introduce a purpose-specific repository only where an aggregate needs a guarded loading path or the domain must stay free of EF Core types.",
  },
  {
    id: "fc-ef-core-patterns-2",
    trackId: "azure-data",
    lessonId: "ef-core-patterns",
    front: "How should read queries be written in EF Core for performance?",
    back: "Project with `Select` into DTOs, use `AsNoTracking()`, avoid loading navigation graphs you do not need, and use `AsSplitQuery()` for wide includes. Watch for N+1 queries in the logs and prefer compiled queries or Dapper for the hottest paths.",
  },
  {
    id: "fc-ef-core-patterns-3",
    trackId: "azure-data",
    lessonId: "ef-core-patterns",
    front: "How do you apply EF Core schema changes safely in CI/CD?",
    back: "Keep migrations in source control, review the generated SQL, and apply them in a deployment step with an idempotent script or a migration bundle rather than calling `Database.Migrate()` at startup on a multi-instance service. Keep each change backward compatible for one release (expand, then contract) when zero downtime matters.",
  },

  {
    id: "fc-caching-strategies-1",
    trackId: "azure-data",
    lessonId: "caching-strategies",
    front:
      "What are the main caching layers available to an ASP.NET Core app on Azure?",
    back: "Browser and CDN caching through response headers, ASP.NET Core output caching middleware, an in-process `IMemoryCache`, a distributed cache (`IDistributedCache` or `HybridCache` over Azure Cache for Redis or Azure Managed Redis), and result caching at the data layer.",
  },
  {
    id: "fc-caching-strategies-2",
    trackId: "azure-data",
    lessonId: "caching-strategies",
    front: "What is the cache-aside pattern, and what is its main risk?",
    back: "On a read, check the cache; on a miss, load from the database and write the value to the cache with a TTL. Writes update the database and invalidate the key. The risk is a stampede: many misses for the same key at once hit the database together, so use a lock or request coalescing (`HybridCache` does this for you).",
  },
  {
    id: "fc-caching-strategies-3",
    trackId: "azure-data",
    lessonId: "caching-strategies",
    front: "When should a cache be in-process rather than in Redis?",
    back: "Small, read-mostly data (configuration, reference lists) where each instance can hold its own copy and brief disagreement between instances is acceptable. Use a distributed cache when instances must agree, the data is large, or a cache miss after a restart is expensive.",
  },

  {
    id: "fc-multi-tenancy-1",
    trackId: "azure-data",
    lessonId: "multi-tenancy",
    front:
      "What are the three common data isolation models for a multi-tenant SaaS on Azure SQL?",
    back: "Database per tenant (strongest isolation, simplest compliance story, most to operate), schema per tenant (a middle ground with awkward migrations), and shared tables with a `TenantId` column (cheapest, scales to many tenants, relies on query filters). Elastic pools make many small databases affordable.",
  },
  {
    id: "fc-multi-tenancy-2",
    trackId: "azure-data",
    lessonId: "multi-tenancy",
    front:
      "How do you stop a shared-table multi-tenant app from leaking data between tenants?",
    back: "Resolve the tenant once per request from the host, route or token claim, hold it in a scoped service, and apply an EF Core global query filter on every tenant-owned entity. Add an integration test that queries as tenant A and asserts that rows from tenant B never appear.",
  },
  {
    id: "fc-multi-tenancy-3",
    trackId: "azure-data",
    lessonId: "multi-tenancy",
    front:
      "A few large customers demand physically separate data while hundreds of small ones do not. What is the usual shape?",
    back: "A hybrid: a shared database for the long tail and dedicated databases (or a dedicated deployment) for the premium tier, selected through a tenant catalogue that maps tenant to connection string. Keep the application code identical across both so the tier is a configuration decision.",
  },

  {
    id: "fc-identity-and-secrets-1",
    trackId: "azure-data",
    lessonId: "identity-and-secrets",
    front:
      "Where should secrets for an ASP.NET Core app on Azure live, and what removes the need for most of them?",
    back: "Azure Key Vault for anything that must remain a secret, loaded through the configuration provider. Managed identities remove most secrets entirely: the app authenticates to SQL, Storage, Service Bus and Key Vault as its own identity, so there is no connection string password to rotate.",
  },
  {
    id: "fc-identity-and-secrets-2",
    trackId: "azure-data",
    lessonId: "identity-and-secrets",
    front:
      "What is the difference between Entra ID and Entra External ID for a SaaS product?",
    back: "Entra ID is the workforce directory: an organisation's employees and partner guests. Entra External ID is for customer-facing apps: self-service sign-up, social identity providers and branding. A B2B SaaS that signs in customers' employees typically uses a multi-tenant Entra ID app registration; a consumer product uses External ID.",
  },

  {
    id: "fc-azure-landing-zone-basics-1",
    trackId: "azure-data",
    lessonId: "azure-landing-zone-basics",
    front: "What is an Azure landing zone?",
    back: "A pre-configured environment with management groups, subscriptions, networking, identity, policy and monitoring in place before any workload is deployed. It encodes the organisation's governance so each new application lands inside guardrails instead of negotiating them.",
  },
  {
    id: "fc-azure-landing-zone-basics-2",
    trackId: "azure-data",
    lessonId: "azure-landing-zone-basics",
    front:
      "What does a workload team actually need to know about the landing zone it deploys into?",
    back: "Which subscription and resource groups it gets, the hub-and-spoke networking and private endpoint rules, which Azure Policies will block or modify resources, how identities and role assignments are granted, and where logs must go. Find these out before the first deployment because they shape service choices.",
  },

  /* ---------------------------------------------------------------- */
  /* React architecture                                                 */

  {
    id: "fc-react-component-architecture-1",
    trackId: "react",
    lessonId: "react-component-architecture",
    front:
      "Is the container versus presentational split still useful in modern React?",
    back: "Hooks replaced the class-based container pattern, and the idea survives as 'components that fetch and coordinate' versus 'components that render props'. Keep leaf components pure and prop-driven so they are reusable and testable, and keep data loading in a few composition points.",
  },
  {
    id: "fc-react-component-architecture-2",
    trackId: "react",
    lessonId: "react-component-architecture",
    front: "What is prop drilling, and what are the two sensible fixes?",
    back: "Passing a value through several components that do not use it, only to reach a deep child. Fix it with composition first (pass the child element as `children` or a prop so the middle layers never see the data), then with a focused Context when the value truly is ambient, such as the theme or current user.",
  },
  {
    id: "fc-react-component-architecture-3",
    trackId: "react",
    lessonId: "react-component-architecture",
    front: "What is the rule for deciding what becomes its own component?",
    back: "Split when a piece of UI has its own state, its own data need, is reused, or when the parent file has become too long to read. Visual shape alone is a weak reason; a component with twelve props that only forwards them downward is a sign the split happened at the wrong seam.",
  },

  {
    id: "fc-react-state-management-1",
    trackId: "react",
    lessonId: "react-state-management",
    front:
      "What is the recommended order for choosing where React state lives?",
    back: "Local `useState` first, lifted to the nearest common parent when siblings need it, the URL when it describes a view (filters, tabs, selected id), and Context or a store only for state that many unrelated components read and write. Most apps need far less global state than they have.",
  },
  {
    id: "fc-react-state-management-2",
    trackId: "react",
    lessonId: "react-state-management",
    front:
      "Why is React Context a poor fit for frequently changing state that is shared widely?",
    back: "Every consumer re-renders when the context value changes, with no selector to narrow it. Context is right for stable, ambient values (theme, auth session, locale). For hot shared state use a store with selectors such as Zustand or Redux Toolkit.",
  },
  {
    id: "fc-react-state-management-3",
    trackId: "react",
    lessonId: "react-state-management",
    front: "Zustand or Redux Toolkit: what tips the decision?",
    back: "Zustand for most apps: a few lines per store, selectors, no boilerplate, easy to co-locate with a feature. Redux Toolkit when the team already has Redux, wants strict conventions and time-travel devtools across a large codebase, or needs RTK Query and middleware for complex async flows.",
  },

  {
    id: "fc-react-server-state-1",
    trackId: "react",
    lessonId: "react-server-state",
    front:
      "Where should server data live in a React app, and why not in a Redux slice?",
    back: "In a server-state cache such as TanStack Query, keyed by the request. Server data has properties a client store does not model: it is owned elsewhere, goes stale, and needs refetching, deduplication and background updates. A Redux slice turns every one of those into hand-written reducers and effects.",
  },
  {
    id: "fc-react-server-state-2",
    trackId: "react",
    lessonId: "react-server-state",
    front: "What does a query key do in TanStack Query?",
    back: "It identifies a piece of server state for caching, deduplication and invalidation. Build it from the resource and its parameters (`['orders', { status, page }]`) so two components asking for the same data share one request, and a mutation can invalidate `['orders']` to refresh every variant.",
  },
  {
    id: "fc-react-server-state-3",
    trackId: "react",
    lessonId: "react-server-state",
    front: "How should a mutation update the UI after it succeeds?",
    back: "Invalidate the affected query keys so they refetch, or set the query data directly from the response when the shape matches. Use optimistic updates with rollback only where the latency is visible to the user and the operation rarely fails.",
  },
  {
    id: "fc-react-server-state-4",
    trackId: "react",
    lessonId: "react-server-state",
    front:
      "What is stale-while-revalidate, and how does TanStack Query implement it?",
    back: "Show cached data immediately and refetch in the background when it is older than `staleTime`; fresh data replaces it when it arrives. Tune `staleTime` per query (seconds for a dashboard, minutes for reference data) so the UI feels instant without serving old data for long.",
  },

  {
    id: "fc-react-rendering-strategies-1",
    trackId: "react",
    lessonId: "react-rendering-strategies",
    front:
      "A public, content-heavy site needs SEO and a fast first paint. Which React rendering strategy fits?",
    back: "Static generation or server-side rendering with Next.js (or another framework with React Server Components) so crawlers and users get full HTML on the first response. A client-only Vite SPA renders an empty shell until JavaScript loads, which hurts both.",
  },
  {
    id: "fc-react-rendering-strategies-2",
    trackId: "react",
    lessonId: "react-rendering-strategies",
    front: "When is a client-rendered Vite SPA the right choice?",
    back: "Authenticated internal or B2B applications where SEO does not matter, users stay for long sessions, and the team wants the simplest build and hosting (a static bundle behind an ASP.NET Core API or on Static Web Apps). First-load time matters less than interaction speed.",
  },
  {
    id: "fc-react-rendering-strategies-3",
    trackId: "react",
    lessonId: "react-rendering-strategies",
    front: "What do React Server Components change about data fetching?",
    back: "Server Components run only on the server, can read databases or call APIs directly with `async`/`await`, and ship no JavaScript for themselves to the browser. Client Components still handle interactivity. In Next.js this moves most data loading out of `useEffect` and client fetch hooks.",
  },

  {
    id: "fc-react-code-organisation-1",
    trackId: "react",
    lessonId: "react-code-organisation",
    front:
      "Feature folders or type folders: which should a React codebase use, and why?",
    back: "Feature folders (`features/orders/` holding its components, hooks, API client and tests). Code that changes together stays together, a feature can be deleted in one move, and the structure mirrors backend modules. Type folders (`components/`, `hooks/`) only scale while the app is small.",
  },
  {
    id: "fc-react-code-organisation-2",
    trackId: "react",
    lessonId: "react-code-organisation",
    front:
      "How do you keep features from importing each other's internals in a React codebase?",
    back: "Each feature exposes a public `index.ts`, and an ESLint rule (`no-restricted-imports` or an import-boundaries plugin) blocks deep imports. Shared primitives live in `shared/` or a design system package; a feature that needs another feature's logic goes through that feature's public API.",
  },

  {
    id: "fc-react-forms-and-validation-1",
    trackId: "react",
    lessonId: "react-forms-and-validation",
    front:
      "When should form inputs be controlled, and when is the uncontrolled approach of React Hook Form better?",
    back: "Controlled inputs are fine for a few fields with live dependent logic. For larger forms, uncontrolled inputs registered with React Hook Form avoid a re-render per keystroke and keep form state out of React state. Use its controlled mode only for components that need it, such as custom pickers.",
  },
  {
    id: "fc-react-forms-and-validation-2",
    trackId: "react",
    lessonId: "react-forms-and-validation",
    front:
      "How do you keep validation rules consistent between a React form and an ASP.NET Core API?",
    back: "Validate on both sides: a Zod schema on the client and FluentValidation or data annotations on the server, with the OpenAPI document carrying the constraints so the generated types agree. Treat client validation as a usability feature and server validation as the security boundary.",
  },
  {
    id: "fc-react-forms-and-validation-3",
    trackId: "react",
    lessonId: "react-forms-and-validation",
    front:
      "What should a form do with validation errors returned by the server?",
    back: "Map the API's problem details (`ValidationProblemDetails` from ASP.NET Core, with errors keyed by field) back onto the fields with `setError`, and show cross-field errors at the form level. The client must never assume its own validation matched the server's.",
  },

  {
    id: "fc-react-performance-architecture-1",
    trackId: "react",
    lessonId: "react-performance-architecture",
    front: "What is the first thing to check when a React screen is slow?",
    back: "Use the React DevTools Profiler to see which components re-render and why. Most slowness comes from a parent re-rendering a large subtree on every state change, from context values that change identity on every render, or from heavy work inside render. Measure before adding `memo` anywhere.",
  },
  {
    id: "fc-react-performance-architecture-2",
    trackId: "react",
    lessonId: "react-performance-architecture",
    front:
      "What is the structural fix for a large list that re-renders on every keystroke in a search box?",
    back: "Move the state down: keep the search text in a small component (or in the URL with a debounced update) so the list only re-renders when the committed query changes. Virtualise long lists with TanStack Virtual, and memoise row components once the state boundary is right.",
  },
  {
    id: "fc-react-performance-architecture-3",
    trackId: "react",
    lessonId: "react-performance-architecture",
    front:
      "How does the React Compiler change the advice about `useMemo` and `useCallback`?",
    back: "With the compiler enabled, memoisation of values and callbacks is inserted automatically for code that follows the Rules of React, so hand-written `useMemo` and `useCallback` become mostly unnecessary. Architecture-level problems (state placed too high, oversized contexts, unvirtualised lists) remain yours to fix.",
  },

  {
    id: "fc-react-micro-frontends-1",
    trackId: "react",
    lessonId: "react-micro-frontends",
    front:
      "What problem do micro-frontends solve, and what problem do they create?",
    back: "They let several teams deploy parts of one UI independently, each owning a vertical slice end to end. They create duplicated dependencies, inconsistent UX, cross-app routing and state sharing, and a composition layer that someone must own. They pay off only with many teams on one product.",
  },
  {
    id: "fc-react-micro-frontends-2",
    trackId: "react",
    lessonId: "react-micro-frontends",
    front: "What are the common ways to compose micro-frontends?",
    back: "Build-time composition (packages in a monorepo, one deploy), run-time composition with Module Federation (Webpack, Rspack, or a Vite plugin), iframes for hard isolation, and server-side composition at the edge or in a BFF. Module Federation is the usual choice when independent deploys are the goal.",
  },
  {
    id: "fc-react-micro-frontends-3",
    trackId: "react",
    lessonId: "react-micro-frontends",
    front:
      "A single team of eight wants micro-frontends 'for scalability'. What is the right advice?",
    back: "Use a monorepo with feature packages and a design system instead. One team gains nothing from independent deploys and pays the full cost of composition, shared state and version drift. Micro-frontends are an organisational tool for many autonomous teams; the number of teams is the driver.",
  },

  {
    id: "fc-react-testing-strategy-1",
    trackId: "react",
    lessonId: "react-testing-strategy",
    front: "What is the recommended testing mix for a React application?",
    back: "Many component tests with Vitest and React Testing Library that render real components and interact through the DOM, a handful of end-to-end flows with Playwright against the running app, and unit tests for pure logic (reducers, formatters, schemas). Mock the network with MSW rather than mocking hooks or modules.",
  },
  {
    id: "fc-react-testing-strategy-2",
    trackId: "react",
    lessonId: "react-testing-strategy",
    front:
      "Why is 'test behaviour, not implementation' the guiding rule in React Testing Library?",
    back: "Tests that query by role, label and text survive refactors (switching state libraries, splitting components) and fail when the user experience breaks. Tests that assert on internal state, hook calls or class names break on every refactor and keep passing while the UI is broken.",
  },

  {
    id: "fc-react-design-systems-1",
    trackId: "react",
    lessonId: "react-design-systems",
    front:
      "What is the difference between a component library and a design system?",
    back: "A component library is code: a package of React components with props and styles. A design system also includes tokens (colour, spacing, typography), usage guidelines, accessibility rules and governance for how it evolves. A library without tokens and rules drifts as soon as two teams use it.",
  },
  {
    id: "fc-react-design-systems-2",
    trackId: "react",
    lessonId: "react-design-systems",
    front:
      "Headless component libraries such as Radix or React Aria: when do they fit better than a styled library like MUI?",
    back: "When the product has its own visual identity and the team can own styling (with Tailwind or CSS Modules) and wants accessibility, keyboard behaviour and focus management done right. A fully styled library is faster for internal tools where a standard look is acceptable.",
  },

  /* ---------------------------------------------------------------- */
  /* ASP.NET Core + React                                               */

  {
    id: "fc-aspnet-react-hosting-1",
    trackId: "fullstack",
    lessonId: "aspnet-react-hosting",
    front:
      "What are the two main ways to host a React front end with an ASP.NET Core API?",
    back: "Same origin: the API serves the built SPA as static files (with the SPA proxy in development), so cookies and relative URLs just work. Separate origins: the SPA on Static Web Apps or a CDN and the API on App Service or Container Apps, which needs CORS, an absolute API base URL and a clear token strategy.",
  },
  {
    id: "fc-aspnet-react-hosting-2",
    trackId: "fullstack",
    lessonId: "aspnet-react-hosting",
    front: "Why does the hosting choice affect the authentication design?",
    back: "Same-origin hosting allows HttpOnly, SameSite cookies issued by the API, which keeps tokens out of JavaScript. Separate origins push you toward bearer tokens obtained by MSAL in the browser, or a BFF that holds tokens server-side and issues a cookie to the SPA.",
  },
  {
    id: "fc-aspnet-react-hosting-3",
    trackId: "fullstack",
    lessonId: "aspnet-react-hosting",
    front:
      "What does the Vite dev server need in order to talk to a local ASP.NET Core API?",
    back: "A proxy entry in `vite.config.ts` that forwards `/api` to the Kestrel port, or the ASP.NET Core SPA proxy template that starts Vite from `dotnet run`. Either keeps requests same-origin in development so cookies and CORS behave as they will in production.",
  },

  {
    id: "fc-blazor-vs-react-1",
    trackId: "fullstack",
    lessonId: "blazor-vs-react",
    front: "When does Blazor beat React for a team on the Microsoft stack?",
    back: "Internal line-of-business apps built by a .NET team with little JavaScript experience, where sharing C# models and validation across client and server and staying inside one toolchain matters more than the front-end ecosystem. Blazor's render modes let the same components run on the server or in WebAssembly.",
  },
  {
    id: "fc-blazor-vs-react-2",
    trackId: "fullstack",
    lessonId: "blazor-vs-react",
    front:
      "What are the signals that React is the better choice even for a .NET shop?",
    back: "A public or customer-facing product where first load and ecosystem matter, a need to hire front-end specialists, heavy use of third-party UI libraries, a design system shared with other non-.NET apps, or micro-frontends. React's component and tooling ecosystem is far larger than Blazor's.",
  },

  {
    id: "fc-api-contracts-openapi-1",
    trackId: "fullstack",
    lessonId: "api-contracts-openapi",
    front:
      "What is contract-first versus code-first OpenAPI, and which does ASP.NET Core favour?",
    back: "Code-first generates the OpenAPI document from the endpoints (the built-in `Microsoft.AspNetCore.OpenApi` package or Swashbuckle). Contract-first writes the document by hand and generates servers and clients from it. ASP.NET Core teams usually go code-first and generate the TypeScript client from the output.",
  },
  {
    id: "fc-api-contracts-openapi-2",
    trackId: "fullstack",
    lessonId: "api-contracts-openapi",
    front:
      "How do you keep a React client and an ASP.NET Core API from drifting apart?",
    back: "Generate the TypeScript client and types from the API's OpenAPI document in CI (Kiota, openapi-typescript, Orval or NSwag), commit or publish the output, and fail the build when the document changes without a regenerated client. Add a contract test that validates responses against the schema.",
  },
  {
    id: "fc-api-contracts-openapi-3",
    trackId: "fullstack",
    lessonId: "api-contracts-openapi",
    front: "How should an ASP.NET Core API version its contract?",
    back: "Add fields rather than change them, keep old fields until no client uses them, and only introduce an explicit version (URL segment or header via `Asp.Versioning`) when a breaking change is unavoidable. Most APIs with a single first-party React client never need a v2.",
  },

  {
    id: "fc-entra-id-auth-1",
    trackId: "fullstack",
    lessonId: "entra-id-auth",
    front:
      "What is the recommended flow for a React SPA signing in with Entra ID?",
    back: "Authorization code flow with PKCE using MSAL for React (`@azure/msal-react`). The SPA redirects to Entra ID, receives tokens in the browser, and sends an access token for the API's scope as a bearer header. The implicit flow is deprecated.",
  },
  {
    id: "fc-entra-id-auth-2",
    trackId: "fullstack",
    lessonId: "entra-id-auth",
    front: "How does an ASP.NET Core API validate Entra ID tokens?",
    back: "With `Microsoft.Identity.Web`: `AddMicrosoftIdentityWebApi` configures JWT bearer authentication against the tenant's metadata, validates issuer, audience and signature, and exposes scope and role requirements through authorization policies. The API does not call Entra ID on every request.",
  },
  {
    id: "fc-entra-id-auth-3",
    trackId: "fullstack",
    lessonId: "entra-id-auth",
    front:
      "When should you put a BFF in front of a React SPA instead of using MSAL in the browser?",
    back: "When tokens must never reach the browser (regulated environments), when you need long sessions with refresh tokens, or when many downstream APIs each need their own token. The BFF (an ASP.NET Core host with cookie auth that proxies to the APIs) holds the tokens and the SPA gets an HttpOnly cookie.",
  },

  {
    id: "fc-realtime-signalr-1",
    trackId: "fullstack",
    lessonId: "realtime-signalr",
    front: "What does SignalR provide over plain WebSockets?",
    back: "Transport negotiation with fallback (WebSockets, server-sent events, long polling), hubs with typed methods and groups, automatic reconnection in the client, and a backplane model so several server instances can broadcast. The JavaScript client works in React behind a small hook or context wrapper.",
  },
  {
    id: "fc-realtime-signalr-2",
    trackId: "fullstack",
    lessonId: "realtime-signalr",
    front:
      "When should you use Azure SignalR Service rather than self-hosting SignalR in the API?",
    back: "When the API runs on more than one instance or scales out (the service owns the connections and fan-out, so no Redis backplane is needed), when connection counts are high, or when the API is serverless (Functions bindings). A single-instance internal app can self-host.",
  },

  /* ---------------------------------------------------------------- */
  /* Cross-cutting concerns                                             */

  {
    id: "fc-observability-1",
    trackId: "crosscutting",
    lessonId: "observability",
    front:
      "What are the three pillars of observability, and what ties them together?",
    back: "Logs, metrics and traces. A trace id propagated through every HTTP call and message (W3C Trace Context) ties them together, so one slow request can be followed across the React app, the API, Service Bus and the database.",
  },
  {
    id: "fc-observability-2",
    trackId: "crosscutting",
    lessonId: "observability",
    front: "How does a .NET service emit telemetry on Azure today?",
    back: "OpenTelemetry through the .NET SDK: `ILogger` for logs, `System.Diagnostics.Metrics` for metrics, `ActivitySource` for traces, exported with the Azure Monitor OpenTelemetry distro to Application Insights. .NET Aspire wires the same instrumentation into its local dashboard.",
  },
  {
    id: "fc-observability-3",
    trackId: "crosscutting",
    lessonId: "observability",
    front: "What makes a log line useful for debugging a distributed request?",
    back: "Structured properties rather than an interpolated string: trace id, span id, tenant, user id and the entity ids involved, with a consistent event name. In Application Insights those properties become queryable in KQL so one request can be reconstructed in seconds.",
  },

  {
    id: "fc-resilience-1",
    trackId: "crosscutting",
    lessonId: "resilience",
    front:
      "Which resilience policies does an outbound HTTP call from a .NET service usually need?",
    back: "A timeout, a retry with exponential backoff and jitter for transient failures only, and a circuit breaker so a failing dependency is not hammered. `Microsoft.Extensions.Http.Resilience` (built on Polly) adds a standard pipeline to `HttpClient` in one call.",
  },
  {
    id: "fc-resilience-2",
    trackId: "crosscutting",
    lessonId: "resilience",
    front: "Why can retries make an outage worse, and what prevents it?",
    back: "Every layer retrying multiplies the load on a struggling dependency (a retry storm). Retry only idempotent operations, only on transient errors, cap the attempts, add jitter, use a circuit breaker, and budget retries at one layer rather than in the client, the gateway and the service.",
  },

  {
    id: "fc-security-architecture-1",
    trackId: "crosscutting",
    lessonId: "security-architecture",
    front:
      "What does 'zero trust' mean in practice for an ASP.NET Core system on Azure?",
    back: "Every call is authenticated and authorised regardless of network location: managed identities between services, private endpoints and network rules as a second layer, least-privilege RBAC on every resource, and token validation on every API, including internal ones.",
  },
  {
    id: "fc-security-architecture-2",
    trackId: "crosscutting",
    lessonId: "security-architecture",
    front:
      "Which OWASP categories still cause most incidents in .NET and React applications?",
    back: "Broken access control (a missing authorisation check on an endpoint or object), injection where raw SQL is concatenated, insecure configuration (debug pages, permissive CORS, secrets in app settings) and vulnerable dependencies. Threat-model each feature and automate dependency and secret scanning in CI.",
  },

  {
    id: "fc-cicd-and-environments-1",
    trackId: "crosscutting",
    lessonId: "cicd-and-environments",
    front:
      "What should a CI/CD pipeline for an ASP.NET Core and React system do between commit and production?",
    back: "Build and test both halves, scan dependencies, produce one immutable artefact (container image or zip) per commit, deploy infrastructure with Bicep or Terraform, promote the same artefact through dev, test and production with environment-specific configuration, and gate production on approvals and smoke tests.",
  },
  {
    id: "fc-cicd-and-environments-2",
    trackId: "crosscutting",
    lessonId: "cicd-and-environments",
    front:
      "How do you deploy without downtime on Azure App Service or Container Apps?",
    back: "App Service deployment slots: deploy to a staging slot, warm it up, then swap. Container Apps revisions: deploy a new revision and shift traffic gradually. Both require backward-compatible database migrations so old and new versions can run against the same schema during the switch.",
  },

  {
    id: "fc-backend-testing-strategy-1",
    trackId: "crosscutting",
    lessonId: "backend-testing-strategy",
    front: "What is the recommended testing shape for an ASP.NET Core backend?",
    back: "Unit tests for domain logic, a large set of integration tests through `WebApplicationFactory` that hit real endpoints with a real database (Testcontainers for SQL Server), and a few end-to-end checks after deployment. Mock only external systems you do not own.",
  },
  {
    id: "fc-backend-testing-strategy-2",
    trackId: "crosscutting",
    lessonId: "backend-testing-strategy",
    front:
      "Why are integration tests through WebApplicationFactory preferred over mocking EF Core?",
    back: "A mocked DbContext passes while the real query translates wrongly or hits a missing index. `WebApplicationFactory` runs the full pipeline (routing, auth, validation, EF Core, SQL) so tests catch configuration mistakes and query bugs. With Testcontainers they still run in CI in seconds per test.",
  },
];
