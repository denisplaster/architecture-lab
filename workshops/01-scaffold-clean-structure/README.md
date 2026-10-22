# Workshop 01: Scaffold, Clean, Structure

A 45-minute, teacher-led, hands-on class. Students create an ASP.NET Core Web API
and a React (Vite) app from the official templates, decide what each template file
is for, remove the samples, and then organize the same code twice: once for a
small project and once for a large one.

## Open the lesson

- **Deployed site:** `workshops/scaffold-clean-structure.html` under the site root,
  for example https://denisplaster.github.io/architecture-lab/workshops/scaffold-clean-structure.html
  once GitHub Pages is enabled.
- **Locally:** `npm run dev`, then http://localhost:5189/workshops/scaffold-clean-structure.html.
  Or open `public/workshops/scaffold-clean-structure.html` straight from disk.

The page has a **Track** switch (Full stack, React only, .NET only), a **Shell**
switch (PowerShell, macOS/Linux), **Teacher notes** (talking points, answers, a
before-class checklist, what to cut when behind) and a class clock. Add `#teacher`
to the URL to open it with teacher notes on.

## What is in this folder

| Path                                | What it is                                                           |
| ----------------------------------- | -------------------------------------------------------------------- |
| `solution/clean`                    | The repository after the cleanup segment: the `main` branch in class |
| `solution/small`                    | After the small-project structure: the `small` branch                |
| `solution/large`                    | After the large-project structure: the `large` branch                |
| `content.mjs`                       | Lesson text, timings, tour quiz, folder trees, exit ticket           |
| `build.mjs`, `styles.css`, `app.js` | Render the page                                                      |

Each snapshot is a complete project. Use them to catch up a student who falls
behind, to show the finished state, or to compare the two structures:

```bash
git diff --no-index --stat workshops/01-scaffold-clean-structure/solution/small workshops/01-scaffold-clean-structure/solution/large
```

Run one in place (build output and `node_modules` are ignored by the snapshot's own `.gitignore`):

```bash
cd workshops/01-scaffold-clean-structure/solution/large
dotnet build && dotnet test
cd src/web && npm install && npm run build
```

## Changing the lesson

1. Edit `content.mjs` for text, or the files under `solution/` for code. The code
   shown on the page is read from `solution/`, so change it there and check that the
   snapshot still builds.
2. Run `npm run build:workshops` to regenerate `public/workshops/scaffold-clean-structure.html`.
3. Commit both.

## How it was verified (October 2026)

Every step was run in order from an empty folder on the .NET 10.0.113 SDK,
Node.js 22, create-vite 9.3.1 (Vite 8.3, React 19.3, TypeScript 6.0) and
PowerShell 7.6.

- At every stage `dotnet build` reported 0 warnings and 0 errors, and `npm run build`
  and `npm run lint` passed.
- `dotnet test` passed on the large structure.
- With the API and the Vite dev server running, the React page listed the courses
  through the `/api` proxy, in both the small and the large structure.
- The PowerShell variants (`mkdir a, b`, `rmdir`, `Remove-Item`, and npm's PowerShell
  shim keeping `--`) were run under PowerShell 7.6.
- Referencing Infrastructure from Application fails the build with CS0234; the
  teacher notes use this as a live demo of an enforced boundary.

Templates change. If a newer SDK or create-vite produces different files, rerun the
steps, update `solution/`, and update the tour list in `content.mjs`.
