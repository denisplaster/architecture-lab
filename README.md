# Architecture Lab

An interactive program for learning software architecture by situation: which
shape fits which problem, and why. Phase 1 covers the Microsoft stack (.NET,
ASP.NET Core, EF Core, Azure, SQL Server, Entra ID) and React.

## What is in it

| Mode         | What you do                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Learn**    | 46 lessons in 7 tracks. Each one: what it is, a diagram, when to reach for it, when not, Microsoft-stack and React realisations, trade-offs, quick checks, sources. |
| **Decide**   | 18 scenarios with concrete teams, numbers and deadlines. Pick an option per decision and get scored feedback that explains what fits _this_ situation.              |
| **Drill**    | 130 flashcards on a Leitner spaced-repetition schedule, scoped to all tracks or one.                                                                                |
| **Advise**   | 4 advisors. Answer questions about your own project; options are ranked live with the reasons.                                                                      |
| **Compare**  | Up to three options side by side on the same twelve quality attributes.                                                                                             |
| **Progress** | Completion per track, mastered cards, streak, and the lessons and scenarios worth another look.                                                                     |

Progress is stored in the browser (`localStorage`). There is no backend.

## Workshops

Teacher-led, hands-on classes that sit alongside the self-paced app. Each one lives
in `workshops/` with its tested reference solution, and its page is built into
`public/workshops/`, so the site serves it next to the app.

| Workshop                                                                                                                                 | Length | Page                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------- |
| [Scaffold, Clean, Structure](workshops/01-scaffold-clean-structure/README.md): templates to small and large structures in .NET and React | 45 min | `workshops/scaffold-clean-structure.html` |

## Run it

```bash
npm install
npm run dev          # http://localhost:5189
```

```bash
npm test             # vitest: logic + content validation
npm run typecheck
npm run lint
npm run build:single # dist/arch-lab.html, one self-contained file
npm run build:workshops # regenerate the workshop pages in public/workshops/
```

## Deploying

- **GitHub Pages**: `.github/workflows/pages.yml` tests, builds and publishes
  `dist/` on every push to `main`, or on demand from the Actions tab. The
  first run enables Pages for the repository. Relative asset paths and hash
  routing mean no base-path or rewrite configuration is needed.
- **Vercel**: import the repository at vercel.com/new; `vercel.json` names the
  framework and the rest is detected. `.github/workflows/vercel.yml` deploys
  from Actions instead when the `VERCEL_TOKEN`, `VERCEL_ORG_ID` and
  `VERCEL_PROJECT_ID` secrets exist; without them it skips.

## How it is built

- React 19, TypeScript, Vite, Tailwind 4, Zustand (persisted). No router
  library: `src/lib/router.ts` is a typed hash router so the build works from a
  static host, a file path, or a single inlined HTML file.
- All content is typed data under `src/content/`. The schema is
  `src/content/types.ts`; `src/content/content.test.ts` validates every id
  reference, diagram, scenario rubric and advisor model, so a content mistake
  fails the test run instead of surfacing as a broken page.
- Diagrams are declarative (`nodes` on a grid plus `edges`) and rendered by
  `src/components/diagram/Diagram.tsx`, so every lesson's picture is consistent
  and theme-aware.
- Scoring and scheduling are pure functions in `src/lib/` with unit tests.

## Adding content

1. Add the lesson id to a track in `src/content/tracks.ts`.
2. Add the lesson object to the matching file in `src/content/lessons/`
   (follow `lessons/_example.ts`).
3. Add two or more flashcards in `src/content/flashcards.ts`.
4. Run the tests. They tell you about anything that does not resolve.

A new stack (Java, Go, Node) is a new set of tracks and lessons; no component
changes are needed.
