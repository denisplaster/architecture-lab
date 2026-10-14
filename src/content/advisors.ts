import type { Advisor } from "./types";

/**
 * Advisors ask single-choice questions about the learner's own situation and
 * rank options by summing answer weights on top of each option's baseline.
 * Weights are -3..3. A positive baseline marks the sensible default.
 */
export const ADVISORS: Advisor[] = [
  /* ---------------------------------------------------------------- */
  /* Backend shape                                                      */
  {
    id: "backend-style",
    title: "Backend shape for a .NET system",
    intro:
      "Picks the overall shape of a .NET backend from your team, traffic, consistency needs and constraints. The default is a modular monolith; the other shapes have to earn their place.",
    options: [
      {
        id: "layered-monolith",
        label: "Layered monolith",
        summary:
          "One ASP.NET Core project organised by technical layer: fastest to start, fine while the domain and team stay small.",
        lessonId: "layered-monolith",
        baseline: 0,
      },
      {
        id: "modular-monolith",
        label: "Modular monolith",
        summary:
          "One deployable split into modules with contracts projects and a schema per module; the default for most teams.",
        lessonId: "modular-monolith",
        baseline: 1,
      },
      {
        id: "microservices",
        label: "Microservices",
        summary:
          "Independently deployed services with their own data, justified only by separate teams or separate scaling needs.",
        lessonId: "microservices",
        baseline: -1,
      },
      {
        id: "serverless-functions",
        label: "Serverless with Azure Functions",
        summary:
          "Event-driven functions and Durable orchestrations for bursty, integration-heavy work that scales to zero.",
        lessonId: "serverless-durable-functions",
        baseline: 0,
      },
      {
        id: "event-driven-cqrs",
        label: "Event-driven with CQRS",
        summary:
          "Separate write and read models connected by events, for domains with heavy write rules and very different read shapes.",
        lessonId: "cqrs",
        baseline: 0,
      },
    ],
    questions: [
      {
        id: "team",
        prompt:
          "How many developers will work on the backend, and how are they organised?",
        help: "Count the people who will commit to it in the first year.",
        answers: [
          {
            id: "small",
            label: "1 to 4 developers",
            weights: {
              "layered-monolith": 2,
              "modular-monolith": 1,
              microservices: -3,
              "serverless-functions": 1,
              "event-driven-cqrs": -1,
            },
          },
          {
            id: "one-team",
            label: "5 to 15 developers in one or two teams",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 2,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "several-teams",
            label: "Three or more teams, each owning part of the system",
            weights: {
              "layered-monolith": -2,
              "modular-monolith": 1,
              microservices: 3,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
          {
            id: "many-teams",
            label: "Many teams across departments",
            weights: {
              "layered-monolith": -3,
              "modular-monolith": -1,
              microservices: 3,
              "serverless-functions": -1,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
      {
        id: "release-cadence",
        prompt: "Do parts of the system need to ship on their own schedule?",
        help: "Independent release cadence is one of the two drivers that pay for distribution.",
        answers: [
          {
            id: "one-train",
            label: "No, one release train for everything is fine",
            weights: {
              "layered-monolith": 1,
              "modular-monolith": 1,
              microservices: -2,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "sometimes",
            label: "Occasionally it would help, but nobody is blocked today",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 1,
              microservices: 0,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "blocked",
            label: "Yes, teams are blocked waiting for each other's releases",
            weights: {
              "layered-monolith": -2,
              "modular-monolith": -1,
              microservices: 3,
              "serverless-functions": 1,
              "event-driven-cqrs": 0,
            },
          },
        ],
      },
      {
        id: "traffic",
        prompt: "What does the load look like?",
        answers: [
          {
            id: "steady-low",
            label: "Low or steady and predictable",
            weights: {
              "layered-monolith": 1,
              "modular-monolith": 1,
              microservices: -1,
              "serverless-functions": -1,
              "event-driven-cqrs": -1,
            },
          },
          {
            id: "bursty",
            label: "Bursty, with long idle periods",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 0,
              "serverless-functions": 3,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "read-heavy",
            label: "High and steady, dominated by reads over complex data",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 1,
              "serverless-functions": -1,
              "event-driven-cqrs": 3,
            },
          },
          {
            id: "hot-parts",
            label: "One or two parts are far hotter than the rest",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 2,
              "serverless-functions": 1,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
      {
        id: "consistency",
        prompt:
          "How often must one operation update several business areas atomically?",
        help: "Think of placing an order that also reserves stock and creates an invoice in one go.",
        answers: [
          {
            id: "constantly",
            label:
              "Constantly; cross-area transactions are the core of the domain",
            weights: {
              "layered-monolith": 1,
              "modular-monolith": 2,
              microservices: -3,
              "serverless-functions": -1,
              "event-driven-cqrs": -2,
            },
          },
          {
            id: "sometimes",
            label: "Sometimes, in a few important flows",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 1,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "rarely",
            label:
              "Rarely; areas are independent and eventual consistency is acceptable",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": -1,
              microservices: 2,
              "serverless-functions": 1,
              "event-driven-cqrs": 2,
            },
          },
        ],
      },
      {
        id: "read-write-shape",
        prompt: "How different are the reads from the writes?",
        answers: [
          {
            id: "crud",
            label: "Mostly CRUD; screens mirror the tables",
            weights: {
              "layered-monolith": 2,
              "modular-monolith": 1,
              microservices: 0,
              "serverless-functions": -1,
              "event-driven-cqrs": -3,
            },
          },
          {
            id: "some-views",
            label: "A few complex screens need denormalised views",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 1,
              microservices: 0,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
          {
            id: "complex",
            label:
              "Heavy write rules, a required audit trail and dashboards over many sources",
            weights: {
              "layered-monolith": -3,
              "modular-monolith": -1,
              microservices: 0,
              "serverless-functions": -1,
              "event-driven-cqrs": 3,
            },
          },
        ],
      },
      {
        id: "ops-maturity",
        prompt:
          "How experienced is the team at running distributed systems (brokers, tracing, Kubernetes)?",
        answers: [
          {
            id: "none",
            label: "Not at all; there are no operations specialists",
            weights: {
              "layered-monolith": 2,
              "modular-monolith": 1,
              microservices: -3,
              "serverless-functions": 2,
              "event-driven-cqrs": -1,
            },
          },
          {
            id: "some",
            label: "Some; we have run a queue and a couple of services",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 1,
              microservices: 0,
              "serverless-functions": 1,
              "event-driven-cqrs": 1,
            },
          },
          {
            id: "strong",
            label: "Strong; a platform team and an on-call rotation exist",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 2,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
      {
        id: "time-and-budget",
        prompt: "How much time and money is there before the first release?",
        answers: [
          {
            id: "tight",
            label: "Tight: weeks, and a small budget",
            weights: {
              "layered-monolith": 2,
              "modular-monolith": 1,
              microservices: -3,
              "serverless-functions": 1,
              "event-driven-cqrs": -2,
            },
          },
          {
            id: "moderate",
            label: "Moderate: a few months with a normal budget",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 1,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "generous",
            label:
              "Generous: a funded multi-month build with room to invest up front",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 1,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
      {
        id: "isolation",
        prompt:
          "Does regulation or a customer demand a hard process or data boundary between parts of the system?",
        help: "For example payments, health records or a customer who requires a separate deployment.",
        answers: [
          {
            id: "no",
            label: "No",
            weights: {
              "layered-monolith": 1,
              "modular-monolith": 1,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "some-parts",
            label: "Yes, for one or two parts",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 2,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
          {
            id: "most-parts",
            label: "Yes, across most of the system",
            weights: {
              "layered-monolith": -2,
              "modular-monolith": -1,
              microservices: 3,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
        ],
      },
      {
        id: "existing",
        prompt: "What already exists?",
        answers: [
          {
            id: "greenfield",
            label: "Nothing; this is greenfield",
            weights: {
              "layered-monolith": 1,
              "modular-monolith": 1,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "monolith",
            label: "An existing monolith we will extend",
            weights: {
              "layered-monolith": 0,
              "modular-monolith": 2,
              microservices: -1,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "integration",
            label:
              "Mostly other systems whose events and webhooks we must react to",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 0,
              microservices: 1,
              "serverless-functions": 3,
              "event-driven-cqrs": 2,
            },
          },
          {
            id: "services",
            label: "A set of services that already run separately",
            weights: {
              "layered-monolith": -2,
              "modular-monolith": -1,
              microservices: 2,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
      {
        id: "growth",
        prompt: "What do you expect in the next two years?",
        answers: [
          {
            id: "stable",
            label: "Stable: few new features, similar usage",
            weights: {
              "layered-monolith": 2,
              "modular-monolith": 0,
              microservices: -2,
              "serverless-functions": 0,
              "event-driven-cqrs": -1,
            },
          },
          {
            id: "steady",
            label: "Steady growth in features and users",
            weights: {
              "layered-monolith": -1,
              "modular-monolith": 2,
              microservices: 0,
              "serverless-functions": 0,
              "event-driven-cqrs": 0,
            },
          },
          {
            id: "fast",
            label: "Fast growth, with several new teams within a year",
            weights: {
              "layered-monolith": -2,
              "modular-monolith": 1,
              microservices: 2,
              "serverless-functions": 0,
              "event-driven-cqrs": 1,
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Azure compute                                                      */
  {
    id: "azure-compute",
    title: "Where to run it on Azure",
    intro:
      "Chooses the Azure compute service for a .NET backend and its React front end. App Service is the default; containers, Kubernetes, Functions and Static Web Apps win when the workload or the team asks for them.",
    options: [
      {
        id: "app-service",
        label: "Azure App Service",
        summary:
          "Managed web hosting with slots and autoscale; the default for a plain ASP.NET Core deployable.",
        lessonId: "azure-compute-choices",
        baseline: 1,
      },
      {
        id: "container-apps",
        label: "Azure Container Apps",
        summary:
          "Serverless containers with revisions, KEDA scaling to zero and optional Dapr, without running a cluster.",
        lessonId: "azure-compute-choices",
        baseline: 0,
      },
      {
        id: "aks",
        label: "Azure Kubernetes Service",
        summary:
          "Full Kubernetes for teams that need its API, custom networking or a platform of their own.",
        lessonId: "azure-compute-choices",
        baseline: -1,
      },
      {
        id: "functions",
        label: "Azure Functions",
        summary:
          "Event-driven compute billed by execution, for triggers, timers, webhooks and bursty background work.",
        lessonId: "serverless-durable-functions",
        baseline: 0,
      },
      {
        id: "static-web-apps",
        label: "Azure Static Web Apps",
        summary:
          "Global static hosting for the React build with a small managed API alongside it.",
        lessonId: "azure-compute-choices",
        baseline: 0,
      },
    ],
    questions: [
      {
        id: "containers",
        prompt:
          "Is the workload packaged as containers, or does it need to be?",
        answers: [
          {
            id: "no",
            label: "No; it is a published .NET app and a React build",
            weights: {
              "app-service": 2,
              "container-apps": -1,
              aks: -2,
              functions: 1,
              "static-web-apps": 1,
            },
          },
          {
            id: "yes",
            label: "Yes, one container image per service",
            weights: {
              "app-service": 0,
              "container-apps": 2,
              aks: 1,
              functions: 0,
              "static-web-apps": -1,
            },
          },
          {
            id: "want",
            label: "Not yet, but we want the same image in every environment",
            weights: {
              "app-service": 1,
              "container-apps": 2,
              aks: 0,
              functions: 0,
              "static-web-apps": 0,
            },
          },
        ],
      },
      {
        id: "kubernetes-skills",
        prompt: "How much Kubernetes experience does the team have?",
        answers: [
          {
            id: "none",
            label: "None",
            weights: {
              "app-service": 1,
              "container-apps": 1,
              aks: -3,
              functions: 0,
              "static-web-apps": 1,
            },
          },
          {
            id: "some",
            label: "A few people have used it",
            weights: {
              "app-service": 0,
              "container-apps": 1,
              aks: 0,
              functions: 0,
            },
          },
          {
            id: "strong",
            label: "We run clusters today and have a platform team",
            weights: {
              "app-service": -1,
              "container-apps": 0,
              aks: 3,
              functions: -1,
            },
          },
        ],
      },
      {
        id: "scale-to-zero",
        prompt: "Does the workload need to scale to zero when idle?",
        answers: [
          {
            id: "no",
            label: "No; traffic is steady and always on",
            weights: {
              "app-service": 2,
              "container-apps": 0,
              aks: 1,
              functions: -1,
              "static-web-apps": 0,
            },
          },
          {
            id: "nice",
            label: "Nice to have, mainly for dev and test environments",
            weights: {
              "app-service": 0,
              "container-apps": 1,
              aks: -1,
              functions: 1,
              "static-web-apps": 1,
            },
          },
          {
            id: "yes",
            label: "Yes; long idle periods and the idle cost matters",
            weights: {
              "app-service": -2,
              "container-apps": 2,
              aks: -2,
              functions: 3,
              "static-web-apps": 1,
            },
          },
        ],
      },
      {
        id: "traffic-shape",
        prompt: "What is the traffic shape?",
        answers: [
          {
            id: "steady",
            label: "Steady and predictable",
            weights: {
              "app-service": 2,
              "container-apps": 0,
              aks: 1,
              functions: -1,
              "static-web-apps": 0,
            },
          },
          {
            id: "daily-peaks",
            label: "Daily peaks that autoscale can follow",
            weights: {
              "app-service": 1,
              "container-apps": 1,
              aks: 0,
              functions: 0,
              "static-web-apps": 0,
            },
          },
          {
            id: "spiky",
            label: "Spiky, with sudden bursts many times the baseline",
            weights: {
              "app-service": -1,
              "container-apps": 2,
              aks: 0,
              functions: 3,
              "static-web-apps": 1,
            },
          },
        ],
      },
      {
        id: "workload-type",
        prompt: "What is the workload mostly?",
        answers: [
          {
            id: "api-and-ui",
            label: "A web API and a React front end",
            weights: {
              "app-service": 2,
              "container-apps": 1,
              aks: 0,
              functions: -1,
              "static-web-apps": 1,
            },
          },
          {
            id: "static-plus-small-api",
            label: "A static React front end with a small API behind it",
            weights: {
              "app-service": 0,
              "container-apps": -1,
              aks: -2,
              functions: 1,
              "static-web-apps": 3,
            },
          },
          {
            id: "events",
            label: "Queue and event processing, timers and webhooks",
            weights: {
              "app-service": -1,
              "container-apps": 1,
              aks: 0,
              functions: 3,
              "static-web-apps": -3,
            },
          },
          {
            id: "mixed",
            label: "An API plus workers that process messages",
            weights: {
              "app-service": 1,
              "container-apps": 2,
              aks: 1,
              functions: 1,
              "static-web-apps": -2,
            },
          },
          {
            id: "long-running",
            label:
              "Long-running or stateful processes (hours-long jobs, gRPC streams, actors)",
            weights: {
              "app-service": -1,
              "container-apps": 2,
              aks: 2,
              functions: -3,
              "static-web-apps": -3,
            },
          },
        ],
      },
      {
        id: "networking",
        prompt: "What are the networking and compliance requirements?",
        answers: [
          {
            id: "public",
            label: "A public endpoint with standard TLS is enough",
            weights: {
              "app-service": 1,
              "container-apps": 0,
              aks: -1,
              functions: 1,
              "static-web-apps": 2,
            },
          },
          {
            id: "vnet",
            label: "VNet integration and private endpoints are required",
            weights: {
              "app-service": 1,
              "container-apps": 1,
              aks: 1,
              functions: 0,
              "static-web-apps": -2,
            },
          },
          {
            id: "strict",
            label:
              "Strict: internal-only, custom network policies and our own ingress rules",
            weights: {
              "app-service": -1,
              "container-apps": 0,
              aks: 3,
              functions: -1,
              "static-web-apps": -3,
            },
          },
        ],
      },
      {
        id: "team-size",
        prompt: "How big is the team that will run this?",
        answers: [
          {
            id: "small",
            label: "1 to 5 developers, no dedicated operations",
            weights: {
              "app-service": 2,
              "container-apps": 0,
              aks: -3,
              functions: 1,
              "static-web-apps": 1,
            },
          },
          {
            id: "one-team",
            label: "One team of 6 to 15 with someone who does operations",
            weights: {
              "app-service": 1,
              "container-apps": 1,
              aks: -1,
              functions: 0,
              "static-web-apps": 0,
            },
          },
          {
            id: "platform",
            label: "Several teams with a platform group",
            weights: {
              "app-service": -1,
              "container-apps": 1,
              aks: 2,
              functions: 0,
              "static-web-apps": 0,
            },
          },
        ],
      },
      {
        id: "cost",
        prompt: "How sensitive is the project to hosting cost?",
        answers: [
          {
            id: "minimise",
            label: "Minimise fixed monthly cost above all",
            weights: {
              "app-service": -1,
              "container-apps": 1,
              aks: -3,
              functions: 2,
              "static-web-apps": 2,
            },
          },
          {
            id: "predictable",
            label: "Predictable cost matters more than the lowest cost",
            weights: {
              "app-service": 2,
              "container-apps": 0,
              aks: 0,
              functions: -1,
              "static-web-apps": 0,
            },
          },
          {
            id: "secondary",
            label: "Cost is secondary to control and capability",
            weights: {
              "app-service": 0,
              "container-apps": 0,
              aks: 2,
              functions: -1,
            },
          },
        ],
      },
      {
        id: "runtime-needs",
        prompt: "Do you need sidecars, Dapr, KEDA scalers or a custom runtime?",
        answers: [
          {
            id: "standard",
            label: "No; the standard .NET runtime is enough",
            weights: {
              "app-service": 2,
              "container-apps": 0,
              aks: -1,
              functions: 1,
              "static-web-apps": 1,
            },
          },
          {
            id: "dapr-keda",
            label:
              "Dapr or KEDA-style event scaling, without running Kubernetes ourselves",
            weights: {
              "app-service": -2,
              "container-apps": 3,
              aks: 0,
              functions: 0,
              "static-web-apps": -2,
            },
          },
          {
            id: "custom",
            label: "Custom sidecars, a service mesh, GPUs or operators",
            weights: {
              "app-service": -3,
              "container-apps": -1,
              aks: 3,
              functions: -2,
              "static-web-apps": -3,
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* React application shape                                            */
  {
    id: "react-app-shape",
    title: "Shape of the React application",
    intro:
      "Decides how the front end is built and rendered: a client-rendered SPA, a server-rendered Next.js app, a static site, micro-frontends, or Blazor instead of React.",
    options: [
      {
        id: "vite-spa",
        label: "Vite single-page app",
        summary:
          "A client-rendered React bundle served as static files behind an ASP.NET Core API; the default for signed-in applications.",
        lessonId: "react-rendering-strategies",
        baseline: 1,
      },
      {
        id: "nextjs-ssr",
        label: "Next.js with server rendering",
        summary:
          "Server-side rendering and React Server Components for public, personalised pages that need SEO and fast first paint.",
        lessonId: "react-rendering-strategies",
        baseline: 0,
      },
      {
        id: "static-site",
        label: "Static site generation",
        summary:
          "Pages pre-rendered at build time and served from a CDN, for content that is the same for everyone.",
        lessonId: "react-rendering-strategies",
        baseline: 0,
      },
      {
        id: "micro-frontends",
        label: "Micro-frontends",
        summary:
          "Independently deployed front-end slices composed at run time, for many teams on one product.",
        lessonId: "react-micro-frontends",
        baseline: -1,
      },
      {
        id: "blazor-instead",
        label: "Blazor instead of React",
        summary:
          "C# components rendered on the server or in WebAssembly, for .NET teams building internal applications.",
        lessonId: "blazor-vs-react",
        baseline: 0,
      },
    ],
    questions: [
      {
        id: "seo",
        prompt: "Do search engines need to index the pages?",
        answers: [
          {
            id: "no",
            label: "No; users sign in before they see anything",
            weights: {
              "vite-spa": 2,
              "nextjs-ssr": -1,
              "static-site": -1,
              "micro-frontends": 1,
              "blazor-instead": 1,
            },
          },
          {
            id: "some",
            label: "A few public pages; the application itself is private",
            weights: {
              "vite-spa": 0,
              "nextjs-ssr": 1,
              "static-site": 1,
              "micro-frontends": 0,
              "blazor-instead": 0,
            },
          },
          {
            id: "yes",
            label: "Yes; most pages must be discoverable",
            weights: {
              "vite-spa": -3,
              "nextjs-ssr": 3,
              "static-site": 2,
              "micro-frontends": -1,
              "blazor-instead": -2,
            },
          },
        ],
      },
      {
        id: "audience",
        prompt: "Who uses it?",
        answers: [
          {
            id: "internal",
            label: "Internal staff",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": -1,
              "static-site": -1,
              "micro-frontends": 0,
              "blazor-instead": 2,
            },
          },
          {
            id: "b2b",
            label: "Business customers behind a login",
            weights: {
              "vite-spa": 2,
              "nextjs-ssr": 0,
              "static-site": -1,
              "micro-frontends": 1,
              "blazor-instead": 0,
            },
          },
          {
            id: "public",
            label: "The general public",
            weights: {
              "vite-spa": -1,
              "nextjs-ssr": 2,
              "static-site": 2,
              "micro-frontends": 0,
              "blazor-instead": -2,
            },
          },
        ],
      },
      {
        id: "skills",
        prompt: "What are the team's skills?",
        answers: [
          {
            id: "csharp",
            label: "Mostly C# developers with little JavaScript experience",
            weights: {
              "vite-spa": -1,
              "nextjs-ssr": -2,
              "static-site": -1,
              "micro-frontends": -2,
              "blazor-instead": 3,
            },
          },
          {
            id: "mixed",
            label: "Mixed; comfortable in both C# and TypeScript",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 1,
              "static-site": 0,
              "micro-frontends": 0,
              "blazor-instead": 0,
            },
          },
          {
            id: "frontend",
            label: "Front-end specialists in TypeScript and React",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 2,
              "static-site": 1,
              "micro-frontends": 1,
              "blazor-instead": -3,
            },
          },
        ],
      },
      {
        id: "teams",
        prompt: "How many teams will work on the front end?",
        answers: [
          {
            id: "one",
            label: "One team",
            weights: {
              "vite-spa": 2,
              "nextjs-ssr": 1,
              "static-site": 1,
              "micro-frontends": -3,
              "blazor-instead": 1,
            },
          },
          {
            id: "few",
            label: "Two or three teams sharing one codebase",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 1,
              "static-site": 0,
              "micro-frontends": -1,
              "blazor-instead": 0,
            },
          },
          {
            id: "many",
            label:
              "Many teams that must deploy their parts of the UI independently",
            weights: {
              "vite-spa": -3,
              "nextjs-ssr": -3,
              "static-site": -3,
              "micro-frontends": 3,
              "blazor-instead": -3,
            },
          },
        ],
      },
      {
        id: "personalisation",
        prompt: "How much of each page is personal to the signed-in user?",
        answers: [
          {
            id: "everything",
            label: "Almost everything: dashboards, data grids, workflows",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 0,
              "static-site": -3,
              "micro-frontends": 1,
              "blazor-instead": 1,
            },
          },
          {
            id: "mixed",
            label: "A mix: shared content with personal sections",
            weights: {
              "vite-spa": 0,
              "nextjs-ssr": 2,
              "static-site": -1,
              "micro-frontends": 0,
              "blazor-instead": 0,
            },
          },
          {
            id: "none",
            label: "Very little: the same content for everyone",
            weights: {
              "vite-spa": -1,
              "nextjs-ssr": 1,
              "static-site": 3,
              "micro-frontends": -1,
              "blazor-instead": -1,
            },
          },
        ],
      },
      {
        id: "offline",
        prompt: "Does it need to work offline or on unreliable networks?",
        answers: [
          {
            id: "no",
            label: "No",
            weights: {
              "vite-spa": 0,
              "nextjs-ssr": 1,
              "static-site": 1,
              "blazor-instead": 0,
            },
          },
          {
            id: "flaky",
            label: "It should tolerate flaky connections",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 0,
              "static-site": 1,
              "micro-frontends": 0,
              "blazor-instead": -2,
            },
          },
          {
            id: "offline-first",
            label: "Yes; offline-first with local data",
            weights: {
              "vite-spa": 2,
              "nextjs-ssr": -1,
              "static-site": 0,
              "micro-frontends": -1,
              "blazor-instead": -2,
            },
          },
        ],
      },
      {
        id: "hosting",
        prompt: "What can you host?",
        answers: [
          {
            id: "static-only",
            label: "Static files only (Static Web Apps, a CDN, blob storage)",
            weights: {
              "vite-spa": 2,
              "nextjs-ssr": -2,
              "static-site": 3,
              "micro-frontends": 1,
              "blazor-instead": -1,
            },
          },
          {
            id: "aspnet",
            label: "An ASP.NET Core host that can also serve the front end",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": -1,
              "static-site": 0,
              "micro-frontends": 0,
              "blazor-instead": 2,
            },
          },
          {
            id: "node",
            label: "A Node server too (Container Apps or App Service on Linux)",
            weights: {
              "vite-spa": 0,
              "nextjs-ssr": 3,
              "static-site": 0,
              "micro-frontends": 0,
              "blazor-instead": -1,
            },
          },
        ],
      },
      {
        id: "first-load",
        prompt: "How much does first-load time matter?",
        answers: [
          {
            id: "little",
            label: "Little; users open it once and stay for hours",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": -1,
              "static-site": 0,
              "micro-frontends": 1,
              "blazor-instead": 1,
            },
          },
          {
            id: "matters",
            label: "It matters; users visit briefly, often on mobile",
            weights: {
              "vite-spa": -2,
              "nextjs-ssr": 2,
              "static-site": 2,
              "micro-frontends": -1,
              "blazor-instead": -2,
            },
          },
          {
            id: "critical",
            label: "Critical; conversion depends on it",
            weights: {
              "vite-spa": -3,
              "nextjs-ssr": 2,
              "static-site": 3,
              "micro-frontends": -1,
              "blazor-instead": -3,
            },
          },
        ],
      },
      {
        id: "content-vs-app",
        prompt: "Is it content-heavy or application-heavy?",
        answers: [
          {
            id: "content",
            label: "Content: articles, documentation, marketing pages",
            weights: {
              "vite-spa": -2,
              "nextjs-ssr": 2,
              "static-site": 3,
              "micro-frontends": -1,
              "blazor-instead": -2,
            },
          },
          {
            id: "app",
            label: "Application: forms, tables, workflows",
            weights: {
              "vite-spa": 1,
              "nextjs-ssr": 0,
              "static-site": -3,
              "micro-frontends": 1,
              "blazor-instead": 2,
            },
          },
          {
            id: "both",
            label: "Both in one product",
            weights: {
              "vite-spa": 0,
              "nextjs-ssr": 2,
              "static-site": -1,
              "micro-frontends": 1,
              "blazor-instead": -1,
            },
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* React client state                                                 */
  {
    id: "react-state",
    title: "Client state strategy in React",
    intro:
      "Picks where client state should live: local state and the URL, Context, a Zustand store, Redux Toolkit, or a server-state cache such as TanStack Query with very little client state at all.",
    options: [
      {
        id: "local-and-url",
        label: "Local state and the URL",
        summary:
          "`useState` lifted as far as needed, with view state in the URL; the default until something forces more.",
        lessonId: "react-state-management",
        baseline: 0,
      },
      {
        id: "context",
        label: "React Context",
        summary:
          "Ambient values such as theme, locale and session that change rarely and are read everywhere.",
        lessonId: "react-state-management",
        baseline: 0,
      },
      {
        id: "zustand",
        label: "Zustand store",
        summary:
          "Small stores with selectors for shared client state that changes often, without boilerplate.",
        lessonId: "react-state-management",
        baseline: 0,
      },
      {
        id: "redux-toolkit",
        label: "Redux Toolkit",
        summary:
          "Strict conventions, devtools and middleware for large teams or codebases that already run on Redux.",
        lessonId: "react-state-management",
        baseline: -1,
      },
      {
        id: "server-state-first",
        label: "Server state first",
        summary:
          "Keep server data in TanStack Query and leave only genuine UI state on the client.",
        lessonId: "react-server-state",
        baseline: 0,
      },
    ],
    questions: [
      {
        id: "server-share",
        prompt: "How much of the application's state is really server data?",
        help: "Lists, records and details fetched from an API count as server data; a half-edited form does not.",
        answers: [
          {
            id: "most",
            label: "Most of it: lists, details and records from an API",
            weights: {
              "local-and-url": -1,
              context: -1,
              zustand: -1,
              "redux-toolkit": -2,
              "server-state-first": 3,
            },
          },
          {
            id: "half",
            label: "About half",
            weights: {
              "local-and-url": 1,
              context: 0,
              zustand: 1,
              "redux-toolkit": 0,
              "server-state-first": 1,
            },
          },
          {
            id: "little",
            label:
              "Little: mostly client-side editing, drawing or a multi-step flow",
            weights: {
              "local-and-url": 1,
              context: 0,
              zustand: 2,
              "redux-toolkit": 1,
              "server-state-first": -3,
            },
          },
        ],
      },
      {
        id: "update-frequency",
        prompt: "How often does the shared client state change?",
        answers: [
          {
            id: "rare",
            label: "Rarely: theme, auth session, locale",
            weights: {
              "local-and-url": 1,
              context: 3,
              zustand: -1,
              "redux-toolkit": -1,
              "server-state-first": 2,
            },
          },
          {
            id: "moderate",
            label: "Moderately: filters, selections, open panels",
            weights: {
              "local-and-url": 2,
              context: -1,
              zustand: 1,
              "redux-toolkit": 0,
              "server-state-first": 0,
            },
          },
          {
            id: "hot",
            label: "Many times per second: canvas, live data, drag and drop",
            weights: {
              "local-and-url": -1,
              context: -3,
              zustand: 3,
              "redux-toolkit": 1,
              "server-state-first": -2,
            },
          },
        ],
      },
      {
        id: "sharing",
        prompt: "How many components read and write the same piece of state?",
        answers: [
          {
            id: "few",
            label: "A few, close together in the tree",
            weights: {
              "local-and-url": 3,
              context: 0,
              zustand: -1,
              "redux-toolkit": -2,
              "server-state-first": 1,
            },
          },
          {
            id: "several",
            label: "Several, across different screens",
            weights: {
              "local-and-url": -1,
              context: 2,
              zustand: 2,
              "redux-toolkit": 1,
              "server-state-first": 0,
            },
          },
          {
            id: "most",
            label: "Most of the application",
            weights: {
              "local-and-url": -3,
              context: -1,
              zustand: 2,
              "redux-toolkit": 2,
              "server-state-first": 0,
            },
          },
        ],
      },
      {
        id: "team",
        prompt:
          "How big is the front-end team, and how much convention does it need?",
        answers: [
          {
            id: "small",
            label: "1 to 3 developers",
            weights: {
              "local-and-url": 1,
              context: 1,
              zustand: 2,
              "redux-toolkit": -2,
              "server-state-first": 1,
            },
          },
          {
            id: "one-team",
            label: "One team of 4 to 10",
            weights: {
              "local-and-url": 1,
              context: 0,
              zustand: 1,
              "redux-toolkit": 0,
              "server-state-first": 1,
            },
          },
          {
            id: "many",
            label:
              "Many developers; strict conventions and review rules are needed",
            weights: {
              "local-and-url": -1,
              context: -1,
              zustand: 0,
              "redux-toolkit": 3,
              "server-state-first": 0,
            },
          },
        ],
      },
      {
        id: "devtools",
        prompt:
          "How important are devtools, action logs and time-travel debugging?",
        answers: [
          {
            id: "no",
            label: "Not needed",
            weights: {
              "local-and-url": 1,
              context: 1,
              zustand: 1,
              "redux-toolkit": -1,
              "server-state-first": 0,
            },
          },
          {
            id: "sometimes",
            label: "Useful for occasional debugging",
            weights: {
              "local-and-url": 0,
              context: 0,
              zustand: 1,
              "redux-toolkit": 1,
              "server-state-first": 1,
            },
          },
          {
            id: "required",
            label:
              "Required: replayable bugs and an audit of every state change",
            weights: {
              "local-and-url": -2,
              context: -2,
              zustand: 1,
              "redux-toolkit": 3,
              "server-state-first": 0,
            },
          },
        ],
      },
      {
        id: "forms",
        prompt: "How form-heavy is the application?",
        answers: [
          {
            id: "few",
            label: "A few simple forms",
            weights: {
              "local-and-url": 0,
              zustand: 1,
              "redux-toolkit": 0,
              "server-state-first": 1,
            },
          },
          {
            id: "many-pages",
            label: "Many forms, each on its own page",
            weights: {
              "local-and-url": 2,
              context: -1,
              zustand: 0,
              "redux-toolkit": -2,
              "server-state-first": 1,
            },
          },
          {
            id: "wizards",
            label: "Multi-step wizards that share data across pages",
            weights: {
              "local-and-url": 0,
              context: 0,
              zustand: 2,
              "redux-toolkit": 1,
              "server-state-first": -1,
            },
          },
        ],
      },
      {
        id: "existing-redux",
        prompt: "Is there existing Redux code?",
        answers: [
          {
            id: "none",
            label: "None",
            weights: {
              "local-and-url": 1,
              context: 1,
              zustand: 1,
              "redux-toolkit": -2,
              "server-state-first": 1,
            },
          },
          {
            id: "some",
            label: "Some, in an older part of the app",
            weights: {
              "local-and-url": 0,
              zustand: 0,
              "redux-toolkit": 1,
              "server-state-first": 1,
            },
          },
          {
            id: "large",
            label: "A large Redux codebase the team knows well",
            weights: {
              "local-and-url": 0,
              context: -1,
              zustand: -2,
              "redux-toolkit": 3,
              "server-state-first": 0,
            },
          },
        ],
      },
      {
        id: "persistence",
        prompt:
          "Does state need to survive a reload or sync across browser tabs?",
        answers: [
          {
            id: "none",
            label: "No",
            weights: {
              "local-and-url": 1,
              context: 1,
              zustand: 0,
              "redux-toolkit": 0,
              "server-state-first": 1,
            },
          },
          {
            id: "preferences",
            label: "Some UI preferences should persist",
            weights: {
              "local-and-url": 1,
              context: -1,
              zustand: 2,
              "redux-toolkit": 0,
              "server-state-first": 0,
            },
          },
          {
            id: "cross-tab",
            label:
              "Full state must survive reloads and stay in sync across tabs",
            weights: {
              "local-and-url": -1,
              context: -2,
              zustand: 2,
              "redux-toolkit": 1,
              "server-state-first": 1,
            },
          },
        ],
      },
    ],
  },
];
