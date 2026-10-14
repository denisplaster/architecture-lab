import type { Lesson } from "../types";

/**
 * Track: .NET distributed patterns. CQRS, events, messaging, serverless and
 * the glue that keeps distributed systems honest.
 */
export const DOTNET_DISTRIBUTED_LESSONS: Lesson[] = [
  {
    id: "cqrs",
    trackId: "dotnet-distributed",
    title: "CQRS",
    tagline:
      "Separate the model that changes things from the model that answers questions.",
    level: 2,
    minutes: 7,
    summary:
      "Command Query Responsibility Segregation splits an application into a write side that enforces rules and a read side that serves screens. It ranges from a naming convention in one codebase to separate stores fed by events. Most .NET teams should use the cheap end; the expensive end is for systems whose reads and writes differ so much in shape or scale that one model serves neither.",
    sections: [
      {
        heading: "What it is",
        body: 'A **command** changes state and returns little or nothing: `PlaceOrder`, `ChangeAddress`. A **query** returns data and changes nothing: `GetOrderSummary`, `SearchCustomers`. CQRS says these two kinds of request deserve different code paths, and often different models, because what makes a good write model (aggregates, invariants, small transactions) makes a poor read model (flat rows shaped like the screen, joins across aggregates, no tracking).\n\nIn a layered app, both go through `OrderService` and share the `Order` entity, which slowly grows screen-specific properties and `Include` chains. CQRS stops that by giving each query its own handler and its own result type.\n\nThe term causes trouble because it covers three very different amounts of architecture. Be explicit about which one you mean before anyone says "we are doing CQRS".',
      },
      {
        heading: "Three levels of commitment",
        body: "**Level 1, code organisation.** Commands and queries are separate classes with separate handlers in one process over one database. Queries use `AsNoTracking()` and `Select` into DTOs, or Dapper. Writes load aggregates through EF Core. There is no consistency problem because there is one database. This is the level most applications should stop at.\n\n**Level 2, separate read model in the same database.** Reads come from SQL views, indexed views or denormalised tables that the write transaction also updates. Still strongly consistent, still one backup. Good for reporting screens that would otherwise need ten joins.\n\n**Level 3, separate read store.** Events from the write side feed **projections** into Cosmos DB, Redis, Azure AI Search or a replica. Reads scale and shape independently; the price is **eventual consistency**, a projection pipeline to operate, and a way to rebuild read models when they drift. This is data architecture, and it should be chosen like any other distributed-system decision.",
      },
      {
        heading: "Shape in .NET",
        body: "```csharp\npublic record PlaceOrder(int CustomerId, IReadOnlyList<Line> Lines) : IRequest<int>;\npublic record GetOrderSummary(int OrderId) : IRequest<OrderSummaryDto?>;\n\npublic sealed class GetOrderSummaryHandler(AppDbContext db)\n    : IRequestHandler<GetOrderSummary, OrderSummaryDto?>\n{\n    public Task<OrderSummaryDto?> Handle(GetOrderSummary q, CancellationToken ct) =>\n        db.Orders.AsNoTracking()\n            .Where(o => o.Id == q.OrderId)\n            .Select(o => new OrderSummaryDto(o.Id, o.Customer.Name, o.Total))\n            .SingleOrDefaultAsync(ct);\n}\n```\n\nMediatR gives you the dispatch and a pipeline; plain handler classes resolved from DI or Minimal API endpoints work just as well and avoid the licence question. Keep the write side on EF Core with change tracking and aggregates. Let the read side pick the fastest tool per query: EF Core projections for most, Dapper for hand-tuned SQL, a Cosmos DB container for a projection. A single `IQuery<T>` marker interface and a convention that query handlers never call `SaveChanges` are enough structure.",
      },
      {
        heading: "Projections and eventual consistency",
        body: 'At level 3 the write side records a domain event (`OrderPlaced`) in an outbox table inside the same transaction, a publisher pushes it to Azure Service Bus, and a projection handler updates the read store. Between the commit and the projection, a query may return stale data. The lag is usually milliseconds and occasionally minutes when the broker is backed up.\n\nDesign for it rather than hiding it:\n\n- Return the new state from the command response so the client can render it without a query.\n- For "read your own writes", serve the acting user\'s next query from the write model, or carry a version the read side must have caught up to.\n- Make every projection handler **idempotent**: at-least-once delivery will replay events, so update by key and ignore versions you have already applied.\n- Keep a rebuild path: delete the read store and replay events, or rebuild from the write database with a batch job. You will need it after the first projection bug.\n\nOn the React side, TanStack Query handles most of this with `invalidateQueries` after a mutation and optimistic updates where latency matters.',
      },
      {
        heading: "Organisation or architecture?",
        body: "Decide by asking what problem you have. If handlers are bloated and the `Order` entity has forty properties for twelve screens, that is a code problem; level 1 fixes it in an afternoon. If a dashboard query takes four seconds because of joins, that is a query problem; a view or denormalised table (level 2) fixes it inside one transaction. Only when reads and writes need **different stores, scaling or shapes** (ten thousand catalogue reads per order written, geo-distributed reads, full-text search) does level 3 pay.\n\nThe common mistake is to adopt level 3 because a conference talk showed it, then spend a year on projection rebuilds for an application with two hundred users. The second mistake is to confuse CQRS with event sourcing. They pair well, and each is useful alone: level 3 CQRS can project from a plain SQL write model with an outbox, and event sourcing can serve queries straight from a replayed aggregate.",
      },
    ],
    diagram: {
      caption:
        "Level 3 CQRS: commands write to SQL, events project into a read store, queries never touch the write model.",
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
          id: "api",
          label: "ASP.NET Core API",
          sub: "Minimal APIs + handlers",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "cmd",
          label: "Command handlers",
          sub: "EF Core aggregates",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "qry",
          label: "Query handlers",
          sub: "Dapper or Select",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "wdb",
          label: "Azure SQL",
          sub: "write model + outbox",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "bus",
          label: "Azure Service Bus",
          sub: "OrderPlaced events",
          col: 4,
          row: 1,
          kind: "queue",
        },
        {
          id: "proj",
          label: "Projector",
          sub: "idempotent handler",
          col: 4,
          row: 2,
          kind: "service",
        },
        {
          id: "rdb",
          label: "Read store",
          sub: "Cosmos DB or Redis",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "spa", to: "api", label: "HTTPS/JSON" },
        { from: "api", to: "cmd", label: "commands" },
        { from: "api", to: "qry", label: "queries" },
        { from: "cmd", to: "wdb", label: "one transaction" },
        { from: "wdb", to: "bus", label: "outbox publisher", style: "dashed" },
        { from: "bus", to: "proj" },
        { from: "proj", to: "rdb", label: "upsert by key" },
        { from: "qry", to: "rdb" },
      ],
      groups: [
        { label: "Eventually consistent", nodeIds: ["bus", "proj", "rdb"] },
      ],
    },
    useWhen: [
      "Entities keep growing screen-specific properties and `Include` chains to serve reads",
      "Reads outnumber writes by orders of magnitude or need a different store such as search",
      "Reporting screens need joins that make the write model slow or fragile",
      "You already publish domain events and want cheap, purpose-built read models",
    ],
    avoidWhen: [
      "A CRUD application where reads and writes have the same shape and the same load",
      "The team cannot yet operate an outbox, a broker and a projection rebuild",
      "Users must always see their own write immediately and nobody will design for lag",
    ],
    microsoftStack: [
      {
        name: "MediatR or plain handlers",
        role: "Dispatch commands and queries to separate handler classes with a pipeline.",
      },
      {
        name: "EF Core",
        role: "Write side with aggregates and tracking; read side with `AsNoTracking` projections.",
      },
      {
        name: "Dapper",
        role: "Hand-tuned SQL for read handlers that need it.",
      },
      {
        name: "Azure Service Bus",
        role: "Carries domain events from the outbox to projection handlers.",
      },
      {
        name: "Azure Cosmos DB",
        role: "Read store for document-shaped, globally distributed projections.",
      },
      {
        name: "Azure Cache for Redis",
        role: "Read store for hot, small, key-addressed projections.",
      },
    ],
    reactStack: [
      {
        name: "TanStack Query mutations",
        role: "`invalidateQueries` after a command, optimistic updates where lag is visible.",
      },
      {
        name: "Command responses as data",
        role: "Render the state returned by the command instead of querying a projection that may lag.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Two models and, at level 3, a projection pipeline to operate.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "Level 1 costs nothing; level 3 costs weeks of plumbing.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Read stores scale and distribute independently of the write database.",
      },
      {
        attribute: "performance",
        effect: 2,
        note: "Reads are served from purpose-shaped rows with no joins.",
      },
      {
        attribute: "consistency",
        effect: -2,
        note: "Projections lag; clients must tolerate stale reads.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "A new screen is a new projection, with no change to the write model.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Command handlers test rules; query handlers test SQL; each is small.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Projection lag, rebuilds and dead-letter queues need monitoring.",
      },
    ],
    related: [
      "event-sourcing",
      "messaging-outbox-saga",
      "vertical-slices",
      "sql-vs-cosmos",
    ],
    checks: [
      {
        id: "cqrs-q1",
        prompt:
          "An internal inventory tool with 200 users has bloated `ProductService` methods. Which level of CQRS fits?",
        options: [
          "Level 3 with a Cosmos DB read store fed by Service Bus events",
          "Level 1: separate command and query handlers over the same SQL database",
          "Event sourcing, since CQRS requires an event store",
          "A Redis cache in front of every query",
        ],
        answer: 1,
        explanation:
          "The problem is code shape, not load, so separate handlers with projected DTOs fix it with no consistency cost. Separate stores add a pipeline nobody needs at 200 users, and CQRS does not require event sourcing at all.",
      },
      {
        id: "cqrs-q2",
        prompt:
          "After placing an order, the user is redirected to a list that does not yet show it. What is the right fix?",
        options: [
          "Add a 500 ms delay before the redirect",
          "Return the new order from the command and render it, or serve the user's next read from the write model",
          "Make the projection handler synchronous inside the command transaction",
          "Poll the read store until the order appears",
        ],
        answer: 1,
        explanation:
          "Design for the lag: the command response already has the data, and read-your-own-writes can be served from the write model. Sleeps and polling are fragile, and making the projection synchronous turns level 3 back into level 2 while keeping the broker.",
      },
      {
        id: "cqrs-q3",
        prompt:
          "A projection handler receives the same `OrderPlaced` event twice. What should happen?",
        options: [
          "The read store ends up with two rows and a nightly job removes duplicates",
          "The handler upserts by order id and version, so the second delivery changes nothing",
          "The broker should guarantee exactly-once delivery, so this cannot happen",
          "The handler throws so the message goes to the dead-letter queue",
        ],
        answer: 1,
        explanation:
          "At-least-once delivery means duplicates are normal, so idempotent upserts are the design. Brokers do not give exactly-once end to end, and dead-lettering a legitimate retry loses data.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: CQRS pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/cqrs",
      },
      {
        title: "Microsoft Learn: CQRS and DDD patterns in a microservice",
        url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/",
      },
    ],
  },
  {
    id: "event-sourcing",
    trackId: "dotnet-distributed",
    title: "Event sourcing",
    tagline:
      "Store what happened and derive what is. Superb for audit and history, costly elsewhere.",
    level: 3,
    minutes: 8,
    summary:
      "Event sourcing stores every change to an aggregate as an immutable event in an append-only stream and rebuilds current state by replaying the stream. It gives you a perfect audit trail, time travel and natural event publication. It also changes how you model, query, version and delete data. Use it for the aggregates that need history, with Marten, KurrentDB or a change-feed design, and keep plain tables for everything else.",
    sections: [
      {
        heading: "What it is",
        body: 'A CRUD system stores the **current state** of an order and overwrites it on every change. An event-sourced system stores the **facts**: `OrderPlaced`, `LineAdded`, `DiscountApplied`, `OrderShipped`, each appended to the order\'s stream with a version number. To load the order you read the stream and apply each event in order; the result is the current state. To change the order you load it, run the command against the rules, and append the new events it produces.\n\nThe stream is the source of truth. Everything else, including the "orders" table your screens read, is a **projection** derived from events and rebuildable at any time. **Snapshots** cache the folded state every few hundred events so loading a long-lived aggregate does not replay years of history.\n\nIt pairs naturally with CQRS at level 3, since projections are the read models, and with messaging, since the events you store are the events you publish.',
      },
      {
        heading: "The real drivers",
        body: 'Teams that are glad they chose event sourcing almost always name one of three reasons.\n\n- **Audit as a first-class requirement.** Finance, insurance, healthcare, anything where "who changed this, when, and from what" is a legal question. An audit table bolted onto CRUD is incomplete the first time someone updates a row with SQL.\n- **Temporal queries.** "What did this policy look like on 3 March?" and "how many carts were abandoned in the hour before the outage?" are a replay to a point in time, with no schema designed in advance.\n- **Debuggability.** A production bug can be reproduced by replaying the exact events into a test, and a wrong projection can be corrected by fixing the code and rebuilding, with no data loss.\n\nScalability and "it works well with microservices" are weak reasons. An outbox gives you reliable events without the modelling change, and SQL Server temporal tables give you row history for most "we need audit" requests at a fraction of the cost.',
      },
      {
        heading: "Stores on the Microsoft stack",
        body: "**Marten** on PostgreSQL (Azure Database for PostgreSQL flexible server) is the most productive option for .NET: a document database and event store in one library, aggregates folded with plain `Apply` methods, inline projections updated in the same transaction and async projections run by a daemon, and snapshots and stream archiving built in. Its sibling Wolverine adds messaging and handlers.\n\n**KurrentDB**, formerly EventStoreDB, is a purpose-built event store with a gRPC .NET client, persistent subscriptions and category streams. It is the strongest choice when the event store is shared by several services or languages, and it is a separate piece of infrastructure to run or to buy as a managed service.\n\n**Azure Cosmos DB** can act as an event log: one container partitioned by stream id, events as documents, optimistic concurrency through a version document or the item ETag, and the **change feed** driving projections. It is a reasonable design when you are already on Cosmos DB and global distribution matters; expect to write the aggregate loading and concurrency code that Marten gives you for free.\n\n**Azure SQL** with an `Events` table and a unique index on `(StreamId, Version)` is enough for modest loads and keeps everything in one familiar database.",
      },
      {
        heading: "Shape in .NET",
        body: '```csharp\npublic sealed class Order\n{\n    public Guid Id { get; private set; }\n    public OrderStatus Status { get; private set; }\n    public int Version { get; private set; }\n\n    public static Order Load(IEnumerable<object> history)\n    {\n        var o = new Order();\n        foreach (var e in history) o.Apply(e);\n        return o;\n    }\n\n    public IEnumerable<object> Ship(DateTimeOffset at)\n    {\n        if (Status != OrderStatus.Paid) throw new InvalidOperationException("unpaid");\n        yield return new OrderShipped(Id, at);\n    }\n\n    private void Apply(object e) { /* switch on event type, mutate state, Version++ */ }\n}\n```\n\nThe handler loads the stream, calls the command method, appends the returned events with the **expected version** so a concurrent writer fails fast, and returns. Tests are given-when-then: given these events, when this command, expect these events. That style of test is the single best thing about the pattern.',
      },
      {
        heading: "The pain the talk skips",
        body: "- **Event versioning.** Stored events are forever. When `OrderPlaced` needs a currency field, you write an upcaster that transforms version 1 into version 2 on read, and you keep it for the life of the system. Renaming an event is a migration.\n- **Deleting data.** Immutable streams and GDPR erasure collide. The usual answer is crypto-shredding: encrypt personal data in events with a per-subject key and delete the key. Design that in on day one.\n- **Rebuilds take time.** Replaying fifty million events into a new projection is hours, during which the read model is stale or missing. You need a blue-green projection strategy.\n- **Everything is a projection.** Every query the business invents needs a projection built and backfilled. Analysts who want SQL today get a stale replica.\n- **Tooling gap.** No EF Core migrations, no scaffolding, fewer people who have done it, and a shape most recruits have not seen.\n- **Leaving is hard.** Converting an event-sourced aggregate back to a table is a project.",
      },
      {
        heading: "A strong warning",
        body: "Event sourcing is an aggregate-level decision, never a system-level one. Apply it to the two aggregates where history is the product (the ledger, the policy, the case file) and keep plain EF Core tables for customers, catalogue, settings and everything else. A system that is event-sourced end to end is slow to build, slow to change and lonely to staff.\n\nBefore choosing it, check the cheaper options honestly: SQL Server system-versioned temporal tables for row history, a domain-events table plus an outbox for integration, Marten's document store without events for flexible schemas. If none of those answers the requirement and the requirement is genuinely about history, event sourcing is the right tool and Marten is the easiest way to start.",
      },
    ],
    diagram: {
      caption:
        "Commands append to a stream; state is folded on load; projections and temporal queries read the same events.",
      nodes: [
        {
          id: "api",
          label: "Command handler",
          sub: "ASP.NET Core",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "agg",
          label: "Order aggregate",
          sub: "fold + decide",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "store",
          label: "Event store",
          sub: "Marten or KurrentDB",
          col: 2,
          row: 1,
          kind: "data",
        },
        {
          id: "snap",
          label: "Snapshots",
          sub: "every N events",
          col: 2,
          row: 0,
          kind: "data",
        },
        {
          id: "proj",
          label: "Async projection",
          sub: "subscription daemon",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "rdb",
          label: "Read model",
          sub: "SQL table or Cosmos",
          col: 4,
          row: 1,
          kind: "data",
        },
        {
          id: "temporal",
          label: "Temporal query",
          sub: "replay to a date",
          col: 3,
          row: 2,
          kind: "note",
        },
      ],
      edges: [
        { from: "api", to: "agg", label: "command" },
        { from: "store", to: "agg", label: "load stream", style: "dashed" },
        { from: "agg", to: "store", label: "append, expected version" },
        { from: "store", to: "snap", style: "dashed" },
        { from: "store", to: "proj", label: "new events" },
        { from: "proj", to: "rdb", label: "upsert" },
        { from: "temporal", to: "store", style: "dashed" },
      ],
      groups: [{ label: "Source of truth", nodeIds: ["store", "snap"] }],
    },
    useWhen: [
      "A regulator or auditor must be able to see every change and its reason, forever",
      "The business asks questions about past states that nobody designed a report for",
      "You need to reproduce production behaviour from the exact sequence of changes",
      "The aggregate is central, long-lived and changed by many kinds of command",
    ],
    avoidWhen: [
      "A row-history requirement that temporal tables or an audit table would satisfy",
      "Most of the system is reference data and CRUD screens",
      "Nobody on the team has versioned an event schema or rebuilt a projection before",
      "Analysts need ad hoc SQL over current data today",
    ],
    microsoftStack: [
      {
        name: "Marten",
        role: "Event store and document database on PostgreSQL with projections and snapshots built in.",
      },
      {
        name: "KurrentDB (formerly EventStoreDB)",
        role: "Dedicated event store with persistent subscriptions, shared across services.",
      },
      {
        name: "Azure Cosmos DB change feed",
        role: "Turns an events container into an event log that drives projection processors.",
      },
      {
        name: "Azure Database for PostgreSQL",
        role: "Managed host for Marten.",
      },
      {
        name: "SQL Server temporal tables",
        role: "The cheaper alternative when row history is all that is needed.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -2,
        note: "Folding, projections, upcasters and snapshots replace one table.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Marten makes the start quick; the first schema change and rebuild cost weeks.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Appends are fast; loads need snapshots; reads come from projections.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Append-only streams partition well and reads scale through projections.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "The stream is strongly consistent; every read model is eventually consistent.",
      },
      {
        attribute: "evolvability",
        effect: 0,
        note: "New projections are cheap; changing stored events is permanent work.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "Given events, when command, then events: the best domain tests you will write.",
      },
      {
        attribute: "operability",
        effect: -2,
        note: "Projection lag, rebuilds and store growth need tooling and attention.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "More storage, more compute for projections, scarcer skills.",
      },
    ],
    related: [
      "cqrs",
      "messaging-outbox-saga",
      "sql-vs-cosmos",
      "ef-core-patterns",
    ],
    checks: [
      {
        id: "event-sourcing-q1",
        prompt:
          "Which requirement most strongly justifies event sourcing for an aggregate?",
        options: [
          "The service must scale to many instances",
          "Auditors must see what the account looked like on any past date and why it changed",
          "The team wants to publish events to other services",
          "Status changes must record who made them",
        ],
        answer: 1,
        explanation:
          "Temporal, explainable history is the driver that nothing cheaper satisfies. Scaling and publishing events are solved by an outbox, and recording who changed a status is covered by an audit column or temporal tables.",
      },
      {
        id: "event-sourcing-q2",
        prompt:
          "`OrderPlaced` events stored for two years lack a currency field that new code needs. What do you do?",
        options: [
          "Run a migration that rewrites the stored events with a default currency",
          "Introduce `OrderPlacedV2` and an upcaster that maps old events to it on read",
          "Delete the old streams and rebuild them from the read model",
          "Add a nullable property and let old events deserialise with null forever",
        ],
        answer: 1,
        explanation:
          "Stored events are immutable, so the schema evolves on read through upcasting. Rewriting history breaks the audit guarantee, rebuilding streams from a projection inverts the source of truth, and a permanent null pushes the problem into every consumer.",
      },
      {
        id: "event-sourcing-q3",
        prompt:
          "A customer invokes their right to erasure, and their data sits in immutable events. What is the standard answer?",
        options: [
          "Explain that the events cannot be changed",
          "Rewrite every affected stream without the personal fields",
          "Crypto-shredding: personal data was encrypted with a per-customer key, so delete the key",
          "Drop the entire event store and rebuild it from projections",
        ],
        answer: 2,
        explanation:
          "Crypto-shredding keeps streams immutable while making the personal data unreadable, which is why it must be designed in from the start. Rewriting streams is expensive and breaks hashes and subscriptions, and refusing the request is not an option under GDPR.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Event Sourcing pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/event-sourcing",
      },
      {
        title: "Azure Cosmos DB: Change feed",
        url: "https://learn.microsoft.com/azure/cosmos-db/change-feed",
      },
    ],
  },
  {
    id: "messaging-outbox-saga",
    trackId: "dotnet-distributed",
    title: "Reliable messaging, outbox and sagas",
    tagline:
      "At-least-once delivery, idempotent consumers, and workflows that survive a crash.",
    level: 3,
    minutes: 8,
    summary:
      "The moment a database write and a message must agree, you need the transactional outbox, idempotent consumers and a plan for retries and dead letters. The moment a business process spans several services, you need a saga, either choreographed with events or orchestrated by a process manager. MassTransit and NServiceBus on Azure Service Bus give .NET teams both, with very different licensing and tooling.",
    sections: [
      {
        heading: "The dual-write problem",
        body: "`SaveChangesAsync()` commits the order. `PublishAsync(new OrderPlaced(...))` then fails because Service Bus is throttling, the pod is killed, or the network blinks. The order exists and Billing never hears about it. Reverse the two calls and you get the opposite ghost: a message about an order that was never saved. No amount of try/catch fixes this, because a database and a broker cannot share one transaction.\n\nThe distributed-systems answer is to stop pretending delivery is exactly once. Deliver **at least once**, make every consumer safe to run twice, and make the hand-off from database to broker a single local transaction. Three ingredients: the **transactional outbox**, the **inbox** (or an equivalent deduplication key), and **idempotent handlers**. Everything else in messaging is built on those.",
      },
      {
        heading: "Outbox and inbox",
        body: "The outbox is a table in the same database as your data. The handler writes the order and the `OrderPlaced` message row in **one EF Core transaction**. A relay then reads unsent rows, publishes them to Azure Service Bus, and marks them sent. If the relay crashes after publishing and before marking, the message is sent twice, which is fine because consumers are idempotent.\n\nRelays come in two shapes: a polling `BackgroundService` (simple, a few seconds of latency) or change-data-capture (SQL Server CDC, Debezium) for high volume. MassTransit and NServiceBus both ship an EF Core outbox so you never write the relay yourself; MassTransit's also includes a **bus outbox** that holds messages until the transaction commits.\n\nOn the consuming side, an inbox table keyed by message id records what has been processed, inside the same transaction as the consumer's own writes. Service Bus duplicate detection (by `MessageId`, within a configurable window) catches most retries at the broker, and it is not a substitute: the consumer's own crash after commit still produces a redelivery.",
      },
      {
        heading: "Sagas: choreography or orchestration",
        body: 'Place order, reserve stock, charge card, schedule shipment: four services, no shared transaction, and any step can fail after earlier ones succeeded. A **saga** runs the steps as local transactions and runs **compensations** (release stock, refund) when a later step fails.\n\n**Choreography**: each service reacts to events and emits its own. Ordering publishes `OrderPlaced`, Inventory reserves and publishes `StockReserved`, Billing charges and publishes `PaymentTaken`. No central coordinator, minimal coupling, and nobody can tell you where an order is without tracing every topic. Fine for two or three steps.\n\n**Orchestration**: a **process manager** owns the workflow state and sends commands: `ReserveStock`, then `ChargeCard`, then `ShipOrder`, with timeouts and compensation steps written in one place. MassTransit\'s state machine sagas and NServiceBus sagas persist that state in SQL or Cosmos DB and correlate incoming messages by order id. Beyond three steps, or when the business asks "where is my order stuck?", orchestration wins.\n\nEither way, every step must be idempotent and every saga needs a timeout path, because the message that never arrives is the common failure.',
      },
      {
        heading: "MassTransit and NServiceBus on Azure Service Bus",
        body: "**MassTransit** gives you consumers, request/response, retry and redelivery policies, EF Core outbox and inbox, state machine sagas and a test harness, over Azure Service Bus, RabbitMQ or in-memory for tests. Version 8 is open source; the project announced that version 9 moves to a commercial licence, so check the terms before upgrading.\n\n**NServiceBus** from Particular Software is commercial from the start and sells a platform around it: ServiceControl for failed-message handling, ServicePulse for monitoring, ServiceInsight for visualising sagas and flows. For teams that will run dozens of endpoints and need operational tooling on day one, that platform is often worth the licence.\n\nThe plain `Azure.Messaging.ServiceBus` SDK is right for a single queue with one consumer and no sagas. **Wolverine** (from the Marten team) and **Dapr pub/sub** are the other credible options; Dapr trades features for portability and fits Container Apps well.\n\nOn Service Bus itself, use **topics with subscriptions** for events, **queues** for commands, sessions for ordered processing per key, and the Standard tier until throughput or VNet needs push you to Premium.",
      },
      {
        heading: "Retries, poison messages and dead letters",
        body: "Transient failures (a timeout, a deadlock, throttling) deserve retries with exponential backoff and jitter; MassTransit configures these per consumer, and Service Bus redelivers a message whose lock expires or is abandoned. Permanent failures (a malformed payload, a business rule that will never pass) deserve **no** retries: after the configured delivery count the broker moves the message to the **dead-letter queue**, and someone must look at it.\n\nTreat the DLQ as an alert, never a log. Monitor its depth, record the exception reason on the message, fix the code or the data, and replay from the DLQ with tooling (Service Bus Explorer in the portal, ServiceControl, or a small admin endpoint). Unbounded retries hide bugs and starve healthy messages.\n\nFinally, make the order of handling explicit. Most consumers can process messages in any order; the few that cannot should use Service Bus sessions keyed by aggregate id, and should accept that sessions limit parallelism.",
      },
      {
        heading: "How to decide",
        body: "You need an outbox the first time a database write and a message must both happen. That includes modular monoliths that publish integration events; it is cheap there and makes later extraction easy. You need an inbox or an equivalent idempotency key for every consumer that writes.\n\nYou need a saga when a business process spans more than one service and more than one step and has a failure path that must undo earlier work. If all the steps live in one process, a plain transaction or Durable Functions is simpler. If the workflow is long-running and mostly waiting on humans, look at Durable Functions or Dapr Workflow before building a process manager by hand.\n\nChoose MassTransit for a capable open-source start, NServiceBus when operational tooling and support matter more than licence cost, and the raw SDK for one queue.",
      },
    ],
    diagram: {
      caption:
        "The outbox makes publish atomic with the write; an orchestrating saga drives the rest of the workflow.",
      nodes: [
        {
          id: "ordering",
          label: "Ordering service",
          sub: "ASP.NET Core",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "odb",
          label: "Azure SQL",
          sub: "orders + outbox table",
          col: 1,
          row: 1,
          kind: "data",
        },
        {
          id: "relay",
          label: "Outbox relay",
          sub: "polling publisher",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "bus",
          label: "Azure Service Bus",
          sub: "topics + dead letters",
          col: 2,
          row: 1,
          kind: "queue",
        },
        {
          id: "saga",
          label: "Order saga",
          sub: "MassTransit state machine",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "sdb",
          label: "Saga state",
          sub: "Azure SQL",
          col: 3,
          row: 2,
          kind: "data",
        },
        {
          id: "billing",
          label: "Billing",
          sub: "idempotent consumer",
          col: 4,
          row: 0,
          kind: "service",
        },
        {
          id: "shipping",
          label: "Shipping",
          sub: "idempotent consumer",
          col: 4,
          row: 2,
          kind: "service",
        },
      ],
      edges: [
        { from: "ordering", to: "odb", label: "one transaction" },
        { from: "odb", to: "relay", label: "unsent rows", style: "dashed" },
        { from: "relay", to: "bus", label: "OrderPlaced" },
        { from: "bus", to: "saga", label: "correlate by order id" },
        { from: "saga", to: "sdb" },
        { from: "saga", to: "billing", label: "ChargeCard command" },
        { from: "saga", to: "shipping", label: "ShipOrder command" },
        { from: "billing", to: "bus", label: "PaymentFailed", style: "dashed" },
      ],
      groups: [
        {
          label: "Atomic write + publish",
          nodeIds: ["ordering", "odb", "relay"],
        },
      ],
    },
    useWhen: [
      "A database write and a published message must never disagree",
      "A business process spans several services and must compensate on failure",
      "Consumers crash or restart mid-message and duplicates must be harmless",
      "The business needs to ask where a multi-step order is stuck",
    ],
    avoidWhen: [
      "All the steps run in one process and one database transaction covers them",
      "The workflow is mostly waiting on people and a workflow engine would be clearer",
      "There is one queue, one consumer and no state to coordinate",
    ],
    microsoftStack: [
      {
        name: "Azure Service Bus",
        role: "Queues for commands, topics for events, sessions for ordering, dead-letter queues per entity.",
      },
      {
        name: "MassTransit",
        role: "Consumers, retries, EF Core outbox and inbox, state machine sagas; v8 open source.",
      },
      {
        name: "NServiceBus + Particular platform",
        role: "Commercial messaging with ServiceControl and ServicePulse for failed-message operations.",
      },
      {
        name: "EF Core transactional outbox",
        role: "Message rows committed with the data; a relay publishes them afterwards.",
      },
      {
        name: "SQL Server Change Data Capture",
        role: "High-volume outbox relay without polling.",
      },
      {
        name: "Service Bus Explorer",
        role: "Portal tooling to inspect, dead-letter and resubmit messages.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -2,
        note: "Outbox, inbox, retries and saga state where a method call used to be.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "No lost or ghost messages; work survives crashes and restarts.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Eventual across services, with compensation instead of rollback.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Consumers scale independently and absorb bursts through the queue.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Higher throughput, longer time to completion for a single request.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "New consumers subscribe without changing publishers.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "Harnesses exist; testing timeouts and compensations still takes effort.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Dead-letter queues, saga state and lag need dashboards and runbooks.",
      },
    ],
    related: [
      "microservices",
      "cqrs",
      "serverless-durable-functions",
      "azure-messaging-choices",
    ],
    checks: [
      {
        id: "messaging-outbox-saga-q1",
        prompt:
          "An order is saved, then `PublishAsync` throws and Billing never hears about it. What is the fix?",
        options: [
          "Publish first and save the order only if publishing succeeds",
          "Wrap both calls in a `TransactionScope`",
          "Write the message to an outbox table in the order's transaction and let a relay publish it",
          "Retry `PublishAsync` in a loop until it succeeds",
        ],
        answer: 2,
        explanation:
          "The outbox makes the write and the intent to publish atomic in one database transaction; the relay delivers at least once afterwards. Reordering creates ghost messages, `TransactionScope` cannot enlist Service Bus, and a retry loop dies with the process.",
      },
      {
        id: "messaging-outbox-saga-q2",
        prompt:
          'A six-step fulfilment process across four services needs compensation and a "where is it stuck?" view. Which style?',
        options: [
          "Choreography: each service reacts to the previous service's event",
          "Orchestration: a process manager with persisted state sends commands and handles timeouts",
          "A single distributed transaction across all four databases",
          "Synchronous HTTP calls in sequence from the Ordering service",
        ],
        answer: 1,
        explanation:
          "Six steps with compensation and status visibility is the case for an orchestrating saga with persisted state. Choreography spreads the flow across topics and gives no single view, distributed transactions are unavailable across services, and sequential HTTP calls fail the moment one service is down.",
      },
      {
        id: "messaging-outbox-saga-q3",
        prompt:
          "A message with a malformed payload has failed ten times and is blocking the consumer. What should happen?",
        options: [
          "Keep retrying with longer delays until the payload is fixed upstream",
          "Delete the message and move on",
          "Let it dead-letter after the delivery count, alert, fix the cause, then resubmit from the DLQ",
          "Increase the lock duration so the consumer has more time",
        ],
        answer: 2,
        explanation:
          "Permanent failures belong in the dead-letter queue with an alert, so healthy messages flow and the bad one can be fixed and replayed. Endless retries hide the bug, deletion loses data, and lock duration only matters for slow handlers.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Transactional Outbox pattern",
        url: "https://learn.microsoft.com/azure/architecture/best-practices/transactional-outbox-cosmos",
      },
      {
        title:
          "Azure Architecture Center: Saga distributed transactions pattern",
        url: "https://learn.microsoft.com/azure/architecture/reference-architectures/saga/saga",
      },
      {
        title: "Azure Service Bus documentation",
        url: "https://learn.microsoft.com/azure/service-bus-messaging/",
      },
    ],
  },
  {
    id: "serverless-durable-functions",
    trackId: "dotnet-distributed",
    title: "Serverless and Durable Functions",
    tagline:
      "Pay per execution, scale to zero, and write long-running workflows as ordinary C#.",
    level: 2,
    minutes: 7,
    summary:
      "Azure Functions runs small pieces of .NET in response to triggers, bills per execution and scales to zero. Durable Functions adds orchestrations that checkpoint their progress so a workflow can run for days through restarts. They beat always-on compute for spiky, event-driven and scheduled work, and they lose to an ASP.NET Core app on Container Apps for steady, latency-sensitive APIs.",
    sections: [
      {
        heading: "Azure Functions today",
        body: 'A function is a method with a **trigger** attribute: HTTP, timer, Service Bus queue or topic, Event Hubs, Event Grid, Cosmos DB change feed, Blob Storage, Storage Queue. **Bindings** inject inputs (a blob, a Cosmos document) and accept outputs (a queue message) without SDK code. The platform scales instances by trigger pressure and you pay for what runs.\n\nFor .NET, the **isolated worker model** is the model: your code runs in its own process on any supported .NET version, with `HostBuilder`, dependency injection, middleware and configuration that look like ASP.NET Core. The older in-process model is tied to the host\'s runtime and is on its way out, so new projects should not start there.\n\n```csharp\n[Function("ProcessOrder")]\npublic async Task Run(\n    [ServiceBusTrigger("orders", Connection = "ServiceBus")] OrderPlaced evt,\n    FunctionContext ctx)\n{\n    await _handler.HandleAsync(evt, ctx.CancellationToken);\n}\n```\n\nKeep the function thin and put the logic in a class the same handler could run from an ASP.NET Core app or a test.',
      },
      {
        heading: "Plans, cold starts and limits",
        body: "**Consumption** is the classic pay-per-execution plan: scale to zero, cold starts of a second or more for .NET, execution capped at ten minutes. **Flex Consumption** is the newer default for serverless: scale to zero plus **always-ready instances** you pay to keep warm, per-instance concurrency you control, VNet integration and faster scale-out. **Premium** gives pre-warmed instances, longer executions and more memory at an always-on price. **Dedicated** (App Service plan) and **Container Apps** hosting run Functions on compute you already pay for.\n\nCold starts come from provisioning a new instance and loading your app. Reduce them with always-ready instances on Flex, ReadyToRun compilation, fewer and smaller dependencies, and by keeping startup work lazy. Measure before you tune: for a nightly batch nobody notices a two-second start; for a checkout API everybody does.\n\nOther limits that bite: HTTP trigger request timeouts at the front door, per-instance memory, and the number of concurrent executions a Service Bus trigger will pull (`MaxConcurrentCalls`).",
      },
      {
        heading: "Durable Functions patterns",
        body: 'An **orchestrator** function is C# that calls **activity** functions and awaits them; the framework checkpoints every result in a task hub (Azure Storage by default, or the managed **Durable Task Scheduler**) and replays the orchestrator from history after a restart. Orchestrator code must therefore be deterministic: no `DateTime.UtcNow`, no `Guid.NewGuid()`, no I/O; use `context.CurrentUtcDateTime`, `context.NewGuid()` and activities instead.\n\n- **Function chaining**: `await` activity A, then B, then C, with retries per step.\n- **Fan-out/fan-in**: start one activity per item, `Task.WhenAll`, aggregate.\n- **Async HTTP API**: the starter returns `202 Accepted` with a status URL the client polls.\n- **Monitor**: a loop that calls an activity, sleeps with a durable timer, and stops on a condition or deadline.\n- **Human interaction**: `WaitForExternalEvent("Approved")` raced against a durable timer for escalation.\n- **Aggregator**: a **durable entity** holding per-key state, updated by signals.\n\n```csharp\nvar tasks = invoices.Select(i => ctx.CallActivityAsync<Result>("Price", i));\nvar results = await Task.WhenAll(tasks);\n```\n\nThat snippet replaces a queue, a worker, a completion table and a reconciliation job.',
      },
      {
        heading: "When serverless wins",
        body: "- **Spiky or rare work**: a nightly invoice run, a webhook that fires a hundred times a day, an image resize on upload. Always-on compute is idle 95 percent of the time; Functions is idle for free.\n- **Event glue**: reacting to a Service Bus message, a Cosmos DB change, an Event Grid notification, with no server to own.\n- **Scheduled jobs**: a timer trigger beats a Windows service or a cron container nobody monitors.\n- **Long-running workflows with waits**: approvals, multi-day retries, monitors. Durable Functions makes these a few dozen lines, and the platform carries the state.\n- **Bursty fan-out**: ten thousand items processed in parallel for a minute, then nothing.\n\nThe common thread is utilisation. If the compute would be busy less than a third of the time, or the load is unpredictable, serverless is cheaper and simpler to run.",
      },
      {
        heading: "When always-on wins",
        body: "- **Steady traffic**: an API doing hundreds of requests per second all day costs less on Container Apps or App Service, with no cold starts and simpler capacity planning.\n- **Latency-sensitive endpoints**: user-facing requests with tight budgets do not want a cold instance; Flex always-ready narrows the gap at a price.\n- **Rich HTTP APIs**: routing, filters, authentication schemes, OpenAPI and versioning are all better in ASP.NET Core than in a folder of HTTP-triggered functions.\n- **Stateful or connection-heavy work**: WebSockets, SignalR hubs (use Azure SignalR Service if you must), gRPC streams, large in-memory caches.\n- **Portability**: triggers and bindings are Azure-specific; a Container App running plain .NET moves anywhere.\n\nA sound default: ASP.NET Core on Container Apps for the API, Functions for the asynchronous and scheduled edges around it, Durable Functions for the workflows that must survive a week.",
      },
      {
        heading: "Common mistakes",
        body: "- Building a whole REST API as forty HTTP-triggered functions and rediscovering ASP.NET Core one feature at a time.\n- Non-deterministic orchestrators: a `DateTime.Now` or an `HttpClient` call in the orchestrator causes replay failures that only show up after a restart.\n- Forgetting that triggers are at-least-once. Every Service Bus or queue-triggered function needs an idempotency key.\n- Fanning out a hundred thousand activities on the Azure Storage provider and hitting throttling; batch the items or use the Durable Task Scheduler.\n- Changing orchestrator logic while instances are in flight. Version orchestrations or drain them first.\n- Using Durable Functions as a business-user workflow tool. That is Logic Apps' job.\n- Ignoring `MaxConcurrentCalls` and prefetch, then wondering why one instance pulls every message.",
      },
    ],
    diagram: {
      caption:
        "A Durable Functions workflow: a starter returns 202, the orchestrator fans out activities and waits for an external approval.",
      nodes: [
        {
          id: "client",
          label: "Client",
          sub: "polls status URL",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "starter",
          label: "HTTP starter",
          sub: "returns 202 + status",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "orch",
          label: "Orchestrator",
          sub: "deterministic, replayed",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "state",
          label: "Task hub",
          sub: "Storage or DTS",
          col: 2,
          row: 2,
          kind: "data",
        },
        {
          id: "a1",
          label: "Activity: fetch",
          sub: "I/O allowed here",
          col: 3,
          row: 0,
          kind: "service",
        },
        {
          id: "a2",
          label: "Activity: price",
          sub: "fan-out per item",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "a3",
          label: "Activity: notify",
          sub: "after fan-in",
          col: 3,
          row: 2,
          kind: "service",
        },
        {
          id: "approval",
          label: "Approval webhook",
          sub: "raises external event",
          col: 4,
          row: 1,
          kind: "external",
        },
      ],
      edges: [
        { from: "client", to: "starter", label: "POST /runs" },
        { from: "starter", to: "orch", label: "schedule" },
        {
          from: "orch",
          to: "state",
          label: "checkpoint history",
          style: "dashed",
        },
        { from: "orch", to: "a1" },
        { from: "orch", to: "a2", label: "Task.WhenAll" },
        { from: "orch", to: "a3" },
        {
          from: "approval",
          to: "orch",
          label: "WaitForExternalEvent",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "Durable Functions app",
          nodeIds: ["starter", "orch", "a1", "a2", "a3"],
        },
      ],
    },
    useWhen: [
      "Work arrives in bursts or on a schedule and compute would otherwise sit idle",
      "You react to Service Bus, Event Grid, Cosmos DB or Blob events and want no server to own",
      "A workflow waits hours or days on timers, people or external systems",
      "A batch must fan out over thousands of items and fan back in reliably",
    ],
    avoidWhen: [
      "The API serves steady traffic with tight latency budgets all day",
      "You need WebSockets, SignalR hubs or large in-process state",
      "Portability off Azure is a requirement",
      "The HTTP surface is large and benefits from ASP.NET Core's routing, filters and OpenAPI",
    ],
    microsoftStack: [
      {
        name: "Azure Functions isolated worker",
        role: "Your .NET process with DI and middleware; the model for all new projects.",
      },
      {
        name: "Flex Consumption plan",
        role: "Scale to zero with always-ready instances and VNet when cold starts matter.",
      },
      {
        name: "Durable Functions",
        role: "Orchestrators, activities, entities and durable timers for long-running workflows.",
      },
      {
        name: "Durable Task Scheduler",
        role: "Managed task hub backend for higher throughput and a monitoring dashboard.",
      },
      {
        name: "Service Bus and Event Grid triggers",
        role: "The usual entry points for asynchronous work.",
      },
      {
        name: "Azure Logic Apps",
        role: "The alternative when business users should own the workflow.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 0,
        note: "Small functions are simple; orchestration determinism rules are not.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "A trigger attribute replaces a worker, a queue reader and a scheduler.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Instances follow trigger pressure, to zero and to thousands.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "Cold starts and per-instance limits; always-ready instances cost money.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Checkpointed orchestrations and built-in retries survive restarts.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Cheap when utilisation is low; more expensive than always-on at steady load.",
      },
      {
        attribute: "evolvability",
        effect: -1,
        note: "Bindings are Azure-specific and in-flight orchestrations resist code changes.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "No servers, but orchestration state and replay failures need their own tooling.",
      },
    ],
    related: [
      "messaging-outbox-saga",
      "azure-compute-choices",
      "aspire-dapr",
      "orleans-actors",
    ],
    checks: [
      {
        id: "serverless-durable-functions-q1",
        prompt:
          "Each night 50,000 invoices must be priced in parallel and a summary emailed when all are done. Best fit?",
        options: [
          "A Windows service that loops over the invoices",
          "A Durable Functions orchestration using fan-out/fan-in over an activity per batch of invoices",
          "An ASP.NET Core background service on a Container App that runs all night",
          "A Logic App with a loop step",
        ],
        answer: 1,
        explanation:
          "Fan-out/fan-in with checkpointing handles parallelism, retries and the completion step in a few lines and costs nothing the rest of the day. A looping service is slow and fragile, an always-on app is idle 23 hours, and Logic Apps is the wrong tool for a code-heavy batch.",
      },
      {
        id: "serverless-durable-functions-q2",
        prompt:
          "A public API serves 500 requests per second all day with a 100 ms latency target. Which host?",
        options: [
          "Azure Functions on the Consumption plan",
          "ASP.NET Core on Azure Container Apps or App Service",
          "Durable Functions with an async HTTP API",
          "Azure Functions on Flex Consumption with no always-ready instances",
        ],
        answer: 1,
        explanation:
          "Steady, latency-sensitive traffic is where always-on compute is both cheaper and faster. Consumption and Flex without warm instances add cold starts, and an async HTTP API turns a fast request into a poll.",
      },
      {
        id: "serverless-durable-functions-q3",
        prompt:
          "An orchestrator calls `DateTime.UtcNow` and an `HttpClient` directly. Why is that a bug?",
        options: [
          "Orchestrators cannot reference `System.Net.Http`",
          "Orchestrators are replayed from history and must be deterministic; use `context.CurrentUtcDateTime` and activities",
          "It is only a performance problem because HTTP calls block the thread",
          "It is fine as long as the orchestration finishes within ten minutes",
        ],
        answer: 1,
        explanation:
          "Replay re-executes orchestrator code and expects the same decisions, so non-deterministic calls produce different paths and corrupt the run. The fix is the context clock and moving I/O into activities. Package references and timeouts are unrelated.",
      },
    ],
    sources: [
      {
        title: "Azure Functions documentation",
        url: "https://learn.microsoft.com/azure/azure-functions/",
      },
      {
        title: "Durable Functions overview",
        url: "https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview",
      },
    ],
  },
  {
    id: "api-gateway-bff",
    trackId: "dotnet-distributed",
    title: "API gateway and Backend-for-Frontend",
    tagline:
      "One front door per client, with tokens kept where the browser cannot lose them.",
    level: 2,
    minutes: 8,
    summary:
      "An API gateway is the single entry point that routes, authenticates and rate-limits traffic for a set of services. A Backend-for-Frontend is a small backend owned by one client team that shapes data for its screens and, for a React SPA, keeps OAuth tokens out of the browser. Both earn their place once there is more than one service or more than one client type, and both can quietly become a new monolith.",
    sections: [
      {
        heading: "What a gateway does",
        body: "A gateway sits between clients and services and takes on the work every service would otherwise repeat: TLS termination, routing by path or host, validating the bearer token once, rate limiting per client, response caching, request and response transforms, API versioning, and attaching a correlation id for tracing.\n\nOn Azure the choices are **Azure API Management** (fully managed, policy-based, with products, subscriptions and a developer portal, strongest for partner-facing APIs), **YARP** (a reverse proxy library you host in ASP.NET Core, strongest when the gateway is really part of your application and you want it in C# and source control), **Azure Front Door** (global edge, WAF and CDN in front of everything) and **Application Gateway** (regional layer 7 with WAF).\n\nA gateway should know URLs, identities and limits. It should never know what an order is. The first business rule written as an API Management policy is the start of the gateway monolith.",
      },
      {
        heading: "Backend-for-Frontend",
        body: "A general-purpose API serves every client equally badly: the mobile app wants three fields and small payloads, the web dashboard wants a joined view of five services, the partner integration wants stable contracts and bulk endpoints. A **BFF** is one backend per client type, owned by that client's team, that calls the services and returns exactly what the screens need.\n\nFor a React SPA, the BFF is usually a small ASP.NET Core app: Minimal API endpoints for aggregated views, YARP routes for straight pass-through, and the authentication handling described next. It deploys with the SPA, often serving the static files too, and changes whenever the UI changes without anyone negotiating with service teams.\n\nThe rule that keeps BFFs honest: one client type per BFF. The moment two clients share one, it is a general-purpose API again, with the costs of a BFF and the benefits of neither.",
      },
      {
        heading: "The token handler pattern for a React SPA",
        body: "Access and refresh tokens in `localStorage` or in JavaScript memory are readable by any script that gets into the page, and browser vendors keep tightening what a public client may do. The **token handler** (or BFF authentication) pattern moves all of it server-side.\n\n- The SPA sends the user to `/bff/login`. The BFF runs the OpenID Connect **authorization code flow with PKCE** against **Entra ID**, using the ASP.NET Core OpenID Connect handler or Microsoft.Identity.Web.\n- The BFF stores the tokens in a server-side session (Azure Cache for Redis or SQL) and issues the browser an **HttpOnly, Secure, SameSite** cookie that contains no token.\n- The SPA calls `/bff/api/orders` with the cookie and a custom header such as `X-CSRF: 1`; the BFF checks the header, loads the session, attaches the access token and forwards the call through YARP.\n- The BFF refreshes tokens silently and exposes `/bff/user` and `/bff/logout`.\n\n**Duende BFF** packages this with anti-forgery, session management and YARP integration (licensed, with a free tier for small companies). Building it by hand on ASP.NET Core cookie authentication and YARP transforms is a few hundred lines. Either way, MSAL leaves the SPA entirely.",
      },
      {
        heading: "GraphQL as a BFF",
        body: "When client types differ widely and screens change weekly, a GraphQL endpoint lets each client ask for exactly the shape it needs. In .NET, **Hot Chocolate** gives you a schema-first or code-first server on ASP.NET Core, DataLoader batching to avoid the N+1 problem, field-level authorization, and Fusion for composing several services into one graph. On the client, Apollo Client, urql or TanStack Query with a small fetcher all work.\n\nThe costs: HTTP caching becomes harder, every resolver needs a cost limit against hostile queries, and the schema becomes a shared contract that someone must own. For a single SPA with twenty screens and a stable API, a REST BFF with purpose-built endpoints is simpler. For a platform with web, mobile, kiosk and partner clients consuming the same domain, GraphQL as the BFF layer is often the cheapest way to stop writing endpoint variants.",
      },
      {
        heading: "Pitfalls",
        body: "- **Gateway as a new monolith.** Every change needs the gateway team, policies hold business logic, and a bad deploy of the gateway takes down everything. Keep the gateway thin and its configuration in source control with its own pipeline.\n- **Shared BFF.** One backend for web and mobile recreates the problem it was meant to solve.\n- **Double hop latency.** Browser to BFF to gateway to service. Fine at tens of milliseconds, painful if each layer adds retries and logging synchronously.\n- **Coupling the BFF to service internals.** The BFF composes public contracts; it does not reach into another team's database.\n- **Cached authorization.** A gateway that caches responses must vary the cache by identity or it leaks data between users.\n- **BFF sprawl.** Three developers and four BFFs is a maintenance problem. Start with one for the SPA and add others when a second client type actually exists.",
      },
      {
        heading: "How to decide",
        body: "One SPA and one ASP.NET Core API: no gateway. Consider a thin BFF anyway, purely for the token handler, because it is the simplest way to get tokens out of the browser and it costs one small project.\n\nSeveral services behind one SPA: a gateway (YARP if you own it in code, API Management if you need policies, products and a portal) plus a BFF per client type as soon as the second client type appears.\n\nAPIs sold or exposed to partners: API Management, with subscriptions, quotas, versioning and the portal doing work you would otherwise build.\n\nMany client types with fast-changing screens: GraphQL as the BFF layer, with a team that owns the schema.\n\nIn every case, write down what the gateway is allowed to know. If the answer includes a business rule, move the rule into a service.",
      },
    ],
    diagram: {
      caption:
        "The BFF holds tokens server-side and talks to services through the gateway; the browser only ever sees a cookie.",
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
          label: "Entra ID",
          sub: "code flow + PKCE",
          col: 1,
          row: 0,
          kind: "external",
        },
        {
          id: "bff",
          label: "BFF",
          sub: "ASP.NET Core + YARP",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "session",
          label: "Session store",
          sub: "Redis, tokens live here",
          col: 1,
          row: 2,
          kind: "data",
        },
        {
          id: "gw",
          label: "API gateway",
          sub: "Azure API Management",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "orders",
          label: "Orders API",
          sub: "Container App",
          col: 3,
          row: 0,
          kind: "service",
        },
        {
          id: "catalog",
          label: "Catalog API",
          sub: "Container App",
          col: 3,
          row: 2,
          kind: "service",
        },
      ],
      edges: [
        { from: "spa", to: "bff", label: "cookie + X-CSRF header" },
        {
          from: "bff",
          to: "entra",
          label: "OIDC",
          style: "dashed",
          bidirectional: true,
        },
        { from: "bff", to: "session", label: "tokens by session id" },
        { from: "bff", to: "gw", label: "Bearer access token" },
        { from: "gw", to: "orders", label: "validate JWT, route" },
        { from: "gw", to: "catalog", label: "rate limit, route" },
      ],
      groups: [
        {
          label: "Owned by the front-end team",
          nodeIds: ["spa", "bff", "session"],
        },
      ],
    },
    useWhen: [
      "A React SPA currently keeps access or refresh tokens in the browser",
      "More than one client type needs different shapes of the same data",
      "Several services sit behind one public surface and all need auth, limits and tracing",
      "APIs are exposed to partners who need subscriptions, quotas and documentation",
    ],
    avoidWhen: [
      "One SPA, one API and a team of three; a gateway adds cost and no benefit",
      "The gateway would be the place where business rules end up",
      "Latency budgets cannot absorb an extra hop or two",
    ],
    microsoftStack: [
      {
        name: "Azure API Management",
        role: "Managed gateway with policies, products, subscriptions and a developer portal.",
      },
      {
        name: "YARP",
        role: "Reverse proxy library for a gateway or BFF written in ASP.NET Core.",
      },
      {
        name: "Entra ID",
        role: "Identity provider for the code flow the BFF runs on the user's behalf.",
      },
      {
        name: "Microsoft.Identity.Web",
        role: "OpenID Connect handler and token acquisition for the BFF.",
      },
      {
        name: "Azure Cache for Redis",
        role: "Server-side session store holding the tokens.",
      },
      {
        name: "Hot Chocolate",
        role: "GraphQL server on ASP.NET Core when the BFF is a graph.",
      },
    ],
    reactStack: [
      {
        name: "fetch with credentials and a CSRF header",
        role: "TanStack Query calls relative `/bff/...` URLs; no MSAL, no token storage in the SPA.",
      },
      {
        name: "GraphQL clients",
        role: "Apollo Client or urql against a Hot Chocolate BFF when the graph option is chosen.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "One or two more deployables between the browser and the data.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "Each hop adds latency; aggregation in the BFF can remove client round trips.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Rate limits, retries and circuit breaking in one place.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Services can be split or merged behind a stable public surface.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "The front-end team owns the BFF and ships without service teams.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "One place for auth, correlation ids and request logs.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "API Management tiers and an extra app to run.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "The BFF is easy to test; gateway policies are not.",
      },
    ],
    related: [
      "entra-id-auth",
      "microservices",
      "aspnet-react-hosting",
      "security-architecture",
    ],
    checks: [
      {
        id: "api-gateway-bff-q1",
        prompt:
          "A security review flags that the React SPA stores access and refresh tokens in `localStorage`. Best fix?",
        options: [
          "Move the tokens to `sessionStorage` so they clear on tab close",
          "Introduce a BFF that runs the code flow, keeps tokens server-side and gives the browser an HttpOnly cookie",
          "Shorten the access token lifetime to five minutes",
          "Encrypt the tokens in the browser with a key fetched from the API",
        ],
        answer: 1,
        explanation:
          "The token handler pattern removes tokens from the browser entirely, which is the only option that defeats script access. Storage location, lifetime and client-side encryption all leave a readable token in the page.",
      },
      {
        id: "api-gateway-bff-q2",
        prompt:
          "A developer proposes applying the customer discount rule in an API Management policy so every service gets it. Why is this wrong?",
        options: [
          "Policies cannot read the request body",
          "The gateway becomes a monolith holding business logic that no service tests or owns",
          "API Management is too slow for arithmetic",
          "It would only work for REST, not GraphQL",
        ],
        answer: 1,
        explanation:
          "Business rules belong in a service with tests and an owner. Rules in gateway policies are invisible to the domain, hard to test and turn every change into a gateway change. The other options are technical claims that do not hold.",
      },
      {
        id: "api-gateway-bff-q3",
        prompt:
          "The web and mobile teams want to share one BFF to save effort. What do you advise?",
        options: [
          "Share it; one backend is cheaper than two",
          "Keep one BFF per client type, or use a GraphQL endpoint if the shapes diverge widely",
          "Replace both with direct calls to the services",
          "Put the mobile endpoints behind API Management and the web ones behind YARP",
        ],
        answer: 1,
        explanation:
          "A shared BFF is a general-purpose API with extra steps, and both teams lose the ability to change it freely. If writing two is too costly, GraphQL lets each client shape its own queries from one server.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Backends for Frontends pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/backends-for-frontends",
      },
      {
        title: "Azure Architecture Center: Gateway Offloading pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/gateway-offloading",
      },
      {
        title: "Azure API Management documentation",
        url: "https://learn.microsoft.com/azure/api-management/",
      },
    ],
  },
  {
    id: "orleans-actors",
    trackId: "dotnet-distributed",
    title: "Orleans and virtual actors",
    tagline:
      "A grain per entity, always addressable, single-threaded, with state the runtime manages.",
    level: 3,
    minutes: 8,
    summary:
      "Microsoft Orleans implements the virtual actor model: every entity (a device, a cart, a game session) is a grain with an identity that always exists, is activated in memory on demand, and processes one call at a time. The runtime handles placement, failover and persistence. It is the right tool for millions of small, stateful things with their own timers, and the wrong one for ordinary CRUD.",
    sections: [
      {
        heading: "The virtual actor model",
        body: 'A classic actor must be created, supervised and found. A **virtual actor** simply exists: you ask the cluster for `ICartGrain` with key `"cart-42"`, and the runtime either routes you to the silo where it is already active or activates it somewhere and loads its state. Calls to one grain run **one at a time**, so there are no locks, no optimistic-concurrency retries and no cache invalidation; the grain is the cache and the single writer. Idle grains are deactivated and their memory reclaimed.\n\nA **silo** is a process hosting grains; a cluster is several silos that share a membership table. Clients, often your ASP.NET Core API co-hosted in the same process, call grains through generated proxies and never know where they live. Orleans came out of Microsoft Research and ran the services behind Halo before it became open source; it is now a .NET Foundation project maintained by the .NET team.',
      },
      {
        heading: "Grains, persistence, timers and reminders",
        body: '```csharp\npublic interface ICartGrain : IGrainWithStringKey\n{\n    Task AddItem(string sku, int qty);\n    Task<CartSummary> GetSummary();\n}\n\npublic sealed class CartGrain(\n    [PersistentState("cart", "carts")] IPersistentState<CartState> state)\n    : Grain, ICartGrain\n{\n    public async Task AddItem(string sku, int qty)\n    {\n        state.State.Lines[sku] = state.State.Lines.GetValueOrDefault(sku) + qty;\n        await state.WriteStateAsync();\n    }\n\n    public Task<CartSummary> GetSummary() => Task.FromResult(state.State.ToSummary());\n}\n```\n\n`IPersistentState<T>` loads on activation and writes when you say so, through a named storage provider. **Timers** run while a grain is active and vanish on deactivation; **reminders** are persisted, survive restarts, and wake the grain on a schedule with minute-level granularity, which is how a cart expires or a device is marked offline. **Streams** deliver events to grains, and **grain call filters** give you cross-cutting logging and authorisation. Grain interfaces are versioned so a rolling upgrade can run two versions side by side.',
      },
      {
        heading: "Where it shines",
        body: 'The pattern Orleans replaces is "load the row, take a lock or a version, modify, save, invalidate the cache" repeated for millions of keys under contention. When each entity has its own state, its own rules and its own clock, a grain per entity is dramatically simpler than the SQL plus Redis version.\n\n- **IoT**: a grain per device holds the twin, validates telemetry, and a reminder marks it offline after five silent minutes. Two million devices are two million small grains spread across silos.\n- **Gaming and real-time sessions**: a grain per match or lobby serialises moves and broadcasts state.\n- **Shopping carts and sessions**: in-memory, consistent, persisted on change, expired by reminder.\n- **Per-key aggregation and rate limiting**: a grain per customer counts requests with no shared counter contention.\n- **Long-lived workflows per entity**: an order grain that holds its own saga state and timers.\n\nThe common shape: many entities, each small, each hot for a while, each needing single-writer semantics.',
      },
      {
        heading: "On Azure",
        body: "Clustering needs a shared membership store: **Azure Table Storage** is the usual choice, with **Cosmos DB** and SQL Server (ADO.NET) as alternatives. Grain state has providers for Azure Table Storage, Azure Blob Storage, Cosmos DB, SQL Server and Redis; pick Table or Cosmos for many small documents and SQL when you need to query the state outside Orleans. Reminders use the same stores.\n\nSilos need direct silo-to-silo networking, so the natural hosts are **Azure Kubernetes Service** and **Azure Container Apps** with internal networking; App Service works for small clusters. Co-host the silo with the ASP.NET Core API in one process to avoid a separate client deployment, and use .NET Aspire to run a multi-silo cluster locally with the dashboard showing grain traces through OpenTelemetry.\n\nPlan the deployment story before the first grain: rolling upgrades rely on grain interface versioning, and a silo shutdown must give activations time to deactivate and persist.",
      },
      {
        heading: "When an API and a cache are enough",
        body: "Most systems do not have millions of hot, stateful entities. An invoicing application with a few thousand customers and low per-row contention is better served by EF Core with optimistic concurrency and, if needed, Azure Cache for Redis. The SQL version has migrations, ad hoc queries, reporting and a decade of tooling; the Orleans version has cluster membership, silo lifecycles, activation placement and a learning curve the whole team pays.\n\nCompare the neighbours too. **Dapr actors** offer a similar virtual actor model through the sidecar with fewer features and no in-process hosting; reasonable on Container Apps if you already run Dapr. **Akka.NET** gives you classic actors with explicit supervision trees, more control and more responsibility. For per-order workflows without heavy state, Durable Functions entities or a saga may be the simpler fit.\n\nChoose Orleans when the entity count, the per-entity timers and the single-writer requirement are all real. Choose SQL and a cache when any of them is a hypothetical.",
      },
      {
        heading: "Common mistakes",
        body: "- **The god grain.** An `AllOrdersGrain` that holds a list of everything is a single-threaded bottleneck and a giant state blob. Grains are per entity; aggregates across entities belong in streams or a read model.\n- **Fan-out from one grain.** A request that calls ten thousand grains serially takes ten thousand turns. Batch, parallelise with care, or restructure.\n- **Blocking inside grains.** `.Result` and `Wait()` inside a grain stall its turn and can deadlock the scheduler.\n- **Large state.** Megabytes per grain multiply across millions of activations; keep state small and reference blobs by id.\n- **Assuming exactly-once.** Calls can be retried after a timeout; make grain methods idempotent.\n- **Treating grains as a cache for SQL.** If the database is still the single writer, the grain adds a layer and no benefit.\n- **Ignoring versioning.** Changing a grain interface without a version number breaks rolling deployments.",
      },
    ],
    diagram: {
      caption:
        "Clients call grains by identity; silos share a membership table and persist grain state and reminders to Azure storage.",
      nodes: [
        {
          id: "clients",
          label: "Devices and SPA",
          sub: "millions of entities",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "co-hosted Orleans client",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "siloA",
          label: "Silo A",
          sub: "Container App replica",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "membership",
          label: "Membership table",
          sub: "Azure Table Storage",
          col: 2,
          row: 1,
          kind: "data",
        },
        {
          id: "siloB",
          label: "Silo B",
          sub: "Container App replica",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "grain",
          label: "Cart grain #42",
          sub: "one activation, one turn",
          col: 3,
          row: 0,
          kind: "service",
        },
        {
          id: "state",
          label: "Grain state",
          sub: "Cosmos DB or Table",
          col: 3,
          row: 2,
          kind: "data",
        },
        {
          id: "reminders",
          label: "Reminders",
          sub: "persistent timers",
          col: 4,
          row: 1,
          kind: "data",
        },
      ],
      edges: [
        { from: "clients", to: "api", label: "HTTPS / MQTT" },
        { from: "api", to: "siloA", label: "grain call by key" },
        { from: "api", to: "siloB", style: "dashed" },
        {
          from: "siloA",
          to: "membership",
          label: "heartbeat",
          style: "dashed",
        },
        { from: "siloB", to: "membership", style: "dashed" },
        { from: "siloA", to: "grain", label: "activates" },
        { from: "grain", to: "state", label: "WriteStateAsync" },
        {
          from: "reminders",
          to: "grain",
          label: "wake on schedule",
          style: "dashed",
        },
      ],
      groups: [
        { label: "Orleans cluster", nodeIds: ["siloA", "siloB", "grain"] },
      ],
    },
    useWhen: [
      "Hundreds of thousands or millions of entities each hold state and react to their own timers",
      "Per-entity contention makes the load-lock-save-invalidate cycle the main source of bugs",
      "You need single-writer semantics per key without distributed locks",
      "Real-time sessions, device twins or carts must stay in memory while hot and persist on change",
    ],
    avoidWhen: [
      "The data is a few thousand rows with low contention and relational queries",
      "Reporting and ad hoc SQL over current state are daily needs",
      "The team has no capacity to learn cluster membership, placement and grain versioning",
    ],
    microsoftStack: [
      {
        name: "Microsoft Orleans",
        role: "The virtual actor runtime: grains, silos, persistence, reminders, streams.",
      },
      {
        name: "Azure Table Storage",
        role: "Default cluster membership table and a cheap grain state store.",
      },
      {
        name: "Azure Cosmos DB",
        role: "Grain state and membership when global distribution or throughput matter.",
      },
      {
        name: "Azure Container Apps or AKS",
        role: "Hosts silos with the internal networking the cluster needs.",
      },
      {
        name: ".NET Aspire Orleans integration",
        role: "Runs a local cluster with clustering and storage resources wired up.",
      },
      {
        name: "Dapr actors",
        role: "The sidecar-based alternative with a similar model and fewer features.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "A cluster and an actor model replace a table and a cache; simpler per entity, harder overall.",
      },
      {
        attribute: "performance",
        effect: 2,
        note: "Hot state is in memory on the silo; no round trip to a database per call.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Grains spread across silos; add silos to add capacity.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Single-threaded turns per grain remove races on one entity.",
      },
      {
        attribute: "reliability",
        effect: 0,
        note: "Silo failure re-activates grains elsewhere; unpersisted state is lost.",
      },
      {
        attribute: "evolvability",
        effect: -1,
        note: "Grain interface versioning and state schema changes need care.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "`TestCluster` is good; distributed behaviour still needs real clusters.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Membership, placement and activation counts are new things to watch.",
      },
    ],
    related: [
      "serverless-durable-functions",
      "aspire-dapr",
      "caching-strategies",
      "realtime-signalr",
    ],
    checks: [
      {
        id: "orleans-actors-q1",
        prompt:
          "Two million IoT devices each report telemetry and must be marked offline after five silent minutes. Which design fits?",
        options: [
          "A SQL table with a `LastSeen` column and a job that scans it every minute",
          "A grain per device holding the twin, with a reminder that fires after five minutes of silence",
          "A Redis key per device with a TTL and a keyspace notification",
          "An Azure Function per device",
        ],
        answer: 1,
        explanation:
          "Per-entity state plus a persistent per-entity timer is exactly the virtual actor shape. A scanning job scales badly at millions of rows, Redis TTL notifications are best-effort and hold no rules, and a function per device is not how Functions work.",
      },
      {
        id: "orleans-actors-q2",
        prompt:
          "A team of four building a CRUD invoicing system for 3,000 customers wants to use Orleans. What do you say?",
        options: [
          "Good idea; grains will make it faster",
          "Use EF Core with optimistic concurrency and, if needed, a Redis cache; Orleans solves a problem you do not have",
          "Use Orleans only for the invoice grain and SQL for the rest",
          "Use Dapr actors instead because they are simpler",
        ],
        answer: 1,
        explanation:
          "Low entity count, low contention and relational reporting are the SQL sweet spot. Orleans adds a cluster to run and a model to learn for no benefit, and the same is true of Dapr actors.",
      },
      {
        id: "orleans-actors-q3",
        prompt:
          "Someone adds an `AllDevicesGrain` that keeps a list of every device and is called on each telemetry message. What is the problem?",
        options: [
          "Grain names cannot start with `All`",
          "It is a single-threaded bottleneck holding ever-growing state; aggregates belong in streams or a read model",
          "It will not persist because lists are not serialisable",
          "It needs a reminder to stay alive",
        ],
        answer: 1,
        explanation:
          "A grain processes one call at a time, so routing every message through one grain serialises the whole system and its state grows without bound. Cross-entity aggregation is the job of streams, projections or a read model.",
      },
    ],
    sources: [
      {
        title: "Microsoft Orleans documentation",
        url: "https://learn.microsoft.com/dotnet/orleans/",
      },
      {
        title: "Microsoft Orleans overview",
        url: "https://learn.microsoft.com/dotnet/orleans/overview",
      },
    ],
  },
  {
    id: "aspire-dapr",
    trackId: "dotnet-distributed",
    title: ".NET Aspire and Dapr",
    tagline:
      "Aspire runs and wires your system in development; Dapr gives it portable building blocks.",
    level: 2,
    minutes: 7,
    summary:
      ".NET Aspire is a C# model of your whole system that runs it locally with service discovery, a telemetry dashboard and a deployment path to Azure Container Apps. Dapr is a sidecar runtime that gives services portable pub/sub, state, secrets and workflows. They overlap on discovery and telemetry and otherwise solve different problems. Most teams should adopt Aspire early and Dapr only once there are several services to glue.",
    sections: [
      {
        heading: "The baseline: docker compose and a wiki page",
        body: 'A typical .NET team runs SQL Server, Redis and perhaps the Azure Service Bus emulator from a `docker-compose.yml`, starts two or three projects with `dotnet run`, and keeps connection strings in `appsettings.Development.json` plus a wiki page titled "how to run locally" that is wrong within a month.\n\nThis works for one API and one database and it is still the right baseline for that case. It frays as the system grows: ports collide, environment variables drift between developers, nobody runs the worker because it needs a queue, telemetry is a `Console.WriteLine`, and the first day for a new developer is spent on setup. Both tools in this lesson are answers to that fraying, and both are optional until it happens.',
      },
      {
        heading: ".NET Aspire",
        body: 'Aspire adds an **AppHost** project that describes the system in C#:\n\n```csharp\nvar builder = DistributedApplication.CreateBuilder(args);\nvar sql = builder.AddSqlServer("sql").AddDatabase("orders");\nvar cache = builder.AddRedis("cache");\nvar api = builder.AddProject<Projects.Orders_Api>("api")\n    .WithReference(sql).WithReference(cache);\nbuilder.AddProject<Projects.Billing_Worker>("billing").WithReference(sql);\nbuilder.Build().Run();\n```\n\nRunning the AppHost starts the containers and projects, injects connection strings and service URLs by **name**, and opens a **dashboard** with structured logs, distributed traces and metrics for everything. A **ServiceDefaults** project gives each service OpenTelemetry, health endpoints and resilient `HttpClient` defaults in one call. **Integrations** (client packages for SQL Server, Cosmos DB, Service Bus, Redis, Blob Storage and many more) register the right client with telemetry and health checks already wired.\n\nFor deployment, the same model feeds `azd` to provision and deploy to **Azure Container Apps**, and the Aspire CLI can publish docker compose or Kubernetes manifests. `Aspire.Hosting.Testing` starts the whole model inside an integration test. In production, Aspire is not a runtime: Container Apps or Kubernetes runs the services; Aspire described them.',
      },
      {
        heading: "Dapr",
        body: 'Dapr runs a **sidecar** next to each service and exposes **building blocks** over HTTP and gRPC: service invocation with mTLS and retries, **pub/sub**, **state management**, input and output **bindings**, secrets, configuration, **actors**, **workflow**, cryptography and jobs. Each block is backed by a **component** declared in YAML: pub/sub over Azure Service Bus in production and Redis locally, state in Cosmos DB or Azure Table Storage, secrets from Key Vault. The application code calls `DaprClient.PublishEventAsync("pubsub", "orders", evt)` and never references a broker SDK.\n\nOn **Azure Container Apps** the sidecar is managed: enable Dapr on the app, point it at components defined in the environment, and the platform injects it. On AKS you install the Dapr control plane yourself. Locally, the Dapr CLI runs sidecars, and the Aspire Community Toolkit has a Dapr integration that starts them from the AppHost.\n\nDapr Workflow deserves a mention: durable, code-first orchestrations in the Durable Functions style, hosted in your own service rather than in Functions.',
      },
      {
        heading: "How they relate and overlap",
        body: "Aspire is **development-time orchestration and deployment description**. Dapr is a **runtime abstraction** your code calls in every environment. They are complementary and they overlap in three places.\n\n- **Service discovery.** Aspire injects `https+http://api` style names resolved by configuration; Dapr routes `invoke/api/method/orders` through the sidecar by app id. Use one convention per solution.\n- **Telemetry.** Both emit OpenTelemetry. With Dapr the sidecar adds its own spans, so traces show the extra hop.\n- **Resilience.** Aspire ServiceDefaults add Polly-based `HttpClient` handlers; Dapr has declarative resiliency policies on the sidecar. Doubling them produces retries of retries.\n\nTypical combinations: Aspire alone with plain SDKs and MassTransit or Service Bus directly (most teams); Dapr alone on Container Apps with compose for local runs (teams coming from Kubernetes); both, with Aspire starting the sidecars locally and `azd` deploying Dapr-enabled Container Apps.",
      },
      {
        heading: "When each is worth adopting",
        body: "**Aspire** is worth adopting the day a solution has two projects and one backing service. It costs an AppHost and a ServiceDefaults project, it replaces the compose file and the wiki page, it gives you traces on day one, and it is easy to remove because the services themselves do not depend on it. The dashboard alone changes how developers debug.\n\n**Dapr** is worth adopting when several services on Container Apps need pub/sub, state and secrets, the team does not want to write and maintain broker and retry code per service, portability across clouds or brokers is a real requirement, or a Dapr Workflow replaces a hand-written saga. It is not worth it for one API with a database, nor for teams already productive with MassTransit, EF Core and the Azure SDKs, because the sidecar adds a hop per call, YAML per component, one more version to track and one more thing to debug when a message does not arrive.",
      },
      {
        heading: "Common mistakes",
        body: '- Treating Aspire as a production orchestrator. It describes and deploys; Container Apps or Kubernetes runs.\n- Hard-coding secrets in the AppHost. Use parameters, user secrets locally and Key Vault references in Azure.\n- Using the Dapr state store as a database. It is a key-value API with no queries beyond the optional query API; relational data still belongs in SQL.\n- Publishing through Dapr pub/sub without idempotent consumers. Delivery is at least once, like every broker.\n- Running both MassTransit and Dapr pub/sub in one system and losing track of which messages go where.\n- Forgetting the sidecar in integration tests, so tests pass locally without Dapr and fail in Container Apps.\n- Skipping ServiceDefaults because "we already have logging", then rebuilding OpenTelemetry wiring by hand per service.',
      },
    ],
    diagram: {
      caption:
        "Aspire starts and wires everything locally and emits the deployment model; Dapr sidecars carry pub/sub and state at runtime.",
      nodes: [
        {
          id: "apphost",
          label: ".NET Aspire AppHost",
          sub: "resource graph + dashboard",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "api",
          label: "Orders API",
          sub: "ASP.NET Core",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "worker",
          label: "Billing worker",
          sub: "subscriber",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "sql",
          label: "SQL Server",
          sub: "container locally",
          col: 2,
          row: 0,
          kind: "data",
        },
        {
          id: "sidecar",
          label: "Dapr sidecar",
          sub: "pub/sub, state, secrets",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "bus",
          label: "Service Bus",
          sub: "emulator or Azure",
          col: 3,
          row: 1,
          kind: "queue",
        },
        {
          id: "state",
          label: "State store",
          sub: "Redis or Cosmos DB",
          col: 3,
          row: 2,
          kind: "data",
        },
        {
          id: "aca",
          label: "Container Apps",
          sub: "azd up from the model",
          col: 4,
          row: 1,
          kind: "external",
        },
      ],
      edges: [
        { from: "apphost", to: "api", label: "starts, injects config" },
        { from: "apphost", to: "worker" },
        {
          from: "apphost",
          to: "sql",
          label: "runs container",
          style: "dashed",
        },
        { from: "api", to: "sql" },
        { from: "api", to: "sidecar", label: "localhost HTTP/gRPC" },
        { from: "sidecar", to: "bus", label: "publish" },
        { from: "sidecar", to: "state", label: "save state" },
        { from: "bus", to: "worker", label: "deliver via its sidecar" },
        {
          from: "apphost",
          to: "aca",
          label: "deployment model",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "One F5 locally",
          nodeIds: ["api", "worker", "sql", "sidecar"],
        },
      ],
    },
    useWhen: [
      "A new developer needs more than an hour to run the system locally",
      "The solution has several projects and backing services and nobody runs the worker",
      "You want traces, logs and metrics across services without wiring OpenTelemetry by hand",
      "Several Container Apps need pub/sub, state and secrets without broker SDK code in each",
    ],
    avoidWhen: [
      "One API and one database, where `dotnet run` and a connection string are enough",
      "The team is already productive with MassTransit, EF Core and the Azure SDKs and has no portability need",
      "Every millisecond matters and a sidecar hop per call is unacceptable",
    ],
    microsoftStack: [
      {
        name: ".NET Aspire AppHost",
        role: "C# model of projects, containers and cloud resources that runs locally.",
      },
      {
        name: "Aspire ServiceDefaults",
        role: "OpenTelemetry, health checks and resilient HttpClient defaults per service.",
      },
      {
        name: "Aspire dashboard",
        role: "Logs, traces and metrics for every resource while developing.",
      },
      {
        name: "Azure Developer CLI (azd)",
        role: "Provisions and deploys the Aspire model to Azure Container Apps.",
      },
      {
        name: "Dapr on Azure Container Apps",
        role: "Managed sidecars with components for Service Bus, Cosmos DB, Key Vault.",
      },
      {
        name: "Azure Service Bus emulator",
        role: "Local broker for compose or Aspire runs without an Azure subscription.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 0,
        note: "Aspire removes compose and env wiring; Dapr adds a sidecar and YAML.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Day-one local runs and telemetry; fewer broker clients to write.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "OpenTelemetry by default and one deployment model.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Swap a Dapr component or an Aspire resource without touching service code.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "Every Dapr call is an extra local hop; Aspire costs nothing at runtime.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "azd and manifests from the model replace hand-written infrastructure for small systems.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Aspire.Hosting.Testing runs the real system in integration tests.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Both are free; sidecars consume a little CPU and memory per replica.",
      },
    ],
    related: [
      "microservices",
      "messaging-outbox-saga",
      "azure-compute-choices",
      "observability",
    ],
    checks: [
      {
        id: "aspire-dapr-q1",
        prompt:
          "New developers spend two days getting four projects, SQL Server and Redis running locally. What is the cheapest fix?",
        options: [
          "A longer wiki page with screenshots",
          "An Aspire AppHost that starts the containers and projects and injects the connections",
          "Dapr sidecars so each service finds the others",
          "Moving development to a shared Azure environment",
        ],
        answer: 1,
        explanation:
          "Local orchestration is exactly what the AppHost does, with the dashboard as a bonus. Dapr solves runtime integration, not setup; a shared cloud environment makes every developer's change visible to everyone else.",
      },
      {
        id: "aspire-dapr-q2",
        prompt:
          'A team with one ASP.NET Core API and one Azure SQL database wants Dapr "to be ready for microservices". Advice?',
        options: [
          "Adopt Dapr now so the code is portable later",
          "Skip Dapr; there is nothing to glue yet, and the sidecar adds a hop and configuration for no benefit",
          "Adopt Dapr actors to structure the domain",
          "Adopt Dapr state management instead of EF Core",
        ],
        answer: 1,
        explanation:
          "Dapr pays off when several services need pub/sub, state and secrets. For one API it is cost without benefit, and its state store is a key-value API that would be a step down from EF Core and SQL.",
      },
      {
        id: "aspire-dapr-q3",
        prompt: "Which statement about .NET Aspire in production is correct?",
        options: [
          "Aspire replaces Kubernetes and Container Apps as the runtime orchestrator",
          "Aspire describes the system and deploys it through azd or manifests; Container Apps or Kubernetes runs it",
          "Aspire requires Dapr to run in Azure",
          "Aspire only works for local development and has no deployment story",
        ],
        answer: 1,
        explanation:
          "The AppHost is a model, not a runtime. It feeds azd and manifest publishers; the platform runs the containers. Dapr is optional, and the deployment story is a core part of the product.",
      },
    ],
    sources: [
      {
        title: ".NET Aspire documentation",
        url: "https://learn.microsoft.com/dotnet/aspire/",
      },
      {
        title: "Azure Container Apps: Dapr integration",
        url: "https://learn.microsoft.com/azure/container-apps/dapr-overview",
      },
    ],
  },
];
