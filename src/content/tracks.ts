import type { Track } from "./types";

/**
 * The curriculum. Lesson ids are the shared vocabulary between lessons,
 * scenarios, flashcards and advisors, so they are fixed here first.
 */
export const TRACKS: Track[] = [
  {
    id: "foundations",
    title: "Foundations",
    summary:
      "How architects think: drivers, trade-offs, and the few models worth knowing.",
    stack: "general",
    lessonIds: [
      "architecture-drivers",
      "tradeoff-thinking",
      "c4-and-adrs",
      "coupling-and-cohesion",
      "fitness-functions",
    ],
  },
  {
    id: "dotnet-styles",
    title: ".NET application styles",
    summary:
      "The shapes a .NET backend can take, from a layered monolith to microservices.",
    stack: "dotnet",
    lessonIds: [
      "layered-monolith",
      "modular-monolith",
      "clean-architecture",
      "vertical-slices",
      "microservices",
      "strangler-fig",
    ],
  },
  {
    id: "dotnet-distributed",
    title: ".NET distributed patterns",
    summary:
      "CQRS, events, messaging, serverless and the glue that keeps distributed systems honest.",
    stack: "dotnet",
    lessonIds: [
      "cqrs",
      "event-sourcing",
      "messaging-outbox-saga",
      "serverless-durable-functions",
      "api-gateway-bff",
      "orleans-actors",
      "aspire-dapr",
    ],
  },
  {
    id: "azure-data",
    title: "Azure hosting and data",
    summary:
      "Picking compute, storage, messaging and identity on Azure for a given workload.",
    stack: "azure",
    lessonIds: [
      "azure-compute-choices",
      "azure-messaging-choices",
      "sql-vs-cosmos",
      "ef-core-patterns",
      "caching-strategies",
      "multi-tenancy",
      "identity-and-secrets",
      "azure-landing-zone-basics",
    ],
  },
  {
    id: "react",
    title: "React architecture",
    summary:
      "Shaping a React codebase: components, state, data, rendering and organisation.",
    stack: "react",
    lessonIds: [
      "react-component-architecture",
      "react-state-management",
      "react-server-state",
      "react-rendering-strategies",
      "react-code-organisation",
      "react-forms-and-validation",
      "react-performance-architecture",
      "react-micro-frontends",
      "react-testing-strategy",
      "react-design-systems",
    ],
  },
  {
    id: "fullstack",
    title: "ASP.NET Core + React",
    summary:
      "Putting the two halves together: hosting, auth, contracts and real-time.",
    stack: "dotnet",
    lessonIds: [
      "aspnet-react-hosting",
      "blazor-vs-react",
      "api-contracts-openapi",
      "entra-id-auth",
      "realtime-signalr",
    ],
  },
  {
    id: "crosscutting",
    title: "Cross-cutting concerns",
    summary:
      "Observability, resilience, security, delivery and testing on the Microsoft stack.",
    stack: "general",
    lessonIds: [
      "observability",
      "resilience",
      "security-architecture",
      "cicd-and-environments",
      "backend-testing-strategy",
    ],
  },
];
