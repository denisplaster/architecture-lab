import type { Lesson } from "../types";

/**
 * React architecture track: components, state, data, rendering, organisation,
 * forms, performance, micro-frontends, testing and design systems. Each lesson
 * answers "when would I pick this, and when not?" for a React 19 front end that
 * talks to an ASP.NET Core API on Azure.
 */
export const REACT_LESSONS: Lesson[] = [
  {
    id: "react-component-architecture",
    trackId: "react",
    title: "Component architecture",
    tagline:
      "Compose small components and hooks; configure nothing you can compose instead.",
    level: 2,
    minutes: 8,
    summary:
      "Component architecture is the set of rules for how a React codebase splits behaviour and markup into components, hooks and boundaries. The modern answer is composition: children and slots over boolean props, hooks over container components, compound components for related parts, and a deliberate line between server and client components in React 19.",
    sections: [
      {
        heading: "Composition over configuration",
        body: 'A component with twelve boolean props (`showIcon`, `isCompact`, `hasFooter`, `hideTitle`) is a configuration API. Every new requirement adds a prop and another branch inside. A composed component takes `children` and a few slots instead, so the caller assembles what it needs:\n\n```tsx\n<Card>\n  <Card.Header action={<IconButton icon={<Pin />} />}>Invoices</Card.Header>\n  <Card.Body>\n    <InvoiceTable />\n  </Card.Body>\n</Card>\n```\n\nComposition keeps the base component small and stable while callers get freedom at the edges. The test: if the next feature request would add a prop that only one caller uses, that caller should compose instead.\n\nThree composition tools cover almost everything:\n\n- **children** for the main content slot.\n- **Named slots** (`header`, `footer`, `action`) as props that accept React elements.\n- **Render props or hooks** when the child needs data the parent computes, such as a `useCombobox()` hook that returns props to spread.\n\nConfiguration still has a place for small, closed sets such as `size="sm" | "md"` or `tone="danger"`. The smell is open-ended growth.',
      },
      {
        heading: "Containers gave way to hooks and compound components",
        body: "The container/presentational split (one component fetches, another renders) made sense before hooks, when logic could only live in class components. With hooks, the logic moves into a custom hook and the presentational part is simply the component. `useOrders()` returns data and callbacks; `<OrdersTable>` renders them. You get the same separation without a second component layer and without props plumbing.\n\nTwo patterns carry most of the weight today:\n\n- **Compound components**: `Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel` share state through a private context. Callers arrange the parts; the parent coordinates them. Radix Primitives and React Aria Components are built this way.\n- **Headless components and hooks**: TanStack Table, Downshift and the React Aria hooks own behaviour, keyboard handling and accessibility and render nothing. Your design system supplies the markup. This is how one behaviour implementation can serve Fluent UI styling in one app and Tailwind in another.\n\nWrite a presentational component when the same markup is reused; write a hook when the same behaviour is reused. Do not write a container just to hold a fetch.",
      },
      {
        heading: "Colocate state, then pick how it travels",
        body: "Keep state in the component that uses it, and lift it only when a second component needs it. Lift to the nearest common parent, never straight to a global store.\n\nWhen data has to cross several levels, choose between three options:\n\n- **Props drilling** is fine for two or three levels. It is explicit and refactor-safe.\n- **Composition** removes most drilling: instead of passing `user` down through `Layout` to `Avatar`, render `<Layout avatar={<Avatar user={user} />} />` at the level that already has the user. The intermediate components never see the prop.\n- **Context** is for values that many distant components read and that change rarely: the signed-in user, theme, locale, the current tenant. In React 19 the context object is rendered directly as the provider (`<UserContext value={user}>`). Every consumer re-renders when the value changes, so split contexts by change frequency and memoise the value.\n\nContext transports values; it is a poor store. If you find yourself writing reducers and selectors over a context value, you want Zustand or Jotai (see the state management lesson).",
      },
      {
        heading: "The server/client boundary in React 19",
        body: 'React 19 formalises two kinds of components. **Server Components** run only on the server (or at build time), can be `async`, can call an ASP.NET Core API or a database directly, and ship no JavaScript to the browser. **Client Components** are the components you have always written: they use state, effects, event handlers and browser APIs. A file opts in with the `"use client"` directive, and everything it imports becomes client code.\n\nThe boundary is an architectural decision because props that cross it must be serialisable: plain objects, arrays, strings, Promises. Functions and class instances cannot cross, with server actions as the one exception.\n\nPractical rules for a Next.js App Router app:\n\n- Pages and layouts stay server components by default; they fetch and pass data down.\n- Push `"use client"` as low in the tree as possible: the interactive table, the dropdown, the form. Keep the page shell on the server.\n- A client component can still render server components passed as `children`, so a client `<Tabs>` can wrap server-rendered panels.\n\nIf you ship a Vite SPA, every component is a client component and this section does not apply. That is a legitimate choice (see rendering strategies).',
      },
      {
        heading: "When to extract",
        body: "Extraction has a cost: another file, another name, another prop interface to keep stable. Extract when one of these is true:\n\n- The piece has a domain name people already use (`InvoiceStatusBadge`, `TenantSwitcher`).\n- The same markup and behaviour appear a third time. Two copies are usually cheaper than a premature abstraction.\n- The component's JSX no longer fits on one screen and has sections with different update frequencies.\n- A piece needs its own state or effect that the parent should not re-run.\n\nDo not extract because a lint rule says a function is too long, or to populate a `components/common` folder that no feature owns. A component with one caller lives next to that caller. It moves to a shared package only when a second feature imports it and both agree on the API.",
      },
    ],
    diagram: {
      caption:
        "A page composed from a server shell, client islands, a headless hook and a compound component.",
      nodes: [
        {
          id: "api",
          label: "Orders API",
          sub: "ASP.NET Core, OpenAPI",
          col: 0,
          row: 1,
          kind: "service",
        },
        {
          id: "page",
          label: "OrdersPage",
          sub: "Server Component",
          col: 1,
          row: 1,
          kind: "ui",
        },
        {
          id: "table",
          label: "OrdersTable",
          sub: "'use client'",
          col: 2,
          row: 0,
          kind: "ui",
        },
        {
          id: "filters",
          label: "OrderFilters",
          sub: "'use client'",
          col: 2,
          row: 2,
          kind: "ui",
        },
        {
          id: "hook",
          label: "useOrdersTable()",
          sub: "headless logic",
          col: 3,
          row: 0,
          kind: "note",
        },
        {
          id: "tabs",
          label: "Tabs / Tabs.Panel",
          sub: "compound component",
          col: 3,
          row: 2,
          kind: "ui",
        },
      ],
      edges: [
        { from: "api", to: "page", label: "fetch on server" },
        { from: "page", to: "table", label: "props: orders[]" },
        { from: "page", to: "filters", label: "children" },
        {
          from: "table",
          to: "hook",
          label: "state + behaviour",
          style: "dashed",
        },
        { from: "filters", to: "tabs", label: "composes" },
      ],
      groups: [
        {
          label: "Client boundary",
          nodeIds: ["table", "filters", "hook", "tabs"],
        },
      ],
    },
    useWhen: [
      "A shared component keeps growing boolean props that only one caller uses",
      "Behaviour such as keyboard navigation or selection is reused across visually different widgets",
      "Several nested components pass a prop through without reading it",
      "You are on the Next.js App Router and need to decide which subtrees ship JavaScript",
    ],
    avoidWhen: [
      "A component has a closed set of three variants; a `variant` prop is simpler than slots",
      "The team is new to React and a compound/context pattern would hide where state lives",
      "The app is a short-lived prototype where duplication is cheaper than an API",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core OpenAPI types",
        role: "Generated request and response types become the prop types of data components.",
      },
      {
        name: "Fluent UI React v9",
        role: "Slot-based components that show the composition style in a Microsoft-branded library.",
      },
      {
        name: "MSAL React templates",
        role: "`AuthenticatedTemplate` and `UnauthenticatedTemplate` gate subtrees by composition instead of flags.",
      },
      {
        name: "Azure Static Web Apps",
        role: "Hosts a Vite SPA where every component is a client component.",
      },
    ],
    reactStack: [
      {
        name: "Custom hooks",
        role: "Hold reusable behaviour (`useOrders`, `useDebouncedValue`) so components stay declarative.",
      },
      {
        name: "Compound components with context",
        role: "`Tabs`, `Menu`, `Accordion` parts coordinate through a private context.",
      },
      {
        name: "Radix Primitives / React Aria Components",
        role: "Headless, accessible building blocks you style yourself.",
      },
      {
        name: "TanStack Table",
        role: "Headless table logic: sorting, grouping, pagination with your markup.",
      },
      {
        name: 'Next.js App Router `"use client"`',
        role: "Marks the server/client boundary per file.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "Small components with few props are easier to read than one configurable giant.",
      },
      {
        attribute: "time-to-market",
        effect: 0,
        note: "Composition takes a little longer to set up and pays back on the third feature.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "New layouts are new compositions, with no change to the base component.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Hooks and headless parts test in isolation; markup tests stay small.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Server/client boundaries and colocated state cut bundle size and re-renders.",
      },
      {
        attribute: "consistency",
        effect: -1,
        note: "Callers can compose inconsistent variants; a design system and lint rules must hold the line.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Feature teams compose what they need without changing shared components.",
      },
      {
        attribute: "reliability",
        effect: 0,
        note: "Fewer branches inside components, but more places where composition can be wrong.",
      },
    ],
    related: [
      "react-state-management",
      "react-design-systems",
      "react-rendering-strategies",
      "blazor-vs-react",
    ],
    checks: [
      {
        id: "react-component-architecture-q1",
        prompt:
          "A shared `<Modal>` already has `showCloseButton`, `footerButtons`, `isDanger`, `hideHeader` and `customTitle`. The next request is a modal with a progress bar in the header. What is the best call?",
        options: [
          "Add a `headerProgress` prop and one more branch in the render",
          "Convert to compound parts (`Modal.Header`, `Modal.Body`, `Modal.Footer`) and let callers compose the header",
          "Fork a `ProgressModal` component for this caller",
          "Replace all the props with a single `config` object",
        ],
        answer: 1,
        explanation:
          "Open-ended growth of caller-specific props is the signal for composition; compound parts let this caller put a progress bar in the header without touching the others. Another prop keeps the growth going, and a fork duplicates focus management and accessibility.",
      },
      {
        id: "react-component-architecture-q2",
        prompt:
          "Which value belongs in React context rather than in props or a store?",
        options: [
          "The current row selection of a data grid",
          "The signed-in user's display name and roles",
          "The list of orders fetched from the API",
          "The draft text in a comment box",
        ],
        answer: 1,
        explanation:
          "The user rarely changes and is read by many distant components, which is exactly what context is for. Row selection changes constantly (local or a store), orders are server state for a query cache, and a draft is local form state.",
      },
      {
        id: "react-component-architecture-q3",
        prompt:
          'In a Next.js App Router app, where should `"use client"` go for an orders page with a sortable, filterable table?',
        options: [
          "At the top of the page file so the whole route is interactive",
          "In the table component file, keeping the page and layout as server components",
          "In the root layout so every component can use hooks",
          "Nowhere; sorting can be done in a server component",
        ],
        answer: 1,
        explanation:
          "The boundary belongs as low as possible: the table needs state and event handlers, the page shell does not. Marking the page or layout as client ships the whole subtree as JavaScript; a server component cannot hold sort state because it has no state or events.",
      },
    ],
    sources: [
      {
        title: "react.dev: Passing data deeply with context",
        url: "https://react.dev/learn/passing-data-deeply-with-context",
      },
      {
        title: "react.dev: Server Components",
        url: "https://react.dev/reference/rsc/server-components",
      },
      {
        title: "react.dev: Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
      },
    ],
  },
  {
    id: "react-state-management",
    trackId: "react",
    title: "State management: a decision ladder",
    tagline:
      "Start local, climb one rung at a time, and keep server data off the ladder.",
    level: 2,
    minutes: 7,
    summary:
      "State management in React is a sequence of small decisions, each made as late as possible: local state, lifted state, context for rare global values, a lightweight store for client application state, and Redux Toolkit when a team needs its conventions and tooling. The URL, forms and server data each have their own home and do not belong in the store.",
    sections: [
      {
        heading: "The ladder",
        body: "Each rung costs more than the one below: more indirection, more files, more things a new developer must learn. Climb only on a concrete signal.\n\n- **`useState` / `useReducer` in one component.** The default. Covers toggles, inputs, hover, local pagination.\n- **Lifted state.** Two siblings need the same value: move it to the nearest common parent and pass it down. Still just props.\n- **Context.** Many components, far apart, read a value that changes rarely: signed-in user, theme, locale, feature flags, tenant. One provider near the root.\n- **Zustand or Jotai.** Client application state that changes often and is read in many places: a shopping cart, a multi-panel editor's selection, notification toasts, an undo stack. Selectors keep re-renders local.\n- **Redux Toolkit.** The same job as Zustand, plus devtools with time travel, a middleware pipeline (listeners, persistence, analytics), serialisable actions that can be logged, and a published Style Guide a large team can follow. Pick it when those are requirements, or when the team already has Redux habits.\n\nMost business apps stop at context plus TanStack Query and never need a store at all. That is a good outcome.",
      },
      {
        heading: "Picking the rung above context",
        body: "Context has one re-render rule: every consumer re-renders when the provider value changes. For a theme that is fine. For a cart that updates on every quantity change it is a performance problem, and you will end up splitting contexts and memoising to fight it. That is the signal to move up.\n\n- **Zustand** is a single store outside React, read through selector hooks: `useCart(s => s.items.length)`. Minimal boilerplate, usable outside components (handy in a SignalR handler), middleware for persistence and devtools.\n- **Jotai** is bottom-up: many small atoms, with derived atoms computed from others. It suits editors and dashboards where state is a graph of related values rather than one tree.\n- **Redux Toolkit** gives `createSlice`, Immer-based reducers, the listener middleware and RTK Query. It is more code per feature and more ceremony, in return for predictability across a large codebase and the best debugging story.\n\nA practical rule: one small team, one app: Zustand. Fine-grained derived state: Jotai. Several teams, many years, auditing or replay requirements: Redux Toolkit.",
      },
      {
        heading: "The URL is state too",
        body: "Anything a user might bookmark, share or expect to survive a refresh belongs in the URL: the active tab, filters, sort order, page number, the selected record id. Keeping it in a store means the back button lies and a copied link opens a different screen.\n\nWith React Router, `useSearchParams` reads and writes the query string and route params hold ids. In Next.js, `useSearchParams` and `usePathname` do the same, and libraries such as nuqs give typed search-param state. Treat the URL as the source of truth and derive component state from it, instead of syncing two copies.\n\nThe URL is a poor home for large or sensitive values (a draft document, a token) and for state that changes dozens of times a second (drag position). Those stay local.",
      },
      {
        heading: "Two kinds of state that never go in the store",
        body: "**Form state is local.** Field values, touched flags and validation errors belong to the form while it is open. React Hook Form keeps them in refs and re-renders only what changed. Lifting a form into a global store makes every keystroke a global event and leaks half-finished input across screens.\n\n**Server data is a cache, and the rules are different.** Orders, customers and prices come from the ASP.NET Core API, and the server owns them. What the client holds is a copy that can go stale, needs refetching, deduplication and invalidation after a write. Those are cache concerns, which TanStack Query, RTK Query or SWR handle. A Redux slice with `orders`, `loading` and `error` reimplements a worse cache by hand (see the server state lesson).\n\nThe practical split: the store holds what the user is doing; the query cache holds what the server knows.",
      },
      {
        heading: "How it goes wrong",
        body: "- **One global store from day one.** Every feature writes to it, nothing is local, and the store becomes a second schema that nobody dares to change.\n- **Context as a store.** Reducers and dispatch in a context, then performance patches with `useMemo` everywhere. Move to Zustand.\n- **Derived state stored instead of computed.** A `totalPrice` kept next to `items` and updated by hand drifts. Compute it in a selector.\n- **Server data copied into the store** after a fetch, then invalidated by hand. This is the single most common source of stale screens.\n- **Auth tokens in the store.** MSAL already caches tokens; read them through `acquireTokenSilent` when you make a request. Persisting them from a store into `localStorage` is a security defect.\n- **Persisting everything.** Persist UI preferences; never persist server data or form drafts without an expiry.",
      },
    ],
    diagram: {
      caption:
        "The decision ladder, with the URL and the query cache as separate homes that are never rungs.",
      nodes: [
        {
          id: "local",
          label: "useState / useReducer",
          sub: "one component",
          col: 0,
          row: 0,
          kind: "ui",
        },
        {
          id: "lifted",
          label: "Lifted state",
          sub: "nearest common parent",
          col: 1,
          row: 0,
          kind: "ui",
        },
        {
          id: "context",
          label: "Context",
          sub: "theme, user, locale",
          col: 2,
          row: 0,
          kind: "ui",
        },
        {
          id: "store",
          label: "Zustand / Jotai",
          sub: "client app state",
          col: 3,
          row: 0,
          kind: "data",
        },
        {
          id: "rtk",
          label: "Redux Toolkit",
          sub: "devtools, middleware",
          col: 4,
          row: 0,
          kind: "data",
        },
        {
          id: "url",
          label: "URL",
          sub: "filters, page, tab",
          col: 1,
          row: 2,
          kind: "note",
        },
        {
          id: "query",
          label: "TanStack Query",
          sub: "server data, a cache",
          col: 3,
          row: 2,
          kind: "data",
        },
      ],
      edges: [
        { from: "local", to: "lifted", label: "two siblings need it" },
        { from: "lifted", to: "context", label: "many readers, rare change" },
        { from: "context", to: "store", label: "frequent updates" },
        { from: "store", to: "rtk", label: "team conventions" },
        {
          from: "lifted",
          to: "url",
          label: "must survive refresh",
          style: "dashed",
        },
        {
          from: "store",
          to: "query",
          label: "came from the API",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "A context value changes many times a minute and consumers re-render across the page",
      "State must be read or written outside React, for example from a SignalR handler",
      "You need undo, time travel or an action log for support and debugging",
      "Several teams need one shared convention for where state lives and how it changes",
    ],
    avoidWhen: [
      "Most of what you want to store is data fetched from the API",
      "The value would be bookmarked or shared; the URL is the right home",
      "Only one component, or one parent-child pair, uses the value",
    ],
    microsoftStack: [
      {
        name: "MSAL (`@azure/msal-react`)",
        role: "Owns the Entra ID token cache; the store never holds tokens.",
      },
      {
        name: "SignalR client",
        role: "Hub handlers write into a Zustand store or invalidate the query cache from outside React.",
      },
      {
        name: "ASP.NET Core API",
        role: "The source of truth for server data, which stays in the query cache rather than the store.",
      },
    ],
    reactStack: [
      { name: "useState / useReducer", role: "Local state, the default rung." },
      {
        name: "Context (React 19 provider syntax)",
        role: "Rarely changing global values such as the user, theme and tenant.",
      },
      {
        name: "Zustand",
        role: "A small store with selectors for frequently changing client state.",
      },
      {
        name: "Jotai",
        role: "Atomic, derived state for editors and dashboards.",
      },
      {
        name: "Redux Toolkit",
        role: "Slices, listener middleware, devtools and RTK Query for large teams.",
      },
      {
        name: "React Router `useSearchParams` / nuqs",
        role: "Shareable, refresh-safe state in the URL.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 2,
        note: "Most state stays local; only a little of it needs a store, compared with one global store for everything.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "No store wiring before the first screen ships.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Local and selected state re-renders less than a global tree read everywhere.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Each rung can be climbed later without rewriting the ones below.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Components with local state test without providers; stores test as plain functions.",
      },
      {
        attribute: "consistency",
        effect: 0,
        note: "The URL and the query cache are additional sources of truth to keep straight.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Feature-local state means features change without touching shared slices.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "No single devtools view of all application state until you adopt Redux.",
      },
    ],
    related: [
      "react-server-state",
      "react-forms-and-validation",
      "react-component-architecture",
    ],
    checks: [
      {
        id: "react-state-management-q1",
        prompt:
          "A filter panel's selected filters must survive a refresh and be shareable by link. Where should they live?",
        options: [
          "In a Zustand store persisted to `localStorage`",
          "In the URL query string, with component state derived from it",
          "In React context near the root",
          "In the TanStack Query cache under a `filters` key",
        ],
        answer: 1,
        explanation:
          "Shareable and refresh-safe are the two signals for URL state; a link then reproduces the screen. Persisted Zustand survives a refresh on one machine only and makes shared links wrong, and the query cache is for server data.",
      },
      {
        id: "react-state-management-q2",
        prompt:
          "A context holds both the theme and the shopping cart. Every quantity change re-renders two hundred product rows. What is the right fix?",
        options: [
          "Wrap every product row in `React.memo`",
          "Keep the theme in context and move the cart to a Zustand store read through selectors",
          "Move the cart into the URL",
          "Move both theme and cart into Redux Toolkit",
        ],
        answer: 1,
        explanation:
          "Frequent updates with many readers is the signal to climb above context; selectors re-render only the rows that read what changed. Memoising rows hides the cost rather than removing it, the URL cannot hold a cart, and Redux is more than this problem needs.",
      },
      {
        id: "react-state-management-q3",
        prompt:
          "Which of these is a reasonable thing to keep in a Redux Toolkit slice?",
        options: [
          "The orders returned by `GET /api/orders`",
          "The current step and selections of an in-progress data import wizard that several screens show",
          "The MSAL access token",
          "The field values of the checkout form",
        ],
        answer: 1,
        explanation:
          "In-progress client work shared by several screens is client application state. Orders are server state for the query cache (or RTK Query), tokens belong to MSAL, and form values are local to the form.",
      },
    ],
    sources: [
      {
        title: "react.dev: Scaling up with reducer and context",
        url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
      },
      { title: "Redux Style Guide", url: "https://redux.js.org/style-guide/" },
      { title: "Zustand documentation", url: "https://zustand.docs.pmnd.rs/" },
    ],
  },
  {
    id: "react-server-state",
    trackId: "react",
    title: "Server state and data fetching",
    tagline:
      "Server data is a cache you rent. Let a query library manage staleness and invalidation.",
    level: 2,
    minutes: 8,
    summary:
      "Server state is data owned by the ASP.NET Core API that the browser merely holds a copy of. TanStack Query, RTK Query and SWR treat it as a cache with staleness, deduplication, background refetch and invalidation after writes. This lesson shows how to pair them with generated OpenAPI clients and why hand-written fetch-and-store code is a trap.",
    sections: [
      {
        heading: "What makes server state different",
        body: "Client state is owned by the browser: the open panel, the draft text. Server state is owned by the API: orders, customers, prices. The copy in the browser is a cache, and caches have problems that `useState` does not solve:\n\n- it can be **stale** the moment it arrives, because another user changed the row;\n- two components asking for the same data should produce **one request**;\n- after a write, every screen showing that data must **refetch or update**;\n- loading and error are **per request**, with retries and backoff;\n- unused data should be **garbage collected** so a long session does not grow without bound.\n\nA query library solves all of these with one primitive: a query identified by a key. TanStack Query v5 is the usual choice for Vite and Next.js apps. RTK Query is the same idea inside Redux Toolkit and is the right pick when the app already uses Redux. SWR is smaller and suits simple read-heavy pages. The rest of this lesson uses TanStack Query terms; the concepts map one to one.",
      },
      {
        heading: "The cache model: keys, staleTime, invalidation",
        body: '```ts\nconst ordersQuery = (status: string) =>\n  queryOptions({\n    queryKey: ["orders", { status }],\n    queryFn: () => api.GET("/orders", { params: { query: { status } } }),\n    staleTime: 30_000,\n  });\n\nconst { data, isPending, error } = useQuery(ordersQuery("open"));\n```\n\n- **queryKey** identifies the data. Include every input that changes the result. Two components with the same key share one cache entry and one in-flight request (deduplication).\n- **staleTime** says how long a result is trusted. The v5 default is 0, which means refetch on every mount and window focus. For reference data (countries, product catalogue) set minutes or hours; for a live order board, seconds.\n- **gcTime** (default five minutes) says how long an unused entry stays in memory before collection.\n- **Invalidation** marks entries stale so active ones refetch: `queryClient.invalidateQueries({ queryKey: ["orders"] })` hits every key that starts with `orders`. Design keys hierarchically so invalidation can be broad or narrow.\n\nPrefer a `queryOptions` factory per endpoint in the feature folder. It keeps keys, functions and defaults in one place that loaders, components and tests share.',
      },
      {
        heading: "Mutations and optimistic updates",
        body: 'Writes go through `useMutation`. The simplest correct pattern invalidates on success and lets the queries refetch:\n\n```ts\nconst cancel = useMutation({\n  mutationFn: (id: string) =>\n    api.POST("/orders/{id}/cancel", { params: { path: { id } } }),\n  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),\n});\n```\n\nThis costs one extra round trip and is right for most forms. Use an **optimistic update** when the user expects instant feedback (toggles, reordering, favourites): in `onMutate` cancel in-flight queries, snapshot the cache, write the expected result, and roll back in `onError`. React 19 adds `useOptimistic` for the same idea inside a single component tree; it pairs well with server actions in Next.js and leaves the query cache untouched.\n\nRules of thumb:\n\n- Do not optimistically update anything the server might reject for business reasons (payments, stock).\n- Always invalidate after the optimistic write settles, so the cache converges on the server\'s truth.\n- Keep mutations in the feature, next to the query factory, so key names stay consistent.',
      },
      {
        heading: "Pairing with an ASP.NET Core OpenAPI client",
        body: "ASP.NET Core produces an OpenAPI document (`Microsoft.AspNetCore.OpenApi`, served at `/openapi/v1.json`). Generate the TypeScript side from it instead of hand-writing fetch calls:\n\n- **openapi-typescript + openapi-fetch**: types plus a tiny typed fetch client; you write the `queryOptions` yourself. Lowest magic.\n- **Orval**: generates TanStack Query hooks (`useGetOrders`, `useCancelOrder`) straight from the document, including keys.\n- **Kiota**: Microsoft's generator; produces a typed client you wrap in query functions.\n\nRun generation in CI from the API build output so a breaking backend change fails the front-end type check. Put the generated code in a workspace package (`packages/api-client`) that both the query factories and the MSW handlers import.\n\nAuth is a fetch middleware concern: an interceptor calls MSAL's `acquireTokenSilent` and attaches the bearer token, so queries never know about Entra ID. On the server, output caching and ETags with `If-None-Match` let the browser's HTTP cache and the query cache cooperate: a 304 is cheap, and `staleTime` decides whether to ask at all.",
      },
      {
        heading: "Suspense, error boundaries and real time",
        body: '`useSuspenseQuery` returns `data` without `undefined` and suspends the component until the data is there. Place a `<Suspense>` with a skeleton around the subtree and an error boundary (`react-error-boundary` together with `QueryErrorResetBoundary`) above it, and the component stops branching on `isPending` and `error`. Use it per region of the page rather than once at the root, or a slow widget blocks the whole screen.\n\nReal-time updates fit the cache model well. A SignalR hub sends `OrderChanged(orderId)`; the client handler calls `queryClient.invalidateQueries({ queryKey: ["orders", orderId] })` or writes the payload with `setQueryData`. Components do not change. Azure SignalR Service handles fan-out when you run several API instances.\n\nDo not use Suspense for mutations, and do not wrap a whole route in one boundary when the route has independent regions.',
      },
      {
        heading: "Why server data in Redux slices goes wrong",
        body: "The classic shape is a slice with `items`, `loading` and `error`, a thunk that fetches, and reducers that merge results. It fails in predictable ways:\n\n- No staleness: data fetched at login is shown all day.\n- No deduplication: two components dispatch two fetches.\n- Invalidation by hand after every mutation, and someone forgets one.\n- Normalisation code (`byId`, `allIds`) that duplicates what the API already shapes.\n- The store grows for the whole session because nothing is garbage collected.\n\nRTK Query exists because the Redux maintainers saw this pattern fail everywhere. If you are on Redux, use it. If you would add Redux only to hold server data, use TanStack Query and skip Redux.",
      },
    ],
    diagram: {
      caption:
        "Two components share one cache entry; mutations and SignalR events invalidate it; a generated client talks to the API.",
      nodes: [
        {
          id: "list",
          label: "OrdersList",
          sub: "useQuery(['orders'])",
          col: 0,
          row: 0,
          kind: "ui",
        },
        {
          id: "badge",
          label: "OrderBadge",
          sub: "same key, one request",
          col: 0,
          row: 2,
          kind: "ui",
        },
        {
          id: "cache",
          label: "Query cache",
          sub: "staleTime, gcTime",
          col: 1,
          row: 1,
          kind: "data",
        },
        {
          id: "client",
          label: "Generated client",
          sub: "Orval / openapi-fetch",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "api",
          label: "Orders API",
          sub: "ASP.NET Core, OpenAPI",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "mut",
          label: "useMutation",
          sub: "invalidate on success",
          col: 2,
          row: 3,
          kind: "ui",
        },
        {
          id: "hub",
          label: "SignalR hub",
          sub: "OrderChanged event",
          col: 3,
          row: 3,
          kind: "queue",
        },
      ],
      edges: [
        { from: "list", to: "cache", label: "subscribe" },
        { from: "badge", to: "cache", label: "deduplicated" },
        { from: "cache", to: "client", label: "fetch when stale" },
        { from: "client", to: "api", label: "HTTPS + bearer token" },
        { from: "mut", to: "client", label: "POST /orders/{id}/cancel" },
        {
          from: "mut",
          to: "cache",
          label: "invalidateQueries",
          style: "dashed",
        },
        { from: "api", to: "hub", label: "push" },
        {
          from: "hub",
          to: "cache",
          label: "invalidate ['orders', id]",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "Browser",
          nodeIds: ["list", "badge", "cache", "client", "mut"],
        },
      ],
    },
    useWhen: [
      "Several screens show the same API data and must agree after a write",
      "Users keep the app open for hours and expect to see other people's changes",
      "You have an OpenAPI document and want generated, typed data access",
      "Loading, error and retry logic is being rewritten in every component",
    ],
    avoidWhen: [
      "The page is a one-shot report with a single request and no writes; a loader with `fetch` is enough",
      "The data is client-owned (an editor document, wizard steps) and never comes back from the server as-is",
      "A Next.js app renders everything in server components and has no client-side refetching",
    ],
    microsoftStack: [
      {
        name: "Microsoft.AspNetCore.OpenApi",
        role: "Emits the OpenAPI document the TypeScript client is generated from.",
      },
      {
        name: "Kiota",
        role: "Microsoft's client generator; an alternative to Orval or openapi-fetch.",
      },
      {
        name: "Azure SignalR Service",
        role: "Fans out change notifications that invalidate query keys in every connected browser.",
      },
      {
        name: "ASP.NET Core output caching and ETags",
        role: "Cheap 304 responses when the query cache decides to refetch.",
      },
    ],
    reactStack: [
      {
        name: "TanStack Query v5",
        role: "Query cache with `queryOptions`, `useQuery`, `useMutation` and `useSuspenseQuery`.",
      },
      {
        name: "RTK Query",
        role: "The same model inside Redux Toolkit, with tag-based invalidation.",
      },
      {
        name: "SWR",
        role: "A smaller stale-while-revalidate hook for read-heavy pages.",
      },
      {
        name: "Orval",
        role: "Generates TanStack Query hooks and Zod schemas from the OpenAPI document.",
      },
      {
        name: "openapi-typescript + openapi-fetch",
        role: "Typed fetch client with no generated runtime code.",
      },
      {
        name: "react-error-boundary",
        role: "Error boundaries around suspending regions, reset through `QueryErrorResetBoundary`.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "One primitive (a keyed query) replaces hand-written loading, error and merge code.",
      },
      {
        attribute: "time-to-market",
        effect: 2,
        note: "Generated client plus query hooks means a new endpoint is minutes of front-end work.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Deduplication and `staleTime` cut requests; background refetch keeps screens fresh.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "Invalidation by key makes every screen converge after a write.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Retries, backoff and error boundaries come built in.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Query factories and MSW handlers test the data layer without components.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "Contract changes fail the type check in CI rather than in production.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Fewer requests to the API, slightly more JavaScript in the bundle.",
      },
    ],
    related: [
      "api-contracts-openapi",
      "caching-strategies",
      "realtime-signalr",
      "react-state-management",
    ],
    checks: [
      {
        id: "react-server-state-q1",
        prompt:
          "A country dropdown refetches `/api/countries` every time it mounts, which is on every form. What is the right fix?",
        options: [
          "Copy the countries into a Zustand store after the first fetch",
          "Set a long `staleTime` (hours) on the countries query",
          "Increase `gcTime` so the entry stays in memory longer",
          "Wrap the dropdown in `React.memo`",
        ],
        answer: 1,
        explanation:
          "Refetch-on-mount is the default because `staleTime` is 0; reference data should be trusted for hours. `gcTime` only controls how long unused data is kept, a store duplicates the cache, and memo does not affect fetching.",
      },
      {
        id: "react-server-state-q2",
        prompt:
          "After a user cancels an order on the detail page, the orders list on another screen still shows it as open. What is the correct pattern?",
        options: [
          "Have both screens refetch on an interval",
          "Call `queryClient.invalidateQueries({ queryKey: ['orders'] })` in the mutation's `onSuccess`",
          "Move the orders list into Redux and dispatch an update from the detail page",
          "Reload the page after the mutation",
        ],
        answer: 1,
        explanation:
          "Hierarchical keys let one invalidation refresh the list, the detail and any badge that starts with `orders`. Polling wastes requests, a Redux copy reintroduces manual syncing, and a reload throws away client state.",
      },
      {
        id: "react-server-state-q3",
        prompt: "Which action is a good candidate for an optimistic update?",
        options: [
          "Submitting a card payment",
          "Toggling a favourite flag on a product",
          "Reserving the last unit of stock",
          "Creating an order that the server numbers",
        ],
        answer: 1,
        explanation:
          "Optimistic updates fit actions the server will almost never reject and that users expect to feel instant. Payments and stock can fail for business reasons, and a server-generated number cannot be guessed on the client.",
      },
    ],
    sources: [
      {
        title: "TanStack Query documentation",
        url: "https://tanstack.com/query/latest",
      },
      {
        title: "react.dev: useOptimistic",
        url: "https://react.dev/reference/react/useOptimistic",
      },
      {
        title: "ASP.NET Core: OpenAPI documents",
        url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/",
      },
    ],
  },
  {
    id: "react-rendering-strategies",
    trackId: "react",
    title: "Rendering strategies: SPA, SSR, SSG, ISR and RSC",
    tagline:
      "Produce HTML where it is needed first: by a crawler, a slow phone or a signed-in user.",
    level: 2,
    minutes: 8,
    summary:
      "A rendering strategy decides where and when HTML is produced: in the browser (CSR), on a server per request (SSR), at build time (SSG), at build time with periodic refresh (ISR), streamed in pieces, or as React Server Components. The drivers are SEO, first-load speed, personalisation, authentication and hosting. Most internal business apps are well served by a plain SPA.",
    sections: [
      {
        heading: "The options in one pass",
        body: "- **CSR (SPA)**: Vite builds static files; the browser downloads JavaScript, then fetches data and renders. Blank or skeleton until then. Simplest to host.\n- **SSR**: a Node server renders HTML per request, then the browser hydrates it. First paint is fast and complete; you now run a server. Next.js, React Router v7 in framework mode and TanStack Start all do this.\n- **SSG**: HTML is rendered at build time. Serves from a CDN with zero servers, and content is as old as the last build.\n- **ISR**: SSG pages that Next.js regenerates in the background after a `revalidate` window or on demand. Fresh enough for catalogues and marketing content.\n- **Streaming SSR**: the server sends the shell immediately and streams slow sections inside `<Suspense>` boundaries as they resolve.\n- **React Server Components (RSC)**: components that run only on the server and send a serialised tree, with no JavaScript for them in the bundle. The Next.js App Router makes RSC the default and mixes it with any of the above per route.\n\nThese are per-route choices in Next.js. A single app can have a static marketing page, an ISR catalogue and a fully client-rendered dashboard.",
      },
      {
        heading: "The drivers that decide it",
        body: "Four questions settle most cases:\n\n- **Do crawlers or link previews need the content?** Public marketing, docs, product pages, job listings: yes, so SSR, SSG or ISR. An app behind Entra ID sign-in: no, crawlers never see it.\n- **Does first load on a slow device matter commercially?** E-commerce and media lose revenue per 100 ms; SSR or SSG with a small client bundle wins. An internal tool used all day from a desktop does not care about a one-second initial load.\n- **Is the content personalised per user?** Personalised pages cannot be built statically. SSR or RSC with per-request data, or an SPA that fetches after login.\n- **What can you host and operate?** SSG and SPA are files on a CDN. SSR and RSC need a Node runtime you must patch, scale and monitor next to your ASP.NET Core API.\n\nOther things that push toward SSR: very large pages where the client bundle is the bottleneck, and sites that must work with JavaScript disabled. Things that push toward SPA: heavy interactivity (editors, dashboards), offline support, and a team with no Node operations experience.",
      },
      {
        heading: "Streaming and RSC in practice",
        body: "With the App Router, a page is a server component that can `await` data from your ASP.NET Core API directly (server to server, inside the Azure network, with a managed identity or a client-credentials token), then render client components for the interactive parts. Wrap slow sections in `<Suspense>` and Next.js streams the shell first.\n\nWhat RSC changes architecturally:\n\n- Initial data fetching moves to the server; TanStack Query is still useful for client-side refetching and mutations, and can hydrate from server-fetched data.\n- Secrets and internal URLs stay on the server; the browser never sees the API's internal address.\n- Bundle size drops because markup-only components ship no JavaScript.\n\nWhat it costs: two runtimes to reason about, a serialisation boundary that rejects functions and class instances, caching semantics that differ between Next.js versions, and debugging across server and client. Teams without a Node-literate operator should think hard before taking this on for an internal application.",
      },
      {
        heading: "Hosting on Azure",
        body: '- **Azure Static Web Apps** hosts SPA and SSG output on a global edge with managed TLS, preview environments per pull request, built-in Entra ID login, and a linked backend (App Service, Container Apps, Functions or API Management) proxied under `/api`. It is the default home for a Vite SPA talking to an ASP.NET Core API.\n- **Azure App Service** runs Node, so a Next.js SSR app runs there, with the API on another App Service or in the same plan.\n- **Azure Container Apps** runs Next.js in a container (`output: "standalone"`) with scale to zero, alongside the API as a second container app. This is the cleanest option for a .NET Aspire solution that includes a Next.js front end.\n- **Azure Front Door** in front of any of them gives caching, WAF and one hostname for `/` (front end) and `/api` (backend).\n\nStatic Web Apps also has a hybrid Next.js mode; check its current limits before relying on it for SSR. For server rendering at scale, Container Apps is the dependable answer.',
      },
      {
        heading: "The honest default for business apps",
        body: "Most line-of-business apps built on ASP.NET Core look like this: a login wall, a few hundred to a few thousand users, data tables, forms and dashboards, used from laptops on an office or VPN network. For them:\n\n- SEO is irrelevant, so SSR brings no ranking benefit.\n- Users keep the app open for hours; initial load is amortised over the day.\n- The data is personalised and changes constantly; SSG and ISR cannot apply.\n- The team runs ASP.NET Core on Azure and may have nobody to operate Node.\n\nA Vite SPA on Static Web Apps, TanStack Query against the API and MSAL for Entra ID is the right shape here and will stay right. Reach for Next.js when a public, content-heavy or conversion-sensitive surface appears, and consider hosting that surface as its own app rather than migrating the whole product.",
      },
    ],
    diagram: {
      caption:
        "Static output on Static Web Apps and server rendering on Container Apps behind one Front Door hostname.",
      nodes: [
        {
          id: "browser",
          label: "Browser",
          sub: "React",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "fd",
          label: "Azure Front Door",
          sub: "CDN, WAF, one hostname",
          col: 1,
          row: 1,
          kind: "external",
        },
        {
          id: "swa",
          label: "Static Web Apps",
          sub: "SPA or SSG output",
          col: 2,
          row: 0,
          kind: "service",
        },
        {
          id: "next",
          label: "Next.js server",
          sub: "Container Apps, SSR/RSC",
          col: 2,
          row: 2,
          kind: "service",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "App Service",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "db",
          label: "Azure SQL",
          sub: "data",
          col: 4,
          row: 1,
          kind: "data",
        },
      ],
      edges: [
        { from: "browser", to: "fd", label: "/" },
        { from: "fd", to: "swa", label: "static files" },
        { from: "fd", to: "next", label: "/app: render per request" },
        {
          from: "browser",
          to: "api",
          label: "JSON (CSR, with token)",
          style: "dashed",
        },
        { from: "next", to: "api", label: "server-to-server fetch" },
        { from: "api", to: "db", label: "EF Core" },
      ],
    },
    useWhen: [
      "Content must be indexed by search engines or show rich link previews",
      "Measured first-load time on mobile affects conversion or retention",
      "Pages are mostly content with small islands of interactivity",
      "The API must stay private and the browser should never call it directly",
    ],
    avoidWhen: [
      "The app sits behind Entra ID sign-in and crawlers never reach it",
      "The UI is a dense, long-lived workspace such as an editor or an operations dashboard",
      "Nobody on the team can operate a Node runtime in production",
    ],
    microsoftStack: [
      {
        name: "Azure Static Web Apps",
        role: "Edge hosting for SPA and SSG output, with a linked ASP.NET Core backend under `/api`.",
      },
      {
        name: "Azure Container Apps",
        role: "Runs a standalone Next.js server next to the API, scale to zero included.",
      },
      {
        name: "Azure Front Door",
        role: "One hostname, caching and WAF in front of static and server-rendered origins.",
      },
      {
        name: "Entra ID with MSAL or Static Web Apps auth",
        role: "Sign-in for SPAs; server-side token acquisition for RSC fetches.",
      },
    ],
    reactStack: [
      {
        name: "Vite",
        role: "The CSR SPA build; static files and nothing to run.",
      },
      {
        name: "Next.js App Router",
        role: "Per-route SSR, SSG, ISR, streaming and React Server Components.",
      },
      {
        name: "React Router v7 framework mode",
        role: "SSR and loaders on a Vite build without adopting Next.js.",
      },
      {
        name: "TanStack Start",
        role: "Another Vite-based full-stack option with typed routing.",
      },
      {
        name: "Suspense",
        role: "The boundary that enables streaming and selective hydration.",
      },
    ],
    tradeoffs: [
      {
        attribute: "performance",
        effect: 1,
        note: "Server rendering improves first paint and SEO; interaction speed is unchanged or slightly worse during hydration.",
      },
      {
        attribute: "simplicity",
        effect: -2,
        note: "Two runtimes and a serialisation boundary, compared with a static bundle.",
      },
      {
        attribute: "operability",
        effect: -1,
        note: "A Node server to patch, scale and monitor next to the API.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Compute for rendering instead of free static hosting.",
      },
      {
        attribute: "deployability",
        effect: -1,
        note: "A container or Node deployment instead of uploading files.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "More decisions per route before the first screen ships.",
      },
      {
        attribute: "scalability",
        effect: 0,
        note: "Static output scales for free; SSR scales with instances, which Container Apps handles.",
      },
      {
        attribute: "reliability",
        effect: -1,
        note: "One more process that can fail on the request path.",
      },
    ],
    related: [
      "aspnet-react-hosting",
      "azure-compute-choices",
      "entra-id-auth",
      "react-performance-architecture",
    ],
    checks: [
      {
        id: "react-rendering-strategies-q1",
        prompt:
          "An expense-approval tool for 800 employees sits behind Entra ID sign-in and is used from office laptops. Which rendering strategy fits?",
        options: [
          "Next.js with SSR on Container Apps for the fastest first load",
          "A Vite SPA on Static Web Apps calling the ASP.NET Core API",
          "SSG rebuilt nightly with the latest expenses",
          "ISR with a 60-second revalidate window",
        ],
        answer: 1,
        explanation:
          "No crawler reaches it, users stay signed in all day, and the data is personalised, so a SPA on static hosting is the cheapest correct answer. SSR adds a Node runtime for no ranking or revenue benefit, and SSG or ISR cannot render per-user data.",
      },
      {
        id: "react-rendering-strategies-q2",
        prompt:
          "A public catalogue has 50,000 product pages, updated a few times an hour, and must rank in search. Which strategy fits?",
        options: [
          "CSR so the catalogue stays one bundle",
          "SSG with a full rebuild on every price change",
          "ISR with on-demand revalidation when a product changes",
          "SSR with no caching so every page is always current",
        ],
        answer: 2,
        explanation:
          "ISR serves static pages from the edge and regenerates only the pages that changed, which keeps both freshness and cost in check. Rebuilding 50,000 pages per change is too slow, uncached SSR pays compute for every crawl, and CSR hides the content from crawlers.",
      },
      {
        id: "react-rendering-strategies-q3",
        prompt:
          "Which statement about a server component in the Next.js App Router is true?",
        options: [
          "It can call `useState` as long as it does not use effects",
          "It can be `async` and fetch from the API with credentials the browser never sees",
          'It must be marked with `"use server"` at the top of the file',
          "It is hydrated in the browser after the HTML arrives",
        ],
        answer: 1,
        explanation:
          'Server components run only on the server, so they can await data with server-side credentials and ship no JavaScript. They have no state or hydration, and `"use server"` marks server actions rather than components.',
      },
    ],
    sources: [
      { title: "Next.js documentation", url: "https://nextjs.org/docs" },
      {
        title: "Azure Static Web Apps documentation",
        url: "https://learn.microsoft.com/azure/static-web-apps/",
      },
      {
        title: "Azure Container Apps documentation",
        url: "https://learn.microsoft.com/azure/container-apps/",
      },
    ],
  },
  {
    id: "react-code-organisation",
    trackId: "react",
    title: "Code organisation and boundaries",
    tagline:
      "Group by feature, expose a public API per folder, and let a linter enforce the fence.",
    level: 2,
    minutes: 7,
    summary:
      "Code organisation decides where a developer looks for a thing and what they are allowed to import. Feature-based folders with a public `index.ts` per feature, boundaries enforced by lint, and a monorepo with shared packages keep a growing React codebase from turning into a web of imports. This lesson covers the structure, the tooling and when a monorepo pays.",
    sections: [
      {
        heading: "Group by feature",
        body: "Type-based folders (`components/`, `hooks/`, `utils/`, `services/`) work for a week. After that, one feature is spread across six folders and a change touches all of them. Feature folders put everything about one capability in one place, mirroring the backend's modules:\n\n```\nsrc/\n  app/            routing, providers, layout shell\n  features/\n    orders/\n      api/        queryOptions, mutations, generated type re-exports\n      components/ OrdersTable.tsx, OrderStatusBadge.tsx\n      hooks/      useOrderFilters.ts\n      index.ts    public API: what other features may import\n    catalog/\n  shared/\n    ui/           design-system components\n    lib/          date formatting, result types\n    api/          fetch client, auth interceptor\n```\n\nThe rule: a feature may import from `shared/` and from another feature's `index.ts`, never from its internals. `shared/` never imports a feature. `app/` imports features to wire routes.\n\nIf the backend is a modular monolith, name features after its modules. A developer who knows where Ordering lives in the .NET solution should find `features/orders` without asking.",
      },
      {
        heading: "Feature-Sliced Design in brief",
        body: "Feature-Sliced Design (FSD) is a published convention for the same idea, with a stricter vocabulary. It defines layers that may only import downward:\n\n- **app**: providers, routing, global styles\n- **pages**: route-level composition\n- **widgets**: large self-contained blocks (a header, an order summary panel)\n- **features**: user actions (add to cart, cancel order)\n- **entities**: business objects and their views (Order, Customer)\n- **shared**: UI kit, API client, utilities\n\nWithin a layer, each slice (`entities/order`) has segments: `ui`, `model`, `api`, `lib`. Every slice has an `index.ts` that is the only import path.\n\nFSD's value is that the rules are written down and come with ESLint rules. Its cost is six layers to explain, and the features-versus-entities split becomes a debate on every pull request. For a team of three to eight, plain feature folders with `shared/` usually suffice. Adopt the full layering when the app has dozens of features and several teams, or when you want a convention you did not have to write yourself.",
      },
      {
        heading: "Enforcing the boundary",
        body: 'A convention that is not enforced lasts until the first deadline. Two tools make the fence real:\n\n- **eslint-plugin-boundaries** declares element types (`feature`, `shared`, `app`) by path pattern and rules such as "a feature may import `shared`, and other features only through `index.ts`". Violations fail `eslint` locally and in CI.\n- **dependency-cruiser** validates the whole import graph against rules in a config file, detects cycles and orphan modules, and can render a graph image for architecture reviews. Run it as a CI step.\n\nIn an Nx workspace, `@nx/enforce-module-boundaries` does the same using project tags.\n\nPair the tooling with path aliases (`@/features/orders`) in `tsconfig.json` and Vite, so imports read as architecture. Keep barrel files small: a giant `index.ts` that re-exports everything defeats tree shaking, invites circular imports, and makes the public API meaningless.',
      },
      {
        heading: "Monorepo: when and with what",
        body: "One React app with one API does not need a monorepo. You need one when more than one deployable shares code: a web app and an admin app sharing the design system, or a front end and a generated API client that must version together.\n\n- **npm or pnpm workspaces** give you `packages/*` with local linking. Enough for two or three packages.\n- **Turborepo** adds a task graph (`build` depends on `^build`), local and remote caching. Low ceremony; fits most teams.\n- **Nx** adds project graphs, generators, affected-only commands and the module-boundary lint. Heavier, and the better choice for many apps and libraries with several teams.\n\nA typical layout for an ASP.NET Core and React product:\n\n```\napps/web, apps/admin\npackages/ui, packages/api-client, packages/config   (eslint, tsconfig)\nsrc/Api, src/Api.Tests                              (the .NET solution lives beside it)\n```\n\nKeep the .NET and React code in one repository when one team ships both and the contract changes often. Split repositories when separate teams own them and the contract is versioned. Either way, `api-client` is generated from the API's OpenAPI output in CI, so a contract change fails the front-end build before it fails a user.",
      },
      {
        heading: "Colocation and the usual mistakes",
        body: "Tests, stories and styles live next to the component: `OrdersTable.tsx`, `OrdersTable.test.tsx`, `OrdersTable.stories.tsx`, `OrdersTable.module.css`. Vitest and Storybook discover them by glob, and deleting a component deletes its tests. A top-level `__tests__` tree drifts away from the code it covers.\n\nMistakes to watch for:\n\n- A `shared/` folder that grows into a second app because everything might be reused. Move things into `shared/` only when a second feature needs them.\n- Cross-feature imports of internals, just this once. The lint rule exists so that this needs a deliberate exception.\n- Generated code checked in and then edited by hand.\n- Deep relative paths (`../../../../shared`). Use aliases.\n- Organising by route only. Routes compose features; they should not own business logic.",
      },
    ],
    diagram: {
      caption:
        "Features import shared code and each other's public API only; the API client is generated from the backend's OpenAPI document.",
      nodes: [
        {
          id: "app",
          label: "apps/web",
          sub: "routes, providers",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "orders",
          label: "features/orders",
          sub: "index.ts public API",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "catalog",
          label: "features/catalog",
          sub: "index.ts public API",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "shared",
          label: "shared/ui, lib, api",
          sub: "imports no feature",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "client",
          label: "packages/api-client",
          sub: "generated from OpenAPI",
          col: 3,
          row: 1,
          kind: "data",
        },
        {
          id: "dotnet",
          label: "src/Api",
          sub: "ASP.NET Core",
          col: 4,
          row: 1,
          kind: "service",
        },
        {
          id: "lint",
          label: "Boundary lint",
          sub: "eslint-plugin-boundaries",
          col: 2,
          row: 3,
          kind: "note",
        },
      ],
      edges: [
        { from: "app", to: "orders" },
        { from: "app", to: "catalog" },
        { from: "orders", to: "shared" },
        { from: "catalog", to: "shared" },
        {
          from: "orders",
          to: "catalog",
          label: "internals: blocked",
          style: "dashed",
        },
        { from: "shared", to: "client" },
        {
          from: "dotnet",
          to: "client",
          label: "openapi.json in CI",
          style: "dashed",
        },
        {
          from: "lint",
          to: "orders",
          label: "fails CI on violation",
          style: "dashed",
        },
      ],
      groups: [
        {
          label: "Monorepo workspace",
          nodeIds: ["app", "orders", "catalog", "shared", "client"],
        },
      ],
    },
    useWhen: [
      "A change to one feature touches files in five type-based folders",
      "Pull requests regularly import another feature's internals",
      "Two or more deployables share components or an API client",
      "The backend is a modular monolith and the front end should mirror its modules",
    ],
    avoidWhen: [
      "The app has a handful of screens and one developer; folders by type are fine for now",
      "You would adopt Nx or the full FSD layering for a single small app",
    ],
    microsoftStack: [
      {
        name: "OpenAPI client generation in CI",
        role: "The API build publishes `openapi.json`; the pipeline regenerates `packages/api-client` and fails on breaking changes.",
      },
      {
        name: "Modular monolith modules",
        role: "Feature folder names mirror the .NET module names so both halves share a vocabulary.",
      },
      {
        name: "Azure Pipelines or GitHub Actions with Turborepo caching",
        role: "Only affected packages rebuild and retest on each pull request.",
      },
    ],
    reactStack: [
      {
        name: "Feature folders with `index.ts`",
        role: "One public import path per feature.",
      },
      {
        name: "eslint-plugin-boundaries",
        role: "Fails lint when a feature imports another feature's internals or `shared/` imports a feature.",
      },
      {
        name: "dependency-cruiser",
        role: "Validates the import graph, finds cycles, draws the architecture.",
      },
      {
        name: "Turborepo",
        role: "Task graph and caching for a workspace of apps and packages.",
      },
      {
        name: "Nx",
        role: "Project graph, generators and module-boundary lint for larger workspaces.",
      },
      {
        name: "Vite and tsconfig path aliases",
        role: "`@/features/orders` instead of relative paths.",
      },
    ],
    tradeoffs: [
      {
        attribute: "evolvability",
        effect: 2,
        note: "Features can be rewritten, moved or extracted behind a stable public API.",
      },
      {
        attribute: "team-autonomy",
        effect: 2,
        note: "Teams own folders and packages with lint-enforced edges.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Colocated tests and feature-local fakes keep test setup small.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "One layout across features; new developers find things the same way everywhere.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "A monorepo task graph rebuilds and tests only what changed.",
      },
      {
        attribute: "simplicity",
        effect: 0,
        note: "More structure up front, less confusion later; a wash for small apps.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Setting up boundaries, aliases and a workspace costs the first week.",
      },
      {
        attribute: "operability",
        effect: 0,
        note: "Organisation of source code does not change what runs in production.",
      },
    ],
    related: [
      "modular-monolith",
      "vertical-slices",
      "react-micro-frontends",
      "cicd-and-environments",
    ],
    checks: [
      {
        id: "react-code-organisation-q1",
        prompt:
          "The orders feature needs `CustomerBadge` from the customers feature. What is the right import?",
        options: [
          '`import { CustomerBadge } from "@/features/customers/components/CustomerBadge"`',
          '`import { CustomerBadge } from "@/features/customers"` via the feature\'s `index.ts`',
          "Copy `CustomerBadge.tsx` into the orders feature",
          "Move `CustomerBadge` to `shared/ui` immediately",
        ],
        answer: 1,
        explanation:
          "The public API is the only sanctioned path between features; the customers team can then refactor internals freely. A deep import couples to internals, a copy drifts, and `shared/` is for code that has no feature owner.",
      },
      {
        id: "react-code-organisation-q2",
        prompt: "When does adopting Turborepo or Nx start to pay for itself?",
        options: [
          "As soon as the app has more than twenty components",
          "When two or more deployables share packages such as a design system or an API client",
          "When the team wants faster `npm install`",
          "When the backend moves to microservices",
        ],
        answer: 1,
        explanation:
          "A monorepo tool manages the task graph and caching across several packages and apps; with one app there is nothing to orchestrate. Component count and install speed are unrelated, and the backend's shape does not require a front-end monorepo.",
      },
      {
        id: "react-code-organisation-q3",
        prompt:
          "Which tool fails CI when `features/orders` imports a file inside `features/catalog/components`?",
        options: [
          "eslint-plugin-boundaries or dependency-cruiser with a rule for feature internals",
          "Prettier",
          "`tsc --noEmit` in strict mode",
          "Vitest",
        ],
        answer: 0,
        explanation:
          "Boundary rules are about which paths may import which; only a dependency linter checks that. TypeScript accepts any import that type-checks, Prettier only formats, and Vitest runs tests.",
      },
    ],
    sources: [
      { title: "Feature-Sliced Design", url: "https://feature-sliced.design/" },
      { title: "Turborepo documentation", url: "https://turborepo.com/docs" },
      {
        title: "Azure Architecture Center: Architecture styles",
        url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/",
      },
    ],
  },
  {
    id: "react-forms-and-validation",
    trackId: "react",
    title: "Forms and validation",
    tagline:
      "Keep form state local, validate twice, and let the server have the last word.",
    level: 2,
    minutes: 8,
    summary:
      "Forms are where client and server rules meet. React Hook Form holds field state locally and cheaply, Zod gives immediate feedback, and ASP.NET Core validation returns ProblemDetails that the form maps back onto fields. This lesson covers controlled versus uncontrolled inputs, multi-step forms, file uploads and the accessibility work every form owes its users.",
    sections: [
      {
        heading: "Controlled, uncontrolled and React Hook Form",
        body: 'A **controlled** input has its value in React state and re-renders on every keystroke. An **uncontrolled** input keeps its value in the DOM and React reads it on submit. Controlled is simpler to reason about and necessary for inputs that transform as you type (masks, dependent fields). Uncontrolled is cheaper for large forms.\n\nReact Hook Form (RHF) gives you the uncontrolled cost model with a controlled developer experience: `register("email")` wires the input by ref, `watch` subscribes to only the fields you ask for, and `Controller` wraps third-party controlled widgets (a Fluent UI `Combobox`, a date picker). A 60-field form re-renders only the fields that changed.\n\nForm state is **local** to the form component. It is created when the form mounts and discarded on submit or cancel. Do not put it in a global store; the store would receive a keystroke stream and leak drafts between screens.\n\nReact 19 adds form actions and `useActionState` for forms that submit to a server action in Next.js. They suit simple forms in RSC apps; for rich client-side validation and complex forms, RHF remains the better tool, and the two can be combined.',
      },
      {
        heading: "Two layers of validation, one truth",
        body: "Define the shape once with Zod and infer the TypeScript type from it:\n\n```ts\nconst orderSchema = z.object({\n  customerId: z.string().uuid(),\n  lines: z.array(z.object({ sku: z.string().min(1), qty: z.number().int().positive() })).min(1),\n  deliveryDate: z.coerce.date().min(new Date()),\n});\ntype OrderInput = z.infer<typeof orderSchema>;\nconst form = useForm<OrderInput>({ resolver: zodResolver(orderSchema) });\n```\n\nThe client schema gives instant feedback for format and presence rules. It is a convenience, never the authority. The ASP.NET Core API re-validates every request: data annotations or FluentValidation, the built-in Minimal API validation in .NET 10, plus the business rules only the server can check (stock, credit limit, uniqueness).\n\nKeep the two in sync by generating request types from the OpenAPI document and declaring the Zod schema against them (`satisfies` the generated type), or by generating Zod schemas from OpenAPI with Orval. Two things must never happen: a client rule stricter than the server, which silently blocks valid input, and a server rule missing on the client, which makes users guess.",
      },
      {
        heading: "Mapping ProblemDetails back onto fields",
        body: 'ASP.NET Core returns validation failures as `ValidationProblemDetails` (`application/problem+json`, RFC 7807 and its successor RFC 9457) with status 400 and an `errors` dictionary keyed by property path:\n\n```json\n{\n  "status": 400,\n  "title": "One or more validation errors occurred.",\n  "errors": { "DeliveryDate": ["Must be a working day."], "Lines[2].Qty": ["Exceeds stock."] }\n}\n```\n\nOn the client, catch the 400 in the mutation\'s `onError`, walk `errors`, and call `form.setError(path, { type: "server", message })`. Agree on key casing between the API\'s JSON options and the form field names (camelCase on both sides avoids a mapping table), and translate indexed paths (`Lines[2].Qty` to `lines.2.qty`). Errors with no matching field go to a form-level summary.\n\nEnable `AddProblemDetails()` in the API so every failure, including unhandled exceptions, has the same shape, and surface `title` or `detail` for non-validation errors. The front end then has one error-handling path, and the server remains the single source of truth for what is valid.',
      },
      {
        heading: "Multi-step forms and file uploads",
        body: "A wizard is either one form with several pages or several forms with a parent that holds completed steps. Prefer the first when steps are small and the final submission is one request: one `useForm` in a `FormProvider`, a schema per step validated with `trigger(fields)` before moving on, and the current step index in the URL so refresh and back work. Prefer the second when steps save to the server independently (a long onboarding flow); each step is its own form and mutation, and the server holds the progress.\n\nFile uploads have two shapes:\n\n- **Through the API**: `FormData` with `multipart/form-data` to a Minimal API endpoint that takes `IFormFile`. Simple, and the API can validate the content. Fine for documents up to a few tens of megabytes; set request size limits deliberately.\n- **Direct to Azure Blob Storage**: the API issues a short-lived SAS URL (a user delegation SAS when the API runs with a managed identity), the browser uploads straight to Blob Storage with progress events, and the form submits the blob name. Use this for large files, video, or many concurrent uploads, so the API never streams bytes.\n\nValidate file type and size on the client for feedback and on the server for safety; the server check is the one that counts.",
      },
      {
        heading: "Accessibility is part of the architecture",
        body: 'Forms are the part of an app most likely to fail an accessibility audit, and retrofitting is expensive because the fixes are structural:\n\n- Every input has a `<label>` associated by `htmlFor` and `id`, or an `aria-labelledby`. Placeholder text is a hint, never a label.\n- Invalid fields set `aria-invalid="true"` and point at their message with `aria-describedby`.\n- On a failed submit, move focus to the first invalid field or to an error summary at the top that links to each field.\n- Group related inputs with `<fieldset>` and `<legend>` (radio groups, address blocks).\n- Do not disable the submit button until the form is valid; let users submit and see what is missing.\n\nBuild these into the design system\'s `Field`, `Input` and `ErrorSummary` components once, so every form gets them for free. Test with Testing Library queries by role and label (`getByLabelText`), which fail when the association is missing, and run axe in Storybook.',
      },
    ],
    diagram: {
      caption:
        "Zod validates in the browser for feedback; FluentValidation on the server decides; ProblemDetails carries field errors back.",
      nodes: [
        {
          id: "form",
          label: "CheckoutForm",
          sub: "React Hook Form",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "zod",
          label: "Zod schema",
          sub: "shape and client rules",
          col: 1,
          row: 0,
          kind: "note",
        },
        {
          id: "submit",
          label: "onSubmit",
          sub: "useMutation",
          col: 1,
          row: 2,
          kind: "ui",
        },
        {
          id: "api",
          label: "POST /orders",
          sub: "Minimal API, .NET 10",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "validator",
          label: "FluentValidation",
          sub: "source of truth",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "problem",
          label: "ProblemDetails 400",
          sub: "errors keyed by field",
          col: 2,
          row: 3,
          kind: "note",
        },
        {
          id: "blob",
          label: "Blob Storage",
          sub: "direct upload via SAS",
          col: 3,
          row: 3,
          kind: "data",
        },
      ],
      edges: [
        { from: "zod", to: "form", label: "zodResolver" },
        { from: "form", to: "submit", label: "valid values" },
        { from: "submit", to: "api", label: "JSON" },
        { from: "api", to: "validator", label: "validates" },
        { from: "validator", to: "problem", label: "fails", style: "dashed" },
        {
          from: "problem",
          to: "form",
          label: "setError(path, msg)",
          style: "dashed",
        },
        {
          from: "form",
          to: "blob",
          label: "files, SAS URL from API",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "Forms have more than a handful of fields or render third-party inputs",
      "The API already returns ValidationProblemDetails and you want field-level errors inline",
      "Request types are generated from OpenAPI and the form should share them",
      "Rules such as uniqueness or stock can only be checked on the server",
    ],
    avoidWhen: [
      "A two-field search box; `useState` and a submit handler are enough",
      "The form submits to a Next.js server action with trivial validation; `useActionState` is simpler",
      "Validation rules exist only on the client and the API accepts anything; fix the API first",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core ProblemDetails",
        role: "`AddProblemDetails()` gives every error, including validation, one shape with field-keyed `errors`.",
      },
      {
        name: "FluentValidation or .NET 10 Minimal API validation",
        role: "Server-side rules that are the source of truth.",
      },
      {
        name: "Azure Blob Storage with SAS",
        role: "Direct browser uploads for large files; the API only issues the token and records the blob name.",
      },
      {
        name: "Kestrel request limits",
        role: "Explicit body size limits for multipart endpoints.",
      },
    ],
    reactStack: [
      {
        name: "React Hook Form",
        role: "Uncontrolled field state with `register`, `Controller`, `FormProvider` and `setError`.",
      },
      {
        name: "Zod with `@hookform/resolvers`",
        role: "Client schema, inferred types and instant feedback.",
      },
      {
        name: "React 19 `useActionState`",
        role: "Form actions for simple server-action forms in RSC apps.",
      },
      {
        name: "Design-system `Field` components",
        role: "Label, description and error wiring with the right ARIA attributes.",
      },
      {
        name: "MSW",
        role: "Replays ProblemDetails responses in component tests.",
      },
    ],
    tradeoffs: [
      {
        attribute: "simplicity",
        effect: 1,
        note: "One form library and one error path, compared with hand-rolled controlled inputs and ad hoc error handling.",
      },
      {
        attribute: "performance",
        effect: 1,
        note: "Uncontrolled fields re-render only what changed.",
      },
      {
        attribute: "consistency",
        effect: 2,
        note: "The same ProblemDetails mapping and the same `Field` components in every form.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "The server stays the authority, so client bugs cannot admit invalid data.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Schemas test as functions; forms test by label with MSW error replies.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Generated types plus a resolver mean little boilerplate per form.",
      },
      {
        attribute: "evolvability",
        effect: 1,
        note: "A rule change on the server surfaces as a new field error without a front-end release.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Direct Blob uploads move bandwidth off the API; otherwise neutral.",
      },
    ],
    related: [
      "react-state-management",
      "api-contracts-openapi",
      "security-architecture",
    ],
    checks: [
      {
        id: "react-forms-and-validation-q1",
        prompt:
          'The client schema passes, but the API returns 400 with `errors: { "Lines[2].Qty": ["Exceeds stock."] }`. What should the form do?',
        options: [
          "Show a generic toast saying the request failed",
          "Map the entry to `lines.2.qty` and call `setError` so the message appears on that field",
          "Add a stock check to the Zod schema so it never happens again",
          "Retry the request once in case stock changed",
        ],
        answer: 1,
        explanation:
          "ProblemDetails carries the field path for exactly this purpose, and inline errors are what users can act on. A toast loses the location, the client cannot know stock, and a retry does not change the outcome.",
      },
      {
        id: "react-forms-and-validation-q2",
        prompt:
          "Users upload 2 GB training videos from the browser. Where should the bytes go?",
        options: [
          "Through the Minimal API as `IFormFile` with a raised request limit",
          "Straight to Azure Blob Storage with a short-lived SAS URL issued by the API",
          "Base64-encoded inside the JSON form submission",
          "Chunked through a SignalR connection",
        ],
        answer: 1,
        explanation:
          "A SAS upload keeps the API off the data path and gives the browser progress events. Streaming gigabytes through the API ties up instances, base64 inflates the payload, and SignalR is for messages rather than bulk transfer.",
      },
      {
        id: "react-forms-and-validation-q3",
        prompt: "Which of these is an accessibility defect in a form?",
        options: [
          "Using placeholder text as the only label for an input",
          "Moving focus to the first invalid field after submit",
          "Grouping radio buttons in a `<fieldset>` with a `<legend>`",
          "Linking an error message with `aria-describedby`",
        ],
        answer: 0,
        explanation:
          "Placeholders disappear on input and are unreliable for screen readers, so every field needs a real label. The other three are the recommended practices.",
      },
    ],
    sources: [
      {
        title: "ASP.NET Core: Handle errors in web APIs (ProblemDetails)",
        url: "https://learn.microsoft.com/aspnet/core/web-api/handle-errors",
      },
      {
        title: "React Hook Form documentation",
        url: "https://react-hook-form.com/",
      },
      {
        title: "react.dev: useActionState",
        url: "https://react.dev/reference/react/useActionState",
      },
    ],
  },
  {
    id: "react-performance-architecture",
    trackId: "react",
    title: "Performance architecture",
    tagline:
      "Ship less, fetch in parallel, render only what is visible, and measure before memoising.",
    level: 3,
    minutes: 8,
    summary:
      "Front-end performance is decided by architecture choices made long before anyone reaches for `useMemo`: how the bundle is split, how data loads, how long lists render, and how assets reach the browser. This lesson gives a budget-driven approach for a React app on Azure, with memoisation and the React Compiler as the last step and Web Vitals as the scoreboard.",
    sections: [
      {
        heading: "Budgets first: what you measure",
        body: "Performance work without a target is endless. Set three numbers and put them in CI:\n\n- A **bundle budget** per route, for example 200 kB of compressed JavaScript for the initial route. `rollup-plugin-visualizer` shows what is in a chunk; `size-limit` or a small script fails the build when a budget is exceeded.\n- **Web Vitals** targets: Largest Contentful Paint under 2.5 s, Interaction to Next Paint under 200 ms, Cumulative Layout Shift under 0.1. Report them from real users with the `web-vitals` package into Application Insights as custom events through the JavaScript SDK, and track the 75th percentile, which is how the thresholds are defined.\n- A **request count** for the first screen, because every sequential round trip to the API costs a full network latency.\n\nLighthouse CI in the pipeline catches regressions on a synthetic run; the Application Insights data tells you what users get on their own devices and networks. Both are needed: lab numbers find causes, field numbers set priorities.",
      },
      {
        heading: "Code splitting and lazy routes",
        body: 'A Vite build produces one main chunk plus whatever you split. The split that matters is **by route**: each route\'s component is loaded with `React.lazy` (or React Router\'s `lazy` route property, or automatic per-page splitting in Next.js) so the login page does not pay for the reporting module.\n\n```tsx\nconst ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));\n\n<Route\n  path="/reports"\n  element={\n    <Suspense fallback={<PageSkeleton />}>\n      <ReportsPage />\n    </Suspense>\n  }\n/>\n```\n\nBeyond routes, split heavy, rarely used dependencies: a chart library, a rich text editor, a PDF viewer, a spreadsheet grid. Load them on interaction or on viewport entry, and preload on hover for perceived speed.\n\nWatch for the opposite failure: hundreds of tiny chunks that each cost a request. Use Vite\'s `manualChunks` to group vendor code sensibly and keep shared chunks few. Check the output after every dependency upgrade; importing the root of a utility library can double a bundle.',
      },
      {
        heading: "Avoiding request waterfalls",
        body: "A waterfall is a chain of requests where each waits for the previous: the route chunk loads, then the component mounts, then `useQuery` fires, then a child mounts and fires its own query. Four sequential hops at 80 ms each is a visible delay before any content.\n\nFixes, in order of impact:\n\n- **Fetch in parallel.** When a screen needs orders and customers, use `useQueries` or two independent `useQuery` calls in the same component instead of nesting one inside a child that renders after the first resolves.\n- **Start fetching before rendering.** React Router loaders (or TanStack Router loaders) call `queryClient.ensureQueryData(ordersQuery())` so the request starts when navigation begins, in parallel with the lazy chunk download.\n- **Prefetch on intent.** `prefetchQuery` on link hover or when a row comes into view.\n- **Fix the API shape.** If the UI always needs an order with its customer and lines, give the API an endpoint that returns them together, or a BFF that composes them. Chatty endpoints are a backend decision with front-end consequences.\n\nIn the Next.js App Router the same rule applies to server components: `await Promise.all([...])` rather than sequential awaits, and `<Suspense>` boundaries so slow sections stream later.",
      },
      {
        heading: "Rendering: virtualise, then memoise, then let the compiler",
        body: "**Long lists** are the one rendering problem that memoisation does not fix. A table with 5,000 rows creates 5,000 row components; virtualisation with TanStack Virtual or react-window renders only the thirty in view. Any list that can exceed a few hundred items should be virtualised from the start, because retrofitting changes the DOM structure and the scrolling behaviour.\n\n**Memoisation** (`memo`, `useMemo`, `useCallback`) is a last resort. Most re-renders are cheap, and memoisation adds code that must stay correct as props change. Use the React DevTools profiler to find the component that is actually slow, then memoise that one, or restructure so it receives stable props. State placed too high in the tree is the usual cause; moving it down removes the re-render instead of hiding it.\n\nThe **React Compiler** memoises automatically at build time for code that follows the rules of React. In a React 19 app it removes most manual `useMemo` and `useCallback`. Enable it, run its lint rules that flag unsafe code, and keep manual memoisation only where the profiler proves the compiler missed something.",
      },
      {
        heading: "Assets, CDN and Front Door",
        body: 'Images and fonts usually weigh more than JavaScript. The architecture decisions:\n\n- Serve static assets with long cache headers and hashed file names (Vite does this) from Static Web Apps or Blob Storage, with **Azure Front Door** in front for edge caching, compression and WAF. One Front Door profile can route `/` to the front end and `/api` to the API, which also removes CORS.\n- Resize and convert images (AVIF, WebP) at upload time with an Azure Function or at build time, store the variants in Blob Storage, and use `srcset` and `sizes` so a phone does not download a desktop image. Front Door does not transform images, so plan this step explicitly; `next/image` does it on the Next.js server if you run Next.js.\n- Self-host fonts with `font-display: swap` and preload the one used above the fold.\n- Set `Cache-Control` on API responses that can tolerate it, and use ETags so repeat requests are 304s.\n\nMark the LCP image with `fetchpriority="high"` and lazy-load the rest.',
      },
      {
        heading: "Common mistakes",
        body: "- Memoising everything before measuring anything.\n- A single `App.tsx` chunk because nobody added `lazy()`, and a 1.5 MB bundle that feels fine on office Wi-Fi.\n- Fetching in `useEffect` in every component, creating the waterfalls that loaders would have avoided.\n- Rendering 10,000 rows because the grid can handle it, then adding pagination the users hate. Virtualise.\n- Importing a whole icon set or date library for one icon or one function.\n- Measuring only on a developer laptop. Throttle CPU and network in DevTools, and read the Application Insights percentiles.",
      },
    ],
    diagram: {
      caption:
        "A lazy route whose loader starts parallel queries before render, a virtualised list, and assets served through Front Door.",
      nodes: [
        {
          id: "route",
          label: "Route",
          sub: "lazy() chunk",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "loader",
          label: "Loader",
          sub: "ensureQueryData",
          col: 1,
          row: 0,
          kind: "service",
        },
        {
          id: "q1",
          label: "orders query",
          sub: "parallel",
          col: 2,
          row: 0,
          kind: "data",
        },
        {
          id: "q2",
          label: "customer query",
          sub: "parallel, never chained",
          col: 2,
          row: 1,
          kind: "data",
        },
        {
          id: "list",
          label: "Virtualised list",
          sub: "TanStack Virtual",
          col: 1,
          row: 2,
          kind: "ui",
        },
        {
          id: "fd",
          label: "Front Door",
          sub: "images, fonts, cached",
          col: 3,
          row: 2,
          kind: "external",
        },
        {
          id: "vitals",
          label: "Web Vitals",
          sub: "LCP, INP, CLS",
          col: 3,
          row: 0,
          kind: "note",
        },
        {
          id: "api",
          label: "ASP.NET Core API",
          sub: "ETag, output cache",
          col: 4,
          row: 1,
          kind: "service",
        },
      ],
      edges: [
        { from: "route", to: "loader", label: "starts with navigation" },
        { from: "loader", to: "q1" },
        { from: "loader", to: "q2" },
        { from: "q1", to: "api" },
        { from: "q2", to: "api" },
        { from: "route", to: "list", label: "renders" },
        { from: "list", to: "fd", label: "srcset images" },
        {
          from: "route",
          to: "vitals",
          label: "reports to App Insights",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "Users on mobile or VPN report slow first loads, or field INP is over 200 ms",
      "The initial JavaScript bundle exceeds a few hundred kilobytes compressed",
      "Screens show lists of thousands of rows or chain several API calls before painting",
      "Images and documents dominate page weight",
    ],
    avoidWhen: [
      "The app is small, used on desktop, and the Web Vitals are already green",
      "The slow part is the API itself; check server timings before touching the front end",
    ],
    microsoftStack: [
      {
        name: "Azure Front Door",
        role: "Edge caching, compression and WAF for static assets, with `/api` routed to the backend.",
      },
      {
        name: "Application Insights JavaScript SDK",
        role: "Real-user Web Vitals and custom timings alongside the API's server-side telemetry.",
      },
      {
        name: "Azure Blob Storage and Azure Functions",
        role: "Image variants generated on upload and served with long cache lifetimes.",
      },
      {
        name: "ASP.NET Core output caching and ETags",
        role: "Cheap repeat responses so the client's refetches cost little.",
      },
    ],
    reactStack: [
      {
        name: "React.lazy and Suspense",
        role: "Route-level and dependency-level code splitting.",
      },
      {
        name: "React Router or TanStack Router loaders",
        role: "Start queries on navigation instead of on mount.",
      },
      {
        name: "TanStack Virtual",
        role: "Render only visible rows of long lists and tables.",
      },
      {
        name: "React Compiler",
        role: "Automatic memoisation at build time for rules-of-React code.",
      },
      {
        name: "rollup-plugin-visualizer and size-limit",
        role: "See what is in a chunk and fail CI on budget overruns.",
      },
      { name: "web-vitals", role: "Collect LCP, INP and CLS from real users." },
    ],
    tradeoffs: [
      {
        attribute: "performance",
        effect: 2,
        note: "Smaller initial bundles, parallel data, and lists that stay smooth at any size.",
      },
      {
        attribute: "scalability",
        effect: 1,
        note: "Edge caching and fewer API round trips reduce load as users grow.",
      },
      {
        attribute: "simplicity",
        effect: -1,
        note: "Lazy boundaries, loaders and virtualisation add structure a tiny app would not need.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "Budgets and loaders cost a little on every route.",
      },
      {
        attribute: "operability",
        effect: 1,
        note: "Field metrics in Application Insights show regressions before users complain.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "CI budgets stop a dependency upgrade from silently doubling the bundle.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Front Door and Functions cost money; cached egress and fewer API calls save some.",
      },
    ],
    related: [
      "caching-strategies",
      "react-server-state",
      "react-rendering-strategies",
      "observability",
    ],
    checks: [
      {
        id: "react-performance-architecture-q1",
        prompt:
          "A dashboard shows a skeleton for 1.2 seconds. Profiling shows three API calls that run one after another as components mount. What is the first fix?",
        options: [
          "Wrap each widget in `React.memo`",
          "Start the three queries in a route loader with `ensureQueryData`, or run them in parallel with `useQueries`",
          "Increase `staleTime` so the second visit is faster",
          "Move the dashboard to server-side rendering",
        ],
        answer: 1,
        explanation:
          "Sequential mounts create a waterfall; loaders or parallel queries collapse three latencies into one. Memo does not affect fetching, `staleTime` only helps repeat visits, and SSR would move the same waterfall to the server unless the fetches are also made parallel.",
      },
      {
        id: "react-performance-architecture-q2",
        prompt:
          "A table with 8,000 rows scrolls badly and the profiler shows 8,000 row components rendering. What fixes it?",
        options: [
          "Memoise every row with `React.memo`",
          "Virtualise the table so only the visible rows render",
          "Enable the React Compiler",
          "Split the table into its own lazy chunk",
        ],
        answer: 1,
        explanation:
          "The cost is the number of DOM nodes and components, which only virtualisation reduces. Memoisation and the compiler avoid re-renders but still create every row; lazy loading changes when the code arrives, not how much is rendered.",
      },
      {
        id: "react-performance-architecture-q3",
        prompt:
          "When should a team add a manual `useMemo` in a React 19 app with the React Compiler enabled?",
        options: [
          "Whenever a prop is an object or array",
          "After the profiler shows a specific expensive computation the compiler did not cover",
          "In every custom hook, as a convention",
          "Never; the compiler makes it illegal",
        ],
        answer: 1,
        explanation:
          "The compiler handles most memoisation; the remaining cases are found by measurement. Blanket rules add code without evidence, and manual memoisation remains allowed where it is justified.",
      },
    ],
    sources: [
      {
        title: "react.dev: React Compiler",
        url: "https://react.dev/learn/react-compiler",
      },
      { title: "web.dev: Web Vitals", url: "https://web.dev/articles/vitals" },
      {
        title: "Azure Front Door documentation",
        url: "https://learn.microsoft.com/azure/frontdoor/",
      },
    ],
  },
  {
    id: "react-micro-frontends",
    trackId: "react",
    title: "Micro-frontends",
    tagline:
      "Split the front end only when separate teams must ship separately; otherwise it is a tax.",
    level: 3,
    minutes: 8,
    summary:
      "Micro-frontends split one user interface into independently built and deployed pieces, integrated at runtime (Module Federation, iframes, web components) or at build time (packages in a monorepo). The only driver that justifies the runtime variants is organisational: several teams that cannot share a release train. Everything else is cost.",
    sections: [
      {
        heading: "The integration options",
        body: "- **Build-time integration**: each team publishes a package (`@org/orders-ui`) and one shell app imports them. One deployable, one React version, one bundle. Teams own code; the release is shared. This is a monorepo with good boundaries, and it is the baseline the other options are measured against.\n- **Module Federation** (webpack 5, Rspack, and the Vite plugin): a shell loads `remoteEntry.js` from each team's deployed app at runtime and shares singleton dependencies (`react`, `react-dom`, the design system). Teams deploy independently; the user sees one app. This is the most common runtime approach.\n- **Web components**: each micro-frontend is a custom element with its own framework inside. Framework-agnostic and well isolated; awkward for sharing React context, routing and styling.\n- **iframes**: total isolation and trivially independent deployment, with poor layout, navigation, focus and deep-linking behaviour. Right for embedding a third-party or legacy app, wrong for pieces of one product.\n- **Server-side composition**: the server stitches fragments, for example edge-side includes or a Next.js shell that renders remote fragments. Less common in React shops and dependent on infrastructure you may not run.",
      },
      {
        heading: "Conway's law is the only real driver",
        body: "A micro-frontend architecture lets teams release without coordinating. If you do not have several teams blocked by each other's release cadence, you do not have the problem it solves.\n\nSignals that it is the real problem:\n\n- Three or more teams, each owning a business area end to end (backend module and UI), with their own on-call and roadmap.\n- Releases are gated on a shared front-end pipeline and teams wait days for each other.\n- Different areas have different change rates: a stable billing UI and a daily-changing merchandising UI.\n- A legacy front end must be replaced area by area while it stays in production (the strangler fig applied to the UI).\n\nSignals that it is a fashion choice: one team of eight wants a scalable architecture; the backend is a single API; the goal is to run two frameworks at once. In those cases a monorepo with code ownership rules gives the same independence at a fraction of the cost.",
      },
      {
        heading: "The costs you will pay",
        body: "- **Duplicated dependencies**: without correct singleton sharing, two React copies load, hooks break and the bundle doubles. With sharing, every team must stay on compatible versions, which reintroduces coordination.\n- **Shared state**: the signed-in user, feature flags and the cart must be shared without a shared store. You end up with an event bus or a tiny shared package that becomes the most sensitive code in the system.\n- **Routing**: one URL space, several routers. The shell owns top-level routes and each remote owns its subtree; deep links, auth redirects and 404s need explicit contracts.\n- **Design consistency**: separate deploys drift unless the design system is a shared singleton with a release process and visual tests.\n- **Operations**: N pipelines, N origins, N versions in production at once, and a failure mode where one remote is down and the shell must degrade.\n- **Testing**: end-to-end tests must run against a composed environment that reflects the real mix of versions.\n- **Performance**: runtime loading adds requests and often repeated code; the first screen is usually slower than a single bundle.",
      },
      {
        heading: "Shape on Azure",
        body: "A workable Azure layout for Module Federation:\n\n- Each team deploys its remote to its own **Azure Static Web App** (or a Blob Storage static website); the shell is another Static Web App.\n- **Azure Front Door** fronts everything with one hostname: `/` to the shell, `/orders/*` and `/billing/*` to the remotes' assets, `/api/orders/*` to the Orders API. Path-based routing keeps CORS and cookies simple.\n- **Entra ID** sign-in happens once in the shell with MSAL; the remotes receive the account and token acquisition through a shared singleton package instead of each initialising MSAL.\n- Each team's API is its own ASP.NET Core service or module, versioned and documented with OpenAPI, so a remote and its API ship together.\n- Preview environments per pull request on Static Web Apps let a team test its remote against the production shell.\n\nPin each `remoteEntry.js` URL per environment in the shell's configuration, and put a health check and a fallback component around every remote so one team's outage shows a message instead of a blank page.",
      },
      {
        heading: "When one deployable is the better answer",
        body: "For an organisation of up to a few teams, the better answer is almost always a monorepo with:\n\n- feature packages per team (`packages/orders-ui`), each with an `index.ts` public API and a CODEOWNERS entry;\n- a shared design system package and a shared `api-client` package;\n- lint-enforced boundaries (eslint-plugin-boundaries, Nx tags);\n- one shell app that imports the feature packages and deploys as one unit, with Turborepo caching so only affected packages rebuild and retest.\n\nTeams get ownership, a fast review loop and the freedom to refactor internals. They give up independent deployment, which for most organisations means a release train of once a day or more often, and that is enough. Move to runtime micro-frontends when a specific team can show, with numbers, that the train is their bottleneck. Keep the feature packages even then: a package with a clean API is the easiest thing to turn into a federated remote later.",
      },
    ],
    diagram: {
      caption:
        "A shell loads team-owned remotes at runtime; Front Door routes paths to each team's Static Web App and API.",
      nodes: [
        {
          id: "fd",
          label: "Front Door",
          sub: "path routing",
          col: 0,
          row: 1,
          kind: "external",
        },
        {
          id: "shell",
          label: "Shell",
          sub: "routing, auth, layout",
          col: 1,
          row: 1,
          kind: "ui",
        },
        {
          id: "orders",
          label: "Orders remote",
          sub: "Team A, own deploy",
          col: 2,
          row: 0,
          kind: "ui",
        },
        {
          id: "billing",
          label: "Billing remote",
          sub: "Team B, own deploy",
          col: 2,
          row: 2,
          kind: "ui",
        },
        {
          id: "shared",
          label: "Shared singletons",
          sub: "react, @org/ui, auth",
          col: 1,
          row: 3,
          kind: "note",
        },
        {
          id: "swaA",
          label: "Static Web App A",
          sub: "remoteEntry.js",
          col: 3,
          row: 0,
          kind: "service",
        },
        {
          id: "swaB",
          label: "Static Web App B",
          sub: "remoteEntry.js",
          col: 3,
          row: 2,
          kind: "service",
        },
        {
          id: "apis",
          label: "Team APIs",
          sub: "ASP.NET Core, OpenAPI",
          col: 4,
          row: 1,
          kind: "service",
        },
      ],
      edges: [
        { from: "fd", to: "shell", label: "/" },
        { from: "shell", to: "orders", label: "loads remoteEntry.js" },
        { from: "shell", to: "billing", label: "loads remoteEntry.js" },
        { from: "orders", to: "swaA", label: "served from", style: "dashed" },
        { from: "billing", to: "swaB", label: "served from", style: "dashed" },
        { from: "shell", to: "shared", label: "shares", style: "dashed" },
        { from: "orders", to: "apis", label: "/api/orders" },
        { from: "billing", to: "apis", label: "/api/billing" },
      ],
    },
    useWhen: [
      "Three or more teams own separate business areas end to end and wait on each other to release",
      "A legacy front end is being replaced one area at a time while it stays live",
      "Different areas have very different change rates and risk profiles",
    ],
    avoidWhen: [
      "One team, or a few teams that already release together daily",
      "The backend is one API and the split would exist only in the UI",
      "Nobody can own the shell, the shared packages and the composed test environment",
    ],
    microsoftStack: [
      {
        name: "Azure Static Web Apps per remote",
        role: "Independent deployment and preview environments for each team's bundle.",
      },
      {
        name: "Azure Front Door",
        role: "One hostname with path rules to each remote's origin and each team's API.",
      },
      {
        name: "Entra ID with MSAL in the shell",
        role: "One sign-in; remotes get the account through a shared singleton.",
      },
      {
        name: "ASP.NET Core APIs per team",
        role: "Each remote ships with its own versioned, OpenAPI-documented backend.",
      },
    ],
    reactStack: [
      {
        name: "Module Federation",
        role: "Runtime loading of remotes with shared singleton `react` and `react-dom`.",
      },
      {
        name: "single-spa",
        role: "An orchestrator for mounting several apps or frameworks in one page.",
      },
      {
        name: "Web components wrapping React",
        role: "Framework-neutral isolation when teams use different stacks.",
      },
      {
        name: "Shared singleton package",
        role: "Auth, design system and an event bus that every remote consumes.",
      },
      {
        name: "Monorepo feature packages",
        role: "The build-time alternative that keeps the same ownership without the runtime cost.",
      },
    ],
    tradeoffs: [
      {
        attribute: "team-autonomy",
        effect: 2,
        note: "Teams deploy on their own cadence with their own pipeline.",
      },
      {
        attribute: "deployability",
        effect: 1,
        note: "Small independent releases, at the cost of version mixing in production.",
      },
      {
        attribute: "simplicity",
        effect: -2,
        note: "A shell, remotes, shared singletons and routing contracts replace one bundle.",
      },
      {
        attribute: "performance",
        effect: -1,
        note: "Runtime loading and duplicated code slow the first screen.",
      },
      {
        attribute: "consistency",
        effect: -2,
        note: "Design and behaviour drift between remotes unless actively policed.",
      },
      {
        attribute: "operability",
        effect: -2,
        note: "Many pipelines, origins and versions; partial outages need fallbacks.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "More infrastructure and more coordination work per feature.",
      },
      {
        attribute: "testability",
        effect: -1,
        note: "End-to-end tests need a composed environment with the real version mix.",
      },
      {
        attribute: "evolvability",
        effect: 0,
        note: "Remotes can change internally, but shared contracts are hard to change.",
      },
    ],
    related: [
      "microservices",
      "react-code-organisation",
      "api-gateway-bff",
      "coupling-and-cohesion",
    ],
    checks: [
      {
        id: "react-micro-frontends-q1",
        prompt:
          "One team of six, one ASP.NET Core API, one React app. They propose Module Federation to keep the code modular. What is the right call?",
        options: [
          "Adopt Module Federation now so the architecture scales later",
          "Use a monorepo with feature packages, lint-enforced boundaries and one deployable",
          "Split by iframe so each feature is fully isolated",
          "Use web components so a future team can pick another framework",
        ],
        answer: 1,
        explanation:
          "Modularity is a code-organisation problem that packages and boundaries solve without runtime cost. Module Federation exists for independent deployment by separate teams, which this team does not need; iframes and web components add isolation this product does not want.",
      },
      {
        id: "react-micro-frontends-q2",
        prompt:
          "After adding a second remote, hooks start throwing invalid hook call errors in production. What is the most likely cause?",
        options: [
          "The remotes use different Tailwind versions",
          "React is not configured as a shared singleton, so two copies of React are loaded",
          "The shell's router does not know the remote's routes",
          "The remote's Static Web App has no custom domain",
        ],
        answer: 1,
        explanation:
          "Two React instances in one page break hooks, which is the classic Module Federation misconfiguration. Styling, routing and domains cause different symptoms.",
      },
      {
        id: "react-micro-frontends-q3",
        prompt:
          "Where should Entra ID sign-in happen in a Module Federation app with three remotes?",
        options: [
          "In each remote, so teams stay independent",
          "Once in the shell, with the account shared through a singleton package",
          "In Azure Front Door, which forwards the user's password",
          "In the API, which sets a cookie each remote reads",
        ],
        answer: 1,
        explanation:
          "One MSAL instance in the shell avoids three redirects and three token caches. Front Door does not perform interactive sign-in, and an API-set cookie would still need a single front-end flow to obtain it.",
      },
    ],
    sources: [
      {
        title: "Module Federation documentation",
        url: "https://module-federation.io/",
      },
      {
        title: "Azure Static Web Apps documentation",
        url: "https://learn.microsoft.com/azure/static-web-apps/",
      },
      {
        title: "Azure Front Door documentation",
        url: "https://learn.microsoft.com/azure/frontdoor/",
      },
    ],
  },
  {
    id: "react-testing-strategy",
    trackId: "react",
    title: "Testing strategy",
    tagline:
      "Static checks, few unit tests, many component tests with MSW, a thin end-to-end layer.",
    level: 2,
    minutes: 7,
    summary:
      "A React testing strategy is a budget decision: where to spend effort for the most confidence per minute. The testing trophy puts static typing and lint at the base, component tests with Testing Library and MSW in the middle, and a thin set of Playwright journeys on top. This lesson covers each layer, API mocking against the OpenAPI contract, visual tests and test data.",
    sections: [
      {
        heading: "The trophy, layer by layer",
        body: "The testing pyramid was written for systems where unit tests were cheap and integration tests were slow. In a React app the opposite holds: a component test that renders a feature against a mocked API runs in milliseconds in jsdom and catches most real bugs. Hence the trophy:\n\n- **Static** (the base): TypeScript in strict mode, ESLint with `typescript-eslint` and the React hooks rules, the React Compiler's lint rule, and the generated OpenAPI types. Free at runtime, and they remove whole classes of errors.\n- **Unit**: pure functions with Vitest. Pricing rules, date maths, reducers, selectors, Zod schemas. Fast and precise, and silent about whether the screen works.\n- **Component** (the widest part): render a feature with Testing Library, intercept HTTP with MSW, interact with `user-event`, assert on what the user sees. Most tests belong here.\n- **End-to-end** (the narrow top): Playwright against a deployed environment with the real ASP.NET Core API and Entra ID. Five to twenty journeys that would be embarrassing to break: sign in, create an order, pay, export.\n\nSpend in that proportion. A suite that is mostly unit tests of component internals is slow to change and misses the bugs users hit.",
      },
      {
        heading: "Component tests with Testing Library",
        body: 'Testing Library\'s rule is to test the way a user interacts: find elements by role and accessible name, type, click, and assert on visible text. Tests written this way survive refactors (swapping a hook, moving state) and fail when behaviour changes.\n\n```tsx\nrender(<OrdersPage />, { wrapper: AppProviders });\nawait screen.findByRole("heading", { name: /open orders/i });\nawait userEvent.click(screen.getByRole("button", { name: /cancel order 1042/i }));\nexpect(await screen.findByText(/order 1042 cancelled/i)).toBeInTheDocument();\n```\n\nPractical rules:\n\n- Render with the real providers (`QueryClientProvider` with retries off, router, theme) through one `AppProviders` wrapper used by every test.\n- Query by role first, label second, test id last. A missing role is an accessibility bug the test just found.\n- Await `findBy*` for anything that arrives after a fetch; never a fixed timeout.\n- One test per behaviour, with the MSW handler overridden inside the test when the scenario needs an error or an empty list.\n\nVitest with jsdom runs these; Vitest\'s browser mode runs the same tests in a real browser when layout or CSS matter.',
      },
      {
        heading: "Mocking the API with MSW against the OpenAPI contract",
        body: 'Mock Service Worker intercepts `fetch` at the network level, so components, query factories and the generated client run unchanged. Handlers describe the API:\n\n```ts\nexport const handlers = [\n  http.get("/api/orders", () => HttpResponse.json(orderFactory.buildList(3))),\n  http.post("/api/orders/:id/cancel", () => new HttpResponse(null, { status: 204 })),\n];\n```\n\nTie the handlers to the contract so mocks cannot drift from the real API:\n\n- Build response bodies from the types generated by `openapi-typescript`, so a renamed field fails the type check in the handler.\n- Reuse the same handlers in Vitest, in Storybook (through the MSW addon) and in the dev server, so every environment lies in the same way.\n- Keep a handler set per scenario (`happyPath`, `validationError`, `serverDown`) with ProblemDetails-shaped bodies for errors, matching what `AddProblemDetails()` produces.\n\nThe contract test that closes the loop lives on the backend: an ASP.NET Core integration test with `WebApplicationFactory` that asserts the OpenAPI document and the response shapes. If that passes and the front end compiles against the generated types, the mocks are trustworthy.',
      },
      {
        heading: "End-to-end with Playwright and visual tests with Storybook",
        body: "Playwright drives real browsers against a real deployment. Keep it thin and deterministic:\n\n- Run against a dedicated test environment (a Static Web Apps preview plus a test API slot with its own database), seeded by an API call before each run.\n- Authenticate once with a test user in Entra ID, save the storage state, and reuse it across tests.\n- Test journeys rather than screens: create an order and see it in the list, rather than the orders page renders.\n- Use the trace viewer on failure; flaky tests get fixed or deleted the same week.\n\n**Visual tests** belong to the design system. Each component has stories; Storybook's test runner or its Vitest addon renders every story, runs axe for accessibility, and a visual regression service (Chromatic or a self-hosted screenshot diff) flags pixel changes for review. This catches the CSS regressions that neither Testing Library nor Playwright asserts on, and documents the component API at the same time.",
      },
      {
        heading: "What not to test, and test data",
        body: "Do not test:\n\n- Implementation details: that a hook was called, that state has a value, that a prop was passed. Test what the user sees.\n- Third-party libraries: Radix's keyboard navigation, TanStack Query's caching. Test that your integration of them works, once.\n- Styling in component tests; use visual tests.\n- Every validation message end to end; one is enough, the rest live in component tests.\n- Generated code.\n\nTest data: write small factories (`orderFactory.build({ status: \"open\" })`) with sensible defaults, backed by Faker with a fixed seed for reproducible randomness. Factories share types with the generated client, so schema changes break them loudly. For end-to-end runs, seed through the API rather than direct SQL, so the data passes the same validation users' data does, and reset between runs with a test-only endpoint or a fresh database per pipeline.",
      },
    ],
    diagram: {
      caption:
        "The trophy: static checks at the base, component tests against typed MSW handlers in the middle, a few Playwright journeys on top.",
      nodes: [
        {
          id: "static",
          label: "Static",
          sub: "TypeScript, ESLint",
          col: 1,
          row: 3,
          kind: "note",
        },
        {
          id: "unit",
          label: "Unit",
          sub: "Vitest",
          col: 1,
          row: 2,
          kind: "note",
        },
        {
          id: "component",
          label: "Component",
          sub: "Testing Library + MSW",
          col: 1,
          row: 1,
          kind: "ui",
        },
        {
          id: "e2e",
          label: "End-to-end",
          sub: "Playwright",
          col: 1,
          row: 0,
          kind: "ui",
        },
        {
          id: "msw",
          label: "MSW handlers",
          sub: "typed from OpenAPI",
          col: 2,
          row: 1,
          kind: "external",
        },
        {
          id: "openapi",
          label: "openapi.json",
          sub: "ASP.NET Core",
          col: 3,
          row: 1,
          kind: "service",
        },
        {
          id: "storybook",
          label: "Storybook",
          sub: "visual, axe, play",
          col: 0,
          row: 1,
          kind: "ui",
        },
        {
          id: "env",
          label: "Test environment",
          sub: "SWA preview + API slot",
          col: 3,
          row: 0,
          kind: "service",
        },
      ],
      edges: [
        { from: "static", to: "unit", label: "cheaper, more of them" },
        { from: "unit", to: "component" },
        { from: "component", to: "e2e", label: "fewer, more confidence" },
        { from: "component", to: "msw", label: "intercepts fetch" },
        {
          from: "openapi",
          to: "msw",
          label: "types generated from",
          style: "dashed",
        },
        { from: "e2e", to: "env", label: "real API + Entra ID" },
        {
          from: "storybook",
          to: "component",
          label: "same stories",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "Tests break on every refactor even though behaviour did not change",
      "Bugs reach users in flows the unit tests already cover",
      "The API has an OpenAPI document and the front end uses a generated client",
      "A design system is shared across apps and CSS regressions slip through",
    ],
    avoidWhen: [
      "A throwaway prototype where the only test worth writing is a smoke test",
      "The API has no stable contract yet; write component tests but hold the contract-tied mocks until it does",
    ],
    microsoftStack: [
      {
        name: "ASP.NET Core `WebApplicationFactory`",
        role: "Backend contract tests that keep the OpenAPI document and response shapes honest.",
      },
      {
        name: "Azure Static Web Apps preview environments",
        role: "A deployed front end per pull request for Playwright to run against.",
      },
      {
        name: "Entra ID test users",
        role: "Non-interactive sign-in for end-to-end runs, with saved storage state.",
      },
      {
        name: "Azure Pipelines or GitHub Actions",
        role: "Runs Vitest, Playwright and Storybook tests and publishes reports and traces.",
      },
    ],
    reactStack: [
      {
        name: "Vitest",
        role: "Unit and component test runner, with jsdom or browser mode.",
      },
      {
        name: "Testing Library + user-event",
        role: "Render and interact the way a user does; query by role and label.",
      },
      {
        name: "MSW",
        role: "Network-level API mocking shared by tests, Storybook and the dev server.",
      },
      {
        name: "Playwright",
        role: "Thin end-to-end journeys in real browsers with trace viewer.",
      },
      {
        name: "Storybook test runner and axe",
        role: "Visual, accessibility and interaction tests per story.",
      },
      {
        name: "Faker with factories",
        role: "Reproducible test data typed against the generated client.",
      },
    ],
    tradeoffs: [
      {
        attribute: "reliability",
        effect: 2,
        note: "Component tests against a contract-typed mock catch the bugs users would hit.",
      },
      {
        attribute: "testability",
        effect: 2,
        note: "One provider wrapper and one handler set make new tests cheap.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Behaviour-level tests survive refactors that implementation-level tests would fail.",
      },
      {
        attribute: "time-to-market",
        effect: 1,
        note: "Fast feedback from jsdom and typed mocks beats waiting on end-to-end runs.",
      },
      {
        attribute: "consistency",
        effect: 1,
        note: "The same MSW handlers lie the same way in tests, stories and local dev.",
      },
      {
        attribute: "simplicity",
        effect: 0,
        note: "Several tools, each with one clear job, compared with one unit framework stretched over everything.",
      },
      {
        attribute: "cost",
        effect: 0,
        note: "Playwright environments cost compute; fewer production incidents pay it back.",
      },
    ],
    related: [
      "backend-testing-strategy",
      "api-contracts-openapi",
      "cicd-and-environments",
      "react-design-systems",
    ],
    checks: [
      {
        id: "react-testing-strategy-q1",
        prompt:
          "You want to verify that clicking Cancel on an order hides the Cancel button and shows a cancelled badge. Which test is the right level?",
        options: [
          "A unit test of the `useCancelOrder` hook asserting it calls the API",
          "A component test rendering the page with MSW handling the POST and returning the cancelled order",
          "A Playwright test against production",
          "A snapshot test of the rendered HTML",
        ],
        answer: 1,
        explanation:
          "The behaviour spans the component, the mutation and the cache update, which a component test with MSW covers in milliseconds. A hook unit test misses the UI, production end-to-end is slow and unsafe for this, and snapshots assert markup rather than behaviour.",
      },
      {
        id: "react-testing-strategy-q2",
        prompt:
          "How do you stop MSW handlers from drifting away from the real API?",
        options: [
          "Record responses from production once a quarter",
          "Type the handler bodies against the types generated from the OpenAPI document",
          "Copy the handlers into the backend repository",
          "Only mock endpoints that never change",
        ],
        answer: 1,
        explanation:
          "Generated types turn a contract change into a compile error in the handlers. Recorded responses go stale between recordings, and copying handlers does not tie them to anything.",
      },
      {
        id: "react-testing-strategy-q3",
        prompt: "What should the Playwright suite contain?",
        options: [
          "Every screen in the app, rendered and screenshotted",
          "A small number of end-to-end journeys through the real API and sign-in",
          "All validation messages for every form",
          "Nothing; component tests are enough",
        ],
        answer: 1,
        explanation:
          "End-to-end tests are slow and expensive, so they cover the journeys where integration failures would be most damaging. Screens and validation messages belong to component and visual tests, and skipping end-to-end entirely leaves deployment and auth untested.",
      },
    ],
    sources: [
      {
        title: "Testing Library documentation",
        url: "https://testing-library.com/docs/",
      },
      {
        title: "Mock Service Worker documentation",
        url: "https://mswjs.io/docs",
      },
      {
        title: "Playwright documentation",
        url: "https://playwright.dev/docs/intro",
      },
    ],
  },
  {
    id: "react-design-systems",
    trackId: "react",
    title: "Design systems and styling",
    tagline:
      "Tokens first, headless behaviour second, your markup third; Storybook is the contract.",
    level: 2,
    minutes: 8,
    summary:
      "A design system is the shared vocabulary of tokens, components and patterns that keeps several screens, apps and teams looking and behaving like one product. This lesson covers building on tokens, choosing between Fluent UI, shadcn-style primitives, Radix, React Aria and MUI, picking a styling approach that survives server components, theming, and distributing the package.",
    sections: [
      {
        heading: "Tokens are the foundation",
        body: "Design tokens are the named values a product is built from: colour (`color.surface.default`), the spacing scale, the type scale, radius, shadow, motion. They live in a tool-neutral JSON file (the Design Tokens Community Group format), ideally exported from Figma, and Style Dictionary transforms them into CSS custom properties, a Tailwind theme, and if needed a .NET resource for emails or PDFs.\n\nTwo layers of tokens avoid the usual mess:\n\n- **Primitive tokens**: the palette and scales (`blue.600`, `space.4`). Never referenced by components.\n- **Semantic tokens**: the roles (`color.action.primary`, `color.text.muted`, `space.inset.md`). Components reference only these. Themes swap the semantic layer.\n\nChanging the brand, adding dark mode or meeting a contrast requirement becomes a token change rather than a component rewrite. If your organisation builds on Fluent UI, Fluent's token set is the primitive layer and you add semantic tokens on top.",
      },
      {
        heading: "Build, adopt or assemble",
        body: "Four realistic choices:\n\n- **Adopt a complete library**: Fluent UI React v9 if the product should look like Microsoft 365 or runs inside Teams and SharePoint; MUI or Mantine for a general product that wants to ship fast. Full components, theming and accessibility done. The cost is fighting the library when the design diverges, and a large dependency.\n- **Assemble on headless primitives**: Radix Primitives, React Aria Components or Base UI provide behaviour and accessibility (focus management, keyboard, ARIA) with no styling. You own the markup and CSS. More work up front, full design control, small bundles.\n- **shadcn-style**: copy generated component source into your repo (headless primitives plus Tailwind). You own the code outright and edit it freely; there is no upstream to update from, which is both the point and the maintenance cost.\n- **Build everything**: justified only for a design-led organisation with a dedicated design-system team. Accessibility alone is years of work.\n\nDecision rule: fewer than two designers and no design-system team, adopt. Brand differentiation as a product requirement, assemble on primitives. Whatever you pick, wrap it in your own `packages/ui` so apps import `@org/ui` and a library swap stays local.",
      },
      {
        heading: "Styling and the RSC constraint",
        body: '- **Tailwind CSS** (v4 configures its theme in CSS with `@theme`, which maps cleanly onto tokens): utilities in markup, no naming, tiny production CSS, works everywhere including server components. The cost is long class strings and a team convention for variants (`cva` or `tailwind-variants`).\n- **CSS Modules**: plain CSS, scoped class names, zero runtime, works in server components. The right default when the team prefers stylesheets.\n- **Runtime CSS-in-JS** (Emotion, styled-components): styles computed in the browser. It does not work inside React Server Components, because they render without a client runtime and no style injection happens, so every styled component must be a client component. Fluent UI v9 (Griffel) and MUI\'s Emotion default both fall here unless you use their zero-runtime options.\n- **Zero-runtime CSS-in-JS** (vanilla-extract, Panda CSS, StyleX, Pigment CSS): typed styles extracted at build time; RSC-compatible.\n\nIf you ship a Vite SPA, all four work and the choice is taste and team skill. If you ship the Next.js App Router, choose Tailwind, CSS Modules or a zero-runtime option, and accept that a runtime CSS-in-JS library forces `"use client"` on everything that uses it.',
      },
      {
        heading: "Theming and dark mode",
        body: 'Themes are the semantic token layer applied as CSS custom properties on a root element:\n\n```css\n:root { --color-surface: #ffffff; --color-text: #1a1a1a; }\n[data-theme="dark"] { --color-surface: #121212; --color-text: #e8e8e8; }\n```\n\nComponents only ever reference `var(--color-surface)`. Switching themes is one attribute change, with no re-render and no flash if the attribute is set before first paint (an inline script in the HTML head, or a cookie read on the server in Next.js).\n\nRules that save pain later:\n\n- Respect `prefers-color-scheme` as the default and let the user override; store the override in `localStorage` or in the user profile through the API.\n- Define dark tokens as their own set rather than inverted light values; contrast and elevation behave differently.\n- Multi-brand or multi-tenant products use the same mechanism with a `data-brand` attribute, with tenant themes loaded from the API at sign-in.\n- Test both themes in Storybook with a global toolbar switch, and run axe on both.',
      },
      {
        heading: "Storybook as the contract",
        body: "Storybook is where the design system is specified, reviewed and tested. Every component has stories for its states (default, hover, disabled, error, loading, long content, right-to-left) written in Component Story Format. The stories are:\n\n- the **documentation** designers and developers review together, published to a Static Web App per branch;\n- the **visual tests** a regression service compares;\n- the **accessibility tests** axe runs on each story;\n- the **interaction tests** (play functions) that verify keyboard and focus behaviour;\n- and, with the MSW addon, a working harness for feature components that fetch data.\n\nThe contract is simple: a change to a story's rendering is a change to the design system, and it goes through review. Treat the published Storybook as the artifact teams build against, and keep product code out of it: it documents `@org/ui` only.",
      },
      {
        heading: "Versioning and distribution",
        body: "Inside a monorepo, apps consume `packages/ui` by workspace link, and every app is always on the latest version. That is the simplest model, and it is right when one organisation's apps release together. The cost is that a breaking change in `ui` must update every app in the same pull request, which Turborepo's affected-only builds make tolerable.\n\nWhen apps live in different repositories, or teams need to upgrade on their own schedule, publish the package to a private npm feed in **Azure Artifacts**: a scoped `.npmrc` (`@org:registry=https://pkgs.dev.azure.com/...`), authentication through the Azure Artifacts credential provider or a pipeline token, and semantic versioning managed with Changesets so each pull request declares its version bump and changelog entry. Publish from the pipeline, never from a laptop.\n\nEither way: one changelog, deprecation warnings before removal, and a codemod or migration note for breaking changes. A design system that breaks consumers without notice gets forked, and then you have two.",
      },
    ],
    diagram: {
      caption:
        "Tokens become CSS variables; primitives supply behaviour; the ui package is documented in Storybook and published to Azure Artifacts.",
      nodes: [
        {
          id: "tokens",
          label: "Design tokens",
          sub: "DTCG JSON, Figma",
          col: 0,
          row: 1,
          kind: "data",
        },
        {
          id: "css",
          label: "CSS variables",
          sub: "light and dark sets",
          col: 1,
          row: 0,
          kind: "note",
        },
        {
          id: "prims",
          label: "Primitives",
          sub: "Radix / React Aria",
          col: 1,
          row: 2,
          kind: "service",
        },
        {
          id: "ui",
          label: "packages/ui",
          sub: "Button, Dialog, Table",
          col: 2,
          row: 1,
          kind: "service",
        },
        {
          id: "storybook",
          label: "Storybook",
          sub: "the contract",
          col: 3,
          row: 0,
          kind: "ui",
        },
        {
          id: "feed",
          label: "Azure Artifacts",
          sub: "private npm feed",
          col: 3,
          row: 2,
          kind: "external",
        },
        {
          id: "apps",
          label: "apps/*",
          sub: "consumers",
          col: 4,
          row: 1,
          kind: "ui",
        },
      ],
      edges: [
        { from: "tokens", to: "css", label: "Style Dictionary" },
        { from: "css", to: "ui", label: "var(--color-*)" },
        { from: "prims", to: "ui", label: "behaviour + a11y" },
        { from: "ui", to: "storybook", label: "stories per state" },
        { from: "ui", to: "feed", label: "publish @org/ui" },
        { from: "feed", to: "apps", label: "npm install" },
        {
          from: "storybook",
          to: "apps",
          label: "review against",
          style: "dashed",
        },
      ],
    },
    useWhen: [
      "More than one app or team must look and behave like one product",
      "Accessibility requirements are contractual and must be met once, centrally",
      "Designers maintain tokens in Figma and want them to flow into code",
      "A rebrand, dark mode or multi-tenant theming is on the roadmap",
    ],
    avoidWhen: [
      "One small app and one team: pick a library, wrap the handful of components you use, and stop",
      "No designer and no time to maintain stories: adopt Fluent UI or MUI as-is",
    ],
    microsoftStack: [
      {
        name: "Azure Artifacts npm feed",
        role: "Private, versioned distribution of `@org/ui` across repositories.",
      },
      {
        name: "Fluent UI React v9",
        role: "Microsoft's design language and token set for Microsoft 365, Teams and SharePoint experiences.",
      },
      {
        name: "Azure Static Web Apps",
        role: "Hosts the published Storybook per branch for review.",
      },
      {
        name: "Azure Pipelines",
        role: "Builds, tests and publishes the package with Changesets-driven versions.",
      },
    ],
    reactStack: [
      {
        name: "Style Dictionary with DTCG tokens",
        role: "Transforms one token source into CSS variables and a Tailwind theme.",
      },
      {
        name: "Radix Primitives / React Aria Components / Base UI",
        role: "Headless, accessible behaviour under your own markup.",
      },
      {
        name: "Tailwind CSS v4 or CSS Modules",
        role: "Styling that works in both client and server components.",
      },
      {
        name: "vanilla-extract / Panda CSS",
        role: "Typed, zero-runtime CSS-in-JS when the team wants styles in TypeScript.",
      },
      {
        name: "Storybook with Chromatic or the test runner",
        role: "Stories as documentation, visual and accessibility tests.",
      },
      {
        name: "Changesets",
        role: "Semantic versions and changelogs per pull request.",
      },
    ],
    tradeoffs: [
      {
        attribute: "consistency",
        effect: 2,
        note: "One token set and one component API across every app, compared with per-app styling.",
      },
      {
        attribute: "evolvability",
        effect: 2,
        note: "Rebrands and theme changes are token edits; library swaps stay inside `packages/ui`.",
      },
      {
        attribute: "testability",
        effect: 1,
        note: "Stories double as visual, accessibility and interaction tests.",
      },
      {
        attribute: "reliability",
        effect: 1,
        note: "Accessibility and keyboard behaviour are solved once, in the primitives.",
      },
      {
        attribute: "team-autonomy",
        effect: 1,
        note: "Feature teams compose from the system without re-deciding styling.",
      },
      {
        attribute: "time-to-market",
        effect: -1,
        note: "The first components and the token pipeline cost weeks before the first app benefits.",
      },
      {
        attribute: "simplicity",
        effect: -1,
        note: "A package, a build pipeline and a release process where a single app had none.",
      },
      {
        attribute: "cost",
        effect: -1,
        note: "Someone must own the system; it is a product with consumers.",
      },
    ],
    related: [
      "react-component-architecture",
      "react-code-organisation",
      "react-testing-strategy",
    ],
    checks: [
      {
        id: "react-design-systems-q1",
        prompt:
          'A team moving a design system to the Next.js App Router finds every component now needs `"use client"`. What is the likely cause and the fix?',
        options: [
          "Tailwind is not supported in server components; switch to CSS Modules",
          "The components use runtime CSS-in-JS (styled-components or Emotion); move to Tailwind, CSS Modules or a zero-runtime option",
          "Server components cannot render styled markup at all; keep the whole app as client components",
          "Radix Primitives force client components; replace them with MUI",
        ],
        answer: 1,
        explanation:
          "Runtime CSS-in-JS injects styles in the browser and cannot run in server components, which is why every styled component drags in the client boundary. Tailwind and CSS Modules work fine on the server, and interactive primitives are expected to be client components regardless.",
      },
      {
        id: "react-design-systems-q2",
        prompt:
          "Dark mode was implemented by inverting every light colour. Users complain cards are unreadable. What is the right correction?",
        options: [
          "Lower the contrast of all text in dark mode",
          "Define a separate semantic token set for dark mode with its own surface, elevation and contrast values",
          "Swap the primitive palette for a darker one",
          "Disable dark mode on cards",
        ],
        answer: 1,
        explanation:
          "Dark themes need their own semantic values because elevation and contrast behave differently on dark surfaces; inversion is a shortcut that fails exactly here. Changing primitives or lowering contrast moves the problem instead of solving it.",
      },
      {
        id: "react-design-systems-q3",
        prompt:
          "Two teams in separate repositories consume the design system and need to upgrade at different times. How should it be distributed?",
        options: [
          "A git submodule pointing at the ui folder",
          "A versioned package published to an Azure Artifacts npm feed with semantic versioning",
          "A workspace link, by merging both repositories into the monorepo",
          "Copying the built CSS and components into each repository",
        ],
        answer: 1,
        explanation:
          "A private npm feed lets each consumer pin a version and upgrade deliberately. Submodules and copies have no versioning story, and a forced monorepo merge is a large organisational change for a distribution problem.",
      },
    ],
    sources: [
      {
        title: "Azure Artifacts documentation",
        url: "https://learn.microsoft.com/azure/devops/artifacts/",
      },
      { title: "Fluent UI React", url: "https://react.fluentui.dev/" },
      {
        title: "Storybook documentation",
        url: "https://storybook.js.org/docs",
      },
    ],
  },
];
