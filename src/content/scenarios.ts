import type { Scenario } from "./types";

/**
 * Decision scenarios. Each one is a concrete situation (team, scale, deadline,
 * compliance, existing systems) followed by a few decisions. The point is
 * that the right answer differs from scenario to scenario because the facts
 * differ, and the feedback always refers to those facts.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "startup-b2b-saas-mvp",
    title: "Four engineers, one quarter, one pitch",
    stacks: ["dotnet", "azure"],
    level: 1,
    situation:
      'Fieldbook is a seed-funded startup building B2B software for landscaping companies: scheduling crews, quoting jobs, invoicing and a customer portal. The founding team is four engineers, all comfortable with C# and ASP.NET Core; one has run production systems before. Nobody is a full-time ops person.\n\nThe investors expect a working product with five paying design-partner customers in 14 weeks. Expected load for the first year is modest: around 200 companies, 2,000 daily active users, a few hundred requests per minute at the busiest hour. The data is ordinary relational data: customers, jobs, quotes, invoices, crew calendars.\n\nThe CTO has read that "we should do microservices from day one so we never have to migrate", and a well-known Clean Architecture template is already cloned. The monthly Azure budget is 800 euros. Customers are in Germany and the Netherlands, so GDPR applies: personal data must stay in the EU and be deletable per customer.\n\nThe team needs to decide the shape of the backend before the first sprint.',
    constraints: [
      "Team: 4 engineers, all C#, no dedicated ops",
      "Deadline: working product with 5 design partners in 14 weeks",
      "Scale: ~200 companies and ~2,000 daily users in year one; a few hundred requests per minute at peak",
      "Budget: 800 euros per month for Azure",
      "Compliance: GDPR; personal data stays in the EU and must be deletable per customer",
      "Skills: no Kubernetes or distributed-systems experience in the team",
    ],
    decisions: [
      {
        id: "shape",
        prompt: "Which overall backend shape do you start with?",
        options: [
          {
            id: "modular-monolith",
            label:
              "A modular monolith: one ASP.NET Core deployable with Scheduling, Quoting, Invoicing and Portal modules",
            score: 3,
            feedback:
              "One deployable with modules that each own their tables fits four engineers and 14 weeks. The contracts between modules are the seams you would need later if one grows; until then there is one pipeline, one log stream and one thing to run.",
          },
          {
            id: "microservices",
            label: "Microservices from day one so there is never a migration",
            score: 0,
            feedback:
              "This is the fashionable trap. Four engineers would spend the quarter on service discovery, per-service pipelines, distributed tracing and eventual consistency for 2,000 users, and the first customer would still be waiting. The 'never migrate' argument ignores that boundaries chosen before the domain is understood are usually wrong.",
          },
          {
            id: "layered-monolith",
            label:
              "A plain layered monolith: Controllers, Services, Repositories",
            score: 2,
            feedback:
              "A plain layered monolith would ship on time and is cheap to run, but with technical-layer folders the four domains blur together within months. The extra cost of module folders and separate schemas is small and buys clear ownership when engineer five arrives.",
          },
          {
            id: "serverless-per-feature",
            label: "An Azure Function per feature, no shared process",
            score: 1,
            feedback:
              "A Function per feature makes the 'quote to invoice' flow a set of cross-function calls with no transaction, and local debugging becomes painful. Functions suit bursty event handlers, which this product does not yet have.",
          },
        ],
      },
      {
        id: "database",
        prompt: "How do you lay out the database?",
        options: [
          {
            id: "single-sql-schema-per-module",
            label: "One Azure SQL database with a schema per module",
            score: 3,
            feedback:
              "One database with schemas for scheduling, quoting and invoicing keeps a single transaction for 'accept quote, create job, raise invoice' while making ownership visible. It also keeps the 800-euro budget and GDPR deletion simple: one place to erase a customer.",
          },
          {
            id: "database-per-module",
            label: "A separate database per module",
            score: 1,
            feedback:
              "Four databases means four connection strings, four backup policies and no transaction across the quote-to-invoice flow, for a product with a few hundred requests per minute. You pay the distributed-data bill without the distribution.",
          },
          {
            id: "single-sql-no-boundaries",
            label: "One database, every table in dbo, no ownership rules",
            score: 2,
            feedback:
              "One flat schema works and ships fast, but without ownership any module can join any table, and the modular monolith erodes within a year. The schema split costs almost nothing now.",
          },
          {
            id: "cosmos-db",
            label: "Azure Cosmos DB because it scales",
            score: 0,
            feedback:
              "Quotes, invoices and calendars are relational, with reports that join across them. Cosmos DB adds a data model the team has not used, costs more at this scale, and gives up the joins and transactions the product relies on.",
          },
        ],
      },
      {
        id: "communication",
        prompt: "How do Scheduling, Quoting and Invoicing talk to each other?",
        options: [
          {
            id: "contracts-and-inprocess-events",
            label:
              "Contract interfaces for synchronous questions, in-process notifications for events",
            score: 3,
            feedback:
              "A synchronous contract interface when a caller needs an answer now (Quoting asks Scheduling for crew availability), and an in-process notification such as a MediatR `INotification` for `QuoteAccepted`. Both stay in one process and one transaction, which is exactly what a four-person team can debug.",
          },
          {
            id: "service-bus-between-modules",
            label: "Azure Service Bus between the modules",
            score: 1,
            feedback:
              "Putting a broker between modules that live in the same process adds retries and eventual consistency to a flow that could be one method call. It also adds a monthly line to a tight budget for no scale benefit yet.",
          },
          {
            id: "shared-dbcontext",
            label:
              "One DbContext for everything; modules query each other's tables",
            score: 0,
            feedback:
              "One DbContext spanning every table lets Invoicing query Scheduling's tables directly. It is the shortcut that turns the modular monolith back into a tangle, and it scatters GDPR deletion across code paths.",
          },
          {
            id: "http-between-modules",
            label: "HTTP calls between modules inside the same process",
            score: 1,
            feedback:
              "Calling your own process over HTTP adds serialisation, a network hop and failure modes with no independence gained, since everything still deploys together.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: a modular monolith on one Azure SQL database, one App Service, one pipeline.**\n\nFour engineers and a 14-week deadline reward the design that has the fewest moving parts while still naming the domain. Modules for Scheduling, Quoting, Invoicing and Portal, each with its own schema and a small contracts project, give ownership and a clean seam without a network in the middle. One database keeps the quote-to-invoice flow in one transaction and makes GDPR erasure a single operation per customer. The 800-euro budget covers an App Service plan, Azure SQL and Key Vault with room to spare.\n\nThe first signal that would change the answer: a module whose load or release cadence diverges, for example the customer portal becoming public-facing with thousands of anonymous users while the back office stays quiet. Then extract that module along its existing contract.",
    relatedLessons: [
      "modular-monolith",
      "layered-monolith",
      "microservices",
      "architecture-drivers",
    ],
  },
  {
    id: "retailer-release-train",
    title: "Sixty engineers and a Friday release train",
    stacks: ["dotnet", "azure"],
    level: 3,
    situation:
      'Northgate is a fashion retailer with an eight-year-old ASP.NET Core monolith serving the web shop, order management, inventory, pricing, returns, loyalty and a back-office admin. Sixty engineers in eight teams work on it. Releases go out on a fortnightly train; the train slips about one time in three because any team\'s failed smoke test blocks everyone, and a hotfix means a full redeploy.\n\nNormal load is 300 orders per minute. On Black Friday last year checkout hit 4,000 orders per minute and the whole application was scaled to 40 instances to keep checkout alive, including the parts that never see customer traffic. Inventory updates from 600 stores arrive as 2 million messages a day through an overnight file import that blocks the morning stand-ups when it fails.\n\nThe platform team has four people, a working CI pipeline, Azure Container Apps for a few side services, and Azure Service Bus already in use for e-mail. The CTO is under pressure to "go microservices" after a conference. Payment data is tokenised by a PSP, so PCI scope is limited to the checkout pages.',
    constraints: [
      "Team: 60 engineers in 8 teams, 4-person platform team",
      "Existing: one ASP.NET Core monolith, fortnightly release train that slips one time in three",
      "Scale: 300 orders per minute normally, 4,000 per minute on Black Friday; 2 million inventory messages per day",
      "Compliance: PCI scope limited to checkout pages via PSP tokenisation",
      "Skills: Container Apps and Service Bus already in production for small services",
      "Deadline: next Black Friday is 11 months away",
    ],
    decisions: [
      {
        id: "target-shape",
        prompt: "What is the target shape for the next 12 months?",
        options: [
          {
            id: "extract-hot-domains",
            label:
              "Extract Checkout and Inventory as services; modularise the rest inside the monolith",
            score: 3,
            feedback:
              "Checkout and Inventory have the two concrete drivers: a different scaling profile (checkout on Black Friday) and a different cadence and failure mode (the overnight import). Loyalty, Returns, Pricing and Admin stay in the monolith, modularised, with their teams still on the train.",
          },
          {
            id: "big-bang-microservices",
            label: "Split all seven domains into microservices this year",
            score: 0,
            feedback:
              "Splitting everything at once is the fashionable trap: eight teams would spend the year on plumbing and the slipping train would be replaced by sixty things that can fail at 2 a.m. Pricing and Returns have no scaling or cadence problem that pays for distribution.",
          },
          {
            id: "keep-monolith-more-qa",
            label: "Keep the monolith and add a QA gate before each train",
            score: 1,
            feedback:
              "More QA on the train treats the symptom. With eight teams sharing one deployable the chance that someone's change blocks the release only grows, and checkout will still be scaled together with the admin UI next November.",
          },
          {
            id: "modularise-only",
            label:
              "Modularise the monolith with contracts and schema ownership, extract nothing",
            score: 2,
            feedback:
              "Modularising with contracts projects and schema ownership is a necessary first step and fixes a lot of the cross-team breakage. On its own it does not let Checkout scale separately or let the inventory import fail without touching the shop.",
          },
        ],
      },
      {
        id: "integration",
        prompt:
          "How does the extracted Checkout service talk to what remains in the monolith?",
        options: [
          {
            id: "async-events-outbox",
            label:
              "Outbox-backed Service Bus events outward; one cached synchronous read for price and stock",
            score: 3,
            feedback:
              "Checkout publishes `OrderPlaced` through an outbox table and Service Bus; the monolith's Loyalty and Returns modules subscribe. The one synchronous call that remains is a read of price and stock, which is cached and can degrade, so Checkout stays up on Black Friday even if Loyalty is being redeployed.",
          },
          {
            id: "shared-database",
            label: "Checkout reads and writes the monolith's tables directly",
            score: 0,
            feedback:
              "Sharing tables makes every schema change a coordinated release again, which is the exact problem being solved. It also drags more of the database into PCI scope.",
          },
          {
            id: "sync-rest-chain",
            label:
              "Synchronous REST calls to Loyalty, Inventory and Pricing when placing an order",
            score: 1,
            feedback:
              "If placing an order calls three modules over HTTP in sequence, Checkout's availability becomes the product of four services' availability, and the 40-instance scale-out next November has to include all of them.",
          },
          {
            id: "everything-event-streamed",
            label:
              "Every interaction through events, including price and stock lookups",
            score: 2,
            feedback:
              "Routing everything through events works but forces Checkout to maintain its own copies of pricing and stock from day one. Defensible later; for the first extraction, one cached read is simpler.",
          },
        ],
      },
      {
        id: "checkout-data",
        prompt: "Where does Checkout's data live after extraction?",
        options: [
          {
            id: "own-database",
            label:
              "Its own Azure SQL database for carts and in-progress orders",
            score: 3,
            feedback:
              "A separate database holding carts and orders in progress, publishing completed orders as events, is what makes Checkout independently deployable. It also keeps the PCI-scoped surface small and separately auditable.",
          },
          {
            id: "shared-db-separate-schema",
            label: "A separate schema in the shared monolith database",
            score: 1,
            feedback:
              "A separate schema keeps ownership visible but still ties Checkout's deploys to the monolith's migrations, maintenance windows and failover, and the Black Friday scale-out still hits one database.",
          },
          {
            id: "replicate-whole-db",
            label: "Replicate the entire monolith database to Checkout",
            score: 0,
            feedback:
              "Replicating the whole database copies the coupling along with the data, and every replication lag becomes a checkout bug on the busiest day of the year.",
          },
          {
            id: "cosmos-for-carts",
            label: "Cosmos DB for carts, Azure SQL for orders",
            score: 2,
            feedback:
              "Cosmos DB for carts and Azure SQL for orders is a reasonable split for the write burst, at the price of two stores to operate. Worth considering once a single Azure SQL database has actually been shown to be the Black Friday bottleneck.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: extract the two domains with real drivers, modularise the rest.**\n\nCheckout has a scaling driver (4,000 orders per minute once a year) and Inventory has a cadence and failure-isolation driver (2 million nightly messages that must not take the shop down). Those two become services on Container Apps with their own databases, talking to the monolith through outbox-backed Service Bus events. The other five domains stay in a modular monolith; most of the release-train pain comes from unowned shared code, which contracts projects and an architecture test fix without a network.\n\nThe platform team of four is the real constraint: each extracted service needs a pipeline, dashboards and an on-call owner, so two in a year is realistic and seven is not.\n\nThe first signal to extract a third: a team whose module blocks the train twice in a quarter for reasons unrelated to the other teams.",
    relatedLessons: [
      "microservices",
      "modular-monolith",
      "messaging-outbox-saga",
      "strangler-fig",
      "coupling-and-cohesion",
    ],
  },
  {
    id: "webforms-erp-strangler",
    title: "The ERP nobody dares to redeploy",
    stacks: ["dotnet", "azure", "data"],
    level: 2,
    situation:
      "Marlow Components runs its business on a 14-year-old ERP: ASP.NET Web Forms on .NET Framework 4.8, 1.2 million lines of VB.NET and C#, one SQL Server 2016 database with 900 tables and 400 stored procedures that hold most of the business rules. 300 staff use it daily for purchasing, stock, production planning and the general ledger. Two of the original developers remain in a team of ten; the other eight joined in the last three years and work mostly on ASP.NET Core.\n\nDeployments happen quarterly on a Sunday because a bad release once cost two days of production. Windows Server 2016 goes out of support within the planning horizon, and the board wants a supplier portal where 150 external suppliers confirm purchase orders and upload delivery notes, within six months.\n\nThe finance director has vetoed any change to the general ledger during the year-end period, which runs from mid-November to the end of January. There is no automated test suite beyond 40 unit tests. The company is a single-site manufacturer in the UK with no special data-residency requirements.",
    constraints: [
      "Existing: Web Forms on .NET Framework 4.8, 1.2M lines, 900 tables, 400 stored procedures",
      "Team: 10 developers, 2 with deep knowledge of the old code",
      "Deadline: supplier portal for 150 external suppliers in 6 months",
      "Scale: 300 internal users; quarterly releases on Sundays",
      "Constraint: general ledger frozen mid-November to end of January",
      "Skills: 40 unit tests; no automated UI tests",
    ],
    decisions: [
      {
        id: "strategy",
        prompt: "What migration strategy do you commit to?",
        options: [
          {
            id: "strangler-fig",
            label:
              "Strangler fig: a proxy in front, new routes to ASP.NET Core, one area at a time",
            score: 3,
            feedback:
              "A reverse proxy routes new routes to an ASP.NET Core application while the old system keeps serving the rest. The supplier portal is the first slice, and the ledger can stay untouched through year-end because nothing forces its move.",
          },
          {
            id: "big-bang-rewrite",
            label: "An 18-month rewrite, then switch over",
            score: 0,
            feedback:
              "An 18-month rewrite of 1.2 million lines by a team where only two people understand the rules in 400 stored procedures is where ERP rewrites die. Nothing ships for the supplier deadline, and the quarterly Sunday releases continue in the meantime.",
          },
          {
            id: "stay-webforms",
            label: "Build the supplier portal in Web Forms too",
            score: 1,
            feedback:
              "Building the portal in Web Forms meets the deadline but adds 150 external users to a framework with no path forward, on an OS leaving support. Every new line increases the eventual migration.",
          },
          {
            id: "containerise-unchanged",
            label:
              "Lift the existing app into Windows containers on Azure, change nothing else",
            score: 2,
            feedback:
              "Containerising deals with the server end-of-life and makes deployments repeatable, which is valuable. It does not help the eight ASP.NET Core developers build the portal, so it is a useful step inside a larger strategy.",
          },
        ],
      },
      {
        id: "first-slice",
        prompt: "What is the first slice to move?",
        options: [
          {
            id: "supplier-portal-first",
            label: "The new supplier portal",
            score: 3,
            feedback:
              "The portal is new functionality with no legacy screens to retire, external users who never touch Web Forms, and a narrow data surface (purchase orders, delivery notes). It proves the proxy, the shared-database rules and the deployment pipeline on something low-risk.",
          },
          {
            id: "ledger-first",
            label: "The general ledger, because it matters most",
            score: 0,
            feedback:
              "The ledger is the most tightly coupled area, the one frozen for two and a half months a year, and the one where a mistake costs real money. Starting there maximises risk and guarantees a collision with the year-end freeze.",
          },
          {
            id: "login-first",
            label: "Authentication and the login page",
            score: 1,
            feedback:
              "Moving login first sounds foundational but it is the one piece both systems must share from day one. Use `Microsoft.AspNetCore.SystemWebAdapters` to share the session and auth cookie, and leave login where it is until later.",
          },
          {
            id: "menu-order",
            label: "Screens in the order they appear in the menu",
            score: 1,
            feedback:
              "Migrating in menu order ignores what drives value and risk. Purchasing may be a good second slice, but only because the portal needs it.",
          },
        ],
      },
      {
        id: "data-transition",
        prompt: "How do old and new share the database during the transition?",
        options: [
          {
            id: "shared-db-ownership-rules",
            label:
              "One database, explicit table ownership per migrated area, views for legacy reads",
            score: 3,
            feedback:
              "Keep one SQL Server database, give each migrated area ownership of its tables, and have the new code read legacy tables only through views or a small anti-corruption layer; tables move ownership with their screens. This is the only option that fits a six-month deadline and 400 stored procedures nobody wants to re-implement yet.",
          },
          {
            id: "duplicate-and-sync",
            label:
              "A second database for the new system, synchronised both ways",
            score: 1,
            feedback:
              "Two-way sync creates conflicts in stock and order quantities, the exact data suppliers will see. The sync becomes a system of its own.",
          },
          {
            id: "split-per-service-now",
            label: "Split the 900 tables into per-service databases first",
            score: 0,
            feedback:
              "Carving 900 tables into per-service databases before anyone knows the seams means guessing boundaries in the most coupled part of the system. It also breaks the stored procedures that still run the business.",
          },
          {
            id: "read-replica-for-new",
            label: "A read-only replica for the new application",
            score: 2,
            feedback:
              "A read-only replica protects the ERP from portal load, but the portal must also write delivery notes and confirmations. A replica is a supplement to shared-database ownership rules, which are still needed.",
          },
        ],
      },
      {
        id: "routing",
        prompt: "What sits in front of both applications?",
        options: [
          {
            id: "yarp-proxy",
            label: "YARP in an ASP.NET Core host, routing by path",
            score: 3,
            feedback:
              "YARP routes `/suppliers/*` to the new app and everything else to Web Forms, and the System.Web adapters let the two share the auth cookie and session so staff do not log in twice. Routes flip one at a time with a config change.",
          },
          {
            id: "iis-url-rewrite",
            label: "IIS URL Rewrite and ARR on the existing servers",
            score: 2,
            feedback:
              "IIS can do the same routing on the existing Windows servers. It keeps the routing rules in IIS config rather than versioned code, and the servers in question are the ones leaving support.",
          },
          {
            id: "hardcoded-links",
            label: "Link from old pages to a new host name, no proxy",
            score: 0,
            feedback:
              "Two host names means two logins, two cookie domains and a broken back button for 300 staff, and every migrated screen requires editing links across the old code.",
          },
          {
            id: "front-door-only",
            label: "Azure Front Door path routing",
            score: 1,
            feedback:
              "Front Door can route by path but it is a global edge service for an internal ERP on one site, adds latency and cost, and cannot share the ASP.NET session between the two applications.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: strangler fig behind YARP, supplier portal first, one database with ownership rules.**\n\nThe facts that decide it are the two people who understand the old code, the six-month portal deadline and the year-end ledger freeze. A rewrite cannot meet the deadline and would have to touch the ledger during the freeze; a strangler lets the ten developers build the portal in ASP.NET Core next to the running ERP, share the login through the System.Web adapters, and move purchasing and stock screens afterwards at the pace the quarterly Sunday release allows. The database stays single, with views and explicit table ownership so each move is small.\n\nWrite characterisation tests around each stored procedure before replacing it; the 40 unit tests are the real risk.\n\nThe first signal that would change the plan: if the company opens a second site that needs the ERP in another region, the single database stops being an option.",
    relatedLessons: [
      "strangler-fig",
      "layered-monolith",
      "api-gateway-bff",
      "ef-core-patterns",
    ],
  },
  {
    id: "internal-crud-lob-tool",
    title: "The fleet manager's spreadsheet",
    stacks: ["dotnet", "azure", "data"],
    level: 1,
    situation:
      "A regional bus operator manages its 320 vehicles in a 40-tab Excel workbook: MOT dates, service schedules, defects, fuel cards, driver assignments. The workbook is e-mailed around; last month two depots overwrote each other's edits and a bus missed its inspection.\n\nIT has two developers for three months to replace it with a web application. 45 staff across five depots will use it, mostly during office hours, a few dozen requests per minute at most. The data is about 20 tables and perhaps 2 GB after five years. Reports needed: vehicles due for inspection in the next 30 days, defects by depot, fuel spend by month. Staff already sign in with Entra ID, and the organisation has an Azure subscription with an existing App Service plan that is mostly idle.\n\nOne of the developers has just finished a course on Clean Architecture and CQRS and has a starter template with eleven projects ready. The other prefers Razor Pages. Nobody will be on call; if the tool is down for an hour, the depots use the printed list. The budget for Azure is whatever fits on the existing plan plus a small database.",
    constraints: [
      "Team: 2 developers for 3 months, no on-call",
      "Scale: 45 users, a few dozen requests per minute, ~20 tables, ~2 GB over 5 years",
      "Existing: Entra ID for sign-in, an underused App Service plan",
      "Budget: existing plan plus a small database",
      "Availability: an hour of downtime is acceptable",
      "Skills: one developer keen on Clean Architecture and CQRS, one on Razor Pages",
    ],
    decisions: [
      {
        id: "shape",
        prompt: "What is the shape of the application?",
        options: [
          {
            id: "layered-monolith",
            label:
              "One ASP.NET Core project: Razor Pages, a services folder, EF Core to Azure SQL",
            score: 3,
            feedback:
              "Twenty tables and 45 users need exactly this and nothing more. Two developers can finish a single project in three months with time for the reports, and there is nobody to maintain anything heavier afterwards.",
          },
          {
            id: "clean-cqrs-template",
            label:
              "The eleven-project Clean Architecture template with CQRS and MediatR",
            score: 1,
            feedback:
              "Eleven projects, handlers, separate read and write models and a domain layer for vehicles and defects is the fashionable trap at this size. Every new field touches six files, and the second developer will be fighting the structure instead of shipping the inspection report.",
          },
          {
            id: "microservices",
            label: "A Vehicles service, a Defects service and a Fuel service",
            score: 0,
            feedback:
              "Three deployments, three databases and a network to debug, for a team of two with no on-call and 45 users. There is no driver here that pays for it.",
          },
          {
            id: "modular-monolith",
            label: "A modular monolith with contracts and a schema per module",
            score: 2,
            feedback:
              "Modules with contracts and separate schemas are reasonable, and would matter if this grew into a wider operations platform. For 20 tables and one small team the extra ceremony is hard to justify today.",
          },
        ],
      },
      {
        id: "data-access",
        prompt: "How do you access the data?",
        options: [
          {
            id: "ef-core-direct",
            label:
              "EF Core with migrations, one DbContext, queries where they are used",
            score: 3,
            feedback:
              "A single DbContext with migrations and queries written in page handlers or small service classes is enough. Projections with `Select` cover the three reports; the 2 GB dataset will never challenge it.",
          },
          {
            id: "repository-unit-of-work",
            label: "Repository and unit-of-work abstractions over EF Core",
            score: 1,
            feedback:
              "Wrapping EF Core, which already is a repository and unit of work, in another layer doubles the code for every query and hides the `Include` and projection decisions that actually matter for the reports.",
          },
          {
            id: "dapper-sql",
            label: "Dapper with hand-written SQL",
            score: 2,
            feedback:
              "Dapper is workable and fast, especially for the reports. It costs you migrations and change tracking that EF Core gives for free on a 20-table schema, so it is a fine second choice.",
          },
          {
            id: "cqrs-split-models",
            label:
              "Separate command and query models with synchronised read tables",
            score: 0,
            feedback:
              "Separate models with synchronised read tables solve a load and complexity problem this tool does not have. For 45 users during office hours the write and read sides are the same twenty tables.",
          },
        ],
      },
      {
        id: "hosting",
        prompt: "Where does it run?",
        options: [
          {
            id: "app-service-azure-sql",
            label: "The existing App Service plan plus Azure SQL serverless",
            score: 3,
            feedback:
              "Deploy to the plan that is already paid for and add Azure SQL on the serverless tier, which auto-pauses outside office hours. Entra ID sign-in is a few lines of configuration with `Microsoft.Identity.Web`.",
          },
          {
            id: "aks",
            label: "An AKS cluster",
            score: 0,
            feedback:
              "A Kubernetes cluster for one small web app that 45 people use is a cluster to patch and upgrade, for a department with nobody on call and a plan already sitting idle.",
          },
          {
            id: "container-apps",
            label: "Azure Container Apps",
            score: 2,
            feedback:
              "Container Apps would run this fine and scale to zero, but it is a new service for this IT team to learn when the App Service plan they already pay for is idle.",
          },
          {
            id: "vm-iis",
            label: "A VM with IIS and SQL Server Express",
            score: 1,
            feedback:
              "A VM means patching an operating system and backing up a database by hand, the kind of work that two developers with a day job will skip.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: a layered monolith on the existing App Service plan with Azure SQL.**\n\nThe decisive facts are two developers, three months, 45 users and 20 tables. A single ASP.NET Core project with Razor Pages and EF Core, organised by feature folder where it helps, replaces the workbook and delivers the three reports. The Clean Architecture template is a good tool for a different problem; here it would consume the schedule in ceremony. Entra ID sign-in via `Microsoft.Identity.Web`, Azure SQL serverless to pause overnight, and a backup policy are the only infrastructure decisions.\n\nWrite a handful of integration tests against a real database for the inspection-due report, since that is the query that prevents a missed MOT.\n\nThe first signal that would change the answer: a request to open the tool to 200 external garages, which brings public exposure, a second identity model and real availability needs.",
    relatedLessons: [
      "layered-monolith",
      "clean-architecture",
      "ef-core-patterns",
      "azure-compute-choices",
    ],
  },
  {
    id: "insurance-claims-audit",
    title: "Every claim must explain itself",
    stacks: ["dotnet", "data", "azure"],
    level: 3,
    situation:
      "Cairn Insurance processes 2 million motor claims a year through a 30-engineer platform built on ASP.NET Core and Azure SQL. Policies, customers, brokers and payments are conventional CRUD modules that work well. Claims is the problem: the regulator now requires the company to show, for any claim, exactly what was known and decided at any point in time, who changed what and why, and to reproduce a settlement decision as it appeared six months earlier. Two audits have failed because the `Claims` table only holds current state and the audit log is a free-text column that developers fill inconsistently.\n\nA claim has a lifecycle of 10 to 40 state changes over weeks: reported, triaged, assessed, reserved, approved, paid, reopened. Adjusters query recent claims constantly; regulators query history rarely. Peak write load is modest, around 50 claim events per second.\n\nAn architect proposes event sourcing. The CTO is worried about rebuilding the whole platform. The team runs SQL Server everywhere, has no PostgreSQL experience, and must keep EU data in the EU under GDPR, including the right to erasure for customer personal data, which sits in the Customers module.",
    constraints: [
      "Team: 30 engineers, SQL Server and EF Core throughout, no PostgreSQL",
      "Scale: 2 million claims per year, ~50 claim events per second at peak, 10-40 events per claim",
      "Compliance: regulator requires point-in-time reconstruction of any claim; GDPR erasure for personal data",
      "Existing: CRUD modules for Policies, Customers, Brokers and Payments that work",
      "Deadline: next regulatory audit in 9 months",
      "Query mix: adjusters read current state constantly, regulators read history rarely",
    ],
    decisions: [
      {
        id: "scope",
        prompt: "Where do you apply event sourcing?",
        options: [
          {
            id: "claims-only",
            label:
              "The Claims bounded context only; the other modules stay CRUD",
            score: 3,
            feedback:
              "Claims is where the regulator's question is literally 'what sequence of decisions led here'. Policies, Customers, Brokers and Payments have no such requirement, so the 30 engineers rebuild one module and the integration between modules keeps its shape.",
          },
          {
            id: "event-source-everything",
            label: "Event-source the whole platform for consistency",
            score: 0,
            feedback:
              "Event-sourcing everything is the fashionable trap. Policies and Brokers have no point-in-time requirement, the rebuild would miss the nine-month audit, and customer personal data in an immutable event stream collides with GDPR erasure.",
          },
          {
            id: "temporal-tables-everywhere",
            label:
              "SQL Server temporal tables on every table, no event sourcing",
            score: 2,
            feedback:
              "System-versioned temporal tables give 'as of' queries with almost no code change, and they are the right answer for Policies if an audit ever asks. For Claims they record what changed but not why or by which decision, which is what the regulator asked for.",
          },
          {
            id: "cdc-to-lake",
            label: "Change data capture into a data lake for history",
            score: 1,
            feedback:
              "CDC gives analysts history but reconstructs state outside the application, with no business meaning attached to each change. The audit needs decisions, not row diffs.",
          },
        ],
      },
      {
        id: "store",
        prompt: "How do you store the claim event stream?",
        options: [
          {
            id: "sql-append-only-stream",
            label:
              "An append-only ClaimEvents table in Azure SQL with a version per claim",
            score: 3,
            feedback:
              "A table keyed by claim id and version, with a unique index on (ClaimId, Version) for optimistic concurrency, fits the team's SQL Server skills and 50 events per second comfortably. Projections into normal tables serve the adjusters' current-state queries.",
          },
          {
            id: "marten",
            label: "Marten on PostgreSQL",
            score: 2,
            feedback:
              "Marten is a mature event store with projections built in, but it runs on PostgreSQL. For a team with no PostgreSQL experience and nine months, adopting a second database engine is a real cost; defensible if they accept it.",
          },
          {
            id: "service-bus-as-store",
            label: "Azure Service Bus as the system of record",
            score: 0,
            feedback:
              "Service Bus is a broker: messages are consumed and gone, there is no replay by claim and no version check. Using it as the system of record means the audit trail disappears on delivery.",
          },
          {
            id: "event-hubs-as-store",
            label: "Azure Event Hubs as the event store",
            score: 1,
            feedback:
              "Event Hubs retains a log and can replay, but it is partitioned for throughput, has a bounded retention window and no per-claim stream or optimistic concurrency. It is the wrong shape for 'load claim 4711 and append one event'.",
          },
        ],
      },
      {
        id: "temporal-query",
        prompt:
          "How do you answer 'what was the state of claim 4711 on 3 March'?",
        options: [
          {
            id: "replay-to-timestamp",
            label: "Replay the claim's events up to that timestamp",
            score: 3,
            feedback:
              "Load the events up to the timestamp and fold them, which the event-sourced Claims module can do by construction. This is the capability the regulator is paying for and it is cheap at 10-40 events per claim.",
          },
          {
            id: "temporal-table-on-projection",
            label:
              "A system-versioned temporal table on the current-state projection",
            score: 2,
            feedback:
              "A temporal projection answers 'as of' quickly and is useful for adjusters. It cannot explain which decision caused the change, so it supplements replay rather than replacing it.",
          },
          {
            id: "audit-columns",
            label: "ModifiedBy and ModifiedAt columns on the claim row",
            score: 1,
            feedback:
              "Those columns record the last change only. This is the design that already failed two audits.",
          },
          {
            id: "snapshots-only",
            label: "Store a full snapshot per state change, no events",
            score: 0,
            feedback:
              "Snapshots without events reproduce current state at points but lose the reason and the actor, and snapshots of a 40-step claim bloat quickly.",
          },
        ],
      },
      {
        id: "integration",
        prompt: "How do Payments and Customers learn about claim decisions?",
        options: [
          {
            id: "integration-events-outbox",
            label:
              "Coarse integration events from an outbox in the same transaction",
            score: 3,
            feedback:
              "Publish `ClaimApproved` and `ClaimPaid` from an outbox written in the same transaction as the event append, through Service Bus or in-process for modules in the same deployable. Payments subscribes and never sees the internal event stream.",
          },
          {
            id: "expose-event-store",
            label: "Let Payments read the ClaimEvents table directly",
            score: 0,
            feedback:
              "Reading the stream directly couples Payments to the internal event schema of Claims, so every refinement of a claim event becomes a cross-module breaking change.",
          },
          {
            id: "sync-polling",
            label: "Payments polls the claims API every minute",
            score: 1,
            feedback:
              "Polling adds latency and load and still needs a way to remember what it has seen. The outbox already provides that.",
          },
          {
            id: "shared-projection-table",
            label: "Payments queries a read-only projection table",
            score: 2,
            feedback:
              "A read-only projection is workable inside one deployable and avoids the raw stream, but it ties Payments to the projection's shape. Events are the cleaner seam.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: event sourcing in the Claims context only, on an Azure SQL append-only stream, with projections and outbox events outward.**\n\nThe regulator's requirement is the driver, and it applies to claims alone, so the blast radius should be one module. The team's SQL Server depth makes a hand-rolled append-only stream the pragmatic store at 50 events per second; Marten would be the choice if PostgreSQL were already in the building. Projections serve the adjusters' constant current-state reads; replay serves the rare regulator question. Personal data stays in the Customers CRUD module and is referenced by id from claim events, so GDPR erasure does not fight the immutable stream.\n\nBuild a replay test that reconstructs a sample of last year's settled claims and matches the known outcomes before the audit.\n\nThe first signal that would change the answer: if the regulator extended the same point-in-time requirement to policy endorsements, Policies would be next.",
    relatedLessons: [
      "event-sourcing",
      "cqrs",
      "modular-monolith",
      "messaging-outbox-saga",
    ],
  },
  {
    id: "nightly-batch-webhook-burst",
    title: "Quiet all day, forty thousand webhooks at nine",
    stacks: ["azure", "dotnet"],
    level: 2,
    situation:
      "Parcelo is a delivery aggregator. 14 carriers push shipment scan events to its webhook endpoint. Most of the day traffic is a few events per second, but when carriers flush their depot scans the endpoint sees bursts of up to 2,000 requests per second for three or four minutes, roughly 40,000 events in a burst, several times an evening. Carriers retry on any non-2xx response or on a 10-second timeout, so duplicates are routine.\n\nEvery night at 02:00 a reconciliation job compares 3 million shipment rows against carrier invoices and produces exception reports; it currently runs 40 minutes as a console app on a VM that someone restarts by hand when it fails.\n\nThe engineering team is five people with ASP.NET Core and Azure SQL experience and no Kubernetes. They pay about 1,200 euros a month for Azure and want to reduce the idle cost of the VM and the App Service instances that sit scaled up all day for the evening bursts. Events must not be lost; a lost scan means a customer sees a parcel stuck. Processing order within one shipment matters; order across shipments does not.",
    constraints: [
      "Scale: bursts of 2,000 webhook requests per second for 3-4 minutes, a few per second otherwise",
      "Batch: nightly job over 3 million rows, currently 40 minutes on a VM",
      "Reliability: no lost scan events; carriers retry, so duplicates arrive",
      "Ordering: per shipment, not global",
      "Team: 5 engineers, no Kubernetes, ASP.NET Core and Azure SQL",
      "Budget: ~1,200 euros per month; idle capacity is the complaint",
    ],
    decisions: [
      {
        id: "ingestion",
        prompt: "How do you ingest the webhook bursts?",
        options: [
          {
            id: "function-enqueue-servicebus",
            label:
              "HTTP-triggered Function validates and enqueues to Service Bus; a queue-triggered Function processes",
            score: 3,
            feedback:
              "The HTTP Function validates the payload and signature, drops the event on a Service Bus queue and returns 202 within milliseconds; the queue-triggered Function processes at whatever rate Azure SQL can absorb. The burst is absorbed by the queue rather than by the database, and nothing is lost if processing is slow.",
          },
          {
            id: "process-sync-in-api",
            label:
              "Validate and write each scan inside the HTTP request in an App Service API",
            score: 1,
            feedback:
              "Synchronous processing turns the 2,000-per-second burst into 2,000 database writes per second, then timeouts, carrier retries and more duplicates. It works at a few events per second and falls over at the evening flush.",
          },
          {
            id: "write-direct-to-sql",
            label: "Write straight from the webhook into Azure SQL, no buffer",
            score: 0,
            feedback:
              "With no buffer the database is the thing that must survive the burst, and any blip loses events because the carrier's retry window is only a few attempts.",
          },
          {
            id: "event-hubs",
            label: "Ingest into Event Hubs and consume with a stream processor",
            score: 2,
            feedback:
              "Event Hubs would absorb the burst easily and is the right tool for telemetry-style streams. Per-event dead-lettering, duplicate detection and simple competing consumers are what this workload needs, and Service Bus has them built in.",
          },
        ],
      },
      {
        id: "duplicates",
        prompt: "How do you handle the duplicates carriers send?",
        options: [
          {
            id: "sb-dedup-plus-idempotent-handler",
            label:
              "Service Bus duplicate detection on the carrier event id, plus an idempotent handler",
            score: 3,
            feedback:
              "Set `MessageId` to the carrier's event id and turn on duplicate detection with a window covering the retry period, then make the handler an upsert keyed on (carrier, event id). A duplicate that slips past the window is still harmless.",
          },
          {
            id: "handler-idempotency-only",
            label: "Idempotent handlers only",
            score: 2,
            feedback:
              "Idempotent handlers alone are correct and sufficient, since every duplicate becomes a no-op upsert. Dedup at the queue just saves the processing cost during the burst, so this is a fine second choice.",
          },
          {
            id: "ignore-duplicates",
            label: "Accept at-least-once delivery and do nothing special",
            score: 0,
            feedback:
              "At-least-once delivery plus carrier retries means a scan can be applied twice, which for status events such as 'delivered then returned' can reorder a shipment's history. Ignoring the problem is how parcels appear stuck.",
          },
          {
            id: "distributed-transaction",
            label:
              "Make receive-and-write atomic with a distributed transaction",
            score: 1,
            feedback:
              "Service Bus transactions do not extend into Azure SQL, and an attempt at it would slow the consumer during the burst. Idempotency is simpler and sufficient.",
          },
        ],
      },
      {
        id: "batch",
        prompt: "How do you run the nightly reconciliation?",
        options: [
          {
            id: "durable-fan-out",
            label:
              "A timer-triggered Durable Functions orchestration with fan-out over chunks",
            score: 3,
            feedback:
              "The orchestration splits the 3 million rows into chunks, fans out activity functions and fans in to write the exception report. Each activity is short, retries are per chunk, the orchestration survives a restart, and the VM with its manual restarts goes away.",
          },
          {
            id: "single-timer-function",
            label: "One timer-triggered Function that does the whole job",
            score: 0,
            feedback:
              "A single 40-minute execution on the Consumption plan hits the 10-minute execution ceiling and fails every night at 02:10.",
          },
          {
            id: "container-apps-job",
            label:
              "A scheduled Container Apps Job running the existing console app",
            score: 2,
            feedback:
              "A scheduled job runs the console app as a container with no time limit and no VM to maintain. Durable Functions wins here mainly because the team is already adopting Functions for ingestion and gets chunk-level retries for free.",
          },
          {
            id: "aks-cronjob",
            label: "A Kubernetes CronJob on AKS",
            score: 1,
            feedback:
              "A CronJob is fine in a team that runs Kubernetes. This team does not, and standing up a cluster to run one nightly job is the most expensive way to replace a VM.",
          },
        ],
      },
      {
        id: "plan",
        prompt: "Which Functions hosting plan?",
        options: [
          {
            id: "flex-consumption",
            label: "Flex Consumption",
            score: 3,
            feedback:
              "Flex Consumption scales out quickly for the 2,000-per-second bursts, scales to zero between them, and bills for actual use, which is the fix for a 1,200-euro bill dominated by idle instances.",
          },
          {
            id: "dedicated-app-service-plan",
            label: "An always-on App Service plan",
            score: 1,
            feedback:
              "Running Functions on an always-on plan keeps the same idle instances the team is trying to get rid of, and still needs manual scale rules for the evening bursts.",
          },
          {
            id: "premium-plan",
            label: "The Premium plan",
            score: 2,
            feedback:
              "Premium gives pre-warmed instances and VNet integration, which would matter if Azure SQL sat behind a private endpoint. If it does not, you pay for always-ready capacity this workload does not need.",
          },
          {
            id: "aks-functions",
            label: "The Functions runtime on AKS with KEDA",
            score: 0,
            feedback:
              "Hosting Functions on Kubernetes is possible but gives this five-person team a cluster to own for a workload that is idle most of the day.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Functions on Flex Consumption with Service Bus for ingestion, Durable Functions for the nightly batch.**\n\nThe two workloads look different but share a trait: they are mostly idle and occasionally intense, which is what a consumption model is for. The webhook burst is absorbed by a queue so Azure SQL is never the thing that has to survive 2,000 writes a second; duplicates are neutralised by `MessageId` deduplication plus idempotent upserts; per-shipment ordering comes from Service Bus sessions keyed on the shipment id if strict ordering is ever needed. The nightly job becomes a fan-out orchestration with chunk-level retries, which removes the VM and the manual restarts.\n\nThe first signal that would change the answer: if carriers moved from webhooks to a continuous stream of millions of scans per hour, ingestion would move to Event Hubs and the processing to a stream consumer.",
    relatedLessons: [
      "serverless-durable-functions",
      "azure-messaging-choices",
      "azure-compute-choices",
      "resilience",
    ],
  },
  {
    id: "global-catalogue-cosmos",
    title: "Twenty thousand reads a second, five regions",
    stacks: ["azure", "data", "dotnet"],
    level: 2,
    situation:
      "Lumen Market is a marketplace with 50 million product listings. The catalogue API serves 20,000 reads per second at peak, mostly point lookups by product id plus category browsing, and about 300 writes per second from sellers updating stock and price. Shoppers are spread across Western Europe, the US East Coast, Brazil, India and Japan, and the product team has set a p99 target of 50 ms for a product lookup measured from the shopper's region.\n\nToday the catalogue lives in one Azure SQL database in West Europe behind Redis. Shoppers in Japan see 250 ms round trips and the Redis miss rate during sales is 30 percent. The 12-person backend team is strong in SQL Server and EF Core and has never run a NoSQL store in production.\n\nThe catalogue holds no personal data, so GDPR residency is not a constraint for it; it is for the separate Orders system. Listings are 2 to 4 KB JSON documents with a handful of attributes that vary by category. Sellers can tolerate seeing their own update appear within a second or two in other regions, and the business wants faceted text search across titles and attributes.",
    constraints: [
      "Scale: 50 million listings, 20,000 reads per second peak, 300 writes per second",
      "Latency: p99 50 ms for a product lookup from each of 5 regions",
      "Existing: Azure SQL in West Europe plus Redis; 250 ms round trips from Japan",
      "Team: 12 engineers, SQL Server and EF Core, no NoSQL in production",
      "Compliance: no personal data in the catalogue",
      "Consistency: sellers accept a second or two of replication lag",
    ],
    decisions: [
      {
        id: "store",
        prompt: "Which store serves the catalogue?",
        options: [
          {
            id: "cosmos-multi-region",
            label: "Azure Cosmos DB for NoSQL replicated to all five regions",
            score: 3,
            feedback:
              "A replica in each shopper's region makes point reads by id single-digit milliseconds locally, which is what the 50 ms p99 target needs. The 2-4 KB variable-attribute documents are a natural fit, and the EF Core team can use the Cosmos provider or the SDK directly.",
          },
          {
            id: "sql-geo-replication-plus-redis",
            label:
              "Azure SQL active geo-replication with a readable secondary and Redis in each region",
            score: 2,
            feedback:
              "Readable secondaries per region keep the team on SQL, at the cost of running five caches and secondaries with a rigid schema for attributes that vary by category. Defensible, and more work to operate at 20,000 reads per second.",
          },
          {
            id: "hyperscale-single-region",
            label: "Azure SQL Hyperscale with read replicas in West Europe",
            score: 1,
            feedback:
              "Hyperscale handles the read volume, but its read replicas sit in the primary's region, so a shopper in Japan still crosses the planet. It solves throughput and ignores the latency target.",
          },
          {
            id: "table-storage",
            label: "Azure Table Storage",
            score: 0,
            feedback:
              "Table Storage is cheap and fast for key lookups but offers no secondary indexes or rich queries for category browsing, and its only read replica is the paired region. It meets neither the browsing nor the latency requirement.",
          },
          {
            id: "blob-json-on-cdn",
            label: "One JSON blob per listing behind Azure Front Door",
            score: 1,
            feedback:
              "Publishing listings as JSON blobs behind a CDN serves point reads from the edge very cheaply, and is worth doing for the hottest listings. It cannot serve category browsing or reflect a seller's stock change within seconds without invalidation machinery.",
          },
        ],
      },
      {
        id: "partition-key",
        prompt: "What partition key do you choose?",
        options: [
          {
            id: "product-id",
            label: "/productId",
            score: 3,
            feedback:
              "Fifty million small logical partitions spread the 300 writes per second evenly and make the dominant query, a lookup by id, a cheap single-partition point read. Category browsing becomes a cross-partition query at a fraction of the traffic, or is served by the search index.",
          },
          {
            id: "category-id",
            label: "/categoryId",
            score: 1,
            feedback:
              "Partitioning by category concentrates popular categories into hot partitions and can push a large category past the 20 GB logical partition limit with 50 million listings. Browsing a category is fast; every other access pattern suffers.",
          },
          {
            id: "country-code",
            label: "/countryCode",
            score: 0,
            feedback:
              "There are five shopper regions and one global catalogue; partitioning by country puts the whole catalogue into a handful of giant partitions that cannot be split and that throttle under 20,000 reads per second.",
          },
          {
            id: "seller-id",
            label: "/sellerId",
            score: 2,
            feedback:
              "Seller id spreads data reasonably and makes a seller's dashboard a single-partition query, but the shopper-side lookup by product id then needs the seller id too or becomes cross-partition. Workable if seller writes dominated; here reads by id dominate.",
          },
        ],
      },
      {
        id: "consistency",
        prompt: "Which consistency level?",
        options: [
          {
            id: "session",
            label: "Session",
            score: 3,
            feedback:
              "Session consistency gives a seller read-your-own-writes within their session, lets other regions lag a second or two as the business accepts, and keeps reads at the lowest cost. It is the default for a reason.",
          },
          {
            id: "strong",
            label: "Strong, because the team is used to SQL",
            score: 0,
            feedback:
              "Strong consistency across five regions means every one of the 300 writes per second waits for cross-continent replication before it returns, to guarantee something the business said it does not need. It undermines the latency goal the migration exists to meet.",
          },
          {
            id: "eventual",
            label: "Eventual",
            score: 2,
            feedback:
              "Eventual is cheapest and fine for shoppers, but a seller who updates a price and then refreshes their listing may see the old value, which generates support tickets. Session costs about the same and avoids that.",
          },
          {
            id: "bounded-staleness",
            label: "Bounded staleness",
            score: 2,
            feedback:
              "Bounded staleness gives a hard lag ceiling across regions, which is useful if the business later puts a number on acceptable lag. For now it costs more than session without a stated requirement to justify it.",
          },
        ],
      },
      {
        id: "search",
        prompt: "How do you serve faceted text search?",
        options: [
          {
            id: "ai-search-change-feed",
            label: "Azure AI Search fed from the Cosmos DB change feed",
            score: 3,
            feedback:
              "An indexer on the change feed gives facets, text relevance and filters updated within seconds of a seller's change, and keeps search load off the operational store. Category browsing can move here too.",
          },
          {
            id: "cosmos-contains",
            label: "CONTAINS queries in Cosmos DB",
            score: 1,
            feedback:
              "`CONTAINS` across 50 million documents is a cross-partition scan that burns request units and cannot do relevance or facets. Fine for a prototype, not for 20,000 reads per second.",
          },
          {
            id: "replicate-to-sql-fulltext",
            label: "Replicate listings to Azure SQL and use full-text search",
            score: 2,
            feedback:
              "Full-text search in SQL works and keeps the team on familiar ground, but you now operate a second copy of the catalogue and still lack facets without more work.",
          },
          {
            id: "redis-search",
            label: "Build the search index in Redis",
            score: 0,
            feedback:
              "A search index in Redis means the whole 50 million-listing index lives in memory per region with hand-built facets and no indexer; it is a search engine the team would have to write.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Cosmos DB for NoSQL replicated to all five regions, partitioned by product id, session consistency, Azure AI Search for browsing and facets.**\n\nThe latency target measured from the shopper's region is the driver. No single-region store can serve a 50 ms p99 to Japan from West Europe, and Cosmos DB's per-region replicas with local reads are exactly the feature that meets it. The absence of personal data removes the residency complication that would otherwise push toward region-pinned SQL. Point reads by id dominate, so the partition key follows them; the change feed keeps the search index current without touching the hot path. The SQL-strong team should start with the SDK, autoscale throughput, and a load test from each region before cutting over.\n\nThe first signal that would change the answer: if listings grew joins and reports that span sellers and orders, the relational store would come back for that part.",
    relatedLessons: [
      "sql-vs-cosmos",
      "caching-strategies",
      "tradeoff-thinking",
    ],
  },
  {
    id: "bank-tenant-isolation",
    title: "One tenant wants its own vault",
    stacks: ["azure", "data", "dotnet"],
    level: 3,
    situation:
      "Ledgerline sells treasury-management SaaS to 400 mid-sized companies. The platform is an ASP.NET Core API and React front end on Azure Container Apps, with one Azure SQL database in which every table carries a `TenantId` column enforced by row-level security. It has worked for five years; the 12-person engineering team deploys daily.\n\nA German bank wants to sign a contract worth a third of current annual revenue. Its security review requires: the bank's data in a database that no other tenant's data touches, encryption with keys the bank controls, data and backups kept in the EU, and a quarterly report proving isolation. The bank's go-live is in three months. Its expected load is 2 percent of the platform's current traffic.\n\nThe other 399 tenants are happy with the shared model and price. Several smaller customers have asked about an \"enterprise tier\" in the past. The team does not want two codebases, and the daily deployment cadence is a selling point they will not give up. The platform already runs in West Europe; backups currently geo-replicate to North Europe.",
    constraints: [
      "Team: 12 engineers, daily deployments, one codebase",
      "Existing: 400 tenants in one Azure SQL database with RLS on TenantId, hosted on Container Apps in West Europe",
      "Compliance: bank requires a dedicated database, customer-controlled keys, EU-only data and backups, quarterly isolation evidence",
      "Deadline: bank go-live in 3 months",
      "Scale: the bank adds ~2% of current load",
      "Business: contract worth a third of annual revenue; other tenants stay on the shared tier",
    ],
    decisions: [
      {
        id: "tenancy-model",
        prompt: "Which tenancy model do you move to?",
        options: [
          {
            id: "hybrid-shared-plus-dedicated",
            label:
              "Hybrid: shared database for the 399, a dedicated database for the bank, chosen per request",
            score: 3,
            feedback:
              "One codebase, one deployment, two data tiers. It meets the bank's isolation requirement in three months without migrating anyone else, and it is the enterprise tier other customers have asked for.",
          },
          {
            id: "db-per-tenant-for-all",
            label: "Move all 400 tenants to a database each in elastic pools",
            score: 1,
            feedback:
              "A database per tenant is a coherent model, but it is a five-year-old platform's data migration plus 400 sets of migrations and backups, undertaken in three months because one customer asked. The bank's requirement does not need it.",
          },
          {
            id: "stay-shared-rls",
            label:
              "Stay shared; argue that row-level security is isolation enough",
            score: 0,
            feedback:
              "Row-level security is good engineering and is not what the bank asked for. A shared database cannot give customer-managed keys per tenant or a database-level isolation report, so this option loses a contract worth a third of revenue.",
          },
          {
            id: "separate-full-stack-for-bank",
            label:
              "A separate Container Apps environment and database just for the bank",
            score: 2,
            feedback:
              "A separate environment is the strongest isolation story and keeps the shared platform untouched. The cost is a second deployment target to keep in step daily; acceptable if the bank also demands compute isolation, which it has not.",
          },
        ],
      },
      {
        id: "resolution",
        prompt: "How does the code find the right database for a request?",
        options: [
          {
            id: "tenant-catalogue-resolver",
            label:
              "A tenant catalogue resolved at request start; DbContext created with that connection",
            score: 3,
            feedback:
              "A small catalogue (tenant id, tier, connection string reference, region) read at request start and cached; the EF Core `DbContext` is created with the resolved connection, and the shared tier keeps its RLS filter. The bank is a row with a different connection string, and the next enterprise tenant is another row.",
          },
          {
            id: "hardcoded-bank-check",
            label: "An if-statement on the bank's tenant id in the data layer",
            score: 0,
            feedback:
              "`if (tenantId == BankId)` is the first special case of many, it cannot be tested without the bank's id, and the quarterly isolation report would have to explain it.",
          },
          {
            id: "env-var-per-tenant",
            label:
              "A connection string per tenant as environment variables on the Container App",
            score: 1,
            feedback:
              "Environment variables per tenant mean a redeploy per new enterprise tenant and a growing list of secrets on the compute. Use Key Vault references and a catalogue instead.",
          },
          {
            id: "separate-code-branch",
            label: "A branch of the codebase for the bank",
            score: 0,
            feedback:
              "A branch ends the daily single deployment the team will not give up, and within a quarter the two branches have drifted.",
          },
        ],
      },
      {
        id: "keys",
        prompt: "How do you satisfy the key-control requirement?",
        options: [
          {
            id: "tde-cmk-keyvault",
            label:
              "TDE with a customer-managed key in Azure Key Vault in West Europe",
            score: 3,
            feedback:
              "Transparent data encryption on the bank's database with a customer-managed key, where the bank controls rotation and can revoke access. The Key Vault audit log is the evidence for the quarterly report.",
          },
          {
            id: "service-managed-tde",
            label: "The default service-managed TDE",
            score: 1,
            feedback:
              "Service-managed TDE encrypts at rest but the key is Microsoft's, which fails the bank's 'keys the bank controls' requirement outright.",
          },
          {
            id: "column-encryption-everywhere",
            label: "Encrypt every column in the application",
            score: 1,
            feedback:
              "Application-level encryption of every column gives the bank control but breaks indexing and querying across code paths built for 400 tenants, in three months. Always Encrypted for a few specific columns can come later if they ask.",
          },
          {
            id: "no-extra-encryption",
            label: "No change to encryption",
            score: 0,
            feedback:
              "Leaving the bank's data without customer-controlled encryption fails the security review and the contract.",
          },
        ],
      },
      {
        id: "residency",
        prompt: "Where do the bank's data and backups live?",
        options: [
          {
            id: "eu-only-paired-region",
            label:
              "Primary in West Europe, backups in North Europe, Key Vault in the same region",
            score: 3,
            feedback:
              "Both regions are in the EU and the existing platform already uses this pairing, so the bank's database inherits it with no new infrastructure.",
          },
          {
            id: "germany-region-only",
            label: "Germany West Central with Germany-only backups",
            score: 2,
            feedback:
              "A Germany-only footprint is a reasonable reading of the requirement and some German banks prefer it. It adds a new region to the platform's operations for one tenant; worth doing only if the contract says Germany rather than EU.",
          },
          {
            id: "us-backup-copy",
            label: "Keep a backup copy in a US region for resilience",
            score: 0,
            feedback:
              "A backup copy in a US region, even encrypted, breaches the EU-only requirement and would appear on the quarterly report.",
          },
          {
            id: "single-region-no-geo-backup",
            label: "West Europe only, no geo-redundant backup",
            score: 1,
            feedback:
              "A single region satisfies residency but leaves the bank with a worse recovery story than the shared tier, which is hard to defend in the review.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: hybrid tenancy, resolved by a tenant catalogue, with a dedicated EU-only Azure SQL database and customer-managed keys for the bank.**\n\nThe facts that settle it: one customer with hard isolation demands, 399 who are fine, a team of 12 that deploys daily and a three-month clock. A hybrid model gives the bank a database no other tenant touches without migrating anyone else, and the catalogue makes the second enterprise tenant a configuration change. Customer-managed TDE keys in Key Vault answer the key-control clause, and the existing West Europe plus North Europe pairing answers residency. Write an automated isolation check that runs the bank's connection against the shared database and proves it returns nothing; that becomes the quarterly evidence.\n\nThe first signal that would change the answer: if the bank also demanded dedicated compute and network, the separate Container Apps environment becomes necessary.",
    relatedLessons: [
      "multi-tenancy",
      "identity-and-secrets",
      "sql-vs-cosmos",
      "security-architecture",
    ],
  },
  {
    id: "compute-no-kubernetes",
    title: "Containers yes, Kubernetes no",
    stacks: ["azure", "dotnet"],
    level: 1,
    situation:
      "Tidewell is a six-person product team at a mid-sized logistics company building a new dispatch system: three ASP.NET Core APIs (Orders, Routing, Notifications), one background worker that consumes a Service Bus queue, and a React front end. Peak load is around 50 requests per second from 150 dispatchers, with the worker handling 20,000 messages a day. Everything is already in Docker for local development.\n\nNobody on the team has run Kubernetes. The company's central IT runs an AKS cluster for another division and has offered a namespace, with the warning that the platform team of two is already stretched and the cluster upgrade backlog is six months long. The product team is on call for its own system.\n\nThe budget is 900 euros a month across dev, test and production. The dev and test environments sit idle at night and weekends, which is where most of the money goes on a lift-and-shift VM estimate. The team wants to try Dapr for service invocation and pub/sub and .NET Aspire for local orchestration. Go-live is in five months.",
    constraints: [
      "Team: 6 developers, own on-call, no Kubernetes experience",
      "Workload: 3 ASP.NET Core APIs, 1 queue worker, 1 React SPA; 50 requests per second; 20,000 messages per day",
      "Budget: 900 euros per month for dev, test and production",
      "Existing: company AKS cluster with an overstretched 2-person platform team",
      "Deadline: go-live in 5 months",
      "Skills: Docker in use; interest in Dapr and .NET Aspire",
    ],
    decisions: [
      {
        id: "compute",
        prompt: "Where do the services run?",
        options: [
          {
            id: "container-apps",
            label: "Azure Container Apps",
            score: 3,
            feedback:
              "Container Apps runs the existing containers with managed ingress, scale-to-zero for dev and test, built-in Dapr, and KEDA scaling for the worker, with no cluster to upgrade. Six people who are on call for their own system get the container model without the Kubernetes operations.",
          },
          {
            id: "aks-namespace",
            label: "The offered namespace on the company AKS cluster",
            score: 0,
            feedback:
              "A namespace on a cluster run by a two-person team with a six-month upgrade backlog is the fashionable trap. The product team would depend on people who are already stretched, and would spend their five months learning ingress controllers and node pools instead of dispatch features.",
          },
          {
            id: "app-service-containers",
            label: "App Service for Containers",
            score: 2,
            feedback:
              "App Service runs each API fine and the team may know it already. It lacks scale-to-zero for dev and test and has no native Dapr, and the worker fits less naturally; a reasonable choice if the team drops the Dapr idea.",
          },
          {
            id: "functions-for-everything",
            label: "Rewrite the APIs and worker as Azure Functions",
            score: 1,
            feedback:
              "Rewriting three APIs and a worker as Functions changes the programming model the team already has in containers for no gain at 50 requests per second.",
          },
          {
            id: "vms-docker-compose",
            label: "VMs running Docker Compose",
            score: 1,
            feedback:
              "VMs are what the lift-and-shift estimate assumed: they are the idle cost at night, need patching, and give no managed ingress or scaling.",
          },
        ],
      },
      {
        id: "worker",
        prompt: "How does the background worker run?",
        options: [
          {
            id: "container-app-keda-queue",
            label:
              "A Container App at min replicas 0 with a KEDA rule on queue length",
            score: 3,
            feedback:
              "The worker starts when messages arrive and stops when the queue drains. At 20,000 messages a day that is a few minutes of compute, which fits the 900-euro budget.",
          },
          {
            id: "worker-inside-api",
            label: "An IHostedService inside the Orders API",
            score: 2,
            feedback:
              "Hosting the consumer inside the Orders API is simple and works at this volume, but it ties the worker's scaling and restarts to the API, and a long message burst can slow the dispatchers' requests.",
          },
          {
            id: "function-queue-trigger",
            label: "A Service Bus-triggered Azure Function",
            score: 2,
            feedback:
              "A queue-triggered Function is a good fit for this volume. The cost is a second hosting model next to the Container Apps the APIs use; fine if the team is happy to run both.",
          },
          {
            id: "windows-service-on-vm",
            label: "A Windows service on a VM",
            score: 0,
            feedback:
              "A Windows service on a VM is the model the team is leaving: always-on cost, manual deployment and an OS to patch for 20,000 messages a day.",
          },
        ],
      },
      {
        id: "local-dev",
        prompt: "How do developers run the whole system locally?",
        options: [
          {
            id: "aspire-apphost",
            label: "A .NET Aspire AppHost",
            score: 3,
            feedback:
              "One AppHost starts the three APIs, the worker, a Service Bus emulator or dev queue, and the React dev server with one F5, with a dashboard for logs and traces. It matches the team's wish list and has a direct deployment path to Container Apps through the Azure Developer CLI.",
          },
          {
            id: "docker-compose",
            label: "The existing Docker Compose file",
            score: 2,
            feedback:
              "Compose already works for the team and is a fine baseline. It lacks the dashboard, service discovery and the path to Container Apps that Aspire adds, so it is a sensible fallback.",
          },
          {
            id: "run-each-manually",
            label: "Each developer starts each process by hand",
            score: 0,
            feedback:
              "Six developers each starting four processes with their own port numbers and connection strings is how 'works on my machine' bugs reach production.",
          },
          {
            id: "minikube-local",
            label: "Kubernetes on every laptop with minikube",
            score: 1,
            feedback:
              "Running Kubernetes on every laptop brings the operational learning curve the team chose Container Apps to avoid, for a system that does not need it.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Azure Container Apps for the APIs and the worker, .NET Aspire for local orchestration, Dapr optional.**\n\nThe deciding facts are the team's own on-call, zero Kubernetes experience, a platform team that cannot help, and a budget where idle dev and test environments are the main cost. Container Apps gives managed ingress, scale-to-zero, KEDA scaling for the worker and built-in Dapr sidecars, with no cluster to upgrade. Aspire gives one-command local startup and the deployment path. The 50 requests per second and 20,000 daily messages are far below anything that would need the control Kubernetes offers.\n\nTry Dapr for pub/sub only after a plain Service Bus client has proven insufficient; it is easy to add on Container Apps later.\n\nThe first signal that would change the answer: a requirement for custom node types, privileged daemon sets or a service mesh policy that Container Apps cannot express, at which point AKS with a real platform team becomes the conversation.",
    relatedLessons: [
      "azure-compute-choices",
      "aspire-dapr",
      "azure-messaging-choices",
      "cicd-and-environments",
    ],
  },
  {
    id: "marketing-docs-site-seo",
    title: "Three hundred pages that must rank",
    stacks: ["react", "azure"],
    level: 1,
    situation:
      "Relay Tools sells a developer product. Its public site has 40 marketing pages, 260 documentation pages, a blog, and one interactive pricing calculator. Traffic is 1.2 million visits a month, 70 percent from search; organic ranking for documentation queries is the main acquisition channel, so Core Web Vitals and crawlability matter to the business.\n\nContent is written in Markdown by five technical writers and product marketers who commit to a Git repository through pull requests; documentation changes land several times a day. Two front-end developers own the site alongside other work. The current site is a Vite single-page React app; search engines index it inconsistently and Lighthouse reports a Largest Contentful Paint over four seconds on mobile.\n\nThe company runs everything else on Azure and wants the site there too. Monthly hosting budget is 200 euros. There is no user login on the site. The pricing calculator takes four inputs and shows a price estimate immediately; it must work without a server round trip.",
    constraints: [
      "Content: 300 Markdown pages in Git, 5 writers merging several times a day",
      "Traffic: 1.2 million visits per month, 70% from search",
      "Team: 2 front-end developers, part time",
      "Existing: Vite SPA with poor indexing and LCP over 4 seconds on mobile",
      "Budget: 200 euros per month, on Azure",
      "Interactivity: one client-side pricing calculator, no login",
    ],
    decisions: [
      {
        id: "rendering",
        prompt: "Which rendering approach do you adopt?",
        options: [
          {
            id: "nextjs-static-generation",
            label: "Next.js with every page statically generated at build time",
            score: 3,
            feedback:
              "Every page is plain HTML for crawlers, LCP drops to the time it takes to send a static file, and five writers merging Markdown trigger a rebuild rather than a server deploy. The calculator is the one client component.",
          },
          {
            id: "keep-vite-spa",
            label: "Keep the Vite SPA and add meta tags",
            score: 0,
            feedback:
              "The SPA is the reason indexing is inconsistent and LCP is over four seconds: the crawler and the reader both wait for JavaScript to fetch and render content that never changes between requests.",
          },
          {
            id: "full-ssr-per-request",
            label: "Server-side rendering on every request",
            score: 1,
            feedback:
              "Rendering 300 static pages on every request puts a Node server in the path of 1.2 million visits for content that changes a few times a day. It fixes crawlability and pays a server bill and an operational burden for nothing.",
          },
          {
            id: "astro-static",
            label: "Astro with Markdown content collections",
            score: 2,
            feedback:
              "Astro would produce the same static HTML with less client JavaScript by default and handles Markdown content well. Next.js wins here only because the two developers already know React tooling and the calculator is a React component.",
          },
          {
            id: "blazor-webassembly",
            label: "Blazor WebAssembly",
            score: 0,
            feedback:
              "A WebAssembly app downloads a runtime before showing a documentation page and gives crawlers nothing to index, which is the current problem in a different language.",
          },
        ],
      },
      {
        id: "content-pipeline",
        prompt: "How does content get from the writers to the site?",
        options: [
          {
            id: "mdx-in-git-build-on-merge",
            label:
              "Markdown in the repository, rendered with MDX at build time, deploy on merge",
            score: 3,
            feedback:
              "Writers keep the pull-request flow they already use, a merge to main triggers the build and deploy, and a bad change is a revert.",
          },
          {
            id: "headless-cms-client-fetch",
            label: "A headless CMS fetched from the browser",
            score: 1,
            feedback:
              "Fetching page content in the browser recreates the SPA problem: the crawler sees an empty shell until the fetch completes.",
          },
          {
            id: "headless-cms-build-time",
            label: "A headless CMS pulled at build time",
            score: 2,
            feedback:
              "Build-time CMS content produces the same static output and gives non-technical editors a nicer interface. The current writers are happy in Git, so it adds a system and a monthly fee without a problem to solve.",
          },
          {
            id: "hardcoded-jsx-pages",
            label: "Each page as hand-written JSX",
            score: 0,
            feedback:
              "Three hundred pages as JSX means every documentation fix is a developer task for the two people who have other work.",
          },
        ],
      },
      {
        id: "hosting",
        prompt: "Where is it hosted?",
        options: [
          {
            id: "static-web-apps",
            label: "Azure Static Web Apps",
            score: 3,
            feedback:
              "Static Web Apps serves the static export from a global edge, builds from the repository on merge, gives preview environments for pull requests, and fits inside the 200-euro budget with room to spare.",
          },
          {
            id: "blob-static-plus-front-door",
            label: "Blob Storage static website behind Azure Front Door",
            score: 2,
            feedback:
              "Blob plus Front Door is the same static hosting assembled by hand, with a CDN and a WAF you configure yourself. It works and costs a little more effort; Static Web Apps packages it.",
          },
          {
            id: "app-service-node",
            label: "App Service for Linux running the Next.js server",
            score: 1,
            feedback:
              "A Node server is only needed if pages render per request, which this site does not. It adds an always-on instance to the bill.",
          },
          {
            id: "aks",
            label: "An AKS cluster with an nginx ingress",
            score: 0,
            feedback:
              "A Kubernetes cluster to serve static HTML would consume the whole budget before the first page is served.",
          },
        ],
      },
      {
        id: "calculator",
        prompt: "How does the pricing calculator work?",
        options: [
          {
            id: "client-component-on-static-page",
            label: "A client component hydrated on the static pricing page",
            score: 3,
            feedback:
              "The page arrives as HTML, the component hydrates, and the four inputs compute locally with no server round trip, as required.",
          },
          {
            id: "ssr-whole-page-for-calculator",
            label: "Make the pricing page dynamic and render it on the server",
            score: 1,
            feedback:
              "Making the page dynamic because one widget is interactive forces a server render for a page whose text never changes, when hydration of one component is all that is needed.",
          },
          {
            id: "iframe-separate-spa",
            label: "An iframe to a separate SPA",
            score: 1,
            feedback:
              "An iframe works but doubles the deployments, complicates styling and analytics, and is heavier than a single hydrated component.",
          },
          {
            id: "server-action-per-keystroke",
            label: "A server action on each input change",
            score: 0,
            feedback:
              "A server action means a network round trip for arithmetic that must work without one, and it needs the Node server the site otherwise avoids.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Next.js static generation from Markdown in Git, hosted on Azure Static Web Apps, with the calculator as a hydrated client component.**\n\nThe facts: 70 percent of traffic from search, content that changes a few times a day through pull requests, two part-time developers and a 200-euro budget. All of them point to prebuilt HTML on an edge network: crawlers get full pages, LCP falls to the cost of a static file, and the writers' workflow stays as it is. One interactive widget does not justify a server; it hydrates on an otherwise static page.\n\nAdd a build-time check that fails the deploy if a page exceeds a size budget, so the LCP win is protected.\n\nThe first signal that would change the answer: a logged-in area with per-user content or a pricing page that depends on live inventory, which would introduce server rendering for those routes only.",
    relatedLessons: [
      "react-rendering-strategies",
      "aspnet-react-hosting",
      "react-code-organisation",
    ],
  },
  {
    id: "internal-admin-dashboard",
    title: "Two hundred admins, forty data grids",
    stacks: ["react", "dotnet"],
    level: 1,
    situation:
      'Harbour Logistics is replacing an ageing operations console used by 200 internal staff: dispatchers, customer-service agents and finance. The console is forty screens of data grids with filters, sorting and paging, detail panels, and CRUD forms for shipments, customers and invoices. Users keep it open all day and complain mostly about slow filters and lost state when they refresh.\n\nThe backend is an existing ASP.NET Core API with a published OpenAPI document and Entra ID authentication; the API team is separate and ships weekly. The front-end team is three developers who know React and TypeScript. There is no public access, no search-engine concern, and the app runs on the corporate network on desktop browsers only.\n\nA consultant has suggested rebuilding in Next.js with React Server Components "because that is where React is going". The team has eight months, and the main risks they see are stale data when two agents edit the same shipment, and making filter state survive a refresh and be shareable as a link between colleagues.',
    constraints: [
      "Users: 200 internal staff on desktop browsers, no SEO, no public access",
      "Existing: ASP.NET Core API with an OpenAPI document and Entra ID; API team ships weekly",
      "Team: 3 front-end developers, 8 months",
      "Workload: 40 screens, mostly data grids with filters and CRUD forms",
      "Requirements: filter state survives refresh and is shareable; stale-data conflicts between agents",
      "Hosting: corporate network, desktop only",
    ],
    decisions: [
      {
        id: "framework",
        prompt: "Which framework and rendering model?",
        options: [
          {
            id: "vite-spa",
            label: "A Vite React SPA served as static files",
            score: 3,
            feedback:
              "There is no SEO, no anonymous first paint to optimise, and 200 logged-in users who keep the tab open all day. A server rendering layer would add a Node process and a deployment with nothing to show for it.",
          },
          {
            id: "nextjs-rsc",
            label: "Next.js with React Server Components",
            score: 1,
            feedback:
              "Next.js with Server Components is the fashionable trap here. It introduces a Node server to host, a second place for data fetching next to the .NET API, and a split programming model for grids that are interactive and client-driven by nature, all for an app with no SEO or first-load concern.",
          },
          {
            id: "react-router-framework",
            label: "React Router in framework mode, SPA mode",
            score: 2,
            feedback:
              "File-based routing and loaders fit a screen-per-URL console well, and SPA mode needs no server. A defensible alternative if the team values its routing conventions.",
          },
          {
            id: "create-react-app",
            label: "Create React App",
            score: 0,
            feedback:
              "Create React App is deprecated and no longer maintained. Starting an eight-month project on it means inheriting a dead toolchain.",
          },
        ],
      },
      {
        id: "server-state",
        prompt: "How do you manage data from the API?",
        options: [
          {
            id: "tanstack-query",
            label: "TanStack Query",
            score: 3,
            feedback:
              "Caching per query key, background refetch on window focus so an agent sees another's edit, stale-while-revalidate for the grids, and mutation hooks that invalidate the affected lists. That is most of the stale-data risk handled by the library.",
          },
          {
            id: "rtk-query",
            label: "Redux Toolkit with RTK Query",
            score: 2,
            feedback:
              "RTK Query does the same job well and makes sense if the team already runs Redux. It brings the Redux store along, which this app otherwise does not need.",
          },
          {
            id: "useeffect-fetch",
            label: "useEffect and useState per screen",
            score: 0,
            feedback:
              "Hand-rolled fetching across forty screens means forty copies of loading, error, cancellation and cache logic, and the stale-data problem stays unsolved.",
          },
          {
            id: "zustand-for-server-data",
            label: "Copy API responses into a Zustand store",
            score: 1,
            feedback:
              "A store of API responses turns the team into maintainers of a cache with no invalidation, refetch or deduplication story. Zustand is for client state.",
          },
        ],
      },
      {
        id: "view-state",
        prompt: "Where do filter, sort and paging state live?",
        options: [
          {
            id: "url-params-plus-zustand",
            label:
              "URL search params for filters and sort; a small Zustand store for selection and panels",
            score: 3,
            feedback:
              "Filters in the URL mean a refresh restores the view and a link can be pasted to a colleague, which is the requirement; selected rows and open panels go in a small Zustand store. The URL is the state that users asked to share.",
          },
          {
            id: "zustand-everything",
            label: "Zustand for all view state, persisted",
            score: 2,
            feedback:
              "A persisted store survives a refresh but does not make a filter shareable as a link, which was an explicit requirement.",
          },
          {
            id: "redux-toolkit-all-ui-state",
            label: "Redux Toolkit slices for every filter and panel",
            score: 1,
            feedback:
              "Slices, actions and selectors for state that belongs in the URL, and still a separate URL-sync layer to write.",
          },
          {
            id: "react-context-at-root",
            label: "One React context at the root holding all filters",
            score: 0,
            feedback:
              "A single context re-renders every subscribed grid when any filter changes, which is how a console with 'slow filters' complaints gets slower.",
          },
        ],
      },
      {
        id: "api-client",
        prompt: "How does the front end call the API?",
        options: [
          {
            id: "generated-openapi-client",
            label:
              "A TypeScript client generated from the OpenAPI document in CI",
            score: 3,
            feedback:
              "Every weekly API change shows up as a compile error on the front end rather than a runtime bug on an agent's screen.",
          },
          {
            id: "handwritten-fetch",
            label: "Hand-written fetch wrappers",
            score: 1,
            feedback:
              "Hand-written wrappers for forty screens drift from the API within a few weekly releases, and the types are whatever the developer remembered.",
          },
          {
            id: "graphql-layer",
            label: "A GraphQL server in front of the REST API",
            score: 0,
            feedback:
              "A GraphQL layer with one consumer is a layer to own, with no over-fetching problem to justify it.",
          },
          {
            id: "trpc",
            label: "tRPC",
            score: 1,
            feedback:
              "tRPC assumes a TypeScript backend sharing types with the client; the backend is .NET, so there is nothing to infer from.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Vite SPA, TanStack Query for server state, URL search params plus a small Zustand store for view state, a generated OpenAPI client.**\n\nThe facts remove the need for a server rendering layer: 200 logged-in users, desktop only, no SEO, an API that already exists. What the users asked for is fast filters, shareable views and fewer stale-data surprises, and those are solved by where state lives rather than by the rendering model. TanStack Query's refetch-on-focus and invalidation handle most conflicts; adding an `ETag` or row version to the API's update endpoints handles the rest. Virtualise the big grids from day one.\n\nThe first signal that would change the answer: a public-facing customer portal with anonymous visitors and SEO, which would be a separate Next.js application rather than a rewrite of this one.",
    relatedLessons: [
      "react-server-state",
      "react-state-management",
      "react-rendering-strategies",
      "api-contracts-openapi",
    ],
  },
  {
    id: "storefront-personalisation",
    title: "Logged-in shoppers see a different shop",
    stacks: ["react", "dotnet", "azure"],
    level: 2,
    situation:
      "Bramble & Co is a fashion retailer with 2 million monthly visitors. Product pages must rank in search and load fast on mobile; a 200 ms slowdown in Largest Contentful Paint has measurably hurt conversion before. 35 percent of visitors are logged in, and for them the business wants personalised recommendations, member prices and a 'recently viewed' rail. Marketing runs A/B tests on page layouts.\n\nThe catalogue has 80,000 products updated through the day; prices change a few times a week except during sales, when they change hourly. The backend is a set of ASP.NET Core APIs on Azure with Redis in front of the catalogue; the recommendation service takes 150 ms per call.\n\nThe front-end team is eight developers experienced with React and currently running a client-rendered SPA whose product pages are indexed poorly. They have six months before the autumn campaign. The company is in the UK and the EU; GDPR applies to the logged-in data, and personalised content must never be cached in a shared cache where another shopper could receive it.",
    constraints: [
      "Traffic: 2 million monthly visitors, 35% logged in, mobile-heavy",
      "Revenue: SEO and Core Web Vitals on product pages directly affect conversion",
      "Personalisation: recommendations (150 ms), member prices, recently viewed, A/B layouts",
      "Catalogue: 80,000 products; prices change weekly, hourly during sales",
      "Team: 8 React developers, 6 months to the autumn campaign",
      "Compliance: GDPR; personalised content must never reach a shared cache",
    ],
    decisions: [
      {
        id: "rendering",
        prompt: "Which rendering approach for product pages?",
        options: [
          {
            id: "app-router-cached-shell-streamed-personalisation",
            label:
              "Next.js App Router: server-rendered product content from cached data, personalised blocks streamed in Suspense",
            score: 3,
            feedback:
              "Title, images, description and base price render on the server from cached catalogue data; the personalised blocks render in Server Components inside Suspense boundaries that stream in after the first paint. Crawlers and anonymous shoppers get fast HTML; logged-in shoppers get their rail a moment later without blocking LCP.",
          },
          {
            id: "full-ssg",
            label: "Statically generate all 80,000 product pages at build time",
            score: 1,
            feedback:
              "Static pages give great anonymous performance but cannot show member prices or recommendations, and hourly sale prices mean constant rebuilds. Personalisation would end up client-side after hydration, which is the compromise this choice was supposed to avoid.",
          },
          {
            id: "client-spa",
            label: "Keep the client-rendered SPA",
            score: 0,
            feedback:
              "The SPA is why product pages index poorly and why LCP waits on JavaScript. Keeping it loses the SEO revenue the project exists to recover.",
          },
          {
            id: "per-request-ssr-no-cache",
            label:
              "Server-render every product page per request, recommendations inline",
            score: 2,
            feedback:
              "Per-request rendering is correct and simple, but it puts the 150 ms recommendation call inside LCP for every logged-in shopper and spends servers rendering identical catalogue content for anonymous visitors. Defensible as a first step; caching the shell is the fix.",
          },
        ],
      },
      {
        id: "personalisation-fetch",
        prompt: "Where is personalised data fetched?",
        options: [
          {
            id: "server-component-in-suspense",
            label:
              "In a Server Component inside a Suspense boundary, using the session cookie",
            score: 3,
            feedback:
              "The 150 ms call happens on the server near the API and streams in without affecting the first paint. No personal data goes through a shared cache because the segment is rendered per request.",
          },
          {
            id: "client-after-hydration",
            label: "Client-side with TanStack Query after hydration",
            score: 2,
            feedback:
              "Fetching after hydration keeps the server simple and is what many storefronts do. It costs a round trip from the shopper's phone and a visible layout shift as the rail appears, both of which affect the metrics this team is measured on.",
          },
          {
            id: "at-build-time",
            label: "At build time",
            score: 0,
            feedback:
              "Build time has no idea who the shopper is; the output would be the same for everyone, and member prices would be wrong.",
          },
          {
            id: "in-middleware-every-request",
            label: "In Next.js middleware for every request",
            score: 1,
            feedback:
              "Calling the recommendation service from middleware for every request, including anonymous and crawler traffic, adds 150 ms to pages that do not need it and runs personal data through a layer that should stay thin.",
          },
        ],
      },
      {
        id: "caching",
        prompt: "How do you cache?",
        options: [
          {
            id: "cache-shell-mark-personalised-dynamic",
            label:
              "Cache the catalogue data fetch with revalidation; keep personalised segments uncached per request",
            score: 3,
            feedback:
              "A short revalidation window during sales (or tag-based invalidation from the price service) and a longer one otherwise, with personalised segments rendered per request and the CDN caching only anonymous HTML. Nothing personal is ever written to a shared cache.",
          },
          {
            id: "cache-whole-page-per-user",
            label: "Cache full pages keyed by user",
            score: 1,
            feedback:
              "Full pages keyed by user means 700,000 logged-in variants of 80,000 products, which no cache holds and which rarely gets a hit.",
          },
          {
            id: "no-caching",
            label: "No caching at all",
            score: 1,
            feedback:
              "Rendering everything per request works at low traffic and is the simplest to reason about, but 2 million visitors against a catalogue that changes weekly is a lot of identical renders and a bigger server bill.",
          },
          {
            id: "cdn-cache-whole-page-including-personalised",
            label:
              "Let Front Door cache the whole page, personalised parts included",
            score: 0,
            feedback:
              "Caching a page with member prices and a recently-viewed rail in Front Door means the next shopper can receive someone else's data, which is a GDPR incident.",
          },
        ],
      },
      {
        id: "hosting",
        prompt: "Where does the Next.js application run?",
        options: [
          {
            id: "container-apps-standalone-behind-front-door",
            label:
              "Standalone output on Azure Container Apps behind Azure Front Door",
            score: 3,
            feedback:
              "Build with `output: 'standalone'`, run it on Container Apps next to the APIs, and put Front Door in front for CDN caching of anonymous pages and assets plus the WAF. It scales with the autumn campaign and keeps the recommendation call inside the region.",
          },
          {
            id: "static-web-apps-export",
            label: "Azure Static Web Apps with a static export",
            score: 0,
            feedback:
              "A static export cannot run Server Components or per-request rendering, so personalisation is impossible there.",
          },
          {
            id: "app-service-linux-node",
            label: "App Service for Linux running Node",
            score: 2,
            feedback:
              "App Service runs a Node server fine and the team may know it; it scales less flexibly than Container Apps for campaign spikes and offers no scale-to-zero for preview environments.",
          },
          {
            id: "aks",
            label: "AKS",
            score: 1,
            feedback:
              "A Kubernetes cluster for one Node application is operational weight the eight front-end developers do not need, when Container Apps gives the same container model managed.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Next.js App Router on Container Apps behind Front Door, cached catalogue shell with streamed, per-request personalised segments.**\n\nThe facts: SEO and LCP drive revenue, a third of visitors need personalised content, prices change often, and personal data must never reach a shared cache. Server rendering from cached catalogue data satisfies crawlers and mobile LCP; Suspense boundaries let the 150 ms recommendation call stream in after the first paint for logged-in shoppers only; keeping personalised segments dynamic and uncached is the GDPR line. A/B layouts become a server-side variant decision read from a cookie. The eight React developers have six months, which is enough to migrate product pages first and leave checkout on the current SPA until after the campaign.\n\nThe first signal that would change the answer: if most traffic became logged-in app users with no search entry point, a client-rendered experience with an API gateway would be simpler.",
    relatedLessons: [
      "react-rendering-strategies",
      "react-server-state",
      "caching-strategies",
      "react-performance-architecture",
    ],
  },
  {
    id: "trading-realtime-dashboard",
    title: "Four hundred ticks a second, sixty screens",
    stacks: ["react", "dotnet", "azure"],
    level: 3,
    situation:
      "Keel Capital's trading desk wants a browser dashboard to replace a desktop application. 60 traders each watch 200 to 500 instruments; the pricing engine, an ASP.NET Core service, produces up to 400 price updates per second for a typical watch list and more in volatile markets. Traders need a changed price on screen within 100 ms of the engine producing it, grids that scroll at 60 frames per second, and no visible stutter during a burst. A trader also enters orders from the same screen, which must never be blocked by the price stream.\n\nThe front-end team is four developers strong in React; the backend team already uses SignalR for notifications elsewhere. The dashboard is internal, on the corporate network, with two API instances for redundancy. Traders run Chrome on high-end workstations with three monitors.\n\nA previous prototype put every tick into a React context and the whole grid re-rendered 400 times a second; it was abandoned at 15 instruments. The team has four months and is told that latency and smoothness matter more than development speed.",
    constraints: [
      "Users: 60 traders, 200-500 instruments each, internal network, Chrome on workstations",
      "Scale: up to 400 price updates per second per client, bursts higher",
      "Latency: changed price visible within 100 ms; grids at 60 fps; order entry never blocked",
      "Existing: ASP.NET Core pricing engine, SignalR in use elsewhere, 2 API instances",
      "Team: 4 React developers, 4 months",
      "Failure: a previous context-based prototype re-rendered the whole grid per tick",
    ],
    decisions: [
      {
        id: "transport",
        prompt: "How do prices reach the browser?",
        options: [
          {
            id: "signalr-websockets-conflated",
            label:
              "SignalR over WebSockets, server conflates ticks and pushes batches at a fixed cadence",
            score: 3,
            feedback:
              "The hub conflates ticks per instrument and sends the latest values every 50 ms or so, so a client receives at most 20 batches per second instead of 400 messages. The 100 ms budget is met and the browser is never flooded.",
          },
          {
            id: "rest-polling-500ms",
            label: "REST polling every 500 ms",
            score: 1,
            feedback:
              "Polling every 500 ms misses the 100 ms target by definition and has 60 clients hammering the API while still delivering stale snapshots.",
          },
          {
            id: "sse-one-way",
            label: "Server-sent events",
            score: 2,
            feedback:
              "Server-sent events are a reasonable one-way channel for price pushes and simpler than WebSockets, but order entry and subscription changes then need a separate request path, and SignalR already handles reconnection and groups for the backend team.",
          },
          {
            id: "tanstack-query-refetch-100ms",
            label: "TanStack Query with refetchInterval set to 100 ms",
            score: 0,
            feedback:
              "`refetchInterval: 100` is a polling loop dressed as a cache: 600 requests per second across 60 clients, each re-rendering the full response, with no ordering guarantee.",
          },
        ],
      },
      {
        id: "tick-state",
        prompt: "Where does tick state live in the client?",
        options: [
          {
            id: "external-store-per-row-subscription",
            label: "A store outside React with per-instrument subscriptions",
            score: 3,
            feedback:
              "Zustand with per-instrument selectors, or a plain `Map` exposed through `useSyncExternalStore`, means a tick for one instrument re-renders only that row's cells. The grid component itself never re-renders on price changes.",
          },
          {
            id: "redux-reducer-per-tick",
            label: "Redux Toolkit, one action per tick",
            score: 1,
            feedback:
              "Dispatching 400 immutable updates a second through Immer creates a new price map on every tick and runs every connected selector; it can be tuned, but it is fighting the library's model.",
          },
          {
            id: "react-context-all-prices",
            label: "A React context holding all prices",
            score: 0,
            feedback:
              "This is the design that failed at 15 instruments. Context has no selective subscription, so every consumer re-renders on every tick.",
          },
          {
            id: "tanstack-query-setquerydata",
            label: "Push ticks into the TanStack Query cache with setQueryData",
            score: 1,
            feedback:
              "Updating the instruments query on each tick triggers every observer of that query; the cache is built for request and response data, not for a 400 Hz stream.",
          },
        ],
      },
      {
        id: "grid-rendering",
        prompt: "How do the grids render?",
        options: [
          {
            id: "virtualised-grid-cell-subscriptions",
            label:
              "A virtualised grid where each price cell subscribes to its own instrument",
            score: 3,
            feedback:
              "TanStack Virtual or a commercial grid with a virtualised DOM renders only the visible rows, and each cell subscribes to its own instrument, so a burst touches a few dozen DOM nodes. That is what gets 500 rows to 60 fps.",
          },
          {
            id: "render-all-rows",
            label: "Render all 500 rows, let React diff",
            score: 0,
            feedback:
              "Mounting 500 rows with 20 columns each means 10,000 live cells and layout work on every scroll; at 400 updates per second the frame budget is gone.",
          },
          {
            id: "memo-everything",
            label: "React.memo on every row and cell",
            score: 1,
            feedback:
              "Memoisation reduces wasted renders but still diffs 500 rows per batch; without virtualisation and targeted subscriptions it is a partial fix.",
          },
          {
            id: "react-compiler-only",
            label: "Enable the React Compiler and rely on it",
            score: 1,
            feedback:
              "The React Compiler removes memoisation boilerplate; it does not change where updates subscribe or how many rows are mounted, so it does not solve a 400 Hz stream on its own.",
          },
        ],
      },
      {
        id: "scale-out",
        prompt: "How does SignalR work across the two API instances?",
        options: [
          {
            id: "azure-signalr-service",
            label: "Azure SignalR Service",
            score: 3,
            feedback:
              "The service holds the 60 connections and fans out hub messages to all clients regardless of which API instance produced them, with no backplane to run. Both instances can push, and a restart of one does not drop every trader.",
          },
          {
            id: "self-hosted-redis-backplane",
            label: "Self-hosted hubs with a Redis backplane",
            score: 2,
            feedback:
              "Two self-hosted hubs with Redis also work and keep everything on the corporate network, which some trading desks require. It is more to operate and the Redis hop adds a little latency to every batch.",
          },
          {
            id: "single-instance",
            label: "Run the hub on one instance only",
            score: 1,
            feedback:
              "One instance avoids the backplane but makes a deploy or crash a full disconnect for sixty traders mid-session.",
          },
          {
            id: "service-bus-to-browser",
            label: "A Service Bus topic subscription per browser",
            score: 0,
            feedback:
              "Browsers cannot subscribe to a Service Bus topic without exposing credentials, and the broker is built for durable messaging between services, not for a 50 ms push to a UI.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: SignalR over WebSockets with server-side conflation, an external store with per-instrument subscriptions, virtualised grids, Azure SignalR Service for the two instances.**\n\nThe facts are a 100 ms budget, 400 ticks per second, 500-row grids and a prototype that proved context-based state fails. The two levers that matter are reducing the message rate before it reaches the browser (conflate on the server to a fixed cadence) and making the update granularity a cell rather than a grid (external store, selective subscription, virtualisation). Order entry stays on normal HTTP calls so a price burst never blocks it. Everything else is detail.\n\nMeasure frame times with the Performance panel under a replayed burst before building features.\n\nThe first signal that would change the answer: if traders needed guaranteed delivery of every tick for audit rather than the latest price, a durable stream (Event Hubs) feeding a separate audit store would sit beside the live push.",
    relatedLessons: [
      "realtime-signalr",
      "react-state-management",
      "react-performance-architecture",
    ],
  },
  {
    id: "form-heavy-redux-proposal",
    title: "Redux for every field, says the senior dev",
    stacks: ["react", "dotnet"],
    level: 2,
    situation:
      "Aurora Underwriting is rebuilding its commercial insurance quoting application. There are 40 multi-step forms; a typical one has six steps and 30 to 80 fields with conditional sections (a fleet schedule appears only if vehicles exceed five), cross-field rules, lookups against rate tables, and auto-saved drafts so a broker can resume a quote days later. Validation rules live on the server in FluentValidation and must stay the source of truth for compliance reasons; the UI needs immediate feedback for the obvious cases.\n\nThe team is six React developers. A senior developer has proposed Redux Toolkit as the single store for everything: every field value, every validation message, every lookup result and the wizard position, arguing that one store makes debugging easier. A proof of concept shows a noticeable lag when typing in an 80-field form on a mid-range laptop.\n\nThe backend is ASP.NET Core with a draft endpoint that accepts partial quotes. Brokers work on laptops over variable connections. Delivery is in ten months and the application will outlive the current team.",
    constraints: [
      "Forms: 40 wizards, 6 steps, 30-80 fields each, conditional sections and cross-field rules",
      "Validation: server-side FluentValidation is the source of truth; UI needs immediate feedback",
      "Drafts: auto-save partial quotes, resume days later from any laptop",
      "Team: 6 React developers, 10 months",
      "Proposal: Redux Toolkit holding every field, message, lookup and wizard position",
      "Evidence: typing lag in an 80-field proof of concept",
    ],
    decisions: [
      {
        id: "field-state",
        prompt: "What holds the field values while a broker types?",
        options: [
          {
            id: "react-hook-form-zod",
            label: "React Hook Form with a Zod schema per step",
            score: 3,
            feedback:
              "React Hook Form keeps field values in uncontrolled inputs and refs, so typing in field 57 does not re-render the other 79, and a Zod schema per step gives immediate feedback for the obvious rules. This directly removes the lag the proof of concept showed.",
          },
          {
            id: "redux-every-field",
            label: "Redux Toolkit, every field in the store",
            score: 0,
            feedback:
              "Dispatching an action per keystroke, running reducers and notifying every connected component is the lag the proof of concept measured, and it gets worse at 80 fields with conditional sections. A global store is the wrong granularity for transient keystroke state.",
          },
          {
            id: "formik",
            label: "Formik",
            score: 1,
            feedback:
              "Formik solves the same problem but re-renders the whole form on each change unless every field is wrapped specially, and the library sees little development now; a ten-month project that will outlive the team should not start there.",
          },
          {
            id: "native-form-actions",
            label: "React 19 form actions with useActionState",
            score: 1,
            feedback:
              "Form actions are good for simple submit-and-validate forms. Six-step wizards with conditional sections, cross-field rules and drafts need field-level state and validation that this approach leaves you to build.",
          },
          {
            id: "tanstack-form",
            label: "TanStack Form",
            score: 2,
            feedback:
              "TanStack Form is a capable, type-safe alternative with fine-grained field subscriptions, and would avoid the lag as well. React Hook Form's larger ecosystem and the team's familiarity tip it here; either is sound.",
          },
        ],
      },
      {
        id: "wizard-and-drafts",
        prompt:
          "Where do the wizard position and cross-step data live, and how are drafts saved?",
        options: [
          {
            id: "form-provider-plus-small-store-and-mutation",
            label:
              "One form instance per quote in a FormProvider, a small Zustand store for the step, a debounced mutation to the draft endpoint",
            score: 3,
            feedback:
              "One React Hook Form instance spans the six steps, Zustand holds the current step and UI flags, and a debounced TanStack Query mutation posts the partial quote to the draft endpoint. Resume is a query for the draft that resets the form.",
          },
          {
            id: "redux-wizard-slice",
            label: "A Redux slice for the wizard position and completed steps",
            score: 2,
            feedback:
              "A slice for wizard orchestration is reasonable if the field values stay out of it. It is more machinery than a small store needs, but it is not the source of the lag.",
          },
          {
            id: "localstorage-only",
            label: "Drafts in localStorage only",
            score: 1,
            feedback:
              "Drafts only in `localStorage` are lost when a broker switches laptops and miss the requirement to resume days later from anywhere; the draft endpoint exists for this.",
          },
          {
            id: "url-state",
            label: "Encode the quote in the URL",
            score: 0,
            feedback:
              "Encoding 80 field values in the URL is impractical for the size and exposes quote data in browser history and logs.",
          },
        ],
      },
      {
        id: "validation",
        prompt: "How do client and server validation work together?",
        options: [
          {
            id: "zod-client-plus-server-truth-mapped",
            label:
              "Zod for immediate cases; server FluentValidation on submit, errors mapped back to fields",
            score: 3,
            feedback:
              "Zod handles required, format and simple ranges instantly; on step submit and on save the server runs FluentValidation and returns a `ValidationProblemDetails` whose per-field errors are mapped back with `setError`. The server stays the source of truth as compliance requires, and the broker still gets instant feedback.",
          },
          {
            id: "client-only",
            label: "Validate on the client only",
            score: 0,
            feedback:
              "Client-only validation cannot be the source of truth for an insurance quote; rules would be duplicated by hand and drift from the FluentValidation rules the compliance team signs off.",
          },
          {
            id: "server-only",
            label: "Validate on the server only",
            score: 1,
            feedback:
              "Server-only validation means a broker waits for a round trip over a variable connection to learn a field is required, which is the experience the team is trying to improve.",
          },
          {
            id: "duplicate-rules-in-redux-middleware",
            label: "Re-implement every rule as Redux middleware",
            score: 1,
            feedback:
              "A second rule set in middleware must be kept in sync by hand, with no path to share definitions with .NET.",
          },
        ],
      },
      {
        id: "lookups",
        prompt: "How are rate tables and lookups fetched?",
        options: [
          {
            id: "tanstack-query-lookups",
            label: "TanStack Query",
            score: 3,
            feedback:
              "Caching and deduplication mean forty forms share one cached copy of the vehicle categories and a stale rate table refreshes in the background. Lookups are server state and belong in a server-state cache.",
          },
          {
            id: "rtk-query",
            label: "RTK Query",
            score: 2,
            feedback:
              "RTK Query handles the same lookups well and would make sense if the Redux store stayed for the wizard; it is a sound choice.",
          },
          {
            id: "useeffect-fetch",
            label: "Fetch in useEffect inside each form",
            score: 0,
            feedback:
              "Fetching in `useEffect` per form means repeated requests, no caching and the usual race conditions when a broker changes a selection quickly.",
          },
          {
            id: "preload-all-into-redux",
            label: "Load every rate table into Redux at startup",
            score: 1,
            feedback:
              "Preloading makes the first paint wait on data most quotes never use, and the tables go stale for a session that lasts all day.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: React Hook Form with Zod per step, a tiny Zustand store for wizard state, TanStack Query for lookups and draft mutations, and server validation as the source of truth.**\n\nThe facts: 80-field forms with conditional sections, a measured typing lag, compliance that keeps rules in FluentValidation, and drafts that must survive a change of laptop. Field values are transient, high-frequency state and belong close to the input; the proof of concept showed what a global store does to them. The senior developer's goal, one place to debug, is better served by the React Hook Form and TanStack Query devtools than by a store holding every keystroke.\n\nThe first signal that would change the answer: if many screens needed to react to the same field values at once (a live premium panel across the whole quote), add `watch` with selectors or a store for the derived premium, still without moving field values into it.",
    relatedLessons: [
      "react-forms-and-validation",
      "react-state-management",
      "react-server-state",
    ],
  },
  {
    id: "healthcare-portal-spa-auth",
    title: "Patients, tokens and the browser",
    stacks: ["dotnet", "react", "azure"],
    level: 2,
    situation:
      "Meridian Health runs a patient portal for 150,000 patients across a US hospital group: appointments, test results, messaging with clinicians and bill payment. The portal is a React single-page application backed by an ASP.NET Core API on Azure. HIPAA applies; test results are protected health information and every access must be attributable and auditable.\n\nA penetration test found access and refresh tokens in `localStorage`, readable by any script on the page, and flagged a third-party analytics script as a path to token theft. The security officer wants the finding closed within 90 days. The team is four backend and three front-end developers. Patients sign in with e-mail and password plus SMS codes today; the group plans to add passkeys. Clinicians use a separate workforce Entra ID tenant and must not be mixed with patients.\n\nTraffic is 30 requests per second at peak; sessions are short, a few minutes to check a result. Patients are on phones with unreliable connections, and many use shared family devices, so a session must end reliably after inactivity.",
    constraints: [
      "Users: 150,000 patients, phones, shared family devices, short sessions",
      "Compliance: HIPAA; every PHI access attributable and auditable",
      "Finding: tokens in localStorage, third-party script on the page; close within 90 days",
      "Team: 4 backend, 3 front-end developers",
      "Existing: React SPA, ASP.NET Core API on Azure, separate workforce Entra ID tenant for clinicians",
      "Scale: 30 requests per second at peak",
    ],
    decisions: [
      {
        id: "token-handling",
        prompt: "Where do tokens live after the fix?",
        options: [
          {
            id: "bff-cookie-session",
            label:
              "A backend-for-frontend: tokens server side, the browser gets only a session cookie",
            score: 3,
            feedback:
              "An ASP.NET Core BFF does the OpenID Connect code flow, keeps access and refresh tokens server side, and gives the browser an `HttpOnly`, `Secure`, `SameSite` cookie; YARP forwards API calls and attaches the token. No token is reachable from any script on the page, which closes the finding completely rather than narrowing it.",
          },
          {
            id: "msal-browser-session-storage",
            label:
              "MSAL.js in the browser with PKCE, tokens in memory or sessionStorage",
            score: 2,
            feedback:
              "The authorization code flow with PKCE and tokens out of `localStorage` is the standard SPA pattern and a real improvement. It still leaves tokens in a JavaScript-reachable context on a page that loads third-party scripts, so for PHI and a pen-test clock the BFF is the stronger close.",
          },
          {
            id: "tokens-in-localstorage",
            label: "Keep tokens in localStorage, remove the analytics script",
            score: 0,
            feedback:
              "This is the finding. Any script that reaches the page, now or after the next marketing request, can read and exfiltrate the token.",
          },
          {
            id: "custom-jwt-from-own-api",
            label: "Issue your own JWTs from the API after a password check",
            score: 1,
            feedback:
              "Issuing your own tokens rebuilds an identity provider by hand, including MFA, lockout and passkeys, and still has to answer where the browser stores the token.",
          },
        ],
      },
      {
        id: "identity-provider",
        prompt: "Who is the identity provider for patients?",
        options: [
          {
            id: "entra-external-id",
            label: "Microsoft Entra External ID",
            score: 3,
            feedback:
              "External ID is the customer-identity service for this: e-mail and password with MFA, a path to passkeys, branded sign-in, and a tenant separate from the clinicians' workforce tenant. The BFF talks to it with the standard OpenID Connect handler.",
          },
          {
            id: "workforce-tenant-guests",
            label:
              "Invite patients as guests into the clinicians' Entra ID tenant",
            score: 0,
            feedback:
              "Inviting 150,000 patients as guests mixes populations the hospital said must stay apart, exposes the directory to patients, and uses licensing and policies meant for staff.",
          },
          {
            id: "aspnet-core-identity-self-hosted",
            label: "ASP.NET Core Identity with your own user table",
            score: 2,
            feedback:
              "Self-hosted Identity is workable and keeps everything in the codebase. The team then owns password policy, MFA, breach response and passkey support themselves, which seven developers should weigh against a managed service.",
          },
          {
            id: "social-login-only",
            label: "Social sign-in only (Google, Facebook)",
            score: 1,
            feedback:
              "Social-only sign-in for PHI puts identity assurance in another company's hands and leaves out patients without those accounts.",
          },
        ],
      },
      {
        id: "session-hardening",
        prompt: "How is the BFF session hardened?",
        options: [
          {
            id: "short-idle-timeout-hardened-cookie",
            label:
              "HttpOnly, Secure, SameSite cookie; 15-minute idle timeout; anti-forgery; server-side session store",
            score: 3,
            feedback:
              "A sliding session with a 15-minute idle timeout and an absolute limit, anti-forgery tokens on state-changing calls, and a server-side session store so logout revokes immediately. On a shared family phone the session ends when the patient stops.",
          },
          {
            id: "thirty-day-persistent-cookie",
            label: "A 30-day persistent cookie for convenience",
            score: 0,
            feedback:
              "A 30-day cookie on a shared family device means the next person to pick up the phone can read someone else's test results.",
          },
          {
            id: "twelve-hour-no-idle-timeout",
            label:
              "A hardened cookie with a 12-hour session and no idle timeout",
            score: 2,
            feedback:
              "Secure against script theft, but it ignores the shared-device fact; a long session without an idle timeout is the gap the security officer will raise next.",
          },
          {
            id: "jwt-cookie-no-server-session",
            label: "A self-contained JWT in the cookie, no server-side session",
            score: 1,
            feedback:
              "A self-contained JWT cannot be revoked server side before it expires, so logout and compromise response are weaker than a server-held session, which matters for PHI.",
          },
        ],
      },
      {
        id: "audit",
        prompt: "How do you meet the audit requirement for PHI access?",
        options: [
          {
            id: "api-level-append-only-audit",
            label:
              "Every PHI-returning API endpoint writes an append-only audit record",
            score: 3,
            feedback:
              "User, patient, resource, purpose, timestamp and request id, written in the same unit of work and stored where application code cannot update or delete it. That is attributable, complete and query-able for a HIPAA request, whichever client asked.",
          },
          {
            id: "front-end-analytics-events",
            label: "Client-side analytics events",
            score: 0,
            feedback:
              "Client-side events can be blocked, spoofed or missed, and the flagged analytics script is the vendor you were just told to distrust.",
          },
          {
            id: "app-service-http-logs",
            label: "App Service HTTP logs",
            score: 1,
            feedback:
              "HTTP logs capture URLs and status codes but not which patient's results a user viewed or why, and their retention and tamper resistance are not designed for audit.",
          },
          {
            id: "bff-only-logging",
            label: "Log at the BFF",
            score: 2,
            feedback:
              "The BFF captures every browser-originated call, but the API also serves clinicians and integrations through other paths; the audit must sit where PHI is read, which is the API.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: a BFF with a hardened server-side session, Entra External ID for patients, API-level append-only audit.**\n\nThe facts are a HIPAA workload, a pen-test finding with a 90-day clock, a third-party script on the page and shared family phones. Keeping tokens entirely out of the browser is the only answer that closes the finding rather than narrowing it, and a cookie session with a 15-minute idle timeout addresses the shared device. External ID keeps patients separate from clinicians and gives MFA and a path to passkeys without the team owning an identity system. The audit log belongs at the API where PHI is read, independent of which client asked.\n\nFirst test to write: a script tag injected in a test page cannot obtain any credential.\n\nThe first signal that would change the answer: a native mobile app, which cannot use the cookie BFF and would need the authorization code flow with PKCE and secure device storage instead.",
    relatedLessons: [
      "entra-id-auth",
      "api-gateway-bff",
      "security-architecture",
      "aspnet-react-hosting",
    ],
  },
  {
    id: "blazor-vs-react-customer-app",
    title: "Twelve C# developers, one customer portal",
    stacks: ["dotnet", "react", "azure"],
    level: 2,
    situation:
      "Westbrook Water, a regional utility, is replacing its customer self-service portal: 500,000 households view bills, submit meter readings, set up direct debits and report leaks. Peak traffic is the first week of each month, around 200 requests per second; the rest of the month is quiet. Six public pages (tariffs, outage map, contact) must be indexed by search engines and must be fast on low-end phones; everything else is behind a login.\n\nThe development team is twelve developers, all experienced in C# and ASP.NET Core, with two who have built small React apps. The company has no front-end specialists and hiring has been slow; a recruiter quoted four months to find one React developer locally. The regulator requires WCAG 2.2 AA accessibility and an annual audit.\n\nThe backend will be new ASP.NET Core APIs on Azure App Service; identity is Entra External ID. The deadline is nine months, driven by the current portal's vendor contract ending. The CTO wants a decision between Blazor and React that the team can defend to the board, and a plan that keeps the eventual mobile app in mind.",
    constraints: [
      "Team: 12 C# developers, 2 with small React experience, no front-end specialists, 4 months to hire one",
      "Users: 500,000 households, 200 requests per second in the first week of the month",
      "Public: 6 SEO-critical pages on low-end phones; everything else behind login",
      "Compliance: WCAG 2.2 AA with an annual audit",
      "Deadline: 9 months, vendor contract ends",
      "Existing: ASP.NET Core APIs on App Service, Entra External ID",
    ],
    decisions: [
      {
        id: "technology",
        prompt: "Which front-end technology do you build the portal in?",
        options: [
          {
            id: "blazor-web-app-auto",
            label:
              "A Blazor Web App: static SSR for public pages, Interactive Auto for the logged-in area",
            score: 3,
            feedback:
              "Twelve C# developers are productive from week one, the six public pages are plain HTML for crawlers and low-end phones, and the interactive part runs on the server first and switches to WebAssembly once the runtime is cached. It fits the team, the deadline and the page mix.",
          },
          {
            id: "react-nextjs-with-contractors",
            label: "React with Next.js, built with hired contractors",
            score: 2,
            feedback:
              "A larger talent pool and the best path to a shared component library with a future React Native app make this defensible. For this team it means a codebase only two people can maintain after the contractors leave, and a four-month hiring lag inside a nine-month deadline.",
          },
          {
            id: "blazor-server-everywhere",
            label: "Blazor Server for everything, public pages included",
            score: 0,
            feedback:
              "Every crawler hit and every low-end phone would open a SignalR circuit before the tariff page renders, and the first-week-of-month peak holds server state for every visitor. The public pages need static HTML.",
          },
          {
            id: "blazor-wasm-standalone",
            label: "A standalone Blazor WebAssembly app",
            score: 1,
            feedback:
              "A standalone WebAssembly app downloads the .NET runtime before anything renders, which is the wrong first impression on a low-end phone, and gives the six public pages no server-rendered HTML for search engines.",
          },
          {
            id: "razor-pages-minimal-js",
            label: "Razor Pages with small amounts of JavaScript",
            score: 2,
            feedback:
              "Razor Pages would also ship on time with this team and is strong on accessibility and SEO. It falls short on the interactive parts such as the meter-reading flow and the leak report with photos, which is where Blazor's component model earns its place.",
          },
        ],
      },
      {
        id: "components",
        prompt: "Where do the UI components come from?",
        options: [
          {
            id: "accessible-blazor-component-library",
            label:
              "An established Blazor component library with documented accessibility, such as Fluent UI Blazor or MudBlazor",
            score: 3,
            feedback:
              "Forms, dialogs and data tables with keyboard and screen-reader behaviour already handled is what twelve C# developers need for a WCAG 2.2 AA audit on a nine-month clock.",
          },
          {
            id: "hand-rolled-components",
            label: "Build every component by hand",
            score: 1,
            feedback:
              "Hand-rolling every input, dialog and table means twelve backend developers learning ARIA patterns under deadline; the accessibility audit is where this shows.",
          },
          {
            id: "commercial-suite",
            label: "A commercial suite such as Telerik UI for Blazor",
            score: 2,
            feedback:
              "A commercial suite is a sound option with support and accessibility documentation; the licence cost is the only reason it is not the default.",
          },
          {
            id: "react-library-via-web-components",
            label: "Wrap a React design system as web components",
            score: 0,
            feedback:
              "Wrapping React components for use from Blazor doubles the toolchains and puts a React dependency back into a team that chose Blazor to avoid one.",
          },
        ],
      },
      {
        id: "hosting",
        prompt: "How do you host it for the first-week-of-month peak?",
        options: [
          {
            id: "app-service-with-azure-signalr",
            label:
              "App Service scaled out, with Azure SignalR Service carrying the circuits",
            score: 3,
            feedback:
              "Azure SignalR Service lets any instance serve any client, so a scale-out does not break interactive-server sessions. Interactive Auto moves returning users to WebAssembly, which cuts server-held state during the peak.",
          },
          {
            id: "app-service-multi-instance-no-affinity",
            label:
              "Several App Service instances, no session affinity, no SignalR Service",
            score: 0,
            feedback:
              "Without affinity or Azure SignalR Service, Blazor Server circuits break as requests land on different instances, which shows up as frozen pages on the first of the month.",
          },
          {
            id: "single-large-instance",
            label: "One large instance",
            score: 1,
            feedback:
              "One instance avoids the affinity problem but makes a deployment or a fault a full outage during the busiest week.",
          },
          {
            id: "container-apps-session-affinity",
            label: "Container Apps with session affinity enabled",
            score: 2,
            feedback:
              "Session affinity keeps circuits on one replica and Container Apps scales well; it is a good choice if the team wants containers. The team's existing App Service estate makes it the second option here.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: a Blazor Web App with static SSR for public pages and Interactive Auto for the logged-in portal, an accessible component library, App Service with Azure SignalR Service.**\n\nThe facts decide it: twelve C# developers, no front-end specialists, a four-month hiring lag, nine months to deliver, and a mix of six SEO pages with a large logged-in area. Blazor lets the whole team build the product now; the render modes give the public pages plain HTML and the logged-in pages interactivity without a WebAssembly download on first visit. React remains the better answer for a team with React skills or a search-driven consumer product, which this is not.\n\nFor the future mobile app, keep the APIs client-neutral and plan on .NET MAUI with Blazor Hybrid to reuse components.\n\nThe first signal that would change the answer: two React hires landing before month three, or the product becoming a public, search-driven experience rather than a logged-in portal.",
    relatedLessons: [
      "blazor-vs-react",
      "aspnet-react-hosting",
      "realtime-signalr",
      "architecture-drivers",
    ],
  },
  {
    id: "api-contract-mobile-web-partner",
    title: "One backend, three kinds of client",
    stacks: ["dotnet", "react", "general"],
    level: 3,
    situation:
      "Orbit Rewards runs a loyalty platform: a React web app, native iOS and Android apps built by an in-house mobile team, and an API used by 40 external partners (retailers and airlines) who post transactions and query balances. Partners range from a large airline with a full integration team to small retailers whose developer integrates once and leaves. Partner integrations break about once a quarter when a field changes, and support spends two days each time.\n\nInternally, the platform is six ASP.NET Core services that call each other synchronously for balance checks and fraud scoring, around 3,000 calls per second between them at peak. The mobile team complains that the home screen needs five requests and over-fetches member data on a slow connection.\n\nA platform engineer proposes GraphQL for everything, including the partner API. The team is 25 engineers; the partner API is contractually versioned and must keep working for 12 months after a change is announced. OpenAPI documents already exist for the web API. Delivery expectations: a published partner developer portal within six months, and the mobile home-screen fix within three.",
    constraints: [
      "Clients: React web, native iOS and Android, 40 external partners of varying skill",
      "Contract: partner API changes must remain backward compatible for 12 months",
      "Scale: ~3,000 internal service-to-service calls per second at peak",
      "Pain: partner breakages once a quarter; mobile home screen needs 5 requests and over-fetches",
      "Team: 25 engineers; OpenAPI already exists for the web API",
      "Deadline: partner portal in 6 months, mobile fix in 3",
    ],
    decisions: [
      {
        id: "partner-api",
        prompt: "What do you offer the 40 partners?",
        options: [
          {
            id: "rest-openapi-versioned-sdks",
            label:
              "Versioned REST described by OpenAPI, with generated SDKs on a developer portal",
            score: 3,
            feedback:
              "Small retailers get a familiar HTTP surface and a Kiota-generated client library; the airline gets a precise spec. Backward compatibility is checked by diffing the OpenAPI document in CI, which ends the quarterly surprise.",
          },
          {
            id: "graphql-public-partner-api",
            label: "A public GraphQL API for partners",
            score: 1,
            feedback:
              "GraphQL for partners is the fashionable trap: a small retailer's one-time developer must learn a query language and tooling, and the platform must own query complexity limits, cost-based rate limiting and caching that REST gets for free. The 12-month compatibility rule also gets harder when every partner queries a different shape.",
          },
          {
            id: "grpc-public",
            label: "gRPC for partners",
            score: 0,
            feedback:
              "gRPC to external partners means HTTP/2 and protobuf tooling for forty organisations, some of which cannot run it behind their proxies, and no curl-friendly way to try the API.",
          },
          {
            id: "rest-no-spec",
            label: "REST as today, without a maintained specification",
            score: 1,
            feedback:
              "REST without a specification is the current state: changes are discovered by partners when something breaks, which is the quarterly incident.",
          },
        ],
      },
      {
        id: "mobile-fix",
        prompt: "How do you fix the mobile home screen?",
        options: [
          {
            id: "bff-per-client",
            label:
              "A mobile BFF owned by the mobile team, composing the calls into one response",
            score: 3,
            feedback:
              "The BFF composes the five calls into one home-screen response shaped for the app and trims the member payload; the web app gets its own BFF or keeps calling the APIs directly. Each client's needs are served without changing the partner contract.",
          },
          {
            id: "expose-partner-api-to-mobile",
            label: "Point the apps at the partner API",
            score: 2,
            feedback:
              "One surface for everyone keeps things simple, but it leaves the five-request, over-fetching home screen as it is and ties mobile releases to the partner compatibility rules.",
          },
          {
            id: "graphql-single-api-for-all",
            label: "One GraphQL endpoint for web, mobile and partners",
            score: 1,
            feedback:
              "A single GraphQL endpoint solves over-fetching for mobile and then drags the partner constraints and the complexity controls into the same schema. The mobile problem does not need the partner surface to change.",
          },
          {
            id: "grpc-web-for-browser",
            label: "gRPC-Web for the web app",
            score: 0,
            feedback:
              "gRPC-Web addresses neither the mobile home screen nor the partners, and adds a proxy layer for the web app.",
          },
        ],
      },
      {
        id: "internal-calls",
        prompt: "How do the six internal services talk to each other?",
        options: [
          {
            id: "grpc-internal",
            label: "gRPC with contract-first .proto files",
            score: 3,
            feedback:
              "Small binary payloads, HTTP/2 multiplexing, generated .NET clients and strict contracts between teams who deploy independently suit 3,000 calls per second of balance checks and fraud scoring. Partners and browsers never see it.",
          },
          {
            id: "rest-json-internal",
            label: "REST with JSON, as today",
            score: 2,
            feedback:
              "REST between the services works; at 3,000 synchronous calls per second the serialisation and connection overhead is measurable and not fatal. A fine choice if the team prefers one protocol everywhere.",
          },
          {
            id: "graphql-federation-internal",
            label: "GraphQL federation between the services",
            score: 0,
            feedback:
              "Federation adds a gateway and schema composition to synchronous internal calls that have fixed shapes; it solves a client problem the services do not have.",
          },
          {
            id: "service-bus-for-queries",
            label: "Request-reply over Service Bus",
            score: 1,
            feedback:
              "Routing balance checks through a broker turns a synchronous question into request-reply with added latency and complexity, for a call that needs an answer within the request.",
          },
        ],
      },
      {
        id: "versioning",
        prompt: "How do you keep the partner API compatible for 12 months?",
        options: [
          {
            id: "url-versioning-additive-policy",
            label:
              "URL versions with Asp.Versioning, additive-only changes within a version, a sunset calendar, an OpenAPI diff in CI",
            score: 3,
            feedback:
              "Explicit `/v1` and `/v2` routes, a written policy that only additive changes land within a version, a deprecation header and a 12-month sunset calendar on the portal, and a CI diff that fails the build on a breaking change within a version.",
          },
          {
            id: "no-versioning-just-careful",
            label: "No versioning; developers are told to be careful",
            score: 0,
            feedback:
              "Relying on care is how a field rename causes a two-day support incident every quarter.",
          },
          {
            id: "new-api-per-feature",
            label:
              "A new endpoint family for each feature, never change existing ones",
            score: 1,
            feedback:
              "Never changing anything avoids breaking changes and leaves partners with an API surface that grows without a map.",
          },
          {
            id: "media-type-versioning",
            label: "Versioning through the Accept media type",
            score: 2,
            feedback:
              "Media-type versioning is technically clean and `Asp.Versioning` supports it, but it is harder for a one-time retailer developer to discover than a `/v2` in the URL.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: versioned REST with OpenAPI and generated SDKs for partners, a BFF per client for mobile and web, gRPC between internal services.**\n\nThe three audiences have different needs, so one protocol for everything serves none of them well. Partners need a stable, discoverable contract with a 12-month compatibility guarantee; that is REST plus OpenAPI plus a CI diff. The mobile home screen needs composition and trimming, which is a BFF the mobile team owns. The internal 3,000 calls per second need efficiency and strict contracts, which is gRPC. GraphQL is a good tool for a client-driven, many-shapes problem, and the only place that problem exists here is inside the mobile BFF, where it could be used privately if the team wants.\n\nThe first signal that would change the answer: if the partner base shifted to a few large integrators building rich dashboards, a GraphQL partner API with a per-partner cost budget would become worth its operational cost.",
    relatedLessons: ["api-contracts-openapi", "api-gateway-bff", "c4-and-adrs"],
  },
  {
    id: "pick-the-broker",
    title: "Four messaging needs, one company",
    stacks: ["azure", "dotnet"],
    level: 2,
    situation:
      "Halcyon Energy is a utility with a platform team of eight .NET engineers standardising messaging across four workloads that currently use a mix of SQL polling tables, a self-hosted RabbitMQ pair nobody wants to patch, and HTTP calls with retries.\n\nFirst, order processing: a meter-installation order moves through booking, engineer dispatch and billing; steps must run in order per order, a failed step must be retried and eventually parked for a human, and about 20,000 orders flow per day. Second, meter telemetry: 300,000 smart meters each send a reading every 15 minutes, 20,000 events per second at the peak minute, consumed by an analytics pipeline and kept for replay for seven days. Third, file-triggered processing: when a supplier drops a CSV into Blob Storage, a Function must validate and import it within a minute. Fourth, partner notifications: 120 partner installers need an HTTPS webhook call when an order's status changes, with retries if their endpoint is down.\n\nThe team already runs Azure Functions and Container Apps. Cost matters: the RabbitMQ VM pair costs more than the equivalent managed services. There is no Kafka experience in the team.",
    constraints: [
      "Team: 8 .NET engineers, Functions and Container Apps in use, no Kafka experience",
      "Orders: 20,000 per day, strict order per order, retries then a human queue",
      "Telemetry: 300,000 meters, 20,000 events per second at peak, 7-day replay",
      "Files: a CSV dropped in Blob Storage must be processed within a minute",
      "Partners: 120 installer webhooks on status change, with retries",
      "Existing: SQL polling tables and an unpatched RabbitMQ pair to retire",
    ],
    decisions: [
      {
        id: "orders",
        prompt: "What carries the order-processing steps?",
        options: [
          {
            id: "service-bus-sessions",
            label: "Service Bus queues with sessions keyed on the order id",
            score: 3,
            feedback:
              "Sessions guarantee that each order's steps are processed in sequence, with retry counts, scheduled redelivery and a dead-letter queue for the human review step. 20,000 orders a day is a small load for it.",
          },
          {
            id: "event-hubs-for-orders",
            label: "Event Hubs with the order id as partition key",
            score: 1,
            feedback:
              "Event Hubs can order within a partition but has no per-message completion, dead-lettering or scheduled retry, so the 'park it for a human' requirement would be rebuilt by hand.",
          },
          {
            id: "storage-queues",
            label: "Azure Storage Queues",
            score: 2,
            feedback:
              "Storage Queues are cheap and handle retries with a poison-message pattern, but they have no sessions, so per-order ordering across competing consumers is not guaranteed. Workable with care; Service Bus is the cleaner fit.",
          },
          {
            id: "event-grid-for-orders",
            label: "Event Grid",
            score: 0,
            feedback:
              "Event Grid pushes events to subscribers and does not provide a work queue with ordering, locks and dead-lettering that a stepwise order process needs.",
          },
        ],
      },
      {
        id: "telemetry",
        prompt: "What ingests the meter telemetry?",
        options: [
          {
            id: "event-hubs",
            label: "Event Hubs",
            score: 3,
            feedback:
              "Partitioned ingestion for 20,000 events per second from 300,000 producers, consumer groups so analytics and a second consumer read independently, retention configured for the seven-day replay, and Capture to Blob Storage for the archive.",
          },
          {
            id: "service-bus-for-telemetry",
            label: "Service Bus Premium",
            score: 1,
            feedback:
              "Service Bus could take the throughput on Premium, at a higher price, but it is a work queue: messages are completed and gone, and seven-day replay for a second consumer is not what it offers.",
          },
          {
            id: "event-grid-for-telemetry",
            label: "Event Grid",
            score: 1,
            feedback:
              "Event Grid is for discrete notifications routed to handlers, not a retained stream of over a billion readings a day that a pipeline reads in order.",
          },
          {
            id: "sql-direct-insert",
            label: "Insert directly into Azure SQL from the ingestion endpoint",
            score: 0,
            feedback:
              "Inserting 20,000 rows per second straight from the endpoint turns the database into the thing that must absorb every peak, with no buffer and no replay.",
          },
        ],
      },
      {
        id: "files",
        prompt: "How does the CSV drop trigger processing?",
        options: [
          {
            id: "event-grid-blob-created",
            label:
              "An Event Grid subscription on the storage account's BlobCreated event",
            score: 3,
            feedback:
              "The Function is triggered within seconds of the upload, with retries and a dead-letter location if the Function is unavailable. It is push-based, cheap and the standard pattern for this.",
          },
          {
            id: "polling-timer-function",
            label: "A timer Function listing the container every minute",
            score: 0,
            feedback:
              "Polling scales badly as files accumulate, costs executions when nothing arrived, and still misses the one-minute target at the edges.",
          },
          {
            id: "service-bus-from-supplier",
            label:
              "Ask suppliers to post a Service Bus message after each upload",
            score: 1,
            feedback:
              "Moving the responsibility to external parties who will forget, when the storage event already exists.",
          },
          {
            id: "logic-app-schedule",
            label: "A scheduled Logic App polling the container",
            score: 1,
            feedback:
              "The same polling with a different bill and a designer to maintain.",
          },
        ],
      },
      {
        id: "partners",
        prompt: "How do partner webhooks get delivered?",
        options: [
          {
            id: "event-grid-webhook-subscriptions",
            label:
              "An Event Grid custom topic with a webhook subscription per partner",
            score: 3,
            feedback:
              "Event Grid retries with backoff for up to 24 hours and dead-letters undeliverable events to storage. Partners must complete the subscription validation handshake, which is a one-time step on their side.",
          },
          {
            id: "own-dispatcher-on-service-bus",
            label:
              "A Service Bus queue plus a Function that calls each partner and reschedules on failure",
            score: 2,
            feedback:
              "A home-built dispatcher is a solid design and gives full control over payload signing and per-partner policies. It is more code to own than Event Grid for 120 endpoints.",
          },
          {
            id: "event-hubs-partners",
            label: "Let partners read from Event Hubs",
            score: 0,
            feedback:
              "Partners cannot pull from Event Hubs without credentials and an SDK, and the requirement is a push to their HTTPS endpoint.",
          },
          {
            id: "inline-http-from-order-service",
            label: "Call the 120 partner URLs from inside the order service",
            score: 1,
            feedback:
              "Calling partners in the request path ties order processing to partner uptime, which is the HTTP-with-retries approach being replaced.",
          },
        ],
      },
    ],
    debrief:
      "**Shape: Service Bus for order workflows, Event Hubs for telemetry, Event Grid for both blob events and partner webhooks.**\n\nEach workload has a different shape and Azure has a service for each: a work queue with ordering and dead-lettering (Service Bus), a high-throughput retained stream (Event Hubs), and a push router for discrete events with retries (Event Grid). Using one service for all four would mean rebuilding the missing features by hand, which is what the RabbitMQ pair and the polling tables were. The eight engineers get managed services they already partially know, and the Functions and Container Apps estate consumes all three through standard triggers and SDKs.\n\nThe first signal that would change the answer: if the analytics team needed Kafka-compatible tooling, Event Hubs' Kafka endpoint keeps the ingestion choice; if order volume grew to millions a day with complex compensation, a saga orchestrator on Durable Functions would sit on top of Service Bus.",
    relatedLessons: [
      "azure-messaging-choices",
      "messaging-outbox-saga",
      "serverless-durable-functions",
      "resilience",
    ],
  },
];
