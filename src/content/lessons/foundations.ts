import type { Lesson } from "../types";

/**
 * Foundations track: how architects think before they pick a style.
 * Drivers, trade-offs, the two documentation habits that survive contact
 * with a real team, coupling as something you can measure, and fitness
 * functions that keep the design honest in CI.
 */
export const FOUNDATIONS_LESSONS: Lesson[] = [
  {
    id: "architecture-drivers",
    trackId: "foundations",
    title: "Architecture drivers",
    tagline:
      "Quality attributes, constraints and the few requirements that actually shape a system.",
    level: 1,
    minutes: 8,
    summary:
      "Architecture drivers are the requirements that decide the shape of a system: measurable quality attributes such as availability or latency, hard constraints such as data residency or a fixed team, and the handful of functional requirements that are architecturally significant. Everything else is detail you can change later. Finding the drivers first is what stops a team from picking a style because it is fashionable.",
    sections: [
      {
        heading: "What counts as a driver",
        body: 'Most requirements do not shape the architecture. "Users can export invoices to PDF" is a feature; it fits a monolith, a serverless function or a microservice equally well. A driver is a requirement that rules options in or out. There are three kinds:\n\n- **Functional requirements that are architecturally significant**: "the warehouse scanner must work offline for four hours" or "ingest 50,000 sensor readings per second". Few features are like this, but the ones that are decide a lot.\n- **Quality attributes** (the cross-functional requirements, the "-ilities"): availability, latency, scalability, security, evolvability, testability, operability, cost.\n- **Constraints**: decisions already made for you, such as "must use the existing Azure landing zone", "three developers, no operations team" or "customer data stays in EU regions".\n\nThe job in the first weeks of a project is to find the five or so drivers that matter, write each one down with a number, and rank them. Ranking is the hard part, because drivers conflict: the cheapest option is rarely the most available one.',
      },
      {
        heading: "The -ilities, made concrete",
        body: 'A quality attribute is only useful when it is a measurable scenario: a stimulus, the environment it happens in, and a response with a number. "Highly available" is a wish. "During a single Azure zone outage, order placement keeps working with under 10 seconds of interruption" is a driver, and it decides the hosting: zone-redundant App Service or Container Apps and a zone-redundant Azure SQL tier.\n\nOn the Microsoft stack the common ones look like this:\n\n- **Availability**: a monthly downtime budget, which maps to SKU and zone or region redundancy. 99.9% allows about 43 minutes a month; 99.99% allows about 4 and usually needs a second region behind Azure Front Door.\n- **Performance**: a p95 latency for named operations, checked with Azure Load Testing before go-live.\n- **Scalability**: peak requests per second and how fast load changes; a Black Friday curve points to Container Apps scale rules or Functions rather than a fixed App Service plan.\n- **Security and compliance**: Entra ID for every identity, data classification, residency.\n- **Evolvability**: which parts will change monthly and which yearly.\n- **Operability**: who is on call, and what they can see at 3am.\n- **Cost**: a monthly ceiling, written down as a number.',
      },
      {
        heading: "Constraints: the decisions already made",
        body: 'Constraints are the fastest way to shrink the option space, so collect them first. They come from four places:\n\n- **Technical**: an existing SQL Server estate, a mandated Entra ID tenant, a platform team that only offers Container Apps and Azure SQL.\n- **Organisational**: team size and skills, a fixed delivery date, no 24/7 operations.\n- **Regulatory**: GDPR, PCI DSS, sector rules on data location and audit trails.\n- **Financial**: a budget, or a rule that spend must be predictable rather than usage-based.\n\nA constraint is not something to argue with during design; it is an input. The useful question is whether it is really a constraint or merely a preference. "We always use Redux" is a preference. "The customer\'s security team has approved exactly these Azure services" is a constraint. Mislabelling a preference as a constraint locks in choices nobody chose, and mislabelling a constraint as a preference wastes weeks on options that were never available.',
      },
      {
        heading: "How drivers decide the architecture",
        body: "Put the ranked drivers next to the candidate styles and most of the debate disappears.\n\nAn internal line-of-business app for 200 users, built by three developers in four months, with a driver list of time-to-market, low operating cost and simplicity, points at a modular monolith on App Service with Azure SQL. Microservices would fail three of the top drivers on day one.\n\nA public telemetry platform with a driver of 50,000 events per second, bursty, with 99.95% ingestion availability, points at Event Hubs in front of consumers on Container Apps with a store built for append-heavy writes. A single ASP.NET Core API writing straight to Azure SQL would fail the scalability driver.\n\nThe same technique works for smaller decisions: sync call or queue, one database or one per module, SPA or server-rendered. State the drivers, score each option against them, pick the best fit, and write the reasoning down so the next person can see which driver would have to change for the decision to change. Drivers do change: a product that doubles its user base or acquires a second market gets a new list.",
      },
      {
        heading: "Common mistakes",
        body: '- Rating every quality attribute as "high". If nothing is allowed to be low, nothing has been prioritised and the architecture will be chosen by whoever argues loudest.\n- Letting the stack choose the drivers. "We are a .NET shop" is a constraint on tooling; it says nothing about whether you need a queue.\n- Drivers without numbers. A driver you cannot measure cannot be tested, so it cannot become a fitness function and it will quietly be ignored.\n- Forgetting operability and cost. They rarely appear in the backlog, and they are the two that hurt most after go-live.\n- Treating the list as finished. Revisit it at every significant milestone and whenever a stakeholder changes.',
      },
    ],
    diagram: {
      caption:
        "Only some requirements shape the architecture. Constraints prune first, then ranked drivers decide between the survivors.",
      nodes: [
        {
          id: "goals",
          label: "Business goals",
          sub: "why the system exists",
          col: 0,
          row: 1,
          kind: "note",
        },
        {
          id: "fr",
          label: "Functional reqs",
          sub: "a few are significant",
          col: 1,
          row: 0,
          kind: "note",
        },
        {
          id: "qa",
          label: "Quality attributes",
          sub: "measurable scenarios",
          col: 1,
          row: 1,
          kind: "note",
        },
        {
          id: "con",
          label: "Constraints",
          sub: "already decided",
          col: 1,
          row: 2,
          kind: "note",
        },
        {
          id: "drivers",
          label: "Ranked drivers",
          sub: "top five, with numbers",
          col: 2,
          row: 1,
          kind: "note",
        },
        {
          id: "decisions",
          label: "Architecture",
          sub: "style, hosting, data",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "adr",
          label: "ADR + fitness test",
          sub: "reasoning kept alive",
          col: 4,
          row: 1,
          kind: "data",
        },
      ],
      edges: [
        { from: "goals", to: "fr" },
        { from: "goals", to: "qa" },
        { from: "goals", to: "con" },
        { from: "fr", to: "drivers", label: "only the significant" },
        { from: "qa", to: "drivers", label: "with a number each" },
        { from: "con", to: "drivers", label: "prune options first" },
        { from: "drivers", to: "decisions", label: "score candidates" },
        { from: "decisions", to: "adr", style: "dashed" },
      ],
    },
    useWhen: [
      "Starting a new system or a re-platforming and the team is already arguing microservices versus monolith",
      "Stakeholders describe requirements only as features and nobody has said a number for availability, latency or users",
      "A regulatory, residency or budget constraint exists that could rule out whole classes of options",
      "Two options look equally good and the tie-breaker is currently personal taste",
    ],
    avoidWhen: [
      "A throwaway spike whose purpose is to learn something in two weeks; its only driver is speed",
      "The decision is local to one module and reversible in an afternoon; a one-line note is enough",
      "The drivers were captured recently and nothing has changed; do not rerun the workshop for its own sake",
    ],
    microsoftStack: [
      {
        name: "Azure Well-Architected Framework",
        role: "Its five pillars (reliability, security, cost, operational excellence, performance efficiency) are a ready-made checklist of quality attributes.",
      },
      {
        name: "Azure service SLAs and zone redundancy",
        role: "An availability driver becomes a concrete SKU and redundancy choice for App Service, Container Apps and Azure SQL.",
      },
      {
        name: "Azure Load Testing",
        role: "Turns a p95 latency driver into a pass or fail check before go-live.",
      },
      {
        name: "Azure Pricing Calculator and Cost Management",
        role: "Puts a number on the cost driver and keeps it visible after launch.",
      },
      {
        name: "Azure Policy and Entra ID",
        role: "Where organisational constraints such as allowed regions and identity rules are enforced, so they are real constraints rather than preferences.",
      },
    ],
    reactStack: [
      {
        name: "Core Web Vitals budgets",
        role: "LCP and INP targets are the front-end's performance drivers and decide whether SSR or a plain SPA fits.",
      },
      {
        name: "Offline requirement",
        role: 'A single "must work without a connection" driver changes the data layer: service worker, TanStack Query persistence and conflict handling.',
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Fewer options survive, so the design has fewer moving parts to justify.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "A day or two of driver work up front, repaid by fewer reversals later.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "You design for a number instead of a guess.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Named operations get latency targets that can be load tested.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "An availability target chooses redundancy deliberately instead of by default.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Knowing which drivers are likely to change tells you where to leave seams.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Measurable scenarios become automated fitness functions.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Operability is on the list, so it gets designed rather than discovered on call.",
      },
      {
        attribute: "cost",
        effect: 2,
        note: "Constraints prune expensive options before anyone has built on them.",
      },
    ],
    related: [
      "tradeoff-thinking",
      "fitness-functions",
      "azure-compute-choices",
      "c4-and-adrs",
    ],
    checks: [
      {
        id: "architecture-drivers-q1",
        prompt:
          'A product owner says the new ordering system must be "highly available". What is the architect\'s best next step?',
        options: [
          "Deploy to two Azure regions behind Front Door to be safe",
          "Ask for the number: acceptable downtime per month, and which operations it covers",
          "Add retries to every outbound HTTP call",
          'Record "high availability" as a driver and move on',
        ],
        answer: 1,
        explanation:
          "A driver needs a measurable scenario before it can choose anything; 99.9% and 99.99% lead to very different (and differently priced) hosting. Jumping to two regions buys the most expensive option without knowing it is needed, and retries address transient faults, not availability targets.",
      },
      {
        id: "architecture-drivers-q2",
        prompt:
          "Which of these is a constraint rather than a quality attribute?",
        options: [
          "p95 checkout latency under 400 ms",
          "All customer data must stay in EU regions",
          "The system should be easy to change",
          "99.9% monthly availability",
        ],
        answer: 1,
        explanation:
          "Data residency is a decision already made by regulation; it prunes regions and services before design starts. Latency, evolvability and availability are quality attributes you trade off against each other.",
      },
      {
        id: "architecture-drivers-q3",
        prompt:
          "An internal reporting tool for 40 users, two developers, three months. Which driver set most likely leads to the right shape?",
        options: [
          "Scalability to a million users and independent deployability per feature",
          "Time-to-market, low operating cost and simplicity",
          "Multi-region availability and sub-100 ms latency",
          "Team autonomy across six teams",
        ],
        answer: 1,
        explanation:
          "With two people and three months, speed, cost and simplicity dominate, which points to a single App Service and Azure SQL. The other sets describe drivers this project does not have; designing for them would spend the whole budget on plumbing.",
      },
    ],
    sources: [
      {
        title: "Azure Well-Architected Framework",
        url: "https://learn.microsoft.com/azure/well-architected/",
      },
      {
        title: "Azure Architecture Center: architecture styles",
        url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/",
      },
    ],
  },
  {
    id: "tradeoff-thinking",
    trackId: "foundations",
    title: "Trade-off thinking",
    tagline:
      "There are no best practices, only trade-offs. See both sides, then argue the choice.",
    level: 1,
    minutes: 8,
    summary:
      "Every architectural choice gives something up, so the skill is naming what you gain, what you lose, and how expensive it is to change your mind later. Spend decision effort in proportion to the cost of reversal, defer the irreversible choices until you know the most, and write the argument so a sceptic can follow it. A worked example compares a synchronous call with a queue in Azure.",
    sections: [
      {
        heading: "No best practices, only trade-offs",
        body: 'A "best practice" is a trade-off that worked for someone else in a context they did not write down. Microservices were a best practice at companies with hundreds of engineers; copied into a team of five they are a liability. Caching is a best practice until the first stale-data incident. The honest answer to most architecture questions is "it depends", and the honest architect finishes the sentence: it depends on which drivers you rank highest.\n\nTwo habits follow from this. First, when someone proposes an option, ask what it costs; if the answer is "nothing", nobody has looked hard enough. Second, when you recommend an option, state the alternative you rejected and why it lost on the drivers that matter here. A recommendation with no rejected alternative is an opinion, and opinions do not survive a change of staff.',
      },
      {
        heading: "First-derivative thinking: the cost of change",
        body: "The current state of a system matters less than how expensive it is to change. Two systems can look identical today and differ entirely in what next year's change costs. So the question to ask about any decision is: if this turns out to be wrong, what does undoing it cost?\n\nSome decisions are cheap to reverse: a logging library, a folder layout, a validation package, which React state library a feature uses. Pick something reasonable, write one line, move on. Some are expensive or practically irreversible: the database engine, the multi-tenant isolation model, a public API contract a partner has integrated with, the message schema on a shared topic, the identity provider. Treat these as one-way doors.\n\nFor one-way doors, delay until the last responsible moment, when you have the most information and the decision is still not blocking anyone. Then decide deliberately, with options compared and the reasoning recorded. For two-way doors, delaying is the mistake: decide fast and let the code tell you if you were wrong.",
      },
      {
        heading: "Worked example: sync call or queue",
        body: 'Ordering must tell the warehouse about a new order. Option A: the ASP.NET Core Ordering API calls the Warehouse API over HTTPS with `HttpClient` and the standard resilience handler. Option B: Ordering publishes `OrderPlaced` to an Azure Service Bus queue and a warehouse worker consumes it.\n\nAgainst the drivers:\n\n- **Latency and feedback**: A gives the customer an immediate yes or no on stock allocation. B gives "received" now and allocation later, so the UI needs a status to poll or a SignalR push.\n- **Reliability**: A fails when the warehouse is down or slow, so Ordering inherits the warehouse\'s availability. B keeps taking orders during a warehouse outage; the queue absorbs it.\n- **Consistency**: A can return a failure and keep the two systems aligned. B is eventual, so you need idempotent consumers, a dead-letter queue and someone watching it.\n- **Complexity and cost**: A is a few lines. B adds a namespace, a worker, an outbox table and monitoring.\n\nIf the business rule is "never accept an order we cannot allocate", A wins and the warehouse must be made reliable. If the rule is "never lose an order" and the warehouse has weekly maintenance windows, B wins. Same code, opposite answers, decided by the driver.',
      },
      {
        heading: "How to argue a choice",
        body: 'An argument that convinces a sceptical reviewer has a fixed shape, which is also the shape of an Architecture Decision Record:\n\n- **Context**: the situation and the drivers that matter, with numbers.\n- **Options**: at least two that a reasonable colleague would actually pick. A straw-man alternative fools nobody.\n- **Trade-offs**: how each option scores on each driver, including what the preferred option loses.\n- **Decision** and **consequences**: what you chose, what becomes harder, and what you will do about that.\n- **What would change our mind**: the driver whose change would reopen the decision.\n\nUse numbers where you can (latency measured in a spike, cost from the pricing calculator, incidents from the last quarter). Avoid authority ("Microsoft recommends", "Netflix does this"); vendors and large companies have different drivers from yours. If you cannot name what the chosen option gives up, you have not finished thinking.',
      },
      {
        heading: "Traps",
        body: '- **Resume-driven architecture**: choosing Kubernetes, event sourcing or micro-frontends because they are interesting. The drivers will not be in the ADR because they were never there.\n- **Speculative generality**: "we might need it later". Later you will know more; build the seam (an interface, a contracts project) rather than the infrastructure.\n- **Hidden one-way doors**: a shared database schema, an event published to a topic other teams read, a URL structure customers bookmark. These look small on the day and are brutal to change.\n- **Premature pessimisation**: avoiding a simple design because it "will not scale", without a number for the scale that is actually expected.\n- **Deciding by committee**: a trade-off has an owner who can explain it; a vote produces no explanation.',
      },
    ],
    diagram: {
      caption:
        "The same integration as a synchronous call (fails together, answers now) and as a queue (survives an outage, answers later).",
      nodes: [
        {
          id: "ordering",
          label: "Ordering API",
          sub: "ASP.NET Core",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "warehouse",
          label: "Warehouse API",
          sub: "sync HTTP call",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "queue",
          label: "Service Bus queue",
          sub: "OrderPlaced",
          col: 1,
          row: 2,
          kind: "queue",
        },
        {
          id: "worker",
          label: "Warehouse worker",
          sub: "idempotent consumer",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "noteA",
          label: "Option A",
          sub: "answer now, fail together",
          col: 3,
          row: 0,
          kind: "note",
        },
        {
          id: "noteB",
          label: "Option B",
          sub: "eventual, survives outage",
          col: 3,
          row: 2,
          kind: "note",
        },
      ],
      edges: [
        { from: "ordering", to: "warehouse", label: "HTTP 200 or error" },
        { from: "ordering", to: "queue", label: "publish via outbox" },
        { from: "queue", to: "worker", label: "at-least-once" },
        { from: "warehouse", to: "noteA", style: "dashed" },
        { from: "worker", to: "noteB", style: "dashed" },
      ],
      groups: [
        { label: "Option A: synchronous", nodeIds: ["warehouse"] },
        { label: "Option B: queue", nodeIds: ["queue", "worker"] },
      ],
    },
    useWhen: [
      "Two senior developers disagree and both arguments are about preference rather than drivers",
      "The decision is expensive to reverse: database engine, public API contract, tenant isolation model",
      "A vendor talk or a big company's blog is being used as the justification for a change",
      'Someone wants to add infrastructure (a broker, a cache, a second database) "because we will need it"',
    ],
    avoidWhen: [
      "The decision is cheap to reverse and local to one feature; pick a reasonable option, note it in a line, move on",
      "A constraint already decided it (the platform team mandates Container Apps); record the constraint instead of re-litigating",
      "You are in a spike whose whole purpose is to generate the information a real decision needs",
    ],
    microsoftStack: [
      {
        name: "Azure Service Bus versus HttpClient",
        role: "The canonical sync-or-async decision; the standard resilience handler is what makes the sync option honest.",
      },
      {
        name: "Azure Well-Architected Framework trade-off pages",
        role: "Each pillar lists what you give up to improve it, a ready reference when writing the trade-offs section.",
      },
      {
        name: "Azure Pricing Calculator",
        role: "Turns the cost side of a trade-off into a number before the ADR is written.",
      },
      {
        name: "Azure SQL versus Cosmos DB",
        role: "A one-way door: the data model and consistency choices leak into every query, so decide late and deliberately.",
      },
      {
        name: "Contracts projects and InternalsVisibleTo",
        role: "The cheap seam that lets you defer the expensive extraction decision.",
      },
    ],
    reactStack: [
      {
        name: "Next.js versus a Vite SPA",
        role: "The rendering model is hard to reverse once routes, data fetching and hosting are built around it.",
      },
      {
        name: "Zustand, Redux Toolkit or TanStack Query per feature",
        role: "State tooling is a two-way door at feature level; choose quickly and let usage decide.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Naming what each option costs tends to favour the option with fewer parts.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Comparing real options takes longer than picking the familiar one.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Decisions line up with the same ranked drivers instead of with whoever decided.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Failure modes are discussed before they happen rather than in the incident review.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Knowing which doors are one-way tells you where to leave seams.",
      },
      {
        attribute: "testability",
        effect: 0,
        note: "No direct effect; the drivers you name may become fitness functions.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "A shared method lets teams decide locally without escalating every call.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Operational cost is on the scorecard, so it stops being a surprise.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Speculative infrastructure is the most common avoidable spend.",
      },
    ],
    related: [
      "architecture-drivers",
      "c4-and-adrs",
      "azure-messaging-choices",
      "messaging-outbox-saga",
    ],
    checks: [
      {
        id: "tradeoff-thinking-q1",
        prompt: "Which decision is the most expensive to reverse?",
        options: [
          "The validation library used in Minimal API endpoints",
          "The folder layout of the React app",
          "The tenant isolation model for customer data in Azure SQL",
          "The logging provider",
        ],
        answer: 2,
        explanation:
          "Tenant isolation shapes every table, query, backup and security review; changing it later is a migration of live customer data. Libraries and folder layouts can be swapped feature by feature with no data movement.",
      },
      {
        id: "tradeoff-thinking-q2",
        prompt:
          "The warehouse API is down for an hour every week for maintenance, and customers do not need instant confirmation of stock allocation. Sync call or queue?",
        options: [
          "Synchronous call with three retries",
          "An Azure Service Bus queue with an idempotent consumer",
          "Synchronous call, returning an error to the customer during maintenance",
          "Write directly into the warehouse database",
        ],
        answer: 1,
        explanation:
          'The drivers here are "never lose an order" and a known weekly outage, which is exactly what a queue absorbs. Retries do not cover an hour-long gap, and writing into another system\'s database is the strongest coupling you can create.',
      },
      {
        id: "tradeoff-thinking-q3",
        prompt:
          "What makes an architectural argument convincing to a sceptical reviewer?",
        options: [
          "Citing a large company that made the same choice",
          "Naming the drivers, comparing at least two real options against them, and saying what would change the decision",
          "Listing every benefit of the chosen option",
          "Showing that a proof of concept runs",
        ],
        answer: 1,
        explanation:
          "A reviewer can check an argument that is anchored to drivers and real alternatives. A list of benefits hides the costs, a working prototype proves feasibility rather than fit, and a large company's drivers are rarely yours.",
      },
    ],
    sources: [
      {
        title: "Azure Well-Architected Framework",
        url: "https://learn.microsoft.com/azure/well-architected/",
      },
      {
        title: "Azure Architecture Center: cloud design patterns",
        url: "https://learn.microsoft.com/azure/architecture/patterns/",
      },
      {
        title: "Azure Service Bus documentation",
        url: "https://learn.microsoft.com/azure/service-bus-messaging/",
      },
    ],
  },
  {
    id: "c4-and-adrs",
    trackId: "foundations",
    title: "C4 diagrams and ADRs",
    tagline:
      "Four zoom levels for pictures, one page per decision. Documentation that stays true.",
    level: 1,
    minutes: 7,
    summary:
      "The C4 model gives you four consistent zoom levels for drawing a system, and in practice only the first two are worth maintaining. Architecture Decision Records capture why a decision was made in one page that lives in the repository next to the code it affects. Together they are the smallest documentation set that a team keeps accurate.",
    sections: [
      {
        heading: "The C4 model",
        body: "C4 is a way of drawing software at four levels of zoom, with the same notation at each level: a box has a name, a technology and a one-line description, and arrows have a label saying what travels along them.\n\n- **Context**: the system as one box, the people who use it, and the external systems it talks to (Entra ID, a payment provider, the ERP).\n- **Container**: the deployable or runnable units inside the system. For a typical Microsoft-stack product that is a React SPA, an ASP.NET Core API, a worker, Azure SQL, Service Bus and a Redis cache, each labelled with its technology.\n- **Component**: the major building blocks inside one container, such as the modules of a modular monolith or the handlers and ports of a Clean Architecture service.\n- **Code**: classes and interfaces. Generate it from the code if you need it; never draw it by hand.\n\nThe discipline is to keep each diagram at one level. A context diagram with a database on it, or a container diagram showing classes, confuses readers and goes stale.",
      },
      {
        heading: "Which levels are worth drawing",
        body: 'Draw the **context** diagram always. It is the onboarding picture, the one you show the security team and the one stakeholders can read. It changes rarely.\n\nDraw the **container** diagram always. It is what most people mean by "the architecture diagram", and it maps almost one to one onto Azure resources in a resource group, so it doubles as the deployment picture if you annotate hosting (App Service, Container Apps, Azure SQL tier).\n\nDraw a **component** diagram only for containers with real internal structure, and accept that it is the first to go stale. Skip it for a CRUD API.\n\nTwo supplementary diagrams earn their place: a **deployment** view when environments, regions or subscriptions matter, and a **dynamic** view for one or two critical flows (checkout, sign-in) showing the order of calls.\n\nKeep diagrams as text so they are reviewed like code. Structurizr DSL describes the model once and renders every level from it; Mermaid has a C4 syntax that GitHub and Azure DevOps render inline; PlantUML with the C4 library is the other common choice. Any of these is better than a drawing tool file nobody can diff.',
      },
      {
        heading: "Architecture Decision Records",
        body: "An ADR is a short document, usually one page, that records a single significant decision. The classic format has five parts: **Title**, **Status** (proposed, accepted, superseded), **Context** (the situation and drivers), **Decision** (what was chosen, in the active voice) and **Consequences** (what becomes easier and what becomes harder). Most teams add **Options considered**, the date and who decided.\n\n```\ndocs/adr/0007-use-service-bus-for-order-events.md\n\nTitle: 7. Use Service Bus for order events\nStatus: accepted (2026-03-14)\nContext: Warehouse has weekly maintenance windows; orders must never be lost ...\nOptions: synchronous HTTP; Service Bus queue; Event Grid\nDecision: publish OrderPlaced to a Service Bus queue via an outbox table ...\nConsequences: eventual allocation; needs DLQ monitoring and idempotent consumer ...\n```\n\nADRs are numbered and immutable once accepted. If the decision changes, write a new ADR and mark the old one superseded; the history of why is the valuable part. Write one for decisions that are expensive to reverse, contested, or that affect more than one team. Do not write one for every library.",
      },
      {
        heading: "Where they live and how they stay alive",
        body: 'ADRs and diagram sources live in the repository with the code they describe, typically `docs/adr/` and `docs/architecture/`. For a modular monolith that is one folder at the root. In a multi-repo setup, platform-level decisions (landing zone, identity, observability) live in the platform repo and service-level decisions in each service repo, with a short index linking them.\n\nThe habit that keeps them alive is simple: the ADR is written or updated in the same pull request as the change it describes, and reviewed there. An ADR that is still "proposed" after a month is a signal that the decision is being made implicitly by code.\n\nLink each ADR to the thing that enforces it. "Modules only reference contracts projects" points to the NetArchTest test; "all PaaS endpoints are private" points to the Azure Policy assignment. A decision with no enforcement is a hope.\n\nOnce a quarter, read the index. Mark what is superseded, delete diagrams nobody has opened, and check that the container diagram still matches the resource group.',
      },
      {
        heading: "Common mistakes",
        body: '- An icon soup diagram: forty Azure icons, no boundaries, no labelled arrows. It impresses in a slide deck and explains nothing.\n- Mixing levels: classes on the container diagram, databases on the context diagram.\n- ADRs written after the fact to justify what was built. The options section gives it away: one real option and two straw men.\n- Documentation in a wiki or SharePoint site that is not reviewed with code. It is accurate for a month.\n- Ten-page ADRs. If it needs ten pages, it is several decisions or a design document.\n- No ADR for deciding not to do something ("we will not adopt microservices this year"). Those are the decisions people relitigate most.',
      },
    ],
    diagram: {
      caption:
        "C4 zooms in level by level; diagram sources and ADRs sit in the repo and are reviewed in the same pull request as the code.",
      nodes: [
        {
          id: "ctx",
          label: "1. Context",
          sub: "system, users, externals",
          col: 0,
          row: 0,
          kind: "note",
        },
        {
          id: "cont",
          label: "2. Container",
          sub: "SPA, API, SQL, Service Bus",
          col: 1,
          row: 0,
          kind: "note",
        },
        {
          id: "comp",
          label: "3. Component",
          sub: "modules inside the API",
          col: 2,
          row: 0,
          kind: "note",
        },
        {
          id: "code",
          label: "4. Code",
          sub: "generate, never draw",
          col: 3,
          row: 0,
          kind: "note",
        },
        {
          id: "dsl",
          label: "Diagram source",
          sub: "Structurizr DSL / Mermaid",
          col: 1,
          row: 2,
          kind: "data",
        },
        {
          id: "adr",
          label: "ADRs",
          sub: "docs/adr/NNNN-title.md",
          col: 2,
          row: 2,
          kind: "data",
        },
        {
          id: "repo",
          label: "Git repo + CI",
          sub: "rendered, reviewed in PR",
          col: 3,
          row: 2,
          kind: "service",
        },
      ],
      edges: [
        { from: "ctx", to: "cont", label: "zoom in" },
        { from: "cont", to: "comp", label: "zoom in" },
        { from: "comp", to: "code", label: "zoom in" },
        {
          from: "dsl",
          to: "cont",
          label: "renders every level",
          style: "dashed",
        },
        { from: "adr", to: "cont", label: "explains why", style: "dashed" },
        { from: "dsl", to: "repo" },
        { from: "adr", to: "repo", label: "same PR as the change" },
      ],
    },
    useWhen: [
      "A new developer needs more than a day to understand how the pieces deploy and talk to each other",
      'Someone asks "why did we choose X" and the answer lives in a departed colleague\'s head',
      "A decision is contested, expensive to reverse, or affects more than one team",
      "Stakeholders outside engineering need one accurate picture of the system",
    ],
    avoidWhen: [
      "Component diagrams for every CRUD module; they go stale before the next sprint ends",
      "ADRs for choices that are cheap to reverse, such as a date library or a folder name",
      "Documentation that lives in a wiki nobody reviews with the code; it will rot and mislead",
    ],
    microsoftStack: [
      {
        name: "Azure Architecture Center reference architectures",
        role: "Container-level pictures of common Azure workloads to borrow structure and naming from.",
      },
      {
        name: "Azure architecture icons",
        role: "The official icon set, used sparingly on container and deployment diagrams for hosting annotations.",
      },
      {
        name: "Mermaid in GitHub and Azure DevOps",
        role: "Both render Mermaid diagrams in markdown, so a C4 container diagram can live in a README and show in pull requests.",
      },
      {
        name: "Structurizr DSL",
        role: "One text model of the system from which context, container and component views are rendered and versioned.",
      },
      {
        name: "Pull requests in GitHub or Azure Repos",
        role: "The review channel for ADRs; a decision is accepted when the PR merges.",
      },
    ],
    reactStack: [
      {
        name: "The SPA as a container",
        role: "Show its hosting (Static Web Apps, App Service, Container Apps) and which API or BFF it calls, with the protocol on the arrow.",
      },
      {
        name: "ADRs for front-end structural choices",
        role: "Rendering model, server-state library and design-system source are the decisions worth a page.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "A shared vocabulary and one picture reduce the explaining every change needs.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "An hour per significant decision, repaid in shorter onboarding and fewer repeated debates.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Decisions reference earlier decisions instead of contradicting them.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Knowing why something was chosen is what makes it safe to change.",
      },
      {
        attribute: "deployability",
        effect: 0,
        note: "No direct effect; a deployment view helps when environments multiply.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Each ADR names the fitness function that enforces it.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Teams can decide locally and record it without an architecture board.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "The container diagram is what on-call reads at 3am to know what talks to what.",
      },
    ],
    related: [
      "tradeoff-thinking",
      "fitness-functions",
      "modular-monolith",
      "azure-landing-zone-basics",
    ],
    checks: [
      {
        id: "c4-and-adrs-q1",
        prompt:
          "Which C4 level maps most directly onto the Azure resources in a resource group?",
        options: ["Context", "Container", "Component", "Code"],
        answer: 1,
        explanation:
          "Containers are the deployable units: the API, the worker, the database, the queue. Those are exactly what you see as resources. Context is coarser (one box for the whole system) and components live inside a single deployable.",
      },
      {
        id: "c4-and-adrs-q2",
        prompt:
          'ADR-0004 "Use Azure SQL for all modules" was accepted in 2024. In 2026 the Catalog module moves to Cosmos DB. What should happen to ADR-0004?',
        options: [
          "Edit it to describe the new state",
          "Delete it to avoid confusion",
          "Mark it superseded by a new ADR that records the Catalog decision and why",
          "Leave it unchanged; accepted ADRs are never touched",
        ],
        answer: 2,
        explanation:
          "ADRs are immutable except for status, so the history of why both decisions were made survives. Editing or deleting destroys that history; leaving it untouched with no status change leaves a wrong document marked accepted.",
      },
      {
        id: "c4-and-adrs-q3",
        prompt:
          "Where should ADRs live for a modular monolith in one GitHub repository?",
        options: [
          "A SharePoint site owned by the architecture board",
          "`docs/adr` in the same repository, reviewed in the pull request that implements the decision",
          "Comments at the top of Program.cs",
          "A pinned message in the team's Teams channel",
        ],
        answer: 1,
        explanation:
          "Keeping ADRs beside the code means they are reviewed, versioned and found by the people changing that code. External sites drift from the code within months, and code comments or chat messages are not discoverable or reviewable as decisions.",
      },
    ],
    sources: [
      {
        title: "The C4 model for visualising software architecture",
        url: "https://c4model.com/",
      },
      {
        title: "Architecture decision records (adr.github.io)",
        url: "https://adr.github.io/",
      },
      {
        title: "Azure Architecture Center",
        url: "https://learn.microsoft.com/azure/architecture/",
      },
    ],
  },
  {
    id: "coupling-and-cohesion",
    trackId: "foundations",
    title: "Coupling and cohesion",
    tagline:
      "Measure what depends on what, and when. A boundary is only as real as its coupling.",
    level: 2,
    minutes: 8,
    summary:
      "Cohesion is whether the things that change together live together; coupling is what else has to change when they do. Both can be measured: afferent and efferent coupling tell you which projects are stable and which are volatile, and the static versus dynamic distinction shows coupling the compiler cannot see. Connascence gives a vocabulary for how strong a dependency is, and most of this applies unchanged to React modules.",
    sections: [
      {
        heading: "Cohesion first",
        body: "A module is cohesive when one reason to change touches one place. Functional cohesion is the goal: an `Ordering` module that holds its endpoints, handlers, validators, EF Core configuration and events. The opposite is coincidental cohesion, and every solution has an example: the `Utils`, `Helpers` or `Common` project where unrelated code goes because nobody decided where it belonged.\n\nThe test is practical. When a requirement changes, how many folders or projects do you open? A layered solution (`Controllers`, `Services`, `Repositories`, `Models`) scores badly: a change to order discounts touches four projects. A feature folder or module scores well: one folder, one pull request, one reviewer who knows the area.\n\nIn React the same test applies. `features/checkout` with its components, hooks, API client and tests is cohesive. `components/`, `hooks/`, `api/` and `utils/` at the top level is the layered shape again, and it produces the same four-folder change.",
      },
      {
        heading: "Afferent and efferent coupling",
        body: "Two numbers describe each project or package. **Afferent coupling (Ca)** counts who depends on it. **Efferent coupling (Ce)** counts what it depends on. From them, instability I = Ce / (Ca + Ce): 0 means everything depends on it and it depends on nothing; 1 means the reverse.\n\nThe useful rule: a project that many others depend on (high Ca, low I) must be stable, so it should contain abstractions and contracts that rarely change. A project that depends on many others (high Ce, high I) is free to change, which is fine as long as nothing important depends on it.\n\nOn a .NET solution this maps directly. `Ordering.Contracts` should have high Ca and zero Ce: interfaces, DTOs, integration events. The `Host` project has high Ce and zero Ca, which is correct for an entry point. The warning sign is a project with **both** high Ca and high Ce, which is what `Shared` or `Common` becomes after a year: everybody depends on it and it depends on half the solution, so every change ripples everywhere. NDepend computes these for a solution and draws the dependency matrix; `dotnet list reference` gives you the raw graph for free.",
      },
      {
        heading: "Static versus dynamic coupling",
        body: "**Static coupling** is what the compiler sees: project references, `using` directives, `import` statements. It is visible, cheap to measure and easy to enforce with an architecture test.\n\n**Dynamic coupling** happens at runtime and the compiler never sees it: synchronous HTTP calls, two services reading the same SQL table, a shared Redis key, an event schema both sides parse. Its strongest form is **temporal coupling**: A only works when B is up at the same moment. A chain of synchronous calls multiplies this; four services at 99.9% each give the caller about 99.6%.\n\nMicroservices usually reduce static coupling and increase dynamic coupling, which is why they feel decoupled in the IDE and coupled in production. A queue removes the temporal coupling but adds coupling to the message schema, so the dependency has moved rather than disappeared. Two services sharing a database table is the strongest coupling there is: the schema is a contract with no compiler to warn you, and every migration is a coordinated release. The DI container is a milder version of the same problem: a class that resolves `IServiceProvider` by hand depends on things no reference graph will show.",
      },
      {
        heading: "Connascence, briefly",
        body: 'Connascence names how strongly two pieces of code must agree, ordered from weakest to strongest:\n\n- **Name**: both must use the same identifier. Unavoidable and cheap; refactoring tools handle it.\n- **Type**: both agree on a type. Also cheap in C# and TypeScript.\n- **Meaning**: both agree what a magic value means (`status == 3`). Replace with an enum.\n- **Position**: both agree on argument order (`Create("x", "y", true, 7)`). Replace with a named options record.\n- **Algorithm**: both implement the same logic (two sides hashing a key the same way). Share the code or make one side the owner.\n- **Execution order**, **timing** and **identity**: dynamic forms; both must call things in a sequence, within a window, or on the same instance.\n\nTwo rules make it useful. Refactor towards weaker forms. And mind locality: strong connascence inside one class is fine, across modules it is a problem, across services it is an outage waiting to happen.',
      },
      {
        heading: "In .NET solutions and React codebases",
        body: "On the .NET side, the project reference graph is your static coupling, so keep it a tree or a shallow DAG with no cycles, and make `Contracts` projects the only shared surface between modules. Use `InternalsVisibleTo` to keep implementation types internal and let NetArchTest or ArchUnitNET fail the build on a crossing. Watch for EF Core navigation properties that reach into another module's entities and for two modules sharing a `DbContext`; both are static coupling disguised as convenience.\n\nOn the React side, imports are the static graph and the same tools exist: dependency-cruiser or eslint-plugin-boundaries can enforce that `features/*` only import each other through a public `index.ts` and that `shared/` never imports a feature. Barrel files that re-export everything look tidy and silently couple every consumer to every export, which also defeats tree shaking. A single global store (one Redux slice tree) couples every feature to one shape; per-feature stores or TanStack Query keys per feature keep the coupling local. React context is dynamic coupling: a component that reads a context depends on a provider somewhere above it that no import shows.",
      },
    ],
    diagram: {
      caption:
        "Static coupling the compiler sees (solid) and dynamic coupling it does not (dashed). The Shared project with high Ca and high Ce is the warning sign.",
      nodes: [
        {
          id: "host",
          label: "Host",
          sub: "Ce high, Ca 0: fine",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "ordering",
          label: "Ordering",
          sub: "module",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "catalog",
          label: "Catalog",
          sub: "module",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "contracts",
          label: "Catalog.Contracts",
          sub: "Ca high, Ce 0: stable",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "shared",
          label: "Shared.Common",
          sub: "Ca high AND Ce high",
          col: 3,
          row: 0,
          kind: "note",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "shared tables couple",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "host", to: "ordering" },
        { from: "host", to: "catalog" },
        { from: "ordering", to: "contracts", label: "static, compile-time" },
        { from: "catalog", to: "contracts", label: "implements" },
        { from: "ordering", to: "shared", label: "everything references" },
        { from: "catalog", to: "shared" },
        {
          from: "ordering",
          to: "db",
          label: "dynamic, runtime",
          style: "dashed",
        },
        { from: "catalog", to: "db", style: "dashed" },
      ],
    },
    useWhen: [
      "A change to one feature regularly forces edits in three or more projects or folders",
      "A Shared, Common or Utils project is referenced by everything and references half the solution",
      "You are planning to extract a module or service and need to know what will break",
      "Build times or React bundle sizes have grown because everything imports everything",
    ],
    avoidWhen: [
      "A small codebase one team can hold in their heads; measure when the first ripple change hurts",
      "Chasing a metric target such as instability below 0.3; metrics point at problems, they do not decide designs",
    ],
    microsoftStack: [
      {
        name: "Project references and InternalsVisibleTo",
        role: "The static coupling graph the compiler enforces; keep it acyclic and route cross-module use through Contracts projects.",
      },
      {
        name: "NDepend",
        role: "Computes Ca, Ce and instability per project and draws the dependency matrix for a .NET solution.",
      },
      {
        name: "NetArchTest or ArchUnitNET",
        role: "Fails the build when a module references another module's implementation.",
      },
      {
        name: "EF Core DbContext per module",
        role: "Separate contexts and SQL schemas keep data coupling visible instead of hidden in navigation properties.",
      },
      {
        name: "Azure Service Bus",
        role: "Trades temporal coupling for message-schema coupling; the schema becomes the contract to version.",
      },
    ],
    reactStack: [
      {
        name: "dependency-cruiser or eslint-plugin-boundaries",
        role: "Enforce that features import each other only via a public index and that shared code never imports features.",
      },
      {
        name: "TanStack Query keys per feature",
        role: "Keeps server-state coupling local instead of one global store every feature depends on.",
      },
      {
        name: "No barrel re-exports",
        role: "Avoids coupling every consumer to every export and keeps tree shaking effective.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Fewer surprising dependencies, though more deliberate structure to learn.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Keeping boundaries honest costs review time on every pull request.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Smaller React bundles and faster .NET incremental builds when the graph is shallow.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Low coupling is the property that makes any later change cheap.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "A module with known dependencies can be extracted or deployed without surprises.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "Cohesive modules with narrow contracts need few fakes to test.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Teams can own a module when its dependencies are explicit.",
      },
      {
        attribute: "consistency",
        effect: 0,
        note: "No direct effect; shared tables give consistency at the price of the strongest coupling.",
      },
    ],
    related: [
      "modular-monolith",
      "clean-architecture",
      "react-code-organisation",
      "fitness-functions",
    ],
    checks: [
      {
        id: "coupling-and-cohesion-q1",
        prompt:
          "A Shared project is referenced by 12 projects (Ca = 12) and references 9 projects (Ce = 9). What does this tell you?",
        options: [
          "It is a well-designed core library",
          "It is both widely depended on and volatile, so changes ripple everywhere; split it into stable contracts and concrete helpers",
          "Nothing; coupling metrics only matter for microservices",
          "It should be published as a NuGet package",
        ],
        answer: 1,
        explanation:
          "High Ca demands stability and high Ce guarantees churn; a project with both is the classic ripple source. Packaging it as NuGet makes the ripple slower and more painful rather than smaller.",
      },
      {
        id: "coupling-and-cohesion-q2",
        prompt:
          "Two services have separate repos and no project references, but both read and write the same Orders table in Azure SQL. How coupled are they?",
        options: [
          "Not coupled; there are no compile-time references",
          "Loosely coupled through the database",
          "Tightly coupled: the schema is a shared contract with no compiler to warn you, and every migration is a coordinated release",
          "Coupled only at deployment time",
        ],
        answer: 2,
        explanation:
          "A shared table is the strongest dynamic coupling: it combines schema, meaning and timing dependencies with none of the visibility of a reference. The absence of a compile-time reference is what makes it dangerous rather than safe.",
      },
      {
        id: "coupling-and-cohesion-q3",
        prompt: "Which refactoring reduces connascence of position?",
        options: [
          "Replace a method taking (string, string, bool, int) with a method taking a named options record",
          "Replace an enum with a string constant",
          "Move the method into a static helper class",
          "Inline the method at every call site",
        ],
        answer: 0,
        explanation:
          "Named members turn agreement on argument order into agreement on names, the weakest form. A string constant moves towards connascence of meaning, and moving or inlining the method changes nothing about how callers must agree with it.",
      },
    ],
    sources: [
      {
        title: "Architect modern web applications with ASP.NET Core and Azure",
        url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/",
      },
      { title: "Connascence", url: "https://connascence.io/" },
      {
        title: "React: Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
      },
    ],
  },
  {
    id: "fitness-functions",
    trackId: "foundations",
    title: "Fitness functions",
    tagline:
      "Architectural rules as automated checks that fail the build when the design drifts.",
    level: 2,
    minutes: 8,
    summary:
      "A fitness function is an automated check of one architectural property: a dependency rule, a latency budget, a cost ceiling. The idea comes from evolutionary architecture, where the design is expected to change and the checks are what keep change safe. On the Microsoft stack they are xUnit tests with NetArchTest, dependency-cruiser rules for React, Azure Load Testing criteria and Cost Management budgets, all wired into CI.",
    sections: [
      {
        heading: "What a fitness function is",
        body: "Evolutionary architecture starts from the observation that the system will change in ways nobody can predict, so instead of a fixed target architecture you define the properties that must hold while it changes, and you test them. A fitness function is one such test: objective, automated, and run often enough that drift is caught in a pull request rather than in a quarterly review.\n\nThey come in a few shapes:\n\n- **Static**: checked against code or configuration without running it. Dependency rules, naming rules, banned APIs, policy on infrastructure templates.\n- **Dynamic**: measured on a running system. p95 latency, error rate, memory per request, monthly spend.\n- **Atomic** (one property) or **holistic** (several properties together, such as latency under load with security headers enabled).\n\nA rule in a wiki is a wish; a rule in CI is architecture. The difference shows a year later, when the modular monolith either still has module boundaries or has a `Shared` project that references everything.",
      },
      {
        heading: "Structure tests in .NET",
        body: 'NetArchTest.Rules and ArchUnitNET both express dependency rules as ordinary xUnit or NUnit tests over loaded assemblies. A typical rule for a modular monolith:\n\n```csharp\n[Fact]\npublic void Ordering_does_not_reference_other_modules()\n{\n    var types = Types.InAssembly(typeof(OrderingModule).Assembly)\n        .That().ResideInNamespace("Ordering");\n\n    var result = types\n        .ShouldNot().HaveDependencyOnAny("Catalog", "Billing")\n        .GetResult();\n\n    Assert.True(result.IsSuccessful,\n        string.Join(", ", result.FailingTypeNames ?? []));\n}\n```\n\nThe same style covers layering (endpoints must not reference `DbContext` directly in Clean Architecture), conventions (handlers are `sealed`, integration events are records in a `Contracts` namespace) and hygiene (no type in the domain references `System.Net.Http`).\n\nRoslyn analyzers are the compile-time version. `BannedApiAnalyzers` with a `BannedSymbols.txt` stops `DateTime.Now` in favour of `TimeProvider`; `TreatWarningsAsErrors` makes the analyzers binding. Add `dotnet list package --vulnerable` as a pipeline step for dependency health. Always assert that the type selection is non-empty; a filter on a misspelt namespace matches nothing and passes forever.',
      },
      {
        heading: "Boundaries in React",
        body: 'On the front end the dependency graph is the import graph, and dependency-cruiser is the common tool. Its configuration is a list of rules, each with a `from` and a `to` pattern, run in CI like a lint step:\n\n```js\n// .dependency-cruiser.cjs (excerpt)\nmodule.exports = {\n  forbidden: [\n    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },\n    { name: "shared-must-not-import-features", severity: "error",\n      from: { path: "^src/shared" }, to: { path: "^src/features" } },\n    { name: "features-use-public-api", severity: "error",\n      from: { path: "^src/features/([^/]+)/" },\n      to: { path: "^src/features/(?!$1)[^/]+/(?!index\\\\.ts$)" } },\n  ],\n};\n```\n\neslint-plugin-boundaries expresses the same rules as lint errors in the editor, which catches them earlier. Pick one; running both is noise.\n\nPerformance budgets are fitness functions too. size-limit or the Vite rollup visualizer fail the build when a route\'s chunk exceeds its budget, and Lighthouse CI asserts Core Web Vitals on a preview deployment. The budget comes from the quality attribute you wrote down as a driver.',
      },
      {
        heading: "Performance and cost budgets in Azure",
        body: "Dynamic fitness functions need a running environment, so they belong after a deployment to a test or staging slot rather than in the PR build.\n\n**Performance**: Azure Load Testing runs a JMeter or Locust script against the environment and has pass or fail criteria on response time percentiles and error rate, with a task for both GitHub Actions and Azure Pipelines. k6 in a workflow is the lighter alternative. The criteria are the latency driver from your drivers list, so a failing run is an architecture conversation rather than a tuning task.\n\n**Cost**: Azure Cost Management budgets with action groups alert when spend crosses a threshold; that is the holistic check. The static checks are Azure Policy assignments that deny SKUs above a size or resources outside allowed regions, and a `what-if` deployment of your Bicep or Terraform in the pipeline so a surprising resource change is visible in the PR.\n\n**Operational**: health check endpoints wired into Container Apps probes, and a Microsoft Defender for Cloud secure-score threshold if the organisation uses it. Each of these is a number with a limit, which is all a fitness function needs.",
      },
      {
        heading: "Putting them in CI",
        body: "Place each check where it is fast enough to block:\n\n- **Every pull request**: structure tests run with the unit tests, dependency-cruiser runs with lint, `dotnet list package --vulnerable`, Bicep `what-if`. Under a minute total, blocking.\n- **After deployment to staging**: load test with criteria, Lighthouse CI, smoke checks. Minutes, blocking the promotion to production.\n- **Scheduled**: cost budget alerts daily, dependency audits weekly. Informational, routed to the team channel.\n\nStart new checks as non-blocking for a week to see what they catch, then make them blocking. A check that stays informational for ever is a dashboard nobody reads.\n\nTreat a failing fitness function like a failing test: either the code is wrong or the rule is. If the rule is wrong, change it in the same pull request as a new or updated ADR, so the rule and its reasoning move together. Give each check an owner and link it from the ADR it enforces.",
      },
      {
        heading: "Common mistakes",
        body: '- Adding twenty rules on day one. Nobody understands them, the first failure is ignored, and then all of them are.\n- Vacuous tests: a namespace filter that matches zero types passes silently. Assert the count.\n- Rules that encode taste rather than drivers ("no class over 200 lines"). They generate arguments, not safety.\n- Flaky dynamic checks. A load test that fails on a noisy shared environment gets a retry button, then gets skipped.\n- Exception lists that grow. An `AllowedViolations` list of forty types is a rule that no longer exists.\n- No link to the reason. A rule without an ADR gets deleted by the first person who finds it inconvenient.',
      },
    ],
    diagram: {
      caption:
        "Fast static checks block the pull request; dynamic checks run after a staging deployment; budgets run on a schedule. Each rule points back to an ADR.",
      nodes: [
        {
          id: "pr",
          label: "Pull request",
          sub: "GitHub Actions",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "arch",
          label: "Structure tests",
          sub: "NetArchTest, analyzers",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "build",
          label: "Build + unit tests",
          sub: "dotnet test, vitest",
          col: 1,
          row: 1,
          kind: "service",
        },
        {
          id: "imports",
          label: "Import rules",
          sub: "dependency-cruiser",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "staging",
          label: "Staging deploy",
          sub: "Container Apps revision",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "load",
          label: "Load test",
          sub: "Azure Load Testing, p95",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "cost",
          label: "Cost budget",
          sub: "Cost Management alert",
          col: 4,
          row: 1,
          kind: "external",
        },
        {
          id: "adr",
          label: "ADRs",
          sub: "docs/adr: the rule source",
          col: 0,
          row: 3,
          kind: "data",
        },
      ],
      edges: [
        { from: "pr", to: "arch" },
        { from: "pr", to: "build" },
        { from: "pr", to: "imports" },
        { from: "build", to: "staging", label: "all green, promote" },
        { from: "staging", to: "load", label: "criteria: p95, errors" },
        {
          from: "load",
          to: "cost",
          label: "scheduled, daily",
          style: "dashed",
        },
        { from: "adr", to: "arch", label: "rule comes from", style: "dashed" },
        { from: "adr", to: "imports", style: "dashed" },
      ],
      groups: [
        { label: "Blocks the PR", nodeIds: ["arch", "build", "imports"] },
      ],
    },
    useWhen: [
      "A modular monolith or Clean Architecture layering has already been bypassed at least once",
      "Several teams commit to the same solution and reviewers cannot see every new dependency",
      "A latency or cost target was promised to the business and is only checked when someone complains",
      "You are mid-migration (strangler fig) and need proof that new code does not reference the legacy code",
    ],
    avoidWhen: [
      "A prototype or a one-developer codebase of a few thousand lines; the rule is cheaper to say than to automate",
      "The rule is still being debated; automate it after the ADR is accepted, not before",
      "You cannot make the check fast and deterministic; a flaky fitness function is ignored within a week",
    ],
    microsoftStack: [
      {
        name: "NetArchTest.Rules or ArchUnitNET",
        role: "Assembly-level dependency, naming and layering rules as ordinary xUnit tests.",
      },
      {
        name: "Roslyn analyzers and BannedApiAnalyzers",
        role: "Compile-time rules such as banning DateTime.Now, enforced with TreatWarningsAsErrors.",
      },
      {
        name: "Azure Load Testing",
        role: "Pipeline task with pass or fail criteria on response time percentiles and error rate.",
      },
      {
        name: "Azure Cost Management budgets and Azure Policy",
        role: "Spend ceilings as alerts, and SKU or region limits as deny policies.",
      },
      {
        name: "Bicep what-if in the pipeline",
        role: "Makes unexpected infrastructure changes visible in the pull request.",
      },
      {
        name: "GitHub Actions or Azure Pipelines",
        role: "Where the checks run and where they block promotion between environments.",
      },
    ],
    reactStack: [
      {
        name: "dependency-cruiser",
        role: "Feature boundary and cycle rules checked in CI.",
      },
      {
        name: "eslint-plugin-boundaries",
        role: "The same rules as editor-time lint errors.",
      },
      {
        name: "Lighthouse CI and size-limit",
        role: "Core Web Vitals and bundle budgets asserted on a preview deployment.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 0,
        note: "More tooling, but the rules it enforces keep the design simpler than it would drift to.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "A day or two to set up, and occasional pull requests blocked by a rule.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Latency and bundle budgets are checked before release instead of after complaints.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Load criteria and vulnerable-package checks catch regressions early.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "The whole point: change is safe because the properties that matter are tested.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "Architecture becomes something you can assert, not just describe.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Teams can change code freely inside boundaries the build enforces.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Budgets and health thresholds are defined once and watched automatically.",
      },
      {
        attribute: "cost",
        effect: 1,
        note: "Spend ceilings and SKU policies catch expensive mistakes before the invoice.",
      },
    ],
    related: [
      "modular-monolith",
      "clean-architecture",
      "c4-and-adrs",
      "react-code-organisation",
    ],
    checks: [
      {
        id: "fitness-functions-q1",
        prompt:
          'A NetArchTest rule "Ordering must not depend on Billing" has passed for a year. A reviewer notices the namespace filter says "Orderng". What went wrong, and what prevents it?',
        options: [
          "Nothing; the rule still documents the intent",
          "The test passed vacuously because it selected zero types; assert that the selection is non-empty",
          "NetArchTest cannot filter by namespace, so use project references instead",
          "Switch to ArchUnitNET, which cannot have this problem",
        ],
        answer: 1,
        explanation:
          "A rule over an empty set is always true, so the typo made the test meaningless for a year. Asserting the selected type count (or a known type being included) catches this with any tool; switching libraries does not.",
      },
      {
        id: "fitness-functions-q2",
        prompt:
          "Which fitness function belongs in the pull request pipeline as a blocking step?",
        options: [
          "A thirty-minute Azure Load Testing run",
          "A dependency-cruiser check that shared/ does not import features/",
          "A monthly cost report",
          "A manual architecture review",
        ],
        answer: 1,
        explanation:
          "The import rule takes seconds and is deterministic, so it can block every PR. A long load test belongs after a staging deployment, cost reports are scheduled, and a manual review is not automated at all.",
      },
      {
        id: "fitness-functions-q3",
        prompt:
          "A structure test starts failing after a legitimate design change. What is the right response?",
        options: [
          "Delete the test",
          "Mark it skipped until the next release",
          "Write or update the ADR that justifies the new rule, then change the test in the same pull request",
          "Add the offending types to an exception list and move on",
        ],
        answer: 2,
        explanation:
          "Rules exist because of decisions, so a rule change is a decision change and travels with its ADR. Skipping or deleting loses the rule silently, and exception lists are how a rule stops existing without anyone deciding that.",
      },
    ],
    sources: [
      {
        title: "Azure Load Testing documentation",
        url: "https://learn.microsoft.com/azure/load-testing/",
      },
      {
        title: "Azure Cost Management and Billing documentation",
        url: "https://learn.microsoft.com/azure/cost-management-billing/",
      },
      {
        title: "Azure Policy documentation",
        url: "https://learn.microsoft.com/azure/governance/policy/",
      },
    ],
  },
];
