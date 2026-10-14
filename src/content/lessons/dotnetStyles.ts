import type { Lesson } from "../types";
import { EXAMPLE_LESSON } from "./_example";

/**
 * Track: .NET application styles. The shapes a .NET backend can take, from a
 * layered monolith to microservices, and the migration path between them.
 */
export const DOTNET_STYLES_LESSONS: Lesson[] = [
  {
    id: "layered-monolith",
    trackId: "dotnet-styles",
    title: "Layered monolith",
    tagline:
      "Controllers, services, repositories, one database. Still the default for most teams.",
    level: 1,
    minutes: 8,
    summary:
      "The layered (N-tier) monolith is the shape most ASP.NET Core applications are born with: a presentation layer, an application or service layer, and a data layer over one SQL database, all in one deployable. It is the right default for small teams and CRUD-heavy products, as long as you know the two ways it rots and watch for them.",
    sections: [
      {
        heading: "What it is",
        body: "A layered monolith organises code by **technical responsibility**. Requests enter through controllers or Minimal API endpoints, pass to application services that hold the business rules, and reach the database through a data access layer, usually EF Core. Dependencies point in one direction, downwards, and nothing in a lower layer knows about the layer above it.\n\nIn a typical ASP.NET Core solution that is three or four projects: `Web` (endpoints, DTOs, filters), `Application` (services, validation), `Data` (DbContext, entity configurations, migrations) and often a `Domain` or `Models` project for the entity classes. Everything compiles into one process, deploys as one unit and talks to one Azure SQL database.\n\nThis is the shape every `dotnet new webapi` tutorial assumes, the shape most hiring interviews assume, and the shape a new .NET developer can navigate on day one. That familiarity is a real architectural asset, and it is the first reason to pick it.",
      },
      {
        heading: "Why it is still the right default",
        body: 'For a team of two to eight developers building a product whose core is forms, lists and reports over relational data, nothing beats a layered monolith on time to first feature.\n\n- One solution, one pipeline, one App Service or Container App, one connection string.\n- Transactions are a `SaveChangesAsync` call. There is no outbox, no saga, no eventual consistency to explain to the product owner.\n- Debugging is a breakpoint. Tracing is one log stream.\n- Scaffolding, EF Core migrations and the ASP.NET Core templates all push you towards this shape, so you spend no effort fighting the framework.\n\nMost line-of-business systems, internal tools, admin portals and early-stage SaaS products never outgrow it. The honest question is rarely "is a monolith good enough?" and almost always "how do I keep this one healthy for five years?".',
      },
      {
        heading: "EF Core straight in the application",
        body: "The most common mistake in a layered .NET app is wrapping EF Core in a generic `IRepository<T>` plus an `IUnitOfWork`. `DbContext` already **is** a unit of work and `DbSet<T>` already is a repository. The wrapper hides `Include`, projections, `ExecuteUpdateAsync`, compiled queries and interceptors, and every feature request ends up adding a bespoke method to it.\n\nA healthier layout:\n\n```csharp\npublic sealed class OrderService(AppDbContext db, TimeProvider clock)\n{\n    public async Task<OrderSummary?> GetAsync(int id, CancellationToken ct) =>\n        await db.Orders\n            .Where(o => o.Id == id)\n            .Select(o => new OrderSummary(o.Id, o.Total, o.Status))\n            .SingleOrDefaultAsync(ct);\n}\n```\n\nInject the DbContext into application services, project to DTOs with `Select` for reads, load full entities only for writes, and keep the DbContext out of controllers. Reserve hand-written repositories for the few aggregates with genuinely complex loading rules. Add Testcontainers with a real SQL Server image for integration tests instead of mocking the context.",
      },
      {
        heading: "Where it decays",
        body: "Two failure modes account for most layered monoliths that teams describe as legacy.\n\n**Anaemic services.** `CustomerService.Update` validates nothing, decides nothing and simply forwards to the repository. The real rules end up in controllers, in stored procedures, or in the React client. The layer exists on the diagram and nowhere else.\n\n**God repositories.** `OrderRepository` grows a method per screen: `GetOrdersForDashboard`, `GetOrdersForExportV2`, `GetOrdersWithCustomerAndLinesForInvoice`. It is referenced from forty places and no one dares change a query.\n\nAdd a single DbContext with three hundred entity types, navigation properties that let any part of the system walk to any other, and a `Common` project that every other project references, and you have a big ball of mud with tidy folder names. The symptom you can measure: a feature in Billing requires edits in six projects and a regression test run of the whole suite.",
      },
      {
        heading: "Keeping it healthy",
        body: "- Business rules live in the application or domain layer. A controller that contains an `if` about money is a bug.\n- Group code by feature inside each layer (`Services/Orders`, `Services/Billing`) so a later move to modules or slices is a folder move.\n- Read paths project straight to DTOs; write paths load aggregates. Do not make one query serve both.\n- Split the DbContext along the obvious seams once it passes roughly fifty entity types. Two contexts over one database is fine.\n- Keep cross-cutting concerns in ASP.NET Core middleware, endpoint filters and EF Core interceptors instead of base classes.\n- Run an architecture test (NetArchTest) that fails when `Web` references `Data` directly.\n- Measure the test suite. When a full run passes ten minutes, that is the moment to introduce boundaries, not later.",
      },
      {
        heading: "When to move to a modular monolith",
        body: "Move when the pain is about **ownership** rather than scale. Signals: two or more teams are editing the same services; a change in one business area regularly breaks another; new developers need a week to learn where things live; the release needs a sign-off from every area because no one can say what a change touches.\n\nThe migration is incremental. Pick one business area, move its services, entities and endpoints into a module folder with its own DbContext and SQL schema, expose a small contracts interface for the two or three calls other code makes into it, and add the architecture test. Repeat for the next area. You never need a big-bang rewrite, and you never need a network boundary to get there.\n\nStay layered when the team is small, the domain is mostly CRUD, and the suite still runs fast. Simplicity you do not need to defend is the cheapest architecture there is.",
      },
    ],
    diagram: {
      caption:
        "Classic layers: dependencies point one way, one process, one database.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "Vite + TanStack Query",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "web",
          label: "Web layer",
          sub: "controllers, Minimal APIs",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "app",
          label: "Application services",
          sub: "rules, validation",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "data",
          label: "Data layer",
          sub: "EF Core DbContext",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "one database",
          col: 4,
          row: 1,
          kind: "data",
        },
        {
          id: "note",
          label: "Rules belong here",
          sub: "never in controllers",
          col: 2,
          row: 0,
          kind: "note",
        },
      ],
      edges: [
        { from: "spa", to: "web", label: "HTTPS/JSON" },
        { from: "web", to: "app", label: "DTO in, DTO out" },
        { from: "app", to: "data" },
        { from: "data", to: "db", label: "SQL" },
        { from: "note", to: "app", style: "dashed" },
      ],
      groups: [{ label: "One deployable", nodeIds: ["web", "app", "data"] }],
    },
    useWhen: [
      "A team of two to eight developers who all work on the whole product",
      "The domain is mostly forms, lists and reports over relational data",
      "You need a first release in weeks and have no dedicated operations people",
      "Every developer already knows the controller, service, repository shape",
    ],
    avoidWhen: [
      "Two or more teams keep colliding in the same service classes",
      "One business area has rules rich enough that services turn into thousand-line classes",
      "Different parts of the system must scale or deploy on their own schedule",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core Web API template",
        role: "The default project layout already assumes this shape.",
      },
      {
        name: "EF Core DbContext",
        role: "Used directly by application services; it is the unit of work and the repository.",
      },
      {
        name: "Azure SQL Database",
        role: "One relational database with transactions across the whole model.",
      },
      {
        name: "Azure App Service",
        role: "One deployable fits the simplest and cheapest hosting option.",
      },
      {
        name: "Testcontainers for .NET",
        role: "Integration tests against a real SQL Server container instead of mocked repositories.",
      },
      {
        name: "NetArchTest",
        role: "Fails the build when a layer reaches past its neighbour.",
      },
    ],
    reactStack: [
      {
        name: "One generated API client",
        role: "A single OpenAPI document feeds one TypeScript client; fine while the API is small.",
      },
      {
        name: "Feature folders in the SPA",
        role: "Group the front end by screen or capability even when the backend is grouped by layer.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 2,
        note: "The shape every .NET developer already knows, with no distributed plumbing.",
      },
      {
        attribute: "time-to-market",
        effect: 2,
        note: "Templates, scaffolding and EF Core migrations all push this way.",
      },
      {
        attribute: "scalability",
        effect: -1,
        note: "Scales as one unit; a hot path cannot scale alone.",
      },
      {
        attribute: "consistency",
        effect: 2,
        note: "Every write is one SQL transaction.",
      },
      {
        attribute: "evolvability",
        effect: -1,
        note: "Technical layers hide business boundaries, so later splitting takes work.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "One pipeline and one artefact; every release ships everything.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "Easy to integration test, easy to over-mock.",
      },
      {
        attribute: "team-autonomy",
        effect: -1,
        note: "Everyone edits the same services and the same DbContext.",
      },
      {
        attribute: "operability",
        effect: 2,
        note: "One log stream, one health check, one dashboard.",
      },
      {
        attribute: "cost",
        effect: 2,
        note: "A single App Service plan and one database.",
      },
    ],
    related: [
      "modular-monolith",
      "clean-architecture",
      "ef-core-patterns",
      "coupling-and-cohesion",
    ],
    checks: [
      {
        id: "layered-monolith-q1",
        prompt:
          "Your `OrderRepository` has grown to sixty methods, one per screen. What is the best fix?",
        options: [
          "Split it into `OrderReadRepository` and `OrderWriteRepository`",
          "Let application services query the DbContext directly and project to DTOs with `Select`",
          "Move the methods into stored procedures so the C# stays small",
          "Add a generic `IRepository<T>` so every entity gets the same methods",
        ],
        answer: 1,
        explanation:
          "A god repository is the symptom of hiding EF Core behind a wrapper. Letting services use the DbContext and project per use case removes the wrapper and the growth. Splitting the repository or going generic keeps the wrapper and keeps the problem; stored procedures just move it.",
      },
      {
        id: "layered-monolith-q2",
        prompt:
          "Which signal most strongly says it is time to move from layers to modules?",
        options: [
          "The solution has more than ten projects",
          "Two teams keep editing the same service classes and breaking each other's features",
          "The API has more than one hundred endpoints",
          "Traffic doubled over the last year",
        ],
        answer: 1,
        explanation:
          "Modules fix ownership problems. Colliding teams and cross-area regressions are ownership problems. Project count and endpoint count are size, and a traffic increase is a scaling question that a modular monolith does not change.",
      },
      {
        id: "layered-monolith-q3",
        prompt:
          'Where should the rule "orders over 10,000 need manager approval" live?',
        options: [
          "In the controller action, since it decides which response to return",
          "In the React form, so the user sees it immediately",
          "In the application or domain layer, with the UI mirroring it for feedback",
          "In a SQL trigger, so it cannot be bypassed",
        ],
        answer: 2,
        explanation:
          "Business rules belong in the application or domain layer where they are testable and reused by every entry point. The UI can mirror the rule for feedback. A controller rule is skipped by the next endpoint, and a trigger hides the rule from the code that owns it.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: N-tier architecture style",
        url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/n-tier",
      },
      {
        title: "Microsoft Learn: Common web application architectures",
        url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures",
      },
    ],
  },
  EXAMPLE_LESSON,
  {
    id: "clean-architecture",
    trackId: "dotnet-styles",
    title: "Clean architecture",
    tagline:
      "Domain in the centre, infrastructure on the edge, dependencies pointing inwards.",
    level: 2,
    minutes: 8,
    summary:
      "Clean, Onion and Hexagonal architecture are one idea with three drawings: the domain model depends on nothing, use cases depend only on the domain, and databases, message brokers and web frameworks are adapters plugged in at the edge. In .NET it usually means four projects and a lot of files per feature. It pays for itself when the rules are rich and the product is long-lived, and it is pure ceremony when they are not.",
    sections: [
      {
        heading: "What it is",
        body: "The **dependency rule** is the whole pattern: source code dependencies point inwards, towards the domain. Everything else follows from it.\n\n- `Domain`: entities, value objects, domain events, domain services. References nothing except the base class library.\n- `Application`: use cases (commands and queries), the **ports** those use cases need (`IOrderRepository`, `IEmailSender`, `IApplicationDbContext`), validation and the DTOs it returns. References `Domain` only.\n- `Infrastructure`: the **adapters** that implement the ports with EF Core, Azure Service Bus, SendGrid, Azure Blob Storage, Entra ID. References `Application`.\n- `Presentation` (or `Web`): ASP.NET Core endpoints, authentication, Swagger, DI composition. References `Application` and, for wiring only, `Infrastructure`.\n\nOnion architecture draws the same thing as rings; Hexagonal (ports and adapters) draws it as a hexagon with adapters on each side. The distinction people argue about is cosmetic. What matters is that `Domain` and `Application` compile without EF Core, without ASP.NET Core and without any Azure SDK.",
      },
      {
        heading: "The template style",
        body: "Two community templates define what \"clean architecture in .NET\" looks like in practice. Jason Taylor's **Clean Architecture** template (`dotnet new ca-sln`) gives you Domain, Application, Infrastructure and Web projects with MediatR requests, FluentValidation validators wired as a pipeline behaviour, EF Core behind an `IApplicationDbContext` interface, and an Angular or React front end. Steve Smith's (Ardalis) **Clean Architecture** template takes a more DDD flavour: aggregates with guard clauses, a specification pattern for queries, a `SharedKernel`, and FastEndpoints on the web side.\n\nBoth are good teaching tools and both are honest about being opinionated. Two warnings before you adopt one wholesale. MediatR and AutoMapper moved to a commercial licence in 2025 with a free tier for small organisations, so check the terms for your company. And the templates ship with every bell: pipeline behaviours for logging, performance, authorisation and caching. Delete what you do not need on day one; each one is a layer a new developer must learn before they can add an endpoint.",
      },
      {
        heading: "Ports and adapters in practice",
        body: "The value of a port is in what it lets you **not** know. A `PlaceOrderHandler` that takes `IOrderRepository` and `IPaymentGateway` can be unit tested with two fakes and no database. The same handler can run inside an Azure Function or a console job because nothing in it mentions HTTP.\n\nThe mistake is to make everything a port. `IApplicationDbContext` exposing `DbSet<Order>` is a thin and honest abstraction over EF Core that keeps `Application` free of the `Infrastructure` project while still letting handlers write LINQ. A generic `IRepository<T>` with `GetAll` and `Find(Expression)` is a leaky re-implementation of the DbSet that hides projections and tracking behaviour.\n\n```csharp\npublic interface IApplicationDbContext\n{\n    DbSet<Order> Orders { get; }\n    Task<int> SaveChangesAsync(CancellationToken ct);\n}\n```\n\nSwapping SQL Server for Cosmos DB behind a port is a story people tell; it almost never happens. The real benefits are a domain free of EF attributes, handlers you can test in milliseconds, and infrastructure you can replace one adapter at a time.",
      },
      {
        heading: "The ceremony bill",
        body: 'Count the files for one endpoint that updates a customer\'s address: `UpdateAddressCommand`, `UpdateAddressCommandValidator`, `UpdateAddressCommandHandler`, `AddressDto`, a mapping profile, the `Address` value object, the EF Core `IEntityTypeConfiguration<Customer>`, and the endpoint or controller. Eight files, four projects, for a form with five fields. Multiply by two hundred endpoints.\n\nThat cost is real and it compounds: three DTO shapes for one entity, a mapping layer that silently drops a new property, handlers that are 90 percent plumbing. Teams respond by adding code generators, which is a sign the abstraction is doing nothing for them.\n\nIt is overkill when the domain is CRUD, when the product may not exist in eighteen months, when the team is two people, and when most "use cases" are a query with a `Select`. In those situations a layered monolith or vertical slices gives you the same testability for a third of the files.',
      },
      {
        heading: "When it pays off, and the DDD connection",
        body: "It pays off when the **rules are the product**: pricing engines, insurance underwriting, logistics planning, anything with a regulator. There the `Domain` project becomes the place where aggregates enforce invariants (`Order.AddLine` refuses a line after shipment), value objects make illegal states unrepresentable (`Money`, `PolicyNumber`), and domain events (`OrderShipped`) announce facts for other parts of the system.\n\nClean architecture is the container that keeps those **DDD tactical patterns** free of infrastructure. Without it, the first `[Required]` attribute, the first `DbContext` call inside an entity, or the first `HttpContext` in a domain service starts the erosion. With it, the compiler enforces the boundary.\n\nThe pairing also makes long-lived products cheaper to change: replacing the web framework, moving a queue from Azure Storage Queues to Service Bus, or adding a second presentation (a scheduled job, a gRPC service) touches one adapter each. Over ten years that is where the money is.",
      },
      {
        heading: "How to decide",
        body: "Ask three questions. Will this system still be developed in five years? Are there rules a product owner would argue about for an hour? Are there more than two external systems to integrate? Three yes answers: use the dependency rule and keep DDD patterns in `Domain`. Three no answers: do not.\n\nIn between, mix. Keep a `Domain` project and the dependency rule, but organise `Application` as vertical slices so each feature is one file. Drop the generic repository and the mapping library. Use clean architecture inside the two modules of a modular monolith where the rules are rich and plain services in the modules that are CRUD. Architecture is allowed to differ per module; what must stay constant is the direction of dependencies.",
      },
    ],
    diagram: {
      caption:
        "The dependency rule: everything points towards Domain; infrastructure implements the ports.",
      nodes: [
        {
          id: "web",
          label: "Presentation",
          sub: "ASP.NET Core endpoints",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "app",
          label: "Application",
          sub: "use cases + ports",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "domain",
          label: "Domain",
          sub: "entities, value objects",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "infra",
          label: "Infrastructure",
          sub: "EF Core, Service Bus",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "adapter target",
          col: 2,
          row: 2,
          kind: "data",
        },
        {
          id: "tests",
          label: "Unit tests",
          sub: "fakes for every port",
          col: 0,
          row: 2,
          kind: "note",
        },
      ],
      edges: [
        { from: "web", to: "app", label: "sends commands" },
        { from: "app", to: "domain", label: "depends on" },
        {
          from: "infra",
          to: "app",
          label: "implements ports",
          style: "dashed",
        },
        { from: "infra", to: "db" },
        { from: "tests", to: "app", style: "dashed" },
      ],
      groups: [
        { label: "Compiles without EF or ASP.NET", nodeIds: ["app", "domain"] },
      ],
    },
    useWhen: [
      "The business rules are complex enough that a product owner argues about them",
      "The product will be developed for years and will outlive today's frameworks",
      "You integrate with three or more external systems that you expect to replace",
      "You want domain logic unit tested without a database or an HTTP host",
    ],
    avoidWhen: [
      "Most endpoints are CRUD and the handler would be a `Select` with a DTO",
      "The team is one or two people and the product may not survive the year",
      "Nobody on the team has used the pattern before and the deadline is this quarter",
    ],
    microsoftStack: [
      {
        name: "Jason Taylor Clean Architecture template",
        role: "Four-project solution with MediatR, FluentValidation and EF Core behind an interface.",
      },
      {
        name: "Ardalis Clean Architecture template",
        role: "DDD-flavoured variant with aggregates, specifications and FastEndpoints.",
      },
      {
        name: "EF Core IEntityTypeConfiguration",
        role: "Keeps mapping in Infrastructure so Domain entities carry no EF attributes.",
      },
      {
        name: "MediatR pipeline behaviours",
        role: "Validation, logging and transactions applied once around every use case.",
      },
      {
        name: "FluentValidation",
        role: "Command validators that live in Application and run before the handler.",
      },
      {
        name: "Azure Service Bus adapter",
        role: "An Infrastructure implementation of an `IEventPublisher` port.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -2,
        note: "Four projects and eight files per feature before the first rule is written.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Slower to the first endpoint; faster to the hundredth if the rules are rich.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Mapping and indirection cost little; careless abstractions over EF Core cost a lot.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Infrastructure and frameworks are replaceable one adapter at a time.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "Use cases run against fakes with no database or host.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Aggregates enforce invariants in one place instead of across services.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Same single process; no change to logs or health checks.",
      },
      {
        attribute: "team-autonomy",
        effect: 0,
        note: "Clear places for things, but every feature still touches four projects.",
      },
    ],
    related: [
      "vertical-slices",
      "layered-monolith",
      "modular-monolith",
      "backend-testing-strategy",
    ],
    checks: [
      {
        id: "clean-architecture-q1",
        prompt:
          "Which project may reference EF Core in a clean architecture solution?",
        options: [
          "Domain, because entities need `[Key]` attributes",
          "Application, because handlers write LINQ queries",
          "Infrastructure, with Application seeing only an interface such as `IApplicationDbContext`",
          "Any project, as long as the DbContext is registered in DI",
        ],
        answer: 2,
        explanation:
          "The dependency rule keeps Domain and Application free of infrastructure packages. Infrastructure implements the port and Presentation wires it up. Handlers can still write LINQ through a `DbSet<T>` exposed on the interface, which is why Application does not need the EF Core package itself.",
      },
      {
        id: "clean-architecture-q2",
        prompt:
          "A two-person team is building an internal admin tool with forty CRUD screens. Which approach fits?",
        options: [
          "Full clean architecture with the Jason Taylor template and all pipeline behaviours",
          "A layered monolith or vertical slices with EF Core used directly",
          "Clean architecture with generic repositories to save time",
          "Microservices, so each screen can be deployed alone",
        ],
        answer: 1,
        explanation:
          "CRUD screens have no rich rules for the Domain project to protect, so the ceremony buys nothing. Generic repositories make clean architecture worse, and microservices add a network to a two-person team's problems.",
      },
      {
        id: "clean-architecture-q3",
        prompt:
          "What is the main practical benefit of ports such as `IPaymentGateway` in Application?",
        options: [
          "Being able to swap SQL Server for Cosmos DB without changing handlers",
          "Use cases that can be unit tested with fakes and reused by a function or a job",
          "Faster startup because adapters are loaded lazily",
          "Automatic retry and circuit breaking on every call",
        ],
        answer: 1,
        explanation:
          "Testability and reuse across hosts are the benefits that teams actually collect. Database swaps rarely happen, and resilience comes from Polly or Microsoft.Extensions.Http.Resilience in the adapter, not from the interface.",
      },
    ],
    sources: [
      {
        title:
          "Microsoft Learn: Common web application architectures (clean architecture section)",
        url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures",
      },
      {
        title: "Microsoft Learn: Design a DDD-oriented microservice",
        url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/",
      },
    ],
  },
  {
    id: "vertical-slices",
    trackId: "dotnet-styles",
    title: "Vertical slice architecture",
    tagline:
      "One folder per feature, one handler per request, shared code only when it earns it.",
    level: 2,
    minutes: 7,
    summary:
      "Vertical slice architecture organises the codebase by request instead of by layer: everything needed to serve `PlaceOrder` lives in one folder, from the endpoint to the SQL. It minimises shared abstractions, keeps changes local, and tests each slice end to end. It suits teams that ship many small features and want to find everything about one of them in one place.",
    sections: [
      {
        heading: "What it is",
        body: "Instead of `Controllers/`, `Services/` and `Repositories/`, the solution has `Features/Orders/PlaceOrder/`, `Features/Orders/GetOrder/`, `Features/Orders/CancelOrder/`. Each slice contains the request type, its validator, the handler that does the work, the response type and the endpoint registration. A slice talks to the database directly through the DbContext, maps its own response, and shares as little as possible with its neighbours.\n\nThe guiding idea, popularised by Jimmy Bogard: **coupling within a slice is fine, coupling between slices is what you minimise.** A read-heavy slice can be a Dapper query returning a flat DTO; the slice next to it can load a rich aggregate and call domain methods. Nobody forces both through the same repository or the same service interface.\n\nThe result is that adding a feature means adding a folder, and deleting one means deleting a folder. The codebase grows wide, not deep, and the blast radius of a change is one directory.",
      },
      {
        heading: "Shape in ASP.NET Core",
        body: 'A slice as a single file:\n\n```csharp\npublic static class PlaceOrder\n{\n    public record Command(int CustomerId, List<Line> Lines) : IRequest<int>;\n\n    public class Validator : AbstractValidator<Command> { /* rules */ }\n\n    public class Handler(AppDbContext db) : IRequestHandler<Command, int>\n    {\n        public async Task<int> Handle(Command cmd, CancellationToken ct)\n        {\n            var order = Order.Create(cmd.CustomerId, cmd.Lines);\n            db.Orders.Add(order);\n            await db.SaveChangesAsync(ct);\n            return order.Id;\n        }\n    }\n\n    public static void Map(IEndpointRouteBuilder app) =>\n        app.MapPost("/orders", (Command c, ISender s, CancellationToken ct) => s.Send(c, ct));\n}\n```\n\nThree ways to dispatch. **MediatR** gives you a pipeline for validation, logging and transactions; note its 2025 move to a commercial licence with a free tier. **Plain endpoint classes** with Minimal APIs and endpoint filters need no mediator at all: the handler is the lambda or a static method, and `IEndpointFilter` replaces pipeline behaviours. **FastEndpoints** packages the request, validator and handler into one `Endpoint<TRequest, TResponse>` class with built-in validation and OpenAPI. Pick one and keep it consistent across the solution.',
      },
      {
        heading: "How it differs from clean architecture",
        body: "Clean architecture slices the system horizontally and makes every feature cross four projects. Vertical slices cut the other way and let each feature choose its own depth. The two are often presented as rivals, and in practice they mix well.\n\nKeep the **dependency rule** for the domain: a `Domain` project with aggregates and value objects that slices call into. Drop the rest: no `IRepository<T>`, no `IApplicationDbContext`, no mapping layer. The slice uses EF Core directly and the domain model keeps the invariants. Jason Taylor's template already organises its Application project by feature folders, which is roughly this hybrid.\n\nWhere they genuinely differ is on shared abstractions. Clean architecture creates ports up front so adapters can be swapped. Vertical slices wait: when the third slice needs the same email-sending code, you extract a helper. The rule of three keeps the shared folder small and every abstraction justified by real usage.",
      },
      {
        heading: "Where it fails",
        body: "- **Rule drift.** The discount calculation is copied into `PlaceOrder`, `UpdateOrder` and `PreviewOrder`, and one of them is now wrong. Rules that matter belong in the domain model, called from slices, never inlined in three handlers.\n- **Slices reaching sideways.** `CancelOrder` queries the `Shipments` table directly. Within one business area that is fine; across areas it is the same boundary violation a modular monolith forbids. Combine slices with modules when the system has more than one area.\n- **No pipeline.** Without MediatR behaviours or endpoint filters, each handler re-implements validation, transaction scope and logging, and one of them forgets.\n- **Inconsistent conventions.** Freedom per slice turns into ten styles. A short template slice and a code review checklist fix this cheaply.\n- **Giant slices.** A `GenerateInvoice` handler of four hundred lines is a layered monolith inside one file.",
      },
      {
        heading: "Testing a slice",
        body: "The natural test for a slice is an **integration test through the front door**: start the app with `WebApplicationFactory`, back it with a real SQL Server in Testcontainers, send the HTTP request, assert on the response and on the database. One test file per slice, a handful of cases each. Respawn or a transaction rollback resets the database between tests.\n\nBecause the slice has no interfaces to fake, you write almost no mocks, and the tests survive refactoring inside the slice. The cost is speed: a few hundred milliseconds per test, which is fine for hundreds of slices and painful for thousands. Pull rich logic into the domain model and unit test that in isolation; keep the integration test for the wiring.\n\nA second benefit of this testing style is that the suite documents the API. New developers read `PlaceOrderTests` before they read `PlaceOrder`.",
      },
      {
        heading: "How to decide",
        body: "Choose vertical slices when the product is a stream of small, independent features, when most endpoints have a different shape from their neighbours, and when the team values finding everything in one folder over finding everything in one layer. It is a strong fit for the modules of a modular monolith and for teams that found clean architecture too heavy.\n\nChoose something else when the rules are concentrated and shared (then protect them in a domain model and keep slices thin), or when the team is large and needs stronger conventions than a folder structure gives. Either way, the slice is a unit of organisation, never a unit of deployment; it says nothing about monolith versus services.",
      },
    ],
    diagram: {
      caption:
        "Each request has its own folder from endpoint to SQL; the domain model is the only shared piece.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "TanStack Query",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "host",
          label: "ASP.NET Core host",
          sub: "Minimal APIs + filters",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "place",
          label: "PlaceOrder",
          sub: "command + handler",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "get",
          label: "GetOrder",
          sub: "query, flat DTO",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "cancel",
          label: "CancelOrder",
          sub: "command + handler",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "domain",
          label: "Domain model",
          sub: "Order aggregate",
          col: 3,
          row: 0,
          kind: "service",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "EF Core, direct",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "spa", to: "host", label: "HTTPS/JSON" },
        { from: "host", to: "place" },
        { from: "host", to: "get" },
        { from: "host", to: "cancel" },
        { from: "place", to: "domain", label: "Order.Create", style: "dashed" },
        {
          from: "cancel",
          to: "domain",
          label: "order.Cancel",
          style: "dashed",
        },
        { from: "place", to: "db" },
        { from: "get", to: "db", label: "projection" },
        { from: "cancel", to: "db" },
      ],
      groups: [
        { label: "Features/Orders", nodeIds: ["place", "get", "cancel"] },
      ],
    },
    useWhen: [
      "The backlog is many small features with different shapes rather than one big model",
      "Developers keep asking where a feature lives and the answer spans five projects",
      "You want integration tests per feature with few mocks",
      "You are organising the inside of a module in a modular monolith",
    ],
    avoidWhen: [
      "The same business rule appears in many requests and nobody owns a domain model for it",
      "A large team needs stricter conventions than folder discipline provides",
      "You already have clean architecture working well and the team is productive in it",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core Minimal APIs",
        role: "Each slice maps its own endpoint; `IEndpointFilter` supplies the pipeline.",
      },
      {
        name: "MediatR",
        role: "Optional dispatcher with pipeline behaviours for validation and transactions.",
      },
      {
        name: "FastEndpoints",
        role: "Request, validator and handler packaged as one endpoint class.",
      },
      {
        name: "EF Core DbContext",
        role: "Used directly inside handlers; reads project with `Select`, writes load aggregates.",
      },
      {
        name: "WebApplicationFactory + Testcontainers",
        role: "One integration test file per slice against a real SQL Server container.",
      },
      {
        name: "Dapper",
        role: "Fine for read slices that want flat SQL and no change tracking.",
      },
    ],
    reactStack: [
      {
        name: "Feature folders",
        role: "`features/orders/placeOrder` mirrors the backend slice and keeps ownership aligned.",
      },
      {
        name: "TanStack Query per slice",
        role: "One `useQuery` or `useMutation` hook per backend request, colocated with the component.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Few abstractions; each slice is readable top to bottom.",
      },
      {
        attribute: "time-to-market",
        effect: 2,
        note: "A feature is a folder; nothing to thread through four projects.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Changes stay local to a slice; cross-cutting changes touch many folders.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Integration tests through the front door with almost no mocks.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Rules can drift between slices unless a domain model owns them.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Developers rarely edit the same file at the same time.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Same process and deployment as any monolith.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Read slices use purpose-built queries instead of generic repositories.",
      },
    ],
    related: [
      "clean-architecture",
      "modular-monolith",
      "cqrs",
      "backend-testing-strategy",
    ],
    checks: [
      {
        id: "vertical-slices-q1",
        prompt:
          "The same discount rule has been copied into three slice handlers. What is the right fix?",
        options: [
          "Create a generic `IDiscountRepository` so all slices read the rule from the database",
          "Move the rule into the `Order` aggregate in the domain model and have each slice call it",
          "Merge the three slices into one `OrderService` class",
          "Accept the duplication; slices are supposed to be independent",
        ],
        answer: 1,
        explanation:
          "Slices minimise coupling to each other, not to the domain model. A rule shared by several requests belongs in the aggregate where it is tested once. Merging slices recreates a layered service, and a repository does not express a rule.",
      },
      {
        id: "vertical-slices-q2",
        prompt: "What is the most natural test for a vertical slice?",
        options: [
          "A unit test of the handler with the DbContext mocked",
          "An integration test that sends the HTTP request against a real SQL Server container",
          "A UI test driven through the React app",
          "A snapshot test of the generated OpenAPI document",
        ],
        answer: 1,
        explanation:
          "Slices have few interfaces to fake, so testing through the front door with WebApplicationFactory and Testcontainers covers wiring, validation and SQL in one go. Mocking the DbContext tests little and breaks on every refactor.",
      },
    ],
    sources: [
      {
        title: "Microsoft Learn: Common web application architectures",
        url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures",
      },
      {
        title: "ASP.NET Core: Minimal APIs overview",
        url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/overview",
      },
    ],
  },
  {
    id: "microservices",
    trackId: "dotnet-styles",
    title: "Microservices",
    tagline:
      "Independently deployable services that own their data. Powerful, and costly to run.",
    level: 3,
    minutes: 8,
    summary:
      "Microservices split a system into services that separate teams can build, deploy and scale on their own, each owning its data and aligned to a bounded context. The design benefits are real; so are the costs of a network between every call, eventual consistency, and a platform someone has to run. This lesson is about telling the justified cases from the resume-driven ones.",
    sections: [
      {
        heading: "What it actually is",
        body: 'The defining property is **independent deployability**: a team can ship a change to the Ordering service on Tuesday afternoon without asking Catalog, Billing or a release manager, and without a coordinated database migration. Everything else (small size, containers, REST or messaging, polyglot runtimes) is incidental.\n\nThree rules follow from that property:\n\n- One service per **bounded context**. Ordering owns the meaning of "order"; Billing holds only the slice of order data it needs, as a copy.\n- **Data per service.** No shared database, no cross-service joins, no foreign keys between services. Integration happens through APIs and events.\n- **Contracts are versioned.** A service never breaks an existing consumer; it adds fields and endpoints and retires old ones later.\n\nThe common failure, the **distributed monolith**, keeps the network and drops the rules: twelve services, one SQL database, synchronous chains five calls deep, and a release train where everything ships together. That gives you every cost in this lesson with none of the benefits.',
      },
      {
        heading: "Why teams choose it",
        body: '- **Team autonomy at scale.** Past roughly three teams working on one codebase, the coordination cost of one release train exceeds the cost of running separate services. Conway\'s law works in your favour when service boundaries match team boundaries.\n- **Independent scaling.** The image-rendering service needs 40 instances and GPU nodes; the admin API needs one. In a monolith both scale together.\n- **Fault isolation.** A memory leak in Reporting restarts Reporting, not Checkout.\n- **Runtime freedom.** A Python service for the ML model next to the .NET services, without a cross-language monolith.\n- **Regulatory boundaries.** Payment card data in one hardened service with its own database, audited separately from the rest.\n\nNotice that none of these are "the code is big" or "it will be more modern". Size is handled by a modular monolith. Modernity is handled by upgrading .NET.',
      },
      {
        heading: "What it costs",
        body: "Every in-process call becomes a network call that can time out, fail halfway, or succeed after the caller gave up. Each service needs timeouts, retries with jitter, circuit breakers and idempotent endpoints (`Microsoft.Extensions.Http.Resilience` or Polly), and each call chain adds latency.\n\n**No distributed transactions.** Placing an order and reserving stock are two services, so you need the outbox pattern, at-least-once delivery, idempotent consumers and a saga for compensation. The product owner must accept that a report may lag the order by seconds.\n\n**Observability becomes mandatory.** Without OpenTelemetry traces correlated across services, Application Insights or a Grafana stack, and structured logs with a correlation id, a bug report is unanswerable.\n\n**A platform team appears.** Someone owns pipelines per service, container registries, ingress and certificates, secrets in Key Vault, service discovery, environment promotion and cost allocation. On AKS that is a full-time job; on Azure Container Apps it is smaller and still not zero.\n\n**Data duplication and versioning.** Billing's copy of customer data drifts; every contract change is a migration with consumers you do not control.",
      },
      {
        heading: "Shape on Azure",
        body: 'For most .NET teams, **Azure Container Apps** is the right host: managed Kubernetes underneath, KEDA-based scale to zero, revisions for blue-green, built-in ingress with TLS, and Dapr available with a switch. **AKS** is for teams that need cluster-level control (custom networking, GPU node pools, service mesh, operators) and have the people to run it. **Azure Functions** fits services that are purely event-driven.\n\nAround the services: **Azure Service Bus** for commands and integration events (topics with subscriptions per consumer), **Azure API Management** or a YARP gateway in front, **Entra ID** for service-to-service tokens via managed identities, **Azure SQL** or **Cosmos DB** per service, and **Azure Container Registry** for images. Locally, **.NET Aspire** runs the whole set with service discovery and a dashboard, which removes most of the "it works on my machine" cost.\n\nMicrosoft\'s eShop reference application is the canonical .NET example: a handful of services, Service Bus or RabbitMQ events, an outbox, and Aspire for orchestration. Read it for the plumbing, and notice how much of the code is plumbing.',
      },
      {
        heading: "Dapr sidecars",
        body: 'Dapr runs as a sidecar next to each service and exposes **building blocks** over HTTP or gRPC: service invocation with mTLS and retries, pub/sub over Service Bus or Event Hubs, state stores over Cosmos DB or Redis, secret stores over Key Vault, bindings, actors and workflows. Your .NET code calls `DaprClient.PublishEventAsync("pubsub", "orders", evt)` and the sidecar talks to whichever broker is configured.\n\nOn Azure Container Apps Dapr is managed, so the sidecar is a setting rather than a deployment. The gain is less infrastructure code per service and portable component configuration. The cost is another process in every pod, another layer in every trace, and a configuration model the team has to learn. Adopt it when you have more than a few services and you are tired of writing the same Service Bus and retry code in each; skip it for two services that share one library.',
      },
      {
        heading: "Justified or resume-driven",
        body: 'A quick audit. You are justified if at least two of these are true: three or more teams need their own release cadence; parts of the system need very different scaling or runtimes; a regulator demands a hard boundary; you already have a platform team or a budget for one.\n\nYou are probably resume-driven if: one team of six owns twelve services; services share a database or call each other synchronously to serve one request; every release deploys everything; nobody can draw the trace for a single order; or the reason given is "it scales" for a system doing fifty requests per second.\n\nThe cheap alternative is a modular monolith with contracts projects and an outbox already in place. It keeps the extraction seam ready, so the day a module truly needs its own deployment, moving it is a week of work instead of a rewrite. Start there unless the audit says otherwise.',
      },
    ],
    diagram: {
      caption:
        "Services own their data and talk through a gateway and a broker; nothing shares a database.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "per-client BFF optional",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "gw",
          label: "API gateway",
          sub: "Azure API Management",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "ordering",
          label: "Ordering",
          sub: "Container App",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "catalog",
          label: "Catalog",
          sub: "Container App + Cosmos",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "billing",
          label: "Billing",
          sub: "Container App",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "orderdb",
          label: "Ordering SQL",
          sub: "own Azure SQL",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "bus",
          label: "Azure Service Bus",
          sub: "topics + subscriptions",
          col: 3,
          row: 1,
          kind: "queue",
        },
        {
          id: "billdb",
          label: "Billing SQL",
          sub: "own Azure SQL",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "spa", to: "gw", label: "HTTPS" },
        { from: "gw", to: "ordering" },
        { from: "gw", to: "catalog" },
        {
          from: "ordering",
          to: "catalog",
          label: "HTTP + resilience",
          style: "dashed",
        },
        { from: "ordering", to: "orderdb" },
        { from: "ordering", to: "bus", label: "OrderPlaced (outbox)" },
        { from: "bus", to: "billing", label: "subscription" },
        { from: "billing", to: "billdb" },
      ],
      groups: [
        {
          label: "Independently deployed",
          nodeIds: ["ordering", "catalog", "billing"],
        },
      ],
    },
    useWhen: [
      "Three or more teams need to release on their own cadence and the shared train is the bottleneck",
      "One part of the system needs a different runtime, hardware or scaling profile from the rest",
      "A regulator or customer contract requires a hard process and data boundary",
      "You have, or are funding, a platform team and an observability stack",
    ],
    avoidWhen: [
      "One team owns the whole system and deploys everything together anyway",
      "Services would still share a database or need five synchronous hops per request",
      "Nobody has run distributed tracing or an outbox before and the deadline is near",
      "The main argument is scale and current load is a few hundred requests per second",
    ],
    microsoftStack: [
      {
        name: "Azure Container Apps",
        role: "Default host: managed Kubernetes, KEDA scaling, revisions, optional Dapr.",
      },
      {
        name: "Azure Kubernetes Service",
        role: "For teams that need cluster control and have the people to run it.",
      },
      {
        name: "Azure Service Bus",
        role: "Integration events and commands between services, with dead-letter queues.",
      },
      {
        name: "Azure API Management",
        role: "Single entry point: routing, auth offload, rate limits, versioning.",
      },
      {
        name: "OpenTelemetry + Application Insights",
        role: "Distributed traces and correlated logs across every service.",
      },
      {
        name: ".NET Aspire",
        role: "Runs the whole set locally with service discovery and a dashboard.",
      },
    ],
    reactStack: [
      {
        name: "Backend-for-Frontend",
        role: "One BFF per client type hides service topology from the React app.",
      },
      {
        name: "Generated clients per service",
        role: "Separate OpenAPI documents keep TypeScript clients independent.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -2,
        note: "A network, a broker and a platform where a method call used to be.",
      },
      {
        attribute: "time-to-market",
        effect: -2,
        note: "Months of plumbing before the first feature; faster later for large organisations.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Each service scales on its own metric and hardware.",
      },
      {
        attribute: "consistency",
        effect: -2,
        note: "No cross-service transactions; eventual consistency is the norm.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Fault isolation per service, provided calls have timeouts and fallbacks.",
      },
      {
        attribute: "deployability",
        effect: 2,
        note: "Small, independent, frequent releases per team.",
      },
      {
        attribute: "team-autonomy",
        effect: 2,
        note: "Teams own code, data, pipeline and on-call for their service.",
      },
      {
        attribute: "operability",
        effect: -2,
        note: "Tracing, dashboards, secrets and pipelines multiply by service count.",
      },
      {
        attribute: "cost",
        effect: -2,
        note: "Per-service compute, databases and the people to run the platform.",
      },
    ],
    related: [
      "modular-monolith",
      "messaging-outbox-saga",
      "aspire-dapr",
      "observability",
    ],
    checks: [
      {
        id: "microservices-q1",
        prompt:
          "Which of these systems is a distributed monolith rather than microservices?",
        options: [
          "Four services, each with its own database, exchanging events through Service Bus",
          "Twelve services sharing one SQL database and released together every second Thursday",
          "Two services where one calls the other over HTTP with a circuit breaker",
          "A single Container App with three modules and an outbox",
        ],
        answer: 1,
        explanation:
          "A shared database and a joint release remove independent deployability, which is the defining property. The event-driven system and the two-service system keep it. The single Container App is a modular monolith, which is a legitimate shape in its own right.",
      },
      {
        id: "microservices-q2",
        prompt:
          'A team of five building a B2B portal at 20 requests per second wants microservices "for scale". What do you recommend?',
        options: [
          "Microservices on AKS with a service mesh, since scale is the goal",
          "A modular monolith with contracts projects and an outbox, extracting a service only when a real driver appears",
          "Azure Functions for every endpoint so each one scales independently",
          "Microservices on Container Apps, because Dapr removes the complexity",
        ],
        answer: 1,
        explanation:
          "At that load and team size there is no scaling or autonomy driver, so the costs of distribution buy nothing. A modular monolith keeps the seam ready for later. Dapr and Functions reduce some plumbing; they do not remove eventual consistency or the operational surface.",
      },
      {
        id: "microservices-q3",
        prompt:
          "Billing needs the customer's email address to send an invoice. In a microservice design, where does it come from?",
        options: [
          "A SQL join against the Customers table in the shared database",
          "A synchronous call to the Customer service every time an invoice is sent",
          "A local copy in Billing's database, kept up to date by `CustomerUpdated` events",
          "The React client, which sends it along with the invoice request",
        ],
        answer: 2,
        explanation:
          "Data per service means Billing owns the copy it needs and updates it from events, so invoicing works even when Customer is down. A shared database breaks the boundary; a synchronous call couples availability; trusting the client is a security hole.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Microservices architecture style",
        url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/microservices",
      },
      {
        title: "Microsoft Learn: .NET microservices architecture guide",
        url: "https://learn.microsoft.com/dotnet/architecture/microservices/",
      },
      {
        title: "Azure Container Apps documentation",
        url: "https://learn.microsoft.com/azure/container-apps/",
      },
    ],
  },
  {
    id: "strangler-fig",
    trackId: "dotnet-styles",
    title: "Strangler fig migration",
    tagline:
      "Replace a legacy .NET system one route at a time behind a facade, and know when to stop.",
    level: 3,
    minutes: 9,
    summary:
      "The strangler fig pattern migrates a legacy system incrementally: a facade routes each request either to the old application or to the new one, features move across one at a time, and the old system shrinks until it can be switched off. For .NET Framework, WebForms and ageing monoliths it is the only migration style with a good track record. The hard parts are data and knowing when to stop.",
    sections: [
      {
        heading: "What it is",
        body: 'A rewrite replaces the whole system on one day and usually fails, because the old system keeps changing while the new one is built and nobody can list what it does. A strangler fig replaces it **route by route**. You put a facade in front of the legacy application, build the first feature in a new ASP.NET Core application, point the facade at it for that route, and repeat. At every point in time there is one live system, made of two codebases, and the proportion shifts.\n\nThe pattern needs three things: a **facade** that can route by path, host or header; an **anti-corruption layer** so the new code is never shaped by the old model; and a plan for **data**, because the two applications will share or synchronise state for the whole migration.\n\nIt also needs a definition of done that is not "everything is migrated". Some of the old system may be worth leaving alone.',
      },
      {
        heading: "The facade on Azure",
        body: "**YARP** is the usual choice for .NET teams: a reverse proxy library you host inside an ASP.NET Core app, configured with routes and clusters in `appsettings.json` or code. It can live in its own tiny app or inside the new application, forwarding unmatched routes to the legacy site. It supports path and header matching, request transforms, session affinity and health checks.\n\n**Azure Front Door** or **Azure Application Gateway** do the same routing at the edge with WAF, TLS and global entry, and are the right choice when the facade must also serve as the public ingress. **Azure API Management** fits when the legacy surface is an API consumed by partners and you want versioning, policies and a developer portal while you migrate.\n\nFor ASP.NET Framework applications specifically, Microsoft's **incremental migration** tooling pairs YARP with the `Microsoft.AspNetCore.SystemWebAdapters` package, which lets the new ASP.NET Core app share session state and authentication with the old one, so a user can move between migrated and unmigrated pages without logging in twice. That shared session is what makes page-by-page migration of WebForms or MVC 5 practical.",
      },
      {
        heading: "The anti-corruption layer",
        body: "The legacy system has a `tblCust` with 140 columns, status codes stored as magic integers, and business rules in stored procedures. The temptation is to scaffold EF Core over it and build the new feature on top. Do that and the new system inherits every quirk, and you will never be able to change the schema.\n\nAn **anti-corruption layer** (ACL) sits between the new domain and the old data. It is a set of adapters: an `ILegacyCustomerReader` that queries the old tables (or calls the old app's endpoints) and returns a clean `Customer` in the new model; a writer that translates the other way for the period when the legacy app still owns the data. Translation code is boring and that is the point: it isolates the ugliness in one project you will delete at the end.\n\nKeep the ACL thin and keep it on the new side of the fence. Legacy code should not learn about the new model at all; if the legacy app must call the new one, do it through a plain HTTP endpoint it treats as an external service.",
      },
      {
        heading: "Data: the hard part",
        body: "Routing requests is a week of work; the data is the migration. The practical sequence for one feature:\n\n- **Read from legacy, write to legacy.** The new page renders from the old tables through the ACL. Zero data risk; proves the routing and the UI.\n- **Read from new, write to both, legacy owns.** The new schema exists and is kept in sync from legacy, either by SQL Server Change Data Capture or change tracking into a sync job, or by events the legacy app emits. Dual writes from the new app are a trap unless one side is clearly the owner.\n- **New owns, legacy reads a copy.** Flip ownership for this feature's tables. Old pages that still need the data get it through a view, a synchronised copy, or an endpoint on the new app.\n- **Drop the legacy tables** once no page reads them.\n\nMove ownership feature by feature, never table by table across all features at once. Keep a reconciliation report running during each transition. Azure SQL for both databases, or one database with two schemas, keeps the sync tooling simple.",
      },
      {
        heading: "Carving out features",
        body: "Pick the first feature by **risk and value**, not by size. A read-only report, a brand-new capability that the legacy app never had, or a self-contained page with its own tables are ideal: they prove the pipeline without touching the core. Save checkout, the core domain or anything with a long chain of dependencies for when the team has the rhythm.\n\nEach carve-out follows the same checklist: add the route, build the slice in the new app with its own tests, wire the ACL, run both old and new in shadow mode and compare outputs, flip the facade, watch the dashboards for a week, delete the legacy page. Deleting is the step teams skip, and skipping it is how you end up maintaining two systems.\n\nFor WebForms there is no in-place upgrade path to ASP.NET Core, so this page-by-page carve-out is the migration. For MVC 5 and Web API 2 the adapters cover more ground and whole controllers can move at a time.",
      },
      {
        heading: "When to stop",
        body: "A strangler fig that runs for four years with both systems alive is a failure dressed as a strategy. Set a budget and a date, and review every quarter whether the remaining legacy is worth replacing.\n\nIt is usually worth stopping when what is left is stable, changes rarely, and can run on a supported platform (ASP.NET Framework 4.8 on Windows is still supported; it costs a Windows App Service plan and a sad developer, not a rewrite). It is worth continuing when the remaining parts are the ones you need to change most, or when the legacy platform itself is out of support.\n\nThe facade can stay as the permanent ingress; the ACL and the sync jobs must be deleted or they become the next legacy. Write the decommission tasks into the backlog on day one so they are visible when the enthusiasm fades.",
      },
    ],
    diagram: {
      caption:
        "A facade routes migrated paths to the new app and the rest to the legacy app while data is synchronised.",
      nodes: [
        {
          id: "users",
          label: "Users",
          sub: "browser",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "facade",
          label: "Facade",
          sub: "YARP or Front Door",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "legacy",
          label: "Legacy WebForms",
          sub: "ASP.NET 4.8 on IIS",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "modern",
          label: "New ASP.NET Core",
          sub: "migrated features",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "acl",
          label: "Anti-corruption layer",
          sub: "translates old model",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "olddb",
          label: "Legacy SQL Server",
          sub: "old schema",
          col: 4,
          row: 0,
          kind: "data",
        },
        {
          id: "newdb",
          label: "Azure SQL",
          sub: "new schema",
          col: 4,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "users", to: "facade", label: "HTTPS" },
        { from: "facade", to: "legacy", label: "/orders/* (not yet)" },
        { from: "facade", to: "modern", label: "/catalog/* (migrated)" },
        { from: "legacy", to: "olddb" },
        { from: "modern", to: "newdb" },
        { from: "modern", to: "acl", style: "dashed" },
        {
          from: "acl",
          to: "olddb",
          label: "reads legacy data",
          style: "dashed",
        },
        {
          from: "olddb",
          to: "newdb",
          label: "CDC / sync job",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "Shared session via SystemWebAdapters",
          nodeIds: ["legacy", "modern"],
        },
      ],
    },
    useWhen: [
      "A .NET Framework, WebForms or MVC 5 application must move to ASP.NET Core and cannot stop changing",
      "The legacy system is too large or too poorly understood to rewrite in one release",
      "You can put a reverse proxy or edge router in front of all traffic",
      "The business accepts a multi-quarter programme with visible, incremental wins",
    ],
    avoidWhen: [
      "The legacy system is small enough to rewrite and freeze for a month",
      "Traffic cannot be routed per path or host, for example a thick client talking straight to the database",
      "No one is prepared to delete legacy code, so both systems would live forever",
    ],
    microsoftStack: [
      {
        name: "YARP",
        role: "Reverse proxy in ASP.NET Core that routes migrated paths to the new app.",
      },
      {
        name: "Microsoft.AspNetCore.SystemWebAdapters",
        role: "Shares session and authentication between ASP.NET Framework and ASP.NET Core during migration.",
      },
      {
        name: "Azure Front Door or Application Gateway",
        role: "Edge routing with WAF when the facade is also the public ingress.",
      },
      {
        name: "Azure API Management",
        role: "Facade for partner-facing APIs with versioning and policies.",
      },
      {
        name: "SQL Server Change Data Capture",
        role: "Feeds a sync job that keeps the new schema current while legacy owns the data.",
      },
      {
        name: "Azure App Service (Windows)",
        role: "Hosts the remaining ASP.NET Framework application until it is retired.",
      },
    ],
    reactStack: [
      {
        name: "Island by island",
        role: "New React screens ship inside migrated routes; the legacy UI keeps its pages until each is replaced.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Two codebases, a facade and sync jobs for the duration of the migration.",
      },
      {
        attribute: "time-to-market",
        effect: 2,
        note: "Value ships from the first migrated feature instead of after a rewrite.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Each cutover is small and reversible by changing a route.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Synchronised data lags and needs reconciliation while ownership moves.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "The new system is built on a modern platform one feature at a time.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "The new app has its own pipeline from day one.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Two sets of logs and dashboards until the legacy app is gone.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Running both systems plus the migration work, for a bounded period.",
      },
    ],
    related: [
      "modular-monolith",
      "microservices",
      "aspnet-react-hosting",
      "c4-and-adrs",
    ],
    checks: [
      {
        id: "strangler-fig-q1",
        prompt:
          "Which feature should move first in a WebForms to ASP.NET Core migration?",
        options: [
          "Checkout, because it is the most valuable",
          "A read-only report with its own tables, to prove routing and the pipeline",
          "The login page, so authentication is modern from the start",
          "All master data screens at once, so the schema can be cleaned up",
        ],
        answer: 1,
        explanation:
          "The first carve-out should be low risk and self-contained so the team learns the mechanics. Checkout and login sit on long dependency chains, and shared session through the adapters means login can wait. A mass schema move is the rewrite you are trying to avoid.",
      },
      {
        id: "strangler-fig-q2",
        prompt:
          "The new app needs customer data that still lives in the legacy `tblCust` table. What is the right approach?",
        options: [
          "Scaffold EF Core over `tblCust` and use that entity throughout the new domain",
          "Read it through an anti-corruption layer that returns a clean `Customer` in the new model",
          "Copy the table once into the new database and stop syncing",
          "Have the legacy app push rows into the new domain model directly",
        ],
        answer: 1,
        explanation:
          "The ACL isolates the legacy shape so the new domain is not built around it. Scaffolding the old table spreads its quirks everywhere; a one-off copy goes stale while legacy still writes; and legacy code should never know the new model.",
      },
      {
        id: "strangler-fig-q3",
        prompt:
          "After two years, 15 percent of the system is still in ASP.NET Framework 4.8, changes twice a year, and runs fine on a Windows App Service. What now?",
        options: [
          "Keep migrating until the last page is gone, whatever it costs",
          "Stop, keep the facade, delete the sync jobs and ACL, and record the decision in an ADR",
          "Rewrite the remaining 15 percent in one release since it is small",
          "Leave the sync jobs running in case the business changes its mind",
        ],
        answer: 1,
        explanation:
          "Stable, rarely changed code on a supported platform is a poor return on migration effort. The facade can stay as ingress, but the temporary machinery must go or it becomes the next legacy. A big-bang rewrite of the leftover is the same bet the pattern exists to avoid.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Strangler Fig pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/strangler-fig",
      },
      {
        title: "Azure Architecture Center: Anti-corruption Layer pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/anti-corruption-layer",
      },
      {
        title: "ASP.NET Core: Incremental ASP.NET to ASP.NET Core migration",
        url: "https://learn.microsoft.com/aspnet/core/migration/inc/overview",
      },
    ],
  },
];
