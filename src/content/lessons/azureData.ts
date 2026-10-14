import type { Lesson } from "../types";

/**
 * Track: Azure hosting and data. Eight lessons on picking compute, messaging,
 * storage, data access, caching, tenancy, identity and the subscription
 * scaffolding for a .NET workload on Azure.
 */
export const AZURE_DATA_LESSONS: Lesson[] = [
  {
    id: "azure-compute-choices",
    trackId: "azure-data",
    title: "Azure compute choices",
    tagline:
      "A ladder from Static Web Apps to AKS, climbed only as far as the workload demands.",
    level: 1,
    minutes: 8,
    summary:
      "Azure offers six mainstream places to run a .NET backend or a React front end, and they differ mainly in how much operational responsibility you take on. This lesson orders them as a ladder, explains what each rung buys you, and gives a rule for stopping at the lowest rung that fits.",
    sections: [
      {
        heading: "The ladder, least to most responsibility",
        body: "Read the options from the rung with the least to run yourself to the rung with the most:\n\n- **Azure Static Web Apps**: static files plus an optional managed Functions API. Nothing to patch, nothing to scale. This is where a Vite-built React SPA belongs by default.\n- **Azure Functions**: event-driven code; you own functions, Azure owns the host. Scale-to-zero on the Consumption and Flex Consumption plans.\n- **Azure App Service**: a managed web host for an ASP.NET Core app. You pick a plan size and a deployment slot strategy; Azure patches the OS and runtime.\n- **Azure Container Apps**: serverless containers on a managed Kubernetes you never see. Scale-to-zero, KEDA scalers, Dapr sidecars, revisions and traffic splitting.\n- **Azure Kubernetes Service**: a real cluster. You own node pools, upgrades, networking add-ons, ingress and cluster security.\n- **Virtual Machines**: you own everything from the OS up.\n\nThe decision rule is simple: start at the top and move down only when a concrete requirement cannot be met one rung higher. Each step down adds a skill the team must keep for the life of the system.",
      },
      {
        heading: "App Service versus Container Apps",
        body: "These two rungs cover most .NET APIs, so the choice between them matters most.\n\n**App Service** is the right default for a single ASP.NET Core deployable that runs all day: a public API, a server-rendered site, a BFF. Deployment slots give you a warm swap, Easy Auth handles Entra ID at the edge, and `dotnet publish` plus a zip deploy is the whole pipeline. Pricing is per plan, not per request, so an idle app still costs its plan.\n\n**Container Apps** fits when you have more than one container, when traffic is bursty enough that scale-to-zero pays, or when you want KEDA to scale on a Service Bus queue length rather than on HTTP load. The **Dapr** sidecar adds service invocation, pub/sub and state APIs without a library choice in your code, which is how .NET Aspire deploys by default. Revisions let you run two versions side by side and split traffic, which App Service slots only approximate.\n\nThe cost shape differs: Container Apps bills on vCPU-seconds and memory with a free grant, so a nightly batch job or a low-traffic internal API is cheaper there, while a steady, always-busy API is usually cheaper on a reserved App Service plan.",
      },
      {
        heading: "When AKS is actually needed",
        body: "Teams reach for AKS because it sounds like the serious option. It is the right call in a short list of situations:\n\n- You need a Kubernetes feature Container Apps hides: custom CNI, node-level DaemonSets, GPU node pools, Windows node pools, a specific service mesh, or operators such as cert-manager with custom CRDs.\n- You are moving an existing Helm-based platform and the manifests are the asset.\n- You run dozens of services and want one cluster-wide policy, networking and observability model owned by a platform team.\n- Compliance requires a node you control, or a private cluster with no public control plane.\n\nIf none of those apply, Container Apps gives you the same containers, the same scale, and no cluster upgrade calendar. A team of five with three services does not need AKS, and the time spent on ingress controllers and node image upgrades comes straight out of feature work.\n\nVMs sit below AKS for legacy Windows services, licensed software that needs a specific OS, or a database engine you must run yourself. For new .NET work they are almost never the answer.",
      },
      {
        heading: "Functions and Static Web Apps in the picture",
        body: "**Azure Functions** is for code that runs in response to something: a timer, a queue message, a blob landing, an HTTP webhook. The isolated worker model on .NET 10 is the one to use. Durable Functions adds orchestration for long-running workflows. Do not host a full ASP.NET Core API as a bag of HTTP-triggered functions; once you want middleware, filters, OpenAPI and a DI graph you are rebuilding App Service with worse tooling.\n\n**Static Web Apps** hosts the React build output on a global CDN, provides preview environments per pull request, and can front an API hosted elsewhere through its `linked backend` feature so the browser sees one origin and no CORS. The Standard plan adds custom auth and private endpoints. A React SPA on App Service works, and it pays plan pricing for files a CDN serves better.\n\nA common complete shape is Static Web Apps for the SPA, one Container App or App Service for the ASP.NET Core API, and Functions for queue-driven background work. That is three rungs, each at the lowest level that fits.",
      },
      {
        heading: "How to decide",
        body: "Ask these in order and stop at the first yes:\n\n- Is it static files or a SPA? Static Web Apps.\n- Is it triggered by events, timers or queues and finishes in minutes? Functions.\n- Is it one always-on web app with a boring deployment story? App Service.\n- Is it several containers, bursty load, a Dapr or Aspire app, or scale-to-zero matters? Container Apps.\n- Do you need a Kubernetes feature by name, or own a platform team? AKS.\n- Does it need its own OS? VMs.\n\nTwo mistakes recur. The first is picking AKS for a future that never arrives and paying for it every week. The second is scattering one product across all six rungs because each team chose independently; agree the default rungs for the organisation and treat a departure as a decision worth an ADR.",
      },
    ],
    diagram: {
      caption:
        "The ladder of operational responsibility. Climb down only when a requirement forces it.",
      nodes: [
        {
          id: "swa",
          label: "Static Web Apps",
          sub: "React SPA on a CDN",
          col: 0,
          row: 0,
          kind: "ui",
        },
        {
          id: "func",
          label: "Azure Functions",
          sub: "events, timers, queues",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "appsvc",
          label: "App Service",
          sub: "one ASP.NET Core app",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "aca",
          label: "Container Apps",
          sub: "KEDA, Dapr, scale to 0",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "aks",
          label: "AKS",
          sub: "you own the cluster",
          col: 4,
          row: 2,
          kind: "service",
        },
        {
          id: "vm",
          label: "Virtual Machines",
          sub: "you own the OS",
          col: 4,
          row: 3,
          kind: "external",
        },
        {
          id: "note",
          label: "More to operate",
          sub: "further right and down",
          col: 1,
          row: 3,
          kind: "note",
        },
      ],
      edges: [
        { from: "swa", to: "func", label: "needs event code", style: "dashed" },
        {
          from: "func",
          to: "appsvc",
          label: "needs a full web app",
          style: "dashed",
        },
        {
          from: "appsvc",
          to: "aca",
          label: "needs containers, KEDA",
          style: "dashed",
        },
        {
          from: "aca",
          to: "aks",
          label: "needs a k8s feature",
          style: "dashed",
        },
        { from: "aks", to: "vm", label: "needs the OS", style: "dashed" },
      ],
      groups: [
        { label: "Serverless", nodeIds: ["swa", "func", "aca"] },
        { label: "You run it", nodeIds: ["aks", "vm"] },
      ],
    },
    useWhen: [
      "You are choosing hosting for a new ASP.NET Core API or React app and want the lowest rung that fits",
      "A single always-on web app with slots and Easy Auth is all you need: App Service",
      "Queue-driven or bursty work where scale-to-zero saves real money: Functions or Container Apps",
      "Several containers wired by .NET Aspire or Dapr: Container Apps",
      "A named Kubernetes feature or a platform team with many services: AKS",
    ],
    avoidWhen: [
      "Picking AKS because it feels future-proof while the team has no one to run a cluster",
      "Hosting a React SPA on an App Service plan when Static Web Apps serves it from a CDN for less",
      "Rebuilding a full ASP.NET Core API as dozens of HTTP-triggered Functions",
    ],
    microsoftStack: [
      {
        name: "Azure Static Web Apps",
        role: "Hosts the Vite build output with PR previews and a linked backend for same-origin APIs.",
      },
      {
        name: "Azure Functions (isolated worker)",
        role: "Event, timer and queue triggers; Durable Functions for orchestration.",
      },
      {
        name: "Azure App Service",
        role: "Managed host for one ASP.NET Core deployable with slots and Easy Auth.",
      },
      {
        name: "Azure Container Apps",
        role: "Serverless containers with KEDA scalers, Dapr sidecars and revisions; the default .NET Aspire target.",
      },
      {
        name: "Azure Kubernetes Service",
        role: "A full cluster for teams that need Kubernetes features by name.",
      },
      {
        name: "azd (Azure Developer CLI)",
        role: "Provisions and deploys Aspire apps to Container Apps with one command.",
      },
    ],
    reactStack: [
      {
        name: "Vite build on Static Web Apps",
        role: "`npm run build` output deploys straight to the CDN with a `staticwebapp.config.json` for SPA routing.",
      },
      {
        name: "Linked backend",
        role: "Routes `/api` to the ASP.NET Core app so the SPA never needs CORS.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 2,
        note: "Picking the highest fitting rung removes whole categories of work compared with running a cluster.",
      },
      {
        attribute: "time-to-market",
        effect: 2,
        note: "Static Web Apps and App Service deploy from a pipeline in an afternoon.",
      },
      {
        attribute: "scalability",
        effect: 0,
        note: "Every rung scales; the lower rungs just let you tune how.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Cold starts on scale-to-zero plans are the one cost; always-on plans avoid them.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "Slots and revisions give safe swaps without a GitOps setup.",
      },
      {
        attribute: "team-autonomy",
        effect: -1,
        note: "Managed rungs constrain runtime choices; AKS gives teams more rope.",
      },
      {
        attribute: "operability",
        effect: 2,
        note: "No node upgrades, no ingress controllers, no cluster certificates to rotate.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Scale-to-zero and CDN hosting are cheaper for bursty or static workloads than a cluster kept warm.",
      },
    ],
    related: [
      "aspire-dapr",
      "serverless-durable-functions",
      "aspnet-react-hosting",
      "cicd-and-environments",
    ],
    checks: [
      {
        id: "azure-compute-choices-q1",
        prompt:
          "A team of four runs one ASP.NET Core API with steady daytime traffic and wants blue-green deploys. Which rung fits?",
        options: [
          "AKS with two node pools",
          "App Service with deployment slots",
          "Azure Functions with HTTP triggers",
          "A Virtual Machine Scale Set",
        ],
        answer: 1,
        explanation:
          "One always-on web app with a swap-based deploy is exactly what App Service slots provide. AKS adds a cluster to run for no feature this team needs, and splitting an API into HTTP Functions loses middleware and OpenAPI tooling.",
      },
      {
        id: "azure-compute-choices-q2",
        prompt:
          "Which requirement genuinely pushes a workload from Container Apps to AKS?",
        options: [
          "The app must scale on Service Bus queue length",
          "The app needs a Dapr sidecar",
          "The app needs a GPU node pool and a custom CNI",
          "The app has three containers that talk to each other",
        ],
        answer: 2,
        explanation:
          "GPU pools and custom networking are cluster-level features Container Apps does not expose. KEDA scaling, Dapr and multi-container apps are all native to Container Apps, so they are reasons to stay there.",
      },
      {
        id: "azure-compute-choices-q3",
        prompt:
          "Where should a Vite-built React SPA with a separate ASP.NET Core API be hosted by default?",
        options: [
          "On the same App Service plan as the API, served from wwwroot",
          "Azure Static Web Apps with a linked backend",
          "An Azure Function that returns index.html",
          "A Container App running nginx",
        ],
        answer: 1,
        explanation:
          "Static Web Apps serves the build output from a CDN, gives PR previews, and the linked backend keeps the API same-origin. Serving from the API's wwwroot works but ties static files to the API's plan and deploy cadence.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Choose an Azure compute service",
        url: "https://learn.microsoft.com/azure/architecture/guide/technology-choices/compute-decision-tree",
      },
      {
        title: "Azure Container Apps documentation",
        url: "https://learn.microsoft.com/azure/container-apps/",
      },
      {
        title: "Azure Static Web Apps documentation",
        url: "https://learn.microsoft.com/azure/static-web-apps/",
      },
    ],
  },
  {
    id: "azure-messaging-choices",
    trackId: "azure-data",
    title: "Azure messaging choices",
    tagline:
      "Commands go on a queue, events go to a topic or grid, streams go to a hub. Pick by shape.",
    level: 2,
    minutes: 7,
    summary:
      "Azure has four messaging services that overlap just enough to confuse: Storage Queues, Service Bus, Event Grid and Event Hubs. The right one follows from whether you are sending a command, announcing an event, or shipping a stream, and from how much you need ordering, sessions, dead-lettering and duplicate detection.",
    sections: [
      {
        heading: "Commands, events and streams",
        body: "Sort the message first, then the service.\n\n- A **command** is work for one receiver: `GenerateInvoice`, `SendWelcomeEmail`. It should be processed once, may need ordering per customer, and must not be lost. Commands belong on a **queue**.\n- An **event** is a fact that already happened: `OrderPlaced`, `BlobCreated`. The sender does not care who listens. Events belong on a **topic** (Service Bus) or a **grid** (Event Grid) with many subscribers.\n- A **stream** is a high-volume, append-only flow of records: telemetry, clickstream, change feeds. Consumers read by offset and replay. Streams belong on **Event Hubs**.\n\nMost line-of-business .NET systems are mostly commands and a few events. Treating everything as a stream, or putting commands on Event Grid, produces systems that are hard to reason about when something goes wrong.",
      },
      {
        heading: "The four services side by side",
        body: "**Azure Storage Queues** are the cheap, simple option: a queue in a storage account, visibility timeout, at-least-once delivery, messages up to 64 KB, no ordering guarantee, no topics, no dead-letter queue built in (you implement poison handling with the dequeue count). Right for one producer, one consumer and a tolerant workload.\n\n**Azure Service Bus** is the enterprise broker: queues and topics with subscriptions and SQL-like filters, **sessions** for ordered per-key processing, built-in **dead-letter queues**, **duplicate detection** on message id, scheduled delivery, transactions across send and complete, and peek-lock with lock renewal. Premium tier gives dedicated capacity and predictable latency.\n\n**Azure Event Grid** is a push-based event router. Azure services publish into it natively (Blob Storage, Resource Manager, Container Registry) and it delivers to webhooks, Functions, Service Bus or Storage Queues with retries and a dead-letter blob. It is for reactive, lightweight events, and its namespace topics add MQTT and pull delivery.\n\n**Azure Event Hubs** is a partitioned log with consumer groups, offsets and retention measured in days. It speaks AMQP and the Kafka protocol, so Kafka clients work unchanged. It is for millions of events per hour, not for a work queue.",
      },
      {
        heading: "Ordering, sessions, dead-lettering, duplicates",
        body: "These four properties decide between Storage Queues and Service Bus more often than throughput does.\n\n**Ordering**: a Service Bus queue is FIFO for a single receiver, but competing consumers break that. Use **sessions** with a session id such as the customer or order id; one receiver owns a session at a time, so messages for one key are processed in order while other keys proceed in parallel. Storage Queues offer no ordering at all.\n\n**Dead-lettering**: Service Bus moves a message to the dead-letter subqueue after `MaxDeliveryCount` failed attempts, or when a filter cannot evaluate, or when you dead-letter it explicitly with a reason. That subqueue is your operational safety net and should have an alert on its depth. Event Grid dead-letters to a storage container after its retry schedule.\n\n**Duplicate detection**: Service Bus can remember message ids for a window and drop repeats, which makes an outbox publisher idempotent at the broker. Your handlers should still be idempotent, because at-least-once delivery means a lock can expire mid-processing.\n\n**Event Hubs** has none of these per-message features. Ordering is per partition, there is no dead-letter, and the consumer tracks its own checkpoint.",
      },
      {
        heading: "Price and throughput shape",
        body: "The billing models are different enough to drive the decision for small teams.\n\n- Storage Queues bill per operation and per GB; a few million messages a month costs very little.\n- Service Bus Basic is per million operations; Standard adds topics and a base charge; Premium is per messaging unit, always on, and priced for steady enterprise load.\n- Event Grid bills per million operations with a free monthly allowance.\n- Event Hubs Standard bills per throughput unit plus ingress; Premium and Dedicated are capacity reserved.\n\nThroughput tells the same story. A Storage Queue handles a few thousand messages per second per queue. Service Bus Standard is fine for most business systems and Premium reaches much higher with predictable latency. Event Hubs is built for sustained ingest that would overwhelm a broker. If you are not sure whether you have a stream, you do not; use Service Bus.",
      },
      {
        heading: "Typical pairings and how to decide",
        body: "On Functions and Container Apps the pairings are well trodden:\n\n- A **Service Bus trigger** on a Function, or a Container App scaled by the **KEDA Service Bus scaler**, is the standard command processor. Peek-lock, auto-complete off, and `MaxConcurrentCalls` tuned to the database you are protecting.\n- **Event Grid to Function** for reacting to Azure platform events such as a file arriving in Blob Storage.\n- **Event Hubs trigger** with batch processing for telemetry, writing to Azure Data Explorer or a time-series store.\n- .NET Aspire wires Service Bus and Event Hubs as resources with emulators for local runs.\n\nDecision rule: one consumer, tolerant of reordering and occasional repeats, tiny budget: Storage Queues. Anything that needs sessions, dead-letters, topics or transactions: Service Bus. Reacting to Azure events or fanning out lightweight notifications to webhooks: Event Grid. Replayable high-volume streams or a Kafka-compatible endpoint: Event Hubs. Do not pick Event Hubs for a work queue because the number sounds impressive; the absence of dead-lettering will cost you an on-call night.",
      },
    ],
    diagram: {
      caption:
        "Commands on a Service Bus queue with sessions, events fanned out by topic and Event Grid, telemetry on Event Hubs.",
      nodes: [
        {
          id: "api",
          label: "Ordering API",
          sub: "ASP.NET Core",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "sbq",
          label: "Service Bus queue",
          sub: "sessions, DLQ, dedupe",
          col: 1,
          row: 0,
          kind: "queue",
        },
        {
          id: "sbt",
          label: "Service Bus topic",
          sub: "OrderPlaced",
          col: 1,
          row: 2,
          kind: "queue",
        },
        {
          id: "worker",
          label: "Invoice worker",
          sub: "Container App + KEDA",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "sub",
          label: "Email subscriber",
          sub: "Functions trigger",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "eg",
          label: "Event Grid",
          sub: "Blob, platform events",
          col: 3,
          row: 1,
          kind: "queue",
        },
        {
          id: "eh",
          label: "Event Hubs",
          sub: "telemetry stream",
          col: 3,
          row: 3,
          kind: "queue",
        },
        {
          id: "devices",
          label: "Devices / web",
          sub: "clickstream",
          col: 4,
          row: 3,
          kind: "external",
        },
      ],
      edges: [
        { from: "api", to: "sbq", label: "GenerateInvoice" },
        { from: "sbq", to: "worker", label: "peek-lock" },
        { from: "api", to: "sbt", label: "OrderPlaced (outbox)" },
        { from: "sbt", to: "sub", label: "subscription filter" },
        { from: "eg", to: "sub", label: "BlobCreated", style: "dashed" },
        { from: "devices", to: "eh", label: "millions/hour" },
      ],
      groups: [
        { label: "Commands", nodeIds: ["sbq", "worker"] },
        { label: "Events", nodeIds: ["sbt", "sub", "eg"] },
      ],
    },
    useWhen: [
      "Work must be processed exactly in order per customer or order: Service Bus sessions",
      "A failed message must be kept for inspection rather than dropped: Service Bus dead-letter queue",
      "Several independent subscribers react to the same fact: Service Bus topic or Event Grid",
      "You must react to Azure platform events such as a blob landing: Event Grid",
      "Telemetry or clickstream at sustained high volume with replay: Event Hubs",
    ],
    avoidWhen: [
      "A single tolerant consumer on a tiny budget, where Storage Queues already suffice",
      "Using Event Hubs as a work queue because it sounds scalable; it has no dead-lettering",
      "Routing commands through Event Grid, which is designed for notifications, not work",
    ],
    microsoftStack: [
      {
        name: "Azure Service Bus",
        role: "Queues and topics with sessions, dead-lettering, duplicate detection and transactions.",
      },
      {
        name: "Azure Storage Queues",
        role: "The cheapest at-least-once queue for simple one-consumer workloads.",
      },
      {
        name: "Azure Event Grid",
        role: "Push delivery of platform and custom events to webhooks, Functions and queues.",
      },
      {
        name: "Azure Event Hubs",
        role: "Partitioned, replayable stream ingest with a Kafka-compatible endpoint.",
      },
      {
        name: "Azure Functions triggers and KEDA scalers",
        role: "Scale consumers on queue depth on Functions and Container Apps.",
      },
      {
        name: ".NET Aspire messaging integrations",
        role: "Service Bus and Event Hubs resources with local emulators.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Any broker is more to learn than a direct HTTP call; Service Bus more than Storage Queues.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Consumers scale on queue depth independently of producers.",
      },
      {
        attribute: "performance",
        effect: 0,
        note: "Latency rises by the broker hop; throughput rises by buffering.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "At-least-once delivery means handlers must be idempotent.",
      },
      {
        attribute: "reliability",
        effect: 2,
        note: "Dead-letter queues and retries turn transient failures into recoverable ones.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Topics let new subscribers appear without changing the publisher.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Dead-letter depth, lock expiry and subscription lag are new things to watch.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Cheap at low volume; Premium and Dedicated tiers are a step change.",
      },
    ],
    related: [
      "messaging-outbox-saga",
      "serverless-durable-functions",
      "event-sourcing",
      "realtime-signalr",
    ],
    checks: [
      {
        id: "azure-messaging-choices-q1",
        prompt:
          "Payment events for one customer must be processed in order, but customers can be processed in parallel. Which option?",
        options: [
          "A Storage Queue with one consumer",
          "A Service Bus queue with sessions keyed by customer id",
          "An Event Hub with one partition",
          "Event Grid with a webhook per customer",
        ],
        answer: 1,
        explanation:
          "Sessions give per-key ordering while different keys are processed concurrently. A single-partition Event Hub orders everything through one consumer with no dead-lettering, and Storage Queues do not guarantee order at all.",
      },
      {
        id: "azure-messaging-choices-q2",
        prompt:
          "A Function must run whenever a CSV lands in a Blob Storage container. Which service is the natural fit?",
        options: [
          "Event Grid blob-created events",
          "Service Bus topic polled by the Function",
          "Event Hubs with a storage sink",
          "A timer trigger that lists the container every minute",
        ],
        answer: 0,
        explanation:
          "Blob Storage publishes natively to Event Grid, which pushes to the Function with retries. A timer poll is late and wasteful; Service Bus and Event Hubs would need something else to publish into them first.",
      },
      {
        id: "azure-messaging-choices-q3",
        prompt:
          "Why is Event Hubs a poor choice for an invoice-generation work queue?",
        options: [
          "It cannot handle enough throughput",
          "It has no dead-letter queue or per-message completion, so failures need custom handling",
          "It only accepts Kafka clients",
          "It does not run on Azure Functions",
        ],
        answer: 1,
        explanation:
          "Event Hubs is a log: consumers checkpoint offsets and there is no per-message lock, complete or dead-letter. Throughput is its strength, it supports AMQP as well as Kafka, and Functions has a trigger for it.",
      },
    ],
    sources: [
      {
        title:
          "Azure Architecture Center: Choose between Azure messaging services",
        url: "https://learn.microsoft.com/azure/architecture/guide/technology-choices/messaging",
      },
      {
        title: "Azure Service Bus documentation",
        url: "https://learn.microsoft.com/azure/service-bus-messaging/",
      },
      {
        title: "Azure Event Grid documentation",
        url: "https://learn.microsoft.com/azure/event-grid/",
      },
    ],
  },
  {
    id: "sql-vs-cosmos",
    trackId: "azure-data",
    title: "Azure SQL versus Cosmos DB",
    tagline:
      "Relational integrity and reporting, or partition-keyed scale with RU pricing.",
    level: 2,
    minutes: 7,
    summary:
      "Azure SQL and Cosmos DB for NoSQL are both excellent and both frequently misapplied. Azure SQL is the default for business data that needs joins, constraints, transactions and reporting; Cosmos DB fits when access patterns are known in advance and must scale horizontally across regions. This lesson covers the cost model, consistency levels, partition-key design and the narrower fits of PostgreSQL, Table Storage and Redis.",
    sections: [
      {
        heading: "Start from Azure SQL",
        body: "For a .NET line-of-business system the sensible default is **Azure SQL Database**: foreign keys, unique constraints, multi-row transactions, ad hoc queries, mature tooling, and EF Core support that just works. Reporting people can point Power BI at it. Backups, point-in-time restore, geo-replication and failover groups are turned on with a switch.\n\nThe serverless compute tier pauses when idle and bills per vCore-second, so a dev or low-traffic environment costs little. Hyperscale removes the storage ceiling and adds named replicas for read scale-out. **SQL Server** on a VM or in a container still has a place when you need SQL Agent, CLR, FILESTREAM or a licence you already own, but new work should not start there.\n\nYou leave Azure SQL for a concrete reason, not because the word relational sounds slow. Most products never find that reason.",
      },
      {
        heading: "What Cosmos DB is good at",
        body: '**Azure Cosmos DB for NoSQL** is a globally distributed document store with single-digit millisecond reads at any scale, multi-region writes, automatic indexing and a change feed. It is a great fit when:\n\n- The access patterns are known and few: look up by id, list by partition, append.\n- Scale is horizontal by nature: per-tenant, per-device, per-user data that never needs a cross-partition join.\n- Users are on several continents and write latency matters locally.\n- You want the change feed as an event source for Functions, materialised views or search indexing.\n\nIt is a poor fit for ad hoc reporting, for data where constraints must hold across documents, and for teams who expect to add arbitrary queries later. Cross-partition queries work but cost RUs in proportion to the partitions touched, and there are no joins across containers. The usual outcome of "we chose Cosmos for a CRUD app" is a bill that surprises everyone and a nightly export to SQL for the reports.',
      },
      {
        heading: "RUs, partition keys and consistency",
        body: "Cosmos DB bills in **request units**: a normalised unit of CPU, memory and IO per operation. A 1 KB point read costs about 1 RU; a write costs more because every index is updated; a cross-partition query costs the sum across partitions. You pick provisioned throughput (with autoscale) or serverless, and a query that exceeds provisioned RUs is throttled with HTTP 429 rather than slowed. Design and cost are the same activity: a bad partition key is an expensive partition key.\n\n**Partition key** rules: choose a property with high cardinality that appears in most queries, so reads are single-partition. Tenant id, user id or device id are typical. A logical partition has a size limit, so one tenant with huge data needs a composite key such as tenant id plus month. Model documents around what is read together; denormalise and accept duplicate data rather than reach across partitions. Transactions are per logical partition, through transactional batch or stored procedures.\n\n**Consistency levels** run from strong, through bounded staleness, **session** (the default and usually right), consistent prefix, to eventual. Session gives read-your-own-writes within a client session at lower RU cost than strong. Choose strong only when a stale read is a bug, and expect higher latency and doubled read RUs for it.",
      },
      {
        heading: "The other stores worth a short look",
        body: "**Azure Database for PostgreSQL Flexible Server** enters when the team knows Postgres, wants JSONB, PostGIS or pgvector, or needs to avoid per-core SQL licensing in the price. EF Core supports it well through Npgsql, and the Azure experience (backups, HA, private networking) is comparable. It is a peer of Azure SQL, not a step down. Choose by team skill and extension needs.\n\n**Azure Table Storage** is a key-value store with a partition key and row key, no secondary indexes and very low cost. It suits logs, audit trails, lookup tables and configuration where every query is by key. Cosmos DB for Table is the same API with throughput guarantees when Table Storage runs out of road.\n\n**Azure Cache for Redis** is not a system of record. It is a cache, a session store, a rate limiter and a pub/sub channel. Data in it should be reconstructable from somewhere else. The caching lesson covers it properly.\n\n**Azure Blob Storage** holds files and large documents; keep the metadata in SQL or Cosmos and the bytes in Blob.",
      },
      {
        heading: "How to decide",
        body: "Ask in order:\n\n- Do you need joins, constraints or ad hoc reporting over this data? Azure SQL (or PostgreSQL if the team prefers it).\n- Is every access by a known key, with horizontal partitioning natural and global distribution wanted? Cosmos DB, with the partition key designed first.\n- Is it a key-value lookup with no query needs and a tiny budget? Table Storage.\n- Is it transient, derived, or a session? Redis.\n\nMixing is normal: orders and customers in Azure SQL, a per-device telemetry container in Cosmos DB, product images in Blob, hot catalogue pages in Redis. What is not normal is one store chosen for all four jobs. When two stores hold related data, decide which one is the source of truth and copy in one direction only, ideally through an outbox or the Cosmos change feed.",
      },
    ],
    diagram: {
      caption:
        "Relational system of record beside a partition-keyed document store, each used for what it does well.",
      nodes: [
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "EF Core + Cosmos SDK",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "orders, customers, FKs",
          col: 1,
          row: 0,
          kind: "data",
        },
        {
          id: "cosmos",
          label: "Cosmos DB NoSQL",
          sub: "pk: /tenantId",
          col: 1,
          row: 2,
          kind: "data",
        },
        {
          id: "pbi",
          label: "Power BI / reports",
          sub: "ad hoc SQL",
          col: 2,
          row: 0,
          kind: "external",
        },
        {
          id: "feed",
          label: "Change feed",
          sub: "Functions trigger",
          col: 2,
          row: 2,
          kind: "queue",
        },
        {
          id: "redis",
          label: "Azure Cache for Redis",
          sub: "hot reads, sessions",
          col: 1,
          row: 3,
          kind: "data",
        },
        {
          id: "search",
          label: "Search / views",
          sub: "materialised",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "api", to: "sql", label: "transactions, joins" },
        { from: "api", to: "cosmos", label: "point reads by key" },
        { from: "api", to: "redis", label: "cache-aside", style: "dashed" },
        { from: "sql", to: "pbi", label: "read replica" },
        { from: "cosmos", to: "feed" },
        { from: "feed", to: "search", label: "project" },
      ],
    },
    useWhen: [
      "Business data with relationships, constraints and reporting needs: Azure SQL or PostgreSQL",
      "Access is always by a known key, data partitions naturally by tenant or device, and multi-region writes matter: Cosmos DB",
      "The team is fluent in Postgres or needs JSONB, PostGIS or pgvector: PostgreSQL Flexible Server",
      "Key-only lookups such as audit logs or config on a small budget: Table Storage",
    ],
    avoidWhen: [
      "Choosing Cosmos DB for a CRUD app whose queries are not yet known; the RU bill will surprise you",
      "Running reports directly against a Cosmos container with cross-partition queries",
      "Treating Redis as a system of record for anything you cannot rebuild",
    ],
    microsoftStack: [
      {
        name: "Azure SQL Database",
        role: "Default relational system of record; serverless tier for dev, Hyperscale for growth.",
      },
      {
        name: "Azure Cosmos DB for NoSQL",
        role: "Partition-keyed documents with RU billing, change feed and multi-region writes.",
      },
      {
        name: "Azure Database for PostgreSQL Flexible Server",
        role: "Relational peer of Azure SQL with JSONB, PostGIS and pgvector.",
      },
      {
        name: "EF Core providers",
        role: "SQL Server, Npgsql and the Cosmos provider; the Cosmos provider is for simple document shapes.",
      },
      {
        name: "Azure Table Storage",
        role: "Cheap key-value storage for logs and lookups with no secondary indexes.",
      },
      {
        name: "Azure Cache for Redis",
        role: "Cache, session store and pub/sub, never the source of truth.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Cosmos DB moves integrity and query design into your code; SQL keeps it in the engine.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Partition-keyed containers scale writes horizontally and across regions.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Single-partition point reads are consistently fast; cross-partition queries are not.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Tunable consistency and per-partition transactions versus full ACID in SQL.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Multi-region replication is built in with SLAs on availability and latency.",
      },
      {
        attribute: "evolvability",
        effect: -1,
        note: "New query shapes that ignore the partition key are expensive to add later.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "No index tuning, but RU throttling and partition skew are new things to watch.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Predictable at known patterns; punishing for ad hoc or cross-partition workloads.",
      },
    ],
    related: [
      "ef-core-patterns",
      "multi-tenancy",
      "caching-strategies",
      "cqrs",
    ],
    checks: [
      {
        id: "sql-vs-cosmos-q1",
        prompt:
          "A SaaS app stores per-tenant activity records, always read by tenant and date, and serves customers in Europe and Australia. Which store?",
        options: [
          "Azure SQL with a tenant column",
          "Cosmos DB with partition key tenant id plus month",
          "Azure Table Storage",
          "Azure Cache for Redis",
        ],
        answer: 1,
        explanation:
          "Known key access, natural partitioning and multi-region reads are the Cosmos DB sweet spot; the composite key keeps a big tenant under the logical partition limit. Azure SQL works but needs read replicas per region, and Redis is not durable storage.",
      },
      {
        id: "sql-vs-cosmos-q2",
        prompt:
          "What happens when a Cosmos DB container receives more requests than its provisioned RUs?",
        options: [
          "Requests queue and complete more slowly",
          "Requests are rejected with HTTP 429 and the SDK retries after a delay",
          "The container scales up automatically in all modes",
          "Writes succeed but reads are served from a stale replica",
        ],
        answer: 1,
        explanation:
          "Cosmos DB throttles with 429 and a retry-after header; it does not queue. Autoscale raises the ceiling within a configured range, but even autoscale throttles at its maximum, so partition design still matters.",
      },
      {
        id: "sql-vs-cosmos-q3",
        prompt:
          "Which requirement most clearly argues for Azure SQL over Cosmos DB?",
        options: [
          "The data must be available in two regions",
          "Reads must complete in under ten milliseconds",
          "Finance needs ad hoc reports joining orders, customers and products",
          "Each tenant's data must be isolated",
        ],
        answer: 2,
        explanation:
          "Ad hoc joins across entities are what a relational engine does and what Cosmos DB does badly and expensively. Both stores handle multi-region, fast point reads and tenant isolation.",
      },
    ],
    sources: [
      {
        title: "Azure Architecture Center: Choose a data store",
        url: "https://learn.microsoft.com/azure/architecture/guide/technology-choices/data-store-overview",
      },
      {
        title: "Azure Cosmos DB documentation",
        url: "https://learn.microsoft.com/azure/cosmos-db/",
      },
      {
        title: "Azure SQL documentation",
        url: "https://learn.microsoft.com/azure/azure-sql/",
      },
    ],
  },
  {
    id: "ef-core-patterns",
    trackId: "azure-data",
    title: "EF Core patterns that hold up",
    tagline:
      "A scoped DbContext, few abstractions, migrations in the pipeline, Dapper for hot reads.",
    level: 2,
    minutes: 7,
    summary:
      "EF Core is the data access default on .NET, and most trouble with it comes from wrapping it in layers it does not need or from not knowing a handful of features. This lesson settles the DbContext lifetime question, the repository debate, and the features that matter in production: migrations in CI/CD, split queries, owned types, bulk updates, concurrency tokens and when to drop to Dapper.",
    sections: [
      {
        heading: "DbContext lifetime and scope",
        body: "A `DbContext` is a unit of work: it tracks changes and flushes them in one `SaveChangesAsync`. Register it **scoped** with `AddDbContext` and let one HTTP request or one message handler own one instance. It is not thread-safe and should never be a singleton; a captive DbContext inside a singleton service is the most common EF Core bug in review.\n\nOutside a request scope (a hosted service, a Blazor Server circuit, a parallel loop) use `AddDbContextFactory` and create a context per operation with `using var db = await factory.CreateDbContextAsync()`. `AddDbContextPool` reuses instances for a small throughput gain; it is fine for stateless APIs but not for contexts that hold per-request state in constructor injection.\n\nKeep the context small: one per module with its own schema, as in a modular monolith, rather than one 300-entity context for everything. Smaller models compile faster and make `MigrationsAssembly` ownership obvious.",
      },
      {
        heading: "The repository debate",
        body: "`DbContext` already implements the unit of work and `DbSet<T>` is already a repository. Wrapping them in `IRepository<T>` with `GetById`, `Add` and `Update` adds a layer that hides the one thing EF Core is good at (composable `IQueryable`) and usually leaks `IQueryable` anyway.\n\nA repository earns its place in two cases:\n\n- A **rich domain model** where aggregates must be loaded whole and the loading rules (includes, filters, tenant checks) are complex enough that you want them written once: `IOrderRepository.GetWithLines(orderId)`.\n- A boundary you genuinely swap: tests that run against SQLite or an in-memory fake, or a module that may move to Cosmos.\n\nOtherwise inject the `DbContext` into the handler and write the query where it is used. For reusable query logic, the **specification pattern** (Ardalis.Specification or a few extension methods on `IQueryable<Order>`) captures named filters such as `ActiveForTenant(tenantId)` without hiding the queryable. Vertical-slice handlers plus specifications beat generic repositories in almost every CRUD-heavy system.",
      },
      {
        heading: "Queries that stay fast",
        body: "- **Projection**: `Select` into a DTO for read endpoints; `AsNoTracking` when you do load entities you will not change.\n- **Split queries**: `AsSplitQuery()` when including several collections, to avoid the cartesian explosion of one giant join. Default single queries are right for one-to-one or a single collection.\n- **Compiled queries**: `EF.CompileAsyncQuery` for a hot path executed thousands of times a second; the gain is small per call and real at scale.\n- **Owned types** map value objects (`Address`, `Money`) into columns of the owner's table with no identity of their own; use `ComplexProperty` in recent versions for the same idea without tracking overhead.\n- **ExecuteUpdate and ExecuteDelete** run set-based SQL without loading entities. Use them for bulk status changes and purges; they bypass change tracking and interceptors, so audit logic must be in the statement.\n- **Global query filters** for soft delete and tenant scoping, with `IgnoreQueryFilters()` used deliberately and rarely.\n\nLog `DbCommand` at Information in development and read the SQL. Most N+1 and cartesian problems are visible in the first ten lines.",
      },
      {
        heading: "Migrations in CI/CD",
        body: "Migrations are code and go through the same pipeline as the app. The pattern that scales:\n\n- Developers run `dotnet ef migrations add` locally and commit the migration and the model snapshot.\n- The pipeline generates an idempotent script with `dotnet ef migrations script --idempotent` or builds a **migration bundle** with `dotnet ef migrations bundle`.\n- A deployment step runs the bundle against the target database using a managed identity, **before** the new app version starts receiving traffic.\n- Migrations are backward compatible for one release: add the column, deploy, backfill, then drop the old column in the next release. That is what makes slot swaps and rolling revisions safe.\n\nNever call `Database.MigrateAsync()` from `Program.cs` in production: several instances race, and the app's identity ends up needing DDL rights. For dev and local Aspire runs it is fine and convenient.\n\nUse **concurrency tokens** (`[Timestamp]` row version on SQL Server, or `IsConcurrencyToken` on a column) for entities edited by people; catch `DbUpdateConcurrencyException` and return a 409 or a merge prompt.",
      },
      {
        heading: "When Dapper belongs beside EF Core",
        body: "EF Core is the default for writes and for queries that follow the model. Dapper, or raw `SqlQuery<T>` in EF Core, belongs on hot read paths where you want the exact SQL you wrote, on reporting queries with window functions and CTEs that LINQ expresses badly, and on bulk reads where materialising tracked entities is pure waste.\n\nThe rule: one way to write, several ways to read. Keep writes in EF Core so change tracking, interceptors, outbox and concurrency tokens hold; let a handful of read endpoints use Dapper with hand-written SQL in the same handler. Share the connection string and the `SqlConnection` through `db.Database.GetDbConnection()` so both run inside one transaction when needed.\n\nFor true bulk insert of hundreds of thousands of rows, `SqlBulkCopy` or the EFCore.BulkExtensions package beats both. Measure before adding either; a batched `AddRange` with `SaveChanges` handles thousands of rows adequately.",
      },
    ],
    diagram: {
      caption:
        "A scoped DbContext per request, specifications for named filters, Dapper for a hot read, migrations applied by the pipeline.",
      nodes: [
        {
          id: "ep",
          label: "Minimal API endpoint",
          sub: "one request = one scope",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "handler",
          label: "Command handler",
          sub: "DbContext injected",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "spec",
          label: "Specification",
          sub: "ActiveForTenant(...)",
          col: 2,
          row: 0,
          kind: "note",
        },
        {
          id: "read",
          label: "Hot read handler",
          sub: "Dapper, hand SQL",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "row version tokens",
          col: 3,
          row: 1,
          kind: "data",
        },
        {
          id: "pipe",
          label: "Deploy pipeline",
          sub: "migration bundle",
          col: 3,
          row: 3,
          kind: "external",
        },
      ],
      edges: [
        { from: "ep", to: "handler", label: "writes" },
        { from: "ep", to: "read", label: "reads" },
        {
          from: "handler",
          to: "spec",
          label: "composes IQueryable",
          style: "dashed",
        },
        { from: "handler", to: "db", label: "SaveChangesAsync" },
        { from: "read", to: "db", label: "SELECT ... (Dapper)" },
        { from: "pipe", to: "db", label: "before traffic shifts" },
      ],
    },
    useWhen: [
      "A scoped DbContext per request or per message handler is the unit of work",
      "Several collection includes on one entity make the single-query result explode: use split queries",
      "A bulk status change or purge touches thousands of rows: ExecuteUpdate or ExecuteDelete",
      "Two users can edit the same record: add a row-version concurrency token",
      "A read endpoint is hot and the LINQ translation is awkward: Dapper beside EF Core",
    ],
    avoidWhen: [
      "A generic IRepository<T> over DbSet<T> that only re-exposes Add, Update and GetById",
      "Calling Database.Migrate() from Program.cs in production with multiple instances",
      "One DbContext with hundreds of entities shared by every module",
    ],
    microsoftStack: [
      {
        name: "EF Core 10",
        role: "Change tracking, LINQ translation, migrations, interceptors and global query filters.",
      },
      {
        name: "AddDbContext / AddDbContextFactory",
        role: "Scoped lifetime for requests; a factory for hosted services and Blazor circuits.",
      },
      {
        name: "dotnet ef migrations bundle",
        role: "A self-contained executable the pipeline runs with a managed identity before traffic shifts.",
      },
      {
        name: "Ardalis.Specification",
        role: "Named, testable query specifications without hiding IQueryable.",
      },
      {
        name: "Dapper",
        role: "Hand-written SQL for hot reads and reporting queries alongside EF Core writes.",
      },
      {
        name: "SqlBulkCopy / EFCore.BulkExtensions",
        role: "Bulk loads where SaveChanges batching is not enough.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 2,
        note: "Injecting DbContext directly removes a repository layer that added nothing.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Migrations and LINQ keep schema and queries in C# with the rest of the feature.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Projection, split queries, compiled queries and Dapper cover the hot paths.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "One SaveChanges per unit of work plus concurrency tokens prevent lost updates.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "Specifications and a SQLite or Testcontainers database test real queries; fakes test less.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "Bundles applied by the pipeline make database changes a normal release step.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Backward-compatible migrations allow rolling deploys and easy rollback.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Command logging shows the SQL; ExecuteUpdate bypasses interceptors, so audit it explicitly.",
      },
    ],
    related: [
      "sql-vs-cosmos",
      "vertical-slices",
      "clean-architecture",
      "backend-testing-strategy",
    ],
    checks: [
      {
        id: "ef-core-patterns-q1",
        prompt:
          "A background IHostedService processes a queue in a loop and needs database access. How should it get a DbContext?",
        options: [
          "Inject the scoped DbContext into the hosted service constructor",
          "Register the DbContext as a singleton",
          "Inject IDbContextFactory and create a context per message",
          "Use a static DbContext shared across the process",
        ],
        answer: 2,
        explanation:
          "Hosted services are singletons, so a scoped DbContext injected into them becomes captive and shared across iterations. A factory gives a fresh, correctly disposed context per message. A singleton or static context is not thread-safe.",
      },
      {
        id: "ef-core-patterns-q2",
        prompt:
          "When does a repository class add real value over using DbContext directly?",
        options: [
          "Always, because it keeps EF Core out of the handlers",
          "When aggregates have complex loading rules that should be written once",
          "When you want to expose IQueryable to controllers",
          "When the project uses Minimal APIs",
        ],
        answer: 1,
        explanation:
          "Repositories pay off for rich aggregates with non-trivial loading, or at a boundary you genuinely swap. A generic wrapper that re-exposes CRUD hides composable queries without protecting anything; Minimal APIs change nothing here.",
      },
      {
        id: "ef-core-patterns-q3",
        prompt:
          "Why should production migrations run from the pipeline rather than Database.Migrate() at startup?",
        options: [
          "Startup migrations are not supported on Azure SQL",
          "Multiple instances race on startup and the app identity would need DDL rights",
          "Pipelines can generate migrations automatically from the model",
          "EF Core cannot run migrations on Linux",
        ],
        answer: 1,
        explanation:
          "Several replicas starting at once can apply the same migration concurrently, and the running app would carry schema-change permissions. A bundle run by the pipeline before traffic shifts avoids both. The other options are false.",
      },
    ],
    sources: [
      {
        title: "EF Core documentation",
        url: "https://learn.microsoft.com/ef/core/",
      },
      {
        title: "EF Core: Applying migrations",
        url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying",
      },
      {
        title:
          "Microsoft Learn: Infrastructure persistence layer in .NET microservices",
        url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design",
      },
    ],
  },
  {
    id: "caching-strategies",
    trackId: "azure-data",
    title: "Caching strategies end to end",
    tagline:
      "Cache at the outermost layer that tolerates the staleness, and plan invalidation first.",
    level: 2,
    minutes: 8,
    summary:
      "Caching on the Microsoft stack happens in four places: the browser via TanStack Query, the CDN via Azure Front Door, the server via ASP.NET Core output caching, and the application via HybridCache over Azure Cache for Redis. This lesson shows how they layer, how to invalidate without lying to users, how to prevent stampedes, and what should never be cached.",
    sections: [
      {
        heading: "The four layers",
        body: "Each layer caches a different shape of thing and tolerates a different staleness:\n\n- **Browser / client**: TanStack Query holds server state per query key with a `staleTime` that decides when to refetch. Zero network cost on a hit.\n- **CDN / edge**: Azure Front Door caches full HTTP responses for anonymous, cacheable routes close to the user. Great for static assets and public pages, useless for per-user data.\n- **Server response**: ASP.NET Core **output caching** stores whole responses in the process or in Redis, keyed by route and selected query strings or headers, with tag-based eviction.\n- **Application data**: **HybridCache** (or `IDistributedCache`) in front of Azure Cache for Redis, keyed by entity, used by handlers that need a lookup the database would serve slowly or expensively.\n\nStart from the outermost layer that can serve the request. A product page for an anonymous user should hit the CDN; a dashboard for a signed-in user should hit TanStack Query on repeat visits and HybridCache on the server; a bank balance should hit the database.",
      },
      {
        heading: "Cache-aside with HybridCache and Redis",
        body: 'Cache-aside means the application checks the cache, misses, reads the source, writes the cache, returns. `HybridCache` in .NET packages this into one call:\n\n```csharp\nvar product = await cache.GetOrCreateAsync(\n    $"product:{id}",\n    async ct => await db.Products.FindAsync(id, ct),\n    new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(10) },\n    tags: ["products"],\n    cancellationToken: ct);\n```\n\nIt combines an in-process L1 with a distributed L2 (Azure Cache for Redis through `IDistributedCache`), serialises once, and coalesces concurrent misses for the same key so only one caller runs the factory. That coalescing is the built-in **stampede protection** that a naive `IDistributedCache` loop lacks.\n\nUse Azure Cache for Redis for the L2 whenever you run more than one instance, which on App Service and Container Apps is always. The Enterprise tiers add active geo-replication and Redis modules; the Basic tier has no SLA and belongs in dev only.',
      },
      {
        heading: "Output caching and the CDN",
        body: 'ASP.NET Core output caching is middleware: `AddOutputCache()` with named policies, `CacheOutput()` on an endpoint, `VaryByQuery` and `VaryByHeader` for the keys that matter, and `IOutputCacheStore.EvictByTagAsync("products")` to invalidate. Back it with Redis (`AddStackExchangeRedisOutputCache`) so eviction reaches every instance. It is distinct from the older response caching, which only sets headers for downstream caches.\n\nAzure Front Door caches by URL plus the headers you choose, honours `Cache-Control` from the origin, and purges by path. Use it for static assets with hashed file names (`Cache-Control: immutable`, one year), for public API responses that change rarely, and for the SPA shell with a short max-age. Never let it cache a response that varies by `Authorization` unless the rule explicitly keys on it, and generally do not cache authenticated responses at the edge at all.\n\nThe order a request hits is CDN, then output cache, then handler with HybridCache, then database. Each layer should have a shorter or equal TTL than the one outside it, or an outer layer will serve data the inner layer already refreshed.',
      },
      {
        heading: "Invalidation that users can trust",
        body: 'Decide the invalidation strategy before choosing TTLs:\n\n- **Time-based** (TTL only): simplest, right for data that is naturally stale-tolerant, such as a product catalogue updated nightly.\n- **Event-based eviction**: on write, remove or re-tag the affected keys. HybridCache `RemoveByTagAsync` and output cache tags make this one line in the command handler. Pair it with a TTL as a backstop.\n- **Version in the key**: `product:{id}:v{rowVersion}` turns every change into a new key; old entries age out. Cheap and race-free when the version is already in the row.\n- **Change feed or domain event**: for caches owned by another service, publish `ProductChanged` and let the consumer evict.\n\nOn the client, mirror this: after a mutation, `queryClient.invalidateQueries({ queryKey: ["products"] })` or `setQueryData` with the server\'s response so the UI never shows the stale list. A `staleTime` of a few seconds on list queries and `Infinity` on reference data such as countries is a reasonable baseline.\n\nStampede protection matters at expiry as well as at cold start: HybridCache coalesces callers, and for very hot keys use a soft TTL that refreshes in the background before the hard expiry.',
      },
      {
        heading: "What not to cache",
        body: "- Anything with a correctness requirement on read: balances, stock levels used for an allocation decision, permission checks. Cache the inputs, not the decision.\n- Per-user responses at the CDN, and any response that includes a CSRF token or a `Set-Cookie`.\n- Large blobs in Redis; its memory is the expensive kind. Put the bytes in Blob Storage behind the CDN and cache the URL.\n- Query results keyed by a user-supplied string without normalisation; the hit rate will be near zero and the memory cost real.\n- Data the database already serves in under a millisecond from its own buffer pool. Measure the miss cost first; a cache that saves two milliseconds while adding a Redis hop saves nothing.\n\nA last check: if the cache cluster disappeared, would the system stay correct and merely slow? If not, the cache has become a store of record and the design is wrong.",
      },
    ],
    diagram: {
      caption:
        "Four cache layers from the browser inwards, each with a TTL no longer than the one outside it, invalidated by tags on write.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "TanStack Query staleTime",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "afd",
          label: "Azure Front Door",
          sub: "edge cache, public only",
          col: 1,
          row: 1,
          kind: "external",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "output caching",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "hc",
          label: "HybridCache",
          sub: "L1 memory + L2 Redis",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "redis",
          label: "Azure Cache for Redis",
          sub: "shared L2",
          col: 4,
          row: 0,
          kind: "data",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "source of truth",
          col: 4,
          row: 2,
          kind: "data",
        },
        {
          id: "cmd",
          label: "Write handler",
          sub: "RemoveByTag on save",
          col: 3,
          row: 3,
          kind: "service",
        },
      ],
      edges: [
        { from: "spa", to: "afd", label: "GET /api/products" },
        { from: "afd", to: "api", label: "miss" },
        { from: "api", to: "hc", label: "GetOrCreateAsync" },
        { from: "hc", to: "redis", label: "L2" },
        { from: "hc", to: "sql", label: "factory on miss" },
        { from: "cmd", to: "sql", label: "SaveChanges" },
        { from: "cmd", to: "hc", label: "evict tag products", style: "dashed" },
      ],
    },
    useWhen: [
      "A read endpoint is hot and its data is stale-tolerant for seconds to minutes",
      "The same lookup is computed for many requests and the source query is expensive",
      "Public, anonymous responses or hashed static assets can be served from the CDN",
      "The app runs on several instances and needs one shared cache: Azure Cache for Redis as L2",
    ],
    avoidWhen: [
      "The read must be correct at the instant it is used, such as a balance before a debit",
      "Responses vary per user and the only candidate layer is the CDN",
      "The database already serves the query from memory faster than a Redis round trip",
    ],
    microsoftStack: [
      {
        name: "HybridCache (Microsoft.Extensions.Caching.Hybrid)",
        role: "Cache-aside with L1/L2, serialisation, tags and stampede coalescing in one call.",
      },
      {
        name: "Azure Cache for Redis",
        role: "Shared L2 and output cache store across instances; Standard tier or above in production.",
      },
      {
        name: "ASP.NET Core output caching",
        role: "Whole-response caching with policies, VaryBy and tag eviction, backed by Redis.",
      },
      {
        name: "Azure Front Door",
        role: "Edge caching and purge for static assets and public responses.",
      },
      {
        name: "IDistributedCache",
        role: "The lower-level abstraction HybridCache sits on; still used for session state.",
      },
    ],
    reactStack: [
      {
        name: "TanStack Query staleTime and gcTime",
        role: "Per-query freshness window and memory retention; set per data type, not globally.",
      },
      {
        name: "invalidateQueries / setQueryData",
        role: "Evict or update client cache after a mutation so the UI reflects the write.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: -1,
        note: "Every cache layer adds a place where data can be wrong.",
      },
      {
        attribute: "performance",
        effect: 2,
        note: "Hits skip the network, the handler or the database entirely.",
      },
      {
        attribute: "scalability",
        effect: 2,
        note: "Database load drops to the miss rate; the CDN absorbs public traffic.",
      },
      {
        attribute: "consistency",
        effect: -2,
        note: "Readers may see stale data for the TTL unless eviction is wired on write.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "A warm cache keeps serving reads through a brief database outage.",
      },
      {
        attribute: "testability",
        effect: -1,
        note: "Tests must cover miss, hit and eviction paths or they pass against the wrong state.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Hit rate, eviction and Redis memory become metrics to watch.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Redis costs money, but less than the database tier it lets you avoid.",
      },
    ],
    related: [
      "react-server-state",
      "sql-vs-cosmos",
      "api-gateway-bff",
      "react-performance-architecture",
    ],
    checks: [
      {
        id: "caching-strategies-q1",
        prompt:
          "Many requests for a product page arrive at once just as its cache entry expires. Which mechanism prevents them all hitting the database?",
        options: [
          "A longer TTL on the output cache",
          "HybridCache coalescing concurrent misses for the same key",
          "Caching the page at Azure Front Door",
          "Using IDistributedCache directly with a null check",
        ],
        answer: 1,
        explanation:
          "Stampede protection means one caller runs the factory while others wait for its result, which HybridCache does by default. A longer TTL only moves the stampede, and a plain IDistributedCache null-check lets every miss through.",
      },
      {
        id: "caching-strategies-q2",
        prompt:
          "A signed-in user's dashboard response is being cached by Front Door and shown to other users. What went wrong?",
        options: [
          "The TTL was too short",
          "An authenticated, per-user response was cached at the edge without varying on the user",
          "HybridCache was configured without an L2",
          "TanStack Query staleTime was set to Infinity",
        ],
        answer: 1,
        explanation:
          "Edge caches key on URL and chosen headers; a per-user response cached there leaks across users. The fix is to exclude authenticated routes from CDN caching. The other settings affect freshness, not leakage.",
      },
      {
        id: "caching-strategies-q3",
        prompt:
          "After a product is renamed, which approach keeps every layer honest with the least code?",
        options: [
          "Restart the API so in-memory caches clear",
          "Wait for all TTLs to expire",
          "Evict by tag in the handler, back the output cache with Redis, and invalidate the TanStack Query key after the mutation",
          "Disable caching for the products endpoint",
        ],
        answer: 2,
        explanation:
          "Tag eviction on write reaches HybridCache and the output cache across instances, and the client invalidation refreshes the UI. Waiting on TTLs shows stale data, and restarting or disabling caching throws away the benefit.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core: HybridCache",
        url: "https://learn.microsoft.com/aspnet/core/performance/caching/hybrid",
      },
      {
        title: "ASP.NET Core: Output caching middleware",
        url: "https://learn.microsoft.com/aspnet/core/performance/caching/output",
      },
      {
        title: "Azure Architecture Center: Cache-Aside pattern",
        url: "https://learn.microsoft.com/azure/architecture/patterns/cache-aside",
      },
    ],
  },
  {
    id: "multi-tenancy",
    trackId: "azure-data",
    title: "Multi-tenancy models",
    tagline:
      "Shared tables, schema per tenant or database per tenant: the isolation driver decides.",
    level: 3,
    minutes: 8,
    summary:
      "A SaaS product on Azure has three ways to keep tenants apart in the database and several ways to work out which tenant a request belongs to. This lesson compares shared-table, schema-per-tenant and database-per-tenant models with elastic pools, explains tenant resolution in ASP.NET Core, and names the drivers that force the more expensive models: noisy neighbours, compliance and data residency.",
    sections: [
      {
        heading: "Three data models",
        body: "**Shared database, shared tables** with a `TenantId` column on every tenant-owned row. Cheapest to run, simplest to migrate, and the model most SaaS products start with. Isolation is enforced in code: an EF Core **global query filter** on `TenantId`, a `SaveChanges` interceptor that stamps it on inserts, and a composite index with `TenantId` first on every tenant table.\n\n**Shared database, schema per tenant**. Each tenant gets its own SQL schema with identical tables. Isolation is visible in the catalogue and per-tenant restore is a schema script away, but migrations run N times and SQL Server tooling for hundreds of schemas gets awkward. It is a middle option that rarely wins outright.\n\n**Database per tenant**. Each tenant has its own Azure SQL database, usually in an **elastic pool** so a hundred small databases share compute. Strongest isolation, per-tenant backup and restore, per-tenant performance tier, and the model regulated customers ask for by name. The cost is a catalogue of connection strings, migrations orchestrated across every database, and a provisioning workflow for new tenants.\n\nThe Azure SaaS guidance calls these tenancy models and adds a fourth: a hybrid where most tenants share and a few large or regulated ones get their own database.",
      },
      {
        heading: "Tenant resolution in ASP.NET Core",
        body: "Before any data access, middleware must decide the tenant and make it available for the request. The common sources, in order of trustworthiness:\n\n- **JWT claim**: a `tid` or custom `tenant_id` claim issued by Entra ID or your own token service. The token is signed, so this is the only source a backend should trust for authorisation.\n- **Host name**: `acme.yourapp.com` maps to a tenant via a lookup. Fine for routing and branding; confirm it against the claim.\n- **Header or route**: `X-Tenant-Id` or `/t/{tenant}/...` for internal services and admin tools, never as the sole source from a browser.\n\nResolve once into a scoped `ITenantContext`, register it with DI, and have the `DbContext` constructor read it for the global query filter and, in the database-per-tenant model, for the connection string. The Finbuckle.MultiTenant library does this with strategies and stores, and is worth using rather than rebuilding.\n\nBackground jobs have no request, so every message carries the tenant id and the handler sets the context before touching data.",
      },
      {
        heading: "What forces the expensive models",
        body: "Teams move away from shared tables for a few recognisable reasons:\n\n- **Noisy neighbours**: one tenant's batch import or report saturates the database and every other tenant slows down. Database per tenant in a pool caps the blast radius; a hot tenant can even leave the pool for its own tier.\n- **Compliance and contracts**: a customer's security questionnaire requires logical or physical separation, customer-managed keys, or per-tenant audit logs. Row-level isolation in code is hard to evidence; a separate database is easy to point at.\n- **Data residency**: EU data in EU regions, Australian health data in Australia. That is per-tenant deployment stamps in several regions, each with its own database, and a global catalogue that routes tenants to the right stamp.\n- **Tenant-specific restore**: a customer deletes everything by accident and wants yesterday back. A shared table cannot be restored for one tenant without surgery.\n\nIf none of these apply yet, shared tables with query filters and a tenant-first index are correct, and the money goes into product.",
      },
      {
        heading: "Shape on Azure",
        body: "A practical mid-size layout:\n\n- **Catalogue database** (one Azure SQL database): tenants, their stamp or region, their model (shared or dedicated), and a Key Vault reference for any dedicated connection string.\n- **Shared database** for the long tail of tenants, with `TenantId` everywhere and row-level security as a second fence if the DBA wants defence in depth.\n- **Elastic pool** holding dedicated databases for large or regulated tenants. The Elastic Database tools and `sqlpackage` or EF Core bundles apply migrations across the pool from a pipeline job that iterates the catalogue.\n- **Per-region stamps** only when residency demands it, each stamp a full copy of compute plus data, fronted by Azure Front Door routing on host name.\n\nFor Cosmos DB the equivalent is the partition key: `/tenantId` in a shared container for most tenants, a dedicated container or database with its own throughput for the heavy ones. Entra ID multi-tenant app registrations handle sign-in from many organisations, with the `tid` claim as the tenant source.",
      },
      {
        heading: "How to decide and common mistakes",
        body: "Start shared unless a signed contract, a regulation or a measured noisy neighbour says otherwise, and design so the move is possible: resolve tenant once, never hard-code the connection string, keep all tenant tables keyed by tenant from day one.\n\nMistakes that show up in audits:\n\n- Forgetting `IgnoreQueryFilters()` is a thing and letting an admin report leak across tenants.\n- Caching by key without the tenant in it, so tenant A sees tenant B's cached menu.\n- Trusting a host name or header for authorisation.\n- Migrating the shared database in one transaction that locks every tenant's hot table for minutes.\n- Offering database per tenant to everyone and then discovering that a thousand databases need a thousand migration runs on release night.\n\nThe hybrid model exists precisely so that both the cheap and the strict options can coexist behind one codebase.",
      },
    ],
    diagram: {
      caption:
        "Tenant resolved from the JWT, routed to a shared database or a dedicated database in an elastic pool via the catalogue.",
      nodes: [
        {
          id: "spa",
          label: "React SPA",
          sub: "acme.yourapp.com",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "mw",
          label: "Tenant middleware",
          sub: "JWT tid -> ITenantContext",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "cat",
          label: "Catalogue DB",
          sub: "tenant -> model, stamp",
          col: 2,
          row: 0,
          kind: "data",
        },
        {
          id: "ctx",
          label: "DbContext",
          sub: "global query filter",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "shared",
          label: "Shared Azure SQL",
          sub: "TenantId on every row",
          col: 3,
          row: 1,
          kind: "data",
        },
        {
          id: "pool",
          label: "Elastic pool",
          sub: "DB per big tenant",
          col: 3,
          row: 3,
          kind: "data",
        },
        {
          id: "kv",
          label: "Key Vault",
          sub: "dedicated conn strings",
          col: 4,
          row: 0,
          kind: "external",
        },
      ],
      edges: [
        { from: "spa", to: "mw", label: "Bearer JWT" },
        { from: "mw", to: "cat", label: "lookup tenant" },
        { from: "mw", to: "ctx", label: "scoped tenant" },
        { from: "ctx", to: "shared", label: "most tenants" },
        {
          from: "ctx",
          to: "pool",
          label: "dedicated tenants",
          style: "dashed",
        },
        { from: "cat", to: "kv", label: "secret reference", style: "dashed" },
      ],
      groups: [{ label: "Hybrid tenancy", nodeIds: ["shared", "pool"] }],
    },
    useWhen: [
      "A SaaS product where most tenants are small and cost per tenant must stay low: shared tables with query filters",
      "A few tenants have contractual isolation or per-tenant restore requirements: database per tenant in an elastic pool",
      "Tenants in different jurisdictions require data to stay in region: per-region stamps and a catalogue",
      "One tenant's load regularly degrades the others: move it to its own database or tier",
    ],
    avoidWhen: [
      "Database per tenant for hundreds of tiny tenants with no isolation requirement; migrations and cost explode",
      "Schema per tenant as a compromise nobody asked for; it has the migration cost without the restore benefit",
      "Resolving tenant from a header or host name alone for authorisation decisions",
    ],
    microsoftStack: [
      {
        name: "EF Core global query filters and SaveChanges interceptors",
        role: "Enforce TenantId on reads and stamp it on writes in the shared model.",
      },
      {
        name: "Azure SQL elastic pools",
        role: "Share compute across many per-tenant databases with per-tenant restore.",
      },
      {
        name: "Finbuckle.MultiTenant",
        role: "Tenant resolution strategies, stores and per-tenant options for ASP.NET Core.",
      },
      {
        name: "Microsoft Entra ID multi-tenant app registration",
        role: "Sign-in from many organisations with the tid claim as tenant source.",
      },
      {
        name: "Azure SQL row-level security",
        role: "A second fence inside the database for the shared model.",
      },
      {
        name: "Azure Front Door",
        role: "Routes tenant host names to the right regional stamp.",
      },
    ],
    reactStack: [
      {
        name: "Tenant-aware query keys",
        role: "Include the tenant id in TanStack Query keys so switching tenants never shows cached data from the last one.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Shared tables with a filter are simpler than a catalogue of databases.",
      },
      {
        attribute: "cost",
        effect: 2,
        note: "One database for the long tail; pools only for tenants who pay for isolation.",
      },
      {
        attribute: "consistency",
        effect: 0,
        note: "Each model keeps tenant data transactional; cross-tenant reporting gets harder with dedicated databases.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Dedicated databases contain noisy neighbours and allow per-tenant restore.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Pools and stamps scale tenants out horizontally when shared tables hit limits.",
      },
      {
        attribute: "deployability",
        effect: -1,
        note: "Migrations must run against every dedicated database on each release.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "Provisioning, catalogue upkeep and per-tenant monitoring are new duties.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Resolving tenant once and keying everything by tenant keeps the model switchable.",
      },
    ],
    related: [
      "sql-vs-cosmos",
      "identity-and-secrets",
      "caching-strategies",
      "security-architecture",
    ],
    checks: [
      {
        id: "multi-tenancy-q1",
        prompt:
          "A startup has 300 small tenants, no compliance demands, and a team of five. Which tenancy model fits today?",
        options: [
          "Database per tenant in an elastic pool",
          "Schema per tenant",
          "Shared tables with a TenantId column and EF Core global query filters",
          "A separate App Service per tenant",
        ],
        answer: 2,
        explanation:
          "With no isolation driver, shared tables cost least and migrate once. Database per tenant would mean 300 migration runs per release, and schema per tenant carries that cost without the restore benefit. Keying everything by tenant keeps the later move open.",
      },
      {
        id: "multi-tenancy-q2",
        prompt:
          "Which source of the tenant id should a backend trust for authorisation?",
        options: [
          "The sub-domain in the Host header",
          "An X-Tenant-Id header sent by the SPA",
          "A claim in the validated JWT",
          "A query string parameter",
        ],
        answer: 2,
        explanation:
          "Only the signed token is tamper-proof. Host names and headers are useful for routing and branding but any client can set them, so they must be checked against the claim rather than trusted alone.",
      },
      {
        id: "multi-tenancy-q3",
        prompt:
          "A customer requires that their data stays in the EU while others are in the US. What does this force?",
        options: [
          "A TenantId column with a region value",
          "Per-region deployment stamps with their own databases and a catalogue that routes tenants",
          "Cosmos DB with multi-region writes to both regions",
          "Encrypting that tenant's rows with a separate key",
        ],
        answer: 1,
        explanation:
          "Residency is about where bytes are stored and processed, so the tenant's compute and data must live in an EU stamp. A column or a key does not move the data, and multi-region replication would copy it to the US.",
      },
    ],
    sources: [
      {
        title:
          "Azure Architecture Center: Architect multitenant solutions on Azure",
        url: "https://learn.microsoft.com/azure/architecture/guide/multitenant/overview",
      },
      {
        title:
          "Azure Architecture Center: Tenancy models for a multitenant solution",
        url: "https://learn.microsoft.com/azure/architecture/guide/multitenant/considerations/tenancy-models",
      },
      {
        title: "EF Core: Global query filters",
        url: "https://learn.microsoft.com/ef/core/querying/filters",
      },
    ],
  },
  {
    id: "identity-and-secrets",
    trackId: "azure-data",
    title: "Identity and secrets on Azure",
    tagline:
      "Entra ID for people, Managed Identity for workloads, Key Vault for what is left.",
    level: 2,
    minutes: 7,
    summary:
      "Most Azure security incidents in small teams start with a connection string in a config file. This lesson shows how Entra ID and Entra External ID cover sign-in for staff and customers, how Managed Identity removes passwords from service-to-service and service-to-database calls, where Key Vault still fits, and how RBAC, app roles and custom claims divide the authorisation work.",
    sections: [
      {
        heading: "Who signs in: Entra ID versus External ID",
        body: "**Microsoft Entra ID** is the directory for your organisation's people and for workloads. Internal tools, admin portals and B2B apps where users come from partner organisations sign in here, with conditional access, MFA and group membership for free.\n\n**Microsoft Entra External ID** is the customer identity service for consumer and citizen-facing apps: self-service sign-up, social identity providers, branded sign-in pages, and a billing model per monthly active user. It is the successor to Azure AD B2C, which still runs for existing tenants but is not where new customer apps should start. The developer experience is the same `Microsoft.Identity.Web` and MSAL libraries, with a different tenant type and authority URL.\n\nThe rule: employees and partners use the workforce tenant; customers use an External ID tenant; never put customers in the workforce directory, and never build your own password store when either of these exists.",
      },
      {
        heading: "Managed Identity kills the connection string secret",
        body: "A **Managed Identity** is an Entra identity attached to an Azure resource: your App Service, Container App, Function or AKS workload. Azure rotates its credential, your code never sees it, and other Azure services accept its token. The result is a connection string with no password:\n\n```\nServer=tcp:myserver.database.windows.net;Database=app;Authentication=Active Directory Default;\n```\n\nIn .NET, `DefaultAzureCredential` from `Azure.Identity` tries, in order, environment variables, workload identity, managed identity, and then developer tools such as Visual Studio, the Azure CLI and `azd`. The same code runs locally as you and in Azure as the resource. Prefer a **user-assigned** identity shared by the app's environments so role assignments survive redeploys; a system-assigned identity dies with the resource.\n\nGrant it data-plane roles: `Storage Blob Data Contributor`, `Azure Service Bus Data Sender`, a contained database user in Azure SQL created `FROM EXTERNAL PROVIDER`, and `Key Vault Secrets User`. On AKS the equivalent is **workload identity**: a Kubernetes service account federated to an Entra application or user-assigned identity, with the same `DefaultAzureCredential` picking it up.",
      },
      {
        heading: "Where Key Vault still belongs",
        body: "Once Azure-to-Azure calls use identities, Key Vault holds the secrets that cannot be replaced by an identity: third-party API keys, SMTP passwords, certificates, signing keys, and the occasional legacy SQL login.\n\nThe app reads them with Managed Identity through `AddAzureKeyVault` in configuration, or through App Service and Container Apps **Key Vault references** so the platform injects them as settings. Either way the secret never appears in a pipeline variable or an `appsettings.json`.\n\nRotation: give every secret an expiry, alert on it with Event Grid's near-expiry event, and for anything with two keys (storage, Cosmos, Service Bus SAS) rotate by swapping to the secondary, regenerating the primary, and swapping back. Better still, remove the need by moving that dependency to RBAC. Certificates in Key Vault can auto-renew from an integrated CA. Treat the Key Vault access log as a security signal; a new identity reading a secret should be explainable.",
      },
      {
        heading: "RBAC, app roles and custom claims",
        body: 'Three authorisation mechanisms sit at different layers, and mixing them up produces either unmanageable code or unmanageable portals.\n\n- **Azure RBAC** governs Azure resources: who can deploy, who can read a storage account, which identity can send to a queue. It is for operators and workloads, not for your app\'s business permissions.\n- **App roles** are declared on the app registration (`Orders.Approver`, `Admin`), assigned to users, groups or client apps in Entra, and arrive in the token as a `roles` claim. Use them for coarse application permissions and check them with `[Authorize(Roles = "Admin")]` or `RequireRole` on Minimal API endpoints.\n- **Custom claims and your own database** handle fine-grained, data-dependent rules: this user may edit this project in this tenant. Load them in a claims transformation or in a policy handler; do not try to express them as hundreds of app roles.\n\nGroup claims are tempting but tokens with many groups overflow, so prefer app roles assigned to groups. Scopes (`api://app/Orders.Read`) describe what a client app may ask for on behalf of a user and belong in the SPA lesson on Entra ID auth.',
      },
      {
        heading: "Common mistakes",
        body: "- Storing the SQL admin password in a pipeline variable and calling it secure. A contained user for the Managed Identity needs no password at all.\n- Giving the app's identity `Contributor` on the resource group because a data role was unfamiliar. Data-plane roles are specific for a reason.\n- Using a system-assigned identity and losing every role assignment when infrastructure is recreated.\n- Running Azure AD B2C for a new customer app in 2026; start on External ID.\n- Building authorisation entirely on `roles` claims until the app has sixty roles and nobody knows who approved what. Keep app roles coarse and move the rest to policies backed by data.\n- Reading Key Vault on every request. Load at startup or cache with a refresh interval; Key Vault has throttling limits and latency.\n\nThe test for a healthy setup: can the whole system be deployed to a fresh subscription without a human copying a secret anywhere? If yes, identity has replaced secrets where it should.",
      },
    ],
    diagram: {
      caption:
        "People sign in through Entra ID or External ID; the workload authenticates to data services with a Managed Identity; Key Vault holds only third-party secrets.",
      nodes: [
        {
          id: "staff",
          label: "Staff / partners",
          sub: "Entra ID workforce",
          col: 0,
          row: 0,
          kind: "external",
        },
        {
          id: "cust",
          label: "Customers",
          sub: "Entra External ID",
          col: 0,
          row: 2,
          kind: "external",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "Microsoft.Identity.Web",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "mi",
          label: "Managed Identity",
          sub: "user-assigned",
          col: 2,
          row: 1,
          kind: "note",
        },
        {
          id: "sql",
          label: "Azure SQL",
          sub: "Entra contained user",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "sb",
          label: "Service Bus",
          sub: "Data Sender role",
          col: 3,
          row: 1,
          kind: "queue",
        },
        {
          id: "kv",
          label: "Key Vault",
          sub: "3rd-party keys, certs",
          col: 3,
          row: 2,
          kind: "data",
        },
        {
          id: "ext",
          label: "Payment provider",
          sub: "API key from vault",
          col: 4,
          row: 2,
          kind: "external",
        },
      ],
      edges: [
        { from: "staff", to: "api", label: "JWT with roles claim" },
        { from: "cust", to: "api", label: "JWT, External ID" },
        { from: "api", to: "mi", label: "DefaultAzureCredential" },
        { from: "mi", to: "sql", label: "token, no password" },
        { from: "mi", to: "sb", label: "RBAC data role" },
        { from: "mi", to: "kv", label: "Secrets User" },
        { from: "kv", to: "ext", label: "rotated key", style: "dashed" },
      ],
    },
    useWhen: [
      "An app on App Service, Container Apps, Functions or AKS talks to Azure SQL, Storage, Service Bus or Key Vault: use Managed Identity",
      "Employees or partner organisations sign in: Entra ID workforce tenant with app roles",
      "Consumers sign up themselves with social or email identities: Entra External ID",
      "A third-party API key or certificate must be stored: Key Vault with expiry and rotation",
    ],
    avoidWhen: [
      "Managed Identity is not possible because the dependency only accepts a password; then Key Vault it, and plan to replace it",
      "Expressing fine-grained, per-record permissions as dozens of app roles",
      "Starting a new consumer app on Azure AD B2C instead of External ID",
    ],
    microsoftStack: [
      {
        name: "Microsoft Entra ID",
        role: "Workforce identity, conditional access, app registrations and app roles.",
      },
      {
        name: "Microsoft Entra External ID",
        role: "Customer identity with self-service sign-up and social providers; the successor to B2C.",
      },
      {
        name: "Managed Identity and Azure.Identity DefaultAzureCredential",
        role: "Passwordless auth from .NET to Azure services, locally and in the cloud.",
      },
      {
        name: "Azure Key Vault",
        role: "Secrets, keys and certificates with RBAC, expiry events and auto-renewal.",
      },
      {
        name: "Microsoft.Identity.Web",
        role: "Token validation, roles and scopes in ASP.NET Core with one registration call.",
      },
      {
        name: "AKS workload identity",
        role: "Federates a Kubernetes service account to an Entra identity for pods.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "No secrets to create, store or rotate for Azure-to-Azure calls.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "Role assignments and contained users take setup time once per environment.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "No expired password incidents; tokens are rotated by the platform.",
      },
      {
        attribute: "deployability",
        effect: 2,
        note: "A fresh environment can be stood up without a human copying secrets.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "DefaultAzureCredential works with developer sign-in locally; CI needs a federated identity.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Key Vault logs and Entra sign-in logs give one audit trail for access.",
      },
      {
        attribute: "team-autonomy",
        effect: -1,
        note: "Role assignments usually need someone with Owner or User Access Administrator.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Managed Identity is free; External ID bills per monthly active user beyond the free tier.",
      },
    ],
    related: [
      "entra-id-auth",
      "security-architecture",
      "multi-tenancy",
      "azure-landing-zone-basics",
    ],
    checks: [
      {
        id: "identity-and-secrets-q1",
        prompt:
          "A Container App must read from Azure SQL. What is the recommended way to authenticate?",
        options: [
          "A SQL login whose password is stored in Key Vault",
          "A user-assigned Managed Identity with a contained database user created FROM EXTERNAL PROVIDER",
          "The SQL admin credentials in an environment variable",
          "A certificate in the container image",
        ],
        answer: 1,
        explanation:
          "Managed Identity removes the password entirely, and user-assigned keeps the role and database user stable across redeploys. Key Vault is for secrets that cannot be replaced by an identity; here one can be.",
      },
      {
        id: "identity-and-secrets-q2",
        prompt:
          "Which mechanism should carry the permission 'this user can approve orders' into an ASP.NET Core API?",
        options: [
          "Azure RBAC Contributor on the resource group",
          "An app role assigned to a group, arriving in the roles claim",
          "A Key Vault secret per user",
          "A group claim listing every group the user belongs to",
        ],
        answer: 1,
        explanation:
          "App roles are the Entra mechanism for coarse application permissions and can be assigned to groups. Azure RBAC controls Azure resources, not business actions, and full group claims overflow tokens in large organisations.",
      },
      {
        id: "identity-and-secrets-q3",
        prompt:
          "A new consumer-facing app needs sign-up with email and Google accounts. Which identity service?",
        options: [
          "Entra ID workforce tenant with guest users",
          "Azure AD B2C",
          "Microsoft Entra External ID",
          "A custom ASP.NET Core Identity table",
        ],
        answer: 2,
        explanation:
          "External ID is the current customer identity service with self-service sign-up and social providers. B2C is maintained for existing tenants, guest users belong to partner scenarios, and a custom password store is a liability when a managed one exists.",
      },
    ],
    sources: [
      {
        title: "Microsoft Entra documentation",
        url: "https://learn.microsoft.com/entra/",
      },
      {
        title: "Azure Key Vault documentation",
        url: "https://learn.microsoft.com/azure/key-vault/",
      },
      {
        title: "Azure Architecture Center: Security design principles",
        url: "https://learn.microsoft.com/azure/well-architected/security/",
      },
    ],
  },
  {
    id: "azure-landing-zone-basics",
    trackId: "azure-data",
    title: "Azure landing zone basics",
    tagline:
      "Subscriptions, groups, naming, policy and Bicep: enough scaffolding to stay tidy.",
    level: 1,
    minutes: 8,
    summary:
      "A landing zone is the subscription and governance scaffolding an application lands in: management groups, subscriptions, resource groups, naming, tagging, policy, networking and cost controls. Enterprise landing zones are large; a small team needs a thin slice of the same ideas. This lesson gives that slice and the signals that you have outgrown it.",
    sections: [
      {
        heading: "The hierarchy and what goes where",
        body: "Azure resources sit in a four-level hierarchy, and each level is where one kind of decision belongs:\n\n- **Management groups** hold subscriptions and carry policy and RBAC that every subscription inherits. A small organisation needs one or two (for example `platform` and `workloads`).\n- **Subscriptions** are the billing and quota boundary and the usual security boundary between environments or teams. One per environment (`dev`, `test`, `prod`) per product is a sane default; one subscription for everything is the mistake that makes prod access and dev access the same thing.\n- **Resource groups** hold resources that share a lifecycle: the API, its database, its Key Vault and its identity in one group, deleted together. They are not a security boundary in practice, so do not use them as one.\n- **Resources** carry tags for cost allocation and ownership.\n\nRegions are chosen per resource group or deployment; keep a workload in one region unless residency or resilience demands otherwise, and pick a paired region for backups.",
      },
      {
        heading: "Naming, tagging and policy",
        body: "Agree a **naming convention** before the first resource exists, because renaming is deleting and recreating. The Cloud Adoption Framework pattern works: `<type>-<workload>-<env>-<region>-<instance>`, giving `rg-orders-prod-weu-001`, `app-orders-prod-weu-001`, `sql-orders-prod-weu-001`. Storage accounts cannot have hyphens and are globally unique, so they get their own rule.\n\n**Tags** answer who pays and who to call: `owner`, `cost-centre`, `environment`, `workload`. Make them mandatory with **Azure Policy** (deny creation without the tag, or inherit from the resource group) rather than by asking nicely.\n\nPolicy also enforces guard rails that would otherwise be a review comment: allowed regions, no public IPs on databases, TLS 1.2 minimum, diagnostic settings sent to a central Log Analytics workspace, SKU limits in dev. Assign built-in initiatives such as the Microsoft cloud security benchmark at the management group and read the compliance report monthly. A policy in audit mode first, deny mode once the existing estate is clean, avoids a Friday where nothing deploys.",
      },
      {
        heading: "Environments and Bicep modules",
        body: "Infrastructure is code, and on Azure the native choice is **Bicep** (Terraform is equally valid if the team already knows it). The shape that keeps environments honest:\n\n```\ninfra/\n  main.bicep                 subscription-scope: resource groups, then modules\n  modules/\n    web-app.bicep            App Service or Container App + identity\n    sql.bicep                Azure SQL + firewall + contained user script\n    keyvault.bicep\n    monitoring.bicep         Log Analytics + App Insights\n  params/\n    dev.bicepparam\n    prod.bicepparam\n```\n\nOne `main.bicep`, one parameter file per environment, and environment differences expressed as parameters (SKU, replica count, retention), never as separate templates. Shared modules can live in a private **Bicep registry** in Azure Container Registry, or you can start from Azure Verified Modules rather than writing your own. The pipeline runs `what-if` on pull request and `deployment create` on merge, with the prod stage gated by an approval. **.NET Aspire** with `azd` generates Bicep for its resources, which is a fine starting point to adopt and then own.\n\nKeep secrets out of parameter files: identities and Key Vault references, as in the identity lesson.",
      },
      {
        heading: "Networking and private endpoints, in brief",
        body: "The enterprise pattern is **hub and spoke**: a hub virtual network holding the firewall, VPN or ExpressRoute gateway and DNS, peered to one spoke network per workload or environment. Workloads reach PaaS services through **Private Endpoints**, which give Azure SQL, Storage, Key Vault and Service Bus a private IP in the spoke and let you disable their public endpoints. Private DNS zones in the hub resolve the service names to those IPs.\n\nA small team does not start there. The minimum worth doing on day one: disable public network access on Azure SQL and Storage and use Private Endpoints from a single workload VNet, integrate App Service or Container Apps into that VNet, and put Azure Front Door or Application Gateway with WAF in front of anything public. That is one VNet, no hub, and most of the security benefit.\n\nMove to hub and spoke when there is a second workload that must share a firewall or an on-premises connection, or when a security team asks for central egress control. By then you want a platform team, which is the real signal you are entering landing-zone territory.",
      },
      {
        heading: "Small team versus enterprise, and cost basics",
        body: "The Azure landing zone reference architecture includes identity, management, connectivity and sandbox subscriptions, a hub network, and dozens of policies. It is right for an enterprise with many teams. For a product team of a few people it is overhead that delays the first deploy by months.\n\nThe small-team slice:\n\n- One management group, three subscriptions (dev, test, prod) or two if test is cheap to share.\n- Bicep with per-environment parameter files and a pipeline that runs what-if.\n- Mandatory tags, allowed regions and diagnostics policies at the management group.\n- A **budget** per subscription with alerts at 50, 80 and 100 percent, and Cost Management's cost analysis grouped by the `workload` tag reviewed every sprint.\n- Reserved capacity or savings plans only once a resource has run at steady load for a quarter; before that, the serverless tiers of SQL and Container Apps are the saving.\n- Auto-shutdown of dev resources overnight through a simple timer.\n\nGraduate to the full enterprise landing zone when a central platform team exists to own it, when many workloads share networking, or when an auditor asks for it. The accelerator can be adopted incrementally, and a tidy small-team setup moves in without being rebuilt.",
      },
    ],
    diagram: {
      caption:
        "A small-team landing zone: one management group with policy, a subscription per environment, Bicep deploying a resource group per workload.",
      nodes: [
        {
          id: "mg",
          label: "Management group",
          sub: "policy, RBAC, tags",
          col: 2,
          row: 0,
          kind: "note",
        },
        {
          id: "dev",
          label: "Subscription: dev",
          sub: "budget alerts",
          col: 0,
          row: 1,
          kind: "external",
        },
        {
          id: "test",
          label: "Subscription: test",
          sub: "budget alerts",
          col: 2,
          row: 1,
          kind: "external",
        },
        {
          id: "prod",
          label: "Subscription: prod",
          sub: "approval gate",
          col: 4,
          row: 1,
          kind: "external",
        },
        {
          id: "rg",
          label: "rg-orders-prod-weu",
          sub: "one lifecycle",
          col: 4,
          row: 2,
          kind: "service",
        },
        {
          id: "law",
          label: "Log Analytics",
          sub: "central diagnostics",
          col: 3,
          row: 3,
          kind: "data",
        },
        {
          id: "bicep",
          label: "Bicep pipeline",
          sub: "what-if, then deploy",
          col: 1,
          row: 3,
          kind: "service",
        },
      ],
      edges: [
        { from: "mg", to: "dev", label: "inherits policy" },
        { from: "mg", to: "test", label: "inherits policy" },
        { from: "mg", to: "prod", label: "inherits policy" },
        { from: "prod", to: "rg" },
        { from: "bicep", to: "dev", label: "dev.bicepparam", style: "dashed" },
        { from: "bicep", to: "rg", label: "prod.bicepparam", style: "dashed" },
        { from: "rg", to: "law", label: "diagnostics" },
      ],
    },
    useWhen: [
      "A product team is about to create its first Azure resources and wants not to regret the layout later",
      "Several environments must be isolated for access and cost, which means a subscription each",
      "Policy must enforce tags, regions and private database access without relying on reviews",
      "The team wants reproducible environments from Bicep with per-environment parameter files",
    ],
    avoidWhen: [
      "Adopting the full enterprise landing zone accelerator with no platform team to run it",
      "Putting dev and prod in one subscription with one Contributor role for everyone",
      "Building hub-and-spoke networking for a single workload with no on-premises connectivity",
    ],
    microsoftStack: [
      {
        name: "Management groups and subscriptions",
        role: "Inherited policy and RBAC above; billing and environment boundary below.",
      },
      {
        name: "Azure Policy and built-in initiatives",
        role: "Mandatory tags, allowed regions, diagnostics and security benchmark compliance.",
      },
      {
        name: "Bicep, Azure Verified Modules and bicepparam files",
        role: "Infrastructure as code with one template per workload and parameters per environment.",
      },
      {
        name: "Azure Cost Management budgets",
        role: "Alerts per subscription and cost analysis by tag.",
      },
      {
        name: "Private Endpoints and Azure Front Door with WAF",
        role: "Private PaaS access and a protected public edge for a single-VNet setup.",
      },
      {
        name: "Azure Developer CLI (azd)",
        role: "Generates and deploys Bicep for Aspire apps as a starting point.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "A thin slice of structure is simpler than either chaos or the full accelerator.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "A day of setup up front, repaid at the second environment.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Policy-enforced diagnostics and private access prevent whole classes of incident.",
      },
      {
        attribute: "deployability",
        effect: 2,
        note: "Bicep with what-if makes every environment a parameter file away.",
      },
      {
        attribute: "team-autonomy",
        effect: 0,
        note: "Teams own their subscriptions within guard rails set once above them.",
      },
      {
        attribute: "operability",
        effect: 2,
        note: "Tags, budgets and a central workspace make cost and health answerable questions.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "A tidy small setup slots into an enterprise landing zone later without a rebuild.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Budgets, dev auto-shutdown and tag-based analysis catch waste early.",
      },
    ],
    related: [
      "azure-compute-choices",
      "identity-and-secrets",
      "cicd-and-environments",
      "observability",
    ],
    checks: [
      {
        id: "azure-landing-zone-basics-q1",
        prompt:
          "Which Azure boundary should separate production from development for a small product team?",
        options: [
          "Separate resource groups in one subscription",
          "Separate subscriptions under one management group",
          "Separate regions in one resource group",
          "Separate tags on the same resources",
        ],
        answer: 1,
        explanation:
          "Subscriptions are the practical access, quota and billing boundary; resource groups do not isolate RBAC well in practice and tags isolate nothing. One management group above them applies the shared policy.",
      },
      {
        id: "azure-landing-zone-basics-q2",
        prompt:
          "How should the difference between dev and prod SKUs be expressed in Bicep?",
        options: [
          "A separate main.bicep per environment",
          "Parameters in dev.bicepparam and prod.bicepparam fed to one template",
          "Manual changes in the portal after deployment",
          "Conditional compilation symbols",
        ],
        answer: 1,
        explanation:
          "One template with per-environment parameter files keeps environments identical in shape and different only in values. Separate templates drift, and portal edits are invisible to the pipeline.",
      },
      {
        id: "azure-landing-zone-basics-q3",
        prompt:
          "A single workload with no on-premises network needs private access to Azure SQL. What is the proportionate setup?",
        options: [
          "A hub-and-spoke topology with Azure Firewall",
          "One workload VNet, VNet integration for the app, and a Private Endpoint for SQL with public access disabled",
          "Leaving the SQL public endpoint open with a firewall rule for the app's outbound IP",
          "ExpressRoute to the office",
        ],
        answer: 1,
        explanation:
          "Private Endpoints in a single VNet give the security benefit without hub-and-spoke overhead. A public endpoint with IP rules is weaker, and firewall hubs or ExpressRoute belong to multi-workload or hybrid estates.",
      },
    ],
    sources: [
      {
        title: "Cloud Adoption Framework: Azure landing zones",
        url: "https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/",
      },
      {
        title: "Cloud Adoption Framework: Naming and tagging conventions",
        url: "https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming",
      },
      {
        title: "Bicep documentation",
        url: "https://learn.microsoft.com/azure/azure-resource-manager/bicep/",
      },
    ],
  },
];
