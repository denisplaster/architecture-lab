// Lesson content. Every code file is read from solution/, the reference
// repository that was built, linted, tested and run end to end at each stage.
// Prose uses `code` and **bold** only.
import { readFileSync } from "node:fs";
import path from "node:path";

export function buildContent(solutionDir) {
  const f = (stage, p) =>
    readFileSync(path.join(solutionDir, stage, p), "utf8").replace(/\n$/, "");
  const API = "src/ClassroomApp.Api";
  const WEB = "src/web/src";

  const readme = {
    full: f("clean", "README.md"),
    react: [
      "# Classroom App",
      "",
      "A React front end built with Vite and TypeScript.",
      "",
      "| Folder    | What it is                   | Run it                          |",
      "| --------- | ---------------------------- | ------------------------------- |",
      "| `src/web` | React + TypeScript with Vite | `cd src/web` then `npm run dev` |",
      "",
      "The dev server runs on http://localhost:5173 and forwards every `/api`",
      "request to an API on http://localhost:5080.",
    ].join("\n"),
    dotnet: [
      "# Classroom App",
      "",
      "An ASP.NET Core Web API on .NET 10.",
      "",
      "| Folder                 | What it is                    | Run it                                      |",
      "| ---------------------- | ----------------------------- | ------------------------------------------- |",
      "| `src/ClassroomApp.Api` | ASP.NET Core Web API, .NET 10 | `dotnet run --project src/ClassroomApp.Api` |",
      "",
      "The API listens on http://localhost:5080.",
    ].join("\n"),
  };

  const tracks = {
    full: { label: "Full stack", minutes: [3, 7, 8, 6, 9, 9, 3] },
    react: { label: "React only", minutes: [3, 5, 7, 6, 9, 9, 6] },
    dotnet: { label: ".NET only", minutes: [3, 5, 7, 6, 9, 10, 5] },
  };

  const L = (t, extra = {}) => ({ t, ...extra });

  const segments = [
    {
      id: "why",
      title: "Why structure matters",
      intro:
        "A template gets you a running app in seconds. It is a demo, not a design. Today you create a project from the official templates, read what they give you, remove what you don't need, and then organize the same code twice: once for a small project and once for a large one.",
      goals: [
        {
          variants: {
            full: "Create an ASP.NET Core Web API and a React app from the terminal, in one Git repository.",
            react:
              "Create a React app with Vite from the terminal, in a Git repository.",
            dotnet:
              "Create an ASP.NET Core Web API from the terminal, in a Git repository.",
          },
        },
        {
          text: "Explain what each template file does, and decide whether to keep it, change it or delete it.",
        },
        {
          text: "Organize the same code for a small project and a large one, and say when to switch.",
        },
      ],
      teacher: {
        say: [
          "A template gets you a running app in seconds. It is a demo, not an architecture.",
          "Today we go from template to a structure we would ship, twice: once small, once large.",
        ],
        ask: "You join a team and the repo has 200 files in one folder called `components`. Where is the code for enrolling a student? Take two answers, then move on.",
        watch: [
          "Anyone missing a tool pairs with a neighbour now, not at minute ten.",
        ],
      },
    },
    {
      id: "create",
      title: "Create the project",
      intro:
        "Make one folder for the whole repository, then let the templates fill it. Use the copy buttons: every command on this page has been run and tested.",
      steps: [
        {
          id: "tools",
          title: "Check your tools",
          text: "Each command prints a version number. You need .NET 10, Node.js 20.19 or newer, and Git.",
          cmds: [
            {
              lines: [
                L("dotnet --version", { stack: "dotnet" }),
                L("node --version", { stack: "react" }),
                L("git --version"),
              ],
            },
          ],
        },
        {
          id: "folder",
          title: "Create the repository folder",
          text: "`git init -b main` starts a Git repository whose first branch is called `main`.",
          cmds: [
            {
              lines: [
                L("mkdir classroom-app"),
                L("cd classroom-app"),
                L("git init -b main"),
              ],
            },
          ],
        },
        {
          id: "dotnet-new",
          stack: "dotnet",
          title: "Create the API and a solution",
          text: "`-n` names the project and `-o` says which folder it goes in. In .NET 10, `dotnet new sln` creates a `.slnx` file, the new XML solution format.",
          cmds: [
            {
              lines: [
                L("dotnet new gitignore"),
                L("dotnet new sln -n ClassroomApp"),
                L(
                  "dotnet new webapi -n ClassroomApp.Api -o src/ClassroomApp.Api",
                ),
                L("dotnet sln add src/ClassroomApp.Api"),
              ],
            },
          ],
        },
        {
          id: "vite-new",
          stack: "react",
          title: "Create the React app",
          text: "If npm asks `Ok to proceed? (y)`, press Enter. The flags answer Vite's questions for you: `--template react-ts` picks React with TypeScript, `--no-eslint` keeps the default linter (Oxlint), and `--no-immediate` stops it from starting the dev server before we look inside.",
          cmds: [
            {
              lines: [
                L(
                  "npm create vite@latest src/web -- --template react-ts --no-eslint --no-immediate",
                ),
                L("cd src/web"),
                L("npm install"),
                L("cd ../.."),
              ],
            },
          ],
        },
        {
          id: "open",
          title: "Open it and save a first commit",
          text: "`code .` opens the folder in VS Code. The first commit is your safety net: you can always get back to the untouched template.",
          cmds: [
            {
              lines: [
                L("code ."),
                L("git add -A"),
                L('git commit -m "Scaffold from templates"'),
              ],
            },
          ],
        },
      ],
      teacher: {
        say: [
          "Every command works the same in PowerShell and in a macOS or Linux terminal, except creating and deleting folders. Pick your shell at the top of the page.",
          "`-n` is the name, `-o` is the folder. The Vite flags answer its questions so the whole class stays in step.",
        ],
        watch: [
          "`dotnet --version` below 10: `dotnet new sln` makes `ClassroomApp.sln` instead of `.slnx`. Everything else still works.",
          "npm asks `Ok to proceed? (y)`: press Enter.",
          "PowerShell says running scripts is disabled: see Troubleshooting at the bottom.",
        ],
        ifBehind:
          "Start the tour while `npm install` runs. It takes about 30 seconds on a good connection.",
      },
    },
    {
      id: "tour",
      title: "Tour the template",
      intro:
        "Templates add two kinds of files: the ones every project needs, and samples that prove the template works. For each file, decide what you would do with it, then check your answers.",
      tour: true,
      teacher: {
        say: [
          "Our job is to tell the needed files from the samples.",
          "`launchSettings.json` is local only; `appsettings.json` ships everywhere. `package-lock.json` gets committed; `node_modules`, `bin` and `obj` never do.",
        ],
        ask: "Which of these files would break the app if you deleted it? (`Program.cs`, the `.csproj`, `index.html`, `main.tsx`, `package.json`.)",
        ifBehind:
          "Cover only `Program.cs`, `launchSettings.json`, `App.tsx` and `vite.config.ts`. Students read the rest after class.",
      },
    },
    {
      id: "clean",
      title: "Remove what you don't need",
      intro:
        "Delete the samples, then replace the demo code with the smallest thing that still runs.",
      steps: [
        {
          id: "clean-delete",
          stack: "react",
          title: "Delete the demo files",
          text: "`git rm` deletes the files and records the delete in Git, and it is the same command in every shell.",
          cmds: [
            {
              lines: [
                L(
                  "git rm -r src/web/src/assets src/web/src/App.css src/web/public/icons.svg src/web/README.md",
                ),
              ],
            },
          ],
        },
        {
          id: "clean-api",
          stack: "dotnet",
          title: "Strip the API down",
          text: "Remove the WeatherForecast sample from `Program.cs`, point the `.http` file at the new endpoint, and pin the port to 5080 so everyone's matches.",
          files: [
            {
              path: `${API}/Program.cs`,
              kind: "replace",
              code: f("clean", `${API}/Program.cs`),
            },
            {
              path: `${API}/ClassroomApp.Api.http`,
              kind: "replace",
              code: f("clean", `${API}/ClassroomApp.Api.http`),
            },
            {
              path: `${API}/Properties/launchSettings.json`,
              kind: "replace",
              code: f("clean", `${API}/Properties/launchSettings.json`),
            },
          ],
        },
        {
          id: "clean-web",
          stack: "react",
          title: "Strip the React app down",
          text: "Replace the demo page and its styles. The `proxy` line forwards every `/api` request from the dev server to the API on port 5080.",
          files: [
            {
              path: `${WEB}/App.tsx`,
              kind: "replace",
              code: f("clean", `${WEB}/App.tsx`),
            },
            {
              path: `${WEB}/index.css`,
              kind: "replace",
              code: f("clean", `${WEB}/index.css`),
            },
            {
              path: "src/web/vite.config.ts",
              kind: "replace",
              code: f("clean", "src/web/vite.config.ts"),
            },
            {
              path: "src/web/index.html",
              kind: "edit",
              find: "    <title>web</title>",
              replace: "    <title>Classroom</title>",
            },
          ],
        },
        {
          id: "clean-readme",
          title: "Write your own README",
          text: "The repository's front page. One table that says what is where and how to run it.",
          files: [{ path: "README.md", kind: "new", variants: readme }],
        },
        {
          id: "clean-check",
          title: "Check that it still builds, then commit",
          text: "Expected: `Build succeeded` from .NET and `built in` from Vite. A passing build is the checkpoint for every step from here on.",
          textVariants: {
            react:
              "Expected: Vite prints `built in`. A passing build is the checkpoint for every step from here on.",
            dotnet:
              "Expected: `Build succeeded`. A passing build is the checkpoint for every step from here on.",
          },
          cmds: [
            {
              lines: [
                L("dotnet build", { stack: "dotnet" }),
                L("cd src/web", { stack: "react" }),
                L("npm run build", { stack: "react" }),
                L("cd ../..", { stack: "react" }),
                L("git add -A"),
                L('git commit -m "Remove template samples"'),
              ],
            },
          ],
        },
      ],
      teacher: {
        say: [
          "Delete with `git rm`, not the file explorer: Git records the delete, and the command is identical in every shell.",
          "We pin the API to port 5080 so the React dev server knows where to send `/api` calls.",
        ],
        watch: [
          "Unsaved files in VS Code (a dot on the tab) cause confusing build results. Turn on File, Auto Save.",
          "Both builds must pass before the commit.",
        ],
      },
    },
    {
      id: "small",
      title: "Structure for a small project",
      intro:
        "One project and one app. Inside each, one folder per kind of code. Anyone can find a file by asking what kind of thing it is.",
      concept: "small",
      steps: [
        {
          id: "small-branch",
          title: "Start a branch",
          text: "Each structure gets its own branch, so you can compare them at the end.",
          cmds: [{ lines: [L("git switch -c small")] }],
        },
        {
          id: "small-api-folders",
          stack: "dotnet",
          title: "Make the API folders",
          cmds: [
            {
              lines: [
                L(
                  "mkdir src/ClassroomApp.Api/Models, src/ClassroomApp.Api/Data, src/ClassroomApp.Api/Endpoints",
                  { shell: "ps" },
                ),
                L(
                  "mkdir src/ClassroomApp.Api/Models src/ClassroomApp.Api/Data src/ClassroomApp.Api/Endpoints",
                  { shell: "sh" },
                ),
              ],
            },
          ],
        },
        {
          id: "small-api-files",
          stack: "dotnet",
          title: "Add the course code to the API",
          text: "A model, a data store, and an endpoint file. `Program.cs` now only registers the store and maps the endpoints.",
          files: [
            {
              path: `${API}/Models/Course.cs`,
              kind: "new",
              code: f("small", `${API}/Models/Course.cs`),
            },
            {
              path: `${API}/Data/CourseStore.cs`,
              kind: "new",
              code: f("small", `${API}/Data/CourseStore.cs`),
            },
            {
              path: `${API}/Endpoints/CourseEndpoints.cs`,
              kind: "new",
              code: f("small", `${API}/Endpoints/CourseEndpoints.cs`),
            },
            {
              path: `${API}/Program.cs`,
              kind: "replace",
              code: f("small", `${API}/Program.cs`),
            },
            {
              path: `${API}/ClassroomApp.Api.http`,
              kind: "replace",
              code: f("small", `${API}/ClassroomApp.Api.http`),
            },
          ],
        },
        {
          id: "small-web-folders",
          stack: "react",
          title: "Make the React folders",
          cmds: [
            {
              lines: [
                L("cd src/web/src"),
                L("mkdir components, pages, hooks, lib, types", {
                  shell: "ps",
                }),
                L("mkdir components pages hooks lib types", { shell: "sh" }),
                L("cd ../../.."),
              ],
            },
          ],
        },
        {
          id: "small-web-files",
          stack: "react",
          title: "Add the course code to the React app",
          text: "In VS Code, typing a path such as `types/course.ts` in the New File box creates the file in that folder. The template turns on `verbatimModuleSyntax`, so type-only imports must say `import type`.",
          files: [
            {
              path: `${WEB}/types/course.ts`,
              kind: "new",
              code: f("small", `${WEB}/types/course.ts`),
            },
            {
              path: `${WEB}/lib/api.ts`,
              kind: "new",
              code: f("small", `${WEB}/lib/api.ts`),
            },
            {
              path: `${WEB}/hooks/useCourses.ts`,
              kind: "new",
              code: f("small", `${WEB}/hooks/useCourses.ts`),
            },
            {
              path: `${WEB}/components/CourseCard.tsx`,
              kind: "new",
              code: f("small", `${WEB}/components/CourseCard.tsx`),
            },
            {
              path: `${WEB}/pages/CoursesPage.tsx`,
              kind: "new",
              code: f("small", `${WEB}/pages/CoursesPage.tsx`),
            },
            {
              path: `${WEB}/App.tsx`,
              kind: "replace",
              code: f("small", `${WEB}/App.tsx`),
            },
          ],
        },
        {
          id: "small-run",
          title: "Run it",
          text: "Start the API in one terminal and the React dev server in a second one. Open http://localhost:5173: you should see two courses. Stop both with Ctrl+C when you're done.",
          textVariants: {
            react:
              "Open http://localhost:5173. The page says `Could not load courses: 502 Bad Gateway`. That is correct: there is no API yet, and you are looking at the page's error state. Stop the server with Ctrl+C.",
            dotnet:
              "Open http://localhost:5080/api/courses in a browser, or click Send request above `GET /api/courses` in the `.http` file. Stop the API with Ctrl+C.",
          },
          cmds: [
            {
              label: "Terminal 1",
              stack: "dotnet",
              lines: [L("dotnet run --project src/ClassroomApp.Api")],
            },
            {
              label: "Terminal 2",
              labelVariants: { react: "Terminal" },
              stack: "react",
              lines: [L("cd src/web"), L("npm run dev")],
            },
          ],
          note: {
            stack: "dotnet",
            text: "The API logs `Failed to determine the https port for redirect`. That warning is expected on the http profile.",
          },
        },
        {
          id: "small-commit",
          title: "Commit the small structure",
          cmds: [
            {
              lines: [
                L("git add -A"),
                L('git commit -m "Small project structure"'),
              ],
            },
          ],
        },
      ],
      teacher: {
        say: [
          "Small-project rule: one project, one app, one folder per kind of code. You find a file by asking what kind of thing it is.",
          "`Program.cs` only wires things up. The endpoint lives in `Endpoints/`, the data access in `Data/`.",
          "Follow the React imports on screen: pages use hooks and components, hooks use lib, everything uses types. Nothing points back up.",
        ],
        watch: [
          "TypeScript error `'Course' is a type and must be imported using a type-only import`: the import needs `import type`.",
          "`502 Bad Gateway` on the page means the API is not running.",
        ],
      },
    },
    {
      id: "large",
      title: "Structure for a large project",
      intro:
        "Organize by feature and make the boundaries real. In .NET the boundaries are separate projects, and the compiler enforces which project may reference which. In React they are feature folders with one public entry file.",
      introVariants: {
        react:
          "Organize by feature and make the boundaries real. Each feature gets a folder with everything it needs and one public entry file; shared code moves into its own folder.",
        dotnet:
          "Organize by feature and make the boundaries real. The boundaries become separate projects, and the compiler enforces which project may reference which.",
      },
      concept: "large",
      steps: [
        {
          id: "large-branch",
          title: "Start a branch from small",
          text: "This branch starts from `small`: you are restructuring a project that grew, which is how it happens on real teams.",
          cmds: [{ lines: [L("git switch -c large")] }],
        },
        {
          id: "large-web-folders",
          stack: "react",
          title: "Make the feature folders",
          cmds: [
            {
              lines: [
                L("cd src/web/src"),
                L(
                  "mkdir app, features/courses/api, features/courses/components, features/courses/hooks, features/courses/pages, shared/lib, shared/ui",
                  { shell: "ps" },
                ),
                L(
                  "mkdir -p app features/courses/api features/courses/components features/courses/hooks features/courses/pages shared/lib shared/ui",
                  { shell: "sh" },
                ),
              ],
            },
          ],
        },
        {
          id: "large-web-move",
          stack: "react",
          title: "Move each file to its new home",
          text: "`git mv` keeps each file's history. It leaves the old folders behind empty, so remove them. Git doesn't store empty folders, which is why `shared/ui` won't appear in a commit until it holds a component.",
          cmds: [
            {
              lines: [
                L("git mv App.tsx app/App.tsx"),
                L(
                  "git mv components/CourseCard.tsx features/courses/components/CourseCard.tsx",
                ),
                L(
                  "git mv hooks/useCourses.ts features/courses/hooks/useCourses.ts",
                ),
                L(
                  "git mv pages/CoursesPage.tsx features/courses/pages/CoursesPage.tsx",
                ),
                L("git mv types/course.ts features/courses/types.ts"),
                L("git mv lib/api.ts shared/lib/http.ts"),
                L("rmdir components, hooks, lib, pages, types", {
                  shell: "ps",
                }),
                L("rmdir components hooks lib pages types", { shell: "sh" }),
                L("cd ../../.."),
              ],
            },
          ],
        },
        {
          id: "large-web-files",
          stack: "react",
          title: "Fix the imports",
          text: "`CoursesPage.tsx` moved without a single change, because its imports point inside its own feature. Everything else gets a new import path, and the feature gets an `index.ts` that is its public API.",
          files: [
            {
              path: `${WEB}/features/courses/api/getCourses.ts`,
              kind: "new",
              code: f("large", `${WEB}/features/courses/api/getCourses.ts`),
            },
            {
              path: `${WEB}/features/courses/hooks/useCourses.ts`,
              kind: "replace",
              code: f("large", `${WEB}/features/courses/hooks/useCourses.ts`),
            },
            {
              path: `${WEB}/features/courses/components/CourseCard.tsx`,
              kind: "replace",
              code: f(
                "large",
                `${WEB}/features/courses/components/CourseCard.tsx`,
              ),
            },
            {
              path: `${WEB}/features/courses/index.ts`,
              kind: "new",
              code: f("large", `${WEB}/features/courses/index.ts`),
            },
            {
              path: `${WEB}/app/App.tsx`,
              kind: "replace",
              code: f("large", `${WEB}/app/App.tsx`),
            },
            {
              path: `${WEB}/main.tsx`,
              kind: "edit",
              find: "import App from './App.tsx'",
              replace: "import App from './app/App.tsx'",
            },
          ],
        },
        {
          id: "large-api-projects",
          stack: "dotnet",
          title: "Add the projects and their references",
          text: "Three class libraries and a test project. The `reference` lines are the architecture: they decide which project may use which.",
          cmds: [
            {
              lines: [
                L(
                  "dotnet new classlib -n ClassroomApp.Domain -o src/ClassroomApp.Domain",
                ),
                L(
                  "dotnet new classlib -n ClassroomApp.Application -o src/ClassroomApp.Application",
                ),
                L(
                  "dotnet new classlib -n ClassroomApp.Infrastructure -o src/ClassroomApp.Infrastructure",
                ),
                L(
                  "dotnet new xunit -n ClassroomApp.UnitTests -o tests/ClassroomApp.UnitTests",
                ),
                L(
                  "dotnet sln add src/ClassroomApp.Domain src/ClassroomApp.Application src/ClassroomApp.Infrastructure tests/ClassroomApp.UnitTests",
                ),
                L(
                  "dotnet add src/ClassroomApp.Application reference src/ClassroomApp.Domain",
                ),
                L(
                  "dotnet add src/ClassroomApp.Infrastructure reference src/ClassroomApp.Application",
                ),
                L(
                  "dotnet add src/ClassroomApp.Api reference src/ClassroomApp.Application src/ClassroomApp.Infrastructure",
                ),
                L(
                  "dotnet add tests/ClassroomApp.UnitTests reference src/ClassroomApp.Application",
                ),
              ],
            },
          ],
        },
        {
          id: "large-api-move",
          stack: "dotnet",
          title: "Delete the samples and move the files",
          text: "Every new project arrives with a sample file (`Class1.cs`, `UnitTest1.cs`). Same habit as before: delete samples. Then move the model into Domain and the store into Infrastructure.",
          cmds: [
            {
              lines: [
                L(
                  "Remove-Item src/ClassroomApp.Domain/Class1.cs, src/ClassroomApp.Application/Class1.cs, src/ClassroomApp.Infrastructure/Class1.cs, tests/ClassroomApp.UnitTests/UnitTest1.cs",
                  { shell: "ps" },
                ),
                L(
                  "rm src/ClassroomApp.Domain/Class1.cs src/ClassroomApp.Application/Class1.cs src/ClassroomApp.Infrastructure/Class1.cs tests/ClassroomApp.UnitTests/UnitTest1.cs",
                  { shell: "sh" },
                ),
                L(
                  "mkdir src/ClassroomApp.Domain/Courses, src/ClassroomApp.Application/Courses, src/ClassroomApp.Infrastructure/Courses",
                  { shell: "ps" },
                ),
                L(
                  "mkdir src/ClassroomApp.Domain/Courses src/ClassroomApp.Application/Courses src/ClassroomApp.Infrastructure/Courses",
                  { shell: "sh" },
                ),
                L(
                  "git mv src/ClassroomApp.Api/Models/Course.cs src/ClassroomApp.Domain/Courses/Course.cs",
                ),
                L(
                  "git mv src/ClassroomApp.Api/Data/CourseStore.cs src/ClassroomApp.Infrastructure/Courses/InMemoryCourseRepository.cs",
                ),
                L(
                  "rmdir src/ClassroomApp.Api/Models, src/ClassroomApp.Api/Data",
                  { shell: "ps" },
                ),
                L(
                  "rmdir src/ClassroomApp.Api/Models src/ClassroomApp.Api/Data",
                  { shell: "sh" },
                ),
              ],
            },
          ],
        },
        {
          id: "large-api-files",
          stack: "dotnet",
          title: "Give each layer its code",
          text: "Application declares what it needs (`ICourseRepository`) and Infrastructure provides it. `Program.cs` is the one place that connects the two. The test checks the use case with a fake, with no database and no web server.",
          files: [
            {
              path: "src/ClassroomApp.Domain/Courses/Course.cs",
              kind: "replace",
              code: f("large", "src/ClassroomApp.Domain/Courses/Course.cs"),
            },
            {
              path: "src/ClassroomApp.Application/Courses/ICourseRepository.cs",
              kind: "new",
              code: f(
                "large",
                "src/ClassroomApp.Application/Courses/ICourseRepository.cs",
              ),
            },
            {
              path: "src/ClassroomApp.Application/Courses/GetCourses.cs",
              kind: "new",
              code: f(
                "large",
                "src/ClassroomApp.Application/Courses/GetCourses.cs",
              ),
            },
            {
              path: "src/ClassroomApp.Infrastructure/Courses/InMemoryCourseRepository.cs",
              kind: "replace",
              code: f(
                "large",
                "src/ClassroomApp.Infrastructure/Courses/InMemoryCourseRepository.cs",
              ),
            },
            {
              path: `${API}/Endpoints/CourseEndpoints.cs`,
              kind: "replace",
              code: f("large", `${API}/Endpoints/CourseEndpoints.cs`),
            },
            {
              path: `${API}/Program.cs`,
              kind: "replace",
              code: f("large", `${API}/Program.cs`),
            },
            {
              path: "tests/ClassroomApp.UnitTests/GetCoursesTests.cs",
              kind: "new",
              code: f(
                "large",
                "tests/ClassroomApp.UnitTests/GetCoursesTests.cs",
              ),
            },
          ],
        },
        {
          id: "large-check",
          title: "Check, then commit",
          text: "Expected: `Build succeeded`, one test passed, and Vite's `built in`. Run the app again if you like: it looks exactly the same, which is the point.",
          textVariants: {
            react:
              "Expected: Vite's `built in`. Run the app again if you like: it looks exactly the same, which is the point.",
            dotnet:
              "Expected: `Build succeeded` and one test passed. Run the API again if you like: it answers exactly the same, which is the point.",
          },
          cmds: [
            {
              lines: [
                L("dotnet build", { stack: "dotnet" }),
                L("dotnet test", { stack: "dotnet" }),
                L("cd src/web", { stack: "react" }),
                L("npm run build", { stack: "react" }),
                L("cd ../..", { stack: "react" }),
                L("git add -A"),
                L('git commit -m "Large project structure"'),
              ],
            },
          ],
        },
      ],
      teacher: {
        say: [
          "Large-project rule: organize by feature and make the boundaries real.",
          "Live demo for .NET: add `using ClassroomApp.Infrastructure.Courses;` to the top of `GetCourses.cs` and build. The compiler refuses with CS0234, because Application doesn't reference Infrastructure. The boundary is enforced, not just agreed.",
          "In React nothing stops a deep import yet. Real projects add a lint rule so the boundary survives new teammates.",
        ],
        point:
          "`CoursesPage.tsx` moved without changing a line, and the unit test runs without a server or a database. Those two facts are the payoff of the large structure.",
        watch: [
          "`git mv` reports that the destination directory does not exist: the folder step was skipped.",
          "A blank page or a build error about `./App.tsx`: `main.tsx` still has the old import.",
        ],
        ifBehind:
          "Students do the React half while you demo the .NET half on the projector. The .NET commands become homework, since they are all on this page.",
      },
    },
    {
      id: "wrap",
      title: "Compare and decide",
      intro:
        "Same features, two structures. Look at what moved, then decide when you would switch.",
      steps: [
        {
          id: "wrap-diff",
          title: "Compare the two branches",
          text: "A line like `src/web/src/{ => app}/App.tsx` means the file moved. Lines with `+` and `-` counts are files whose contents changed.",
          cmds: [{ lines: [L("git diff --stat -M small large")] }],
        },
      ],
      signals: true,
      exit: [
        {
          q: "Name one file you deleted and one you changed. Why each?",
          a: "Deleted: `App.css`, `src/assets`, `icons.svg` or the web README, because they only served the demo. Changed: `Program.cs` (removed WeatherForecast), `launchSettings.json` (fixed port) or `App.tsx` (replaced the demo). Any pair with a sound reason counts.",
        },
        {
          q: "Two developers, six screens, one API. Small structure or large, and why?",
          a: "Small. The large structure's extra projects and folders cost time on every change, and one small team has no boundaries to protect yet.",
        },
        {
          stack: "react",
          q: "In the large React structure, `features/students` needs `CourseCard`. May it import `features/courses/components/CourseCard`?",
          a: "No. Import it from `features/courses`, the feature's `index.ts`, if courses exports it. If several features need it, move it to `shared/ui`.",
        },
        {
          stack: "dotnet",
          q: "Why does `GetCourses` depend on `ICourseRepository` instead of `InMemoryCourseRepository`?",
          a: "So Application never references Infrastructure. You can swap in EF Core, or a fake in a test, without touching the use case.",
        },
      ],
      teacher: {
        say: [
          "Start small. Switch when it hurts, and use the signals on screen to notice when it does.",
          "Both branches do exactly the same thing. Structure changed where code lives and who may depend on whom, not what the app does.",
        ],
        ask: "Exit ticket: three questions on paper or in the class chat. Collect them at the door.",
      },
    },
  ];

  const T = (area, stack, path, answer, what, why) => ({
    area,
    stack,
    path,
    answer,
    what,
    why,
  });
  const ROOT = "Repository root",
    APIA = "API · src/ClassroomApp.Api",
    WEBA = "React · src/web";
  const tour = [
    T(
      ROOT,
      "dotnet",
      ".gitignore",
      "keep",
      "Lists the files Git should never commit.",
      "`bin/`, `obj/`, `node_modules/` and editor settings must stay out of the repository. Created by `dotnet new gitignore`.",
    ),
    T(
      ROOT,
      "dotnet",
      "ClassroomApp.slnx",
      "keep",
      "The solution file: which .NET projects belong together.",
      "`dotnet build` and Visual Studio use it to build and open every project at once. `.slnx` is the XML format .NET 10 creates by default.",
    ),
    T(
      APIA,
      "dotnet",
      "ClassroomApp.Api.csproj",
      "keep",
      "The project file: framework, compiler settings, NuGet packages.",
      "Without it there is no project. It targets `net10.0`, turns on nullable reference types and references `Microsoft.AspNetCore.OpenApi`.",
    ),
    T(
      APIA,
      "dotnet",
      "Program.cs",
      "change",
      "The entry point: registers services and sets up the request pipeline.",
      "Keep the setup, remove the WeatherForecast sample endpoint and its record.",
    ),
    T(
      APIA,
      "dotnet",
      "ClassroomApp.Api.http",
      "change",
      "Requests you can send from the editor with one click.",
      "Useful, but it points at the sample `/weatherforecast` route.",
    ),
    T(
      APIA,
      "dotnet",
      "Properties/launchSettings.json",
      "change",
      "Settings for running the app on your machine: ports and environment.",
      "Production never reads it, and the template picked a random port. We pin it to 5080 so everyone's matches.",
    ),
    T(
      APIA,
      "dotnet",
      "appsettings.json, appsettings.Development.json",
      "keep",
      "Configuration for every environment, plus overrides for Development.",
      "Logging levels now, connection strings later. Secrets don't belong in either file.",
    ),
    T(
      APIA,
      "dotnet",
      "bin/, obj/",
      "ignore",
      "Folders the build creates.",
      "Recreated on every build. Never edit or commit them; `.gitignore` already skips them.",
    ),
    T(
      WEBA,
      "react",
      "package.json",
      "keep",
      "Scripts and dependencies for the React app.",
      "`npm run dev`, `build`, `lint` and `preview` come from here, and so do React 19, Vite 8, TypeScript and Oxlint.",
    ),
    T(
      WEBA,
      "react",
      "package-lock.json",
      "keep",
      "The exact version of every installed package.",
      "Commit it, so every machine installs exactly the same packages.",
    ),
    T(
      WEBA,
      "react",
      "node_modules/",
      "ignore",
      "The installed packages themselves.",
      "`npm install` recreates it. Never commit it.",
    ),
    T(
      WEBA,
      "react",
      "index.html",
      "change",
      "The single HTML page the app loads into.",
      "Vite starts from it and loads `/src/main.tsx`, so it stays. Only the title changes.",
    ),
    T(
      WEBA,
      "react",
      "vite.config.ts",
      "change",
      "Settings for Vite's dev server and build.",
      "We add a proxy so `/api` requests reach the .NET API.",
    ),
    T(
      WEBA,
      "react",
      "tsconfig.json, tsconfig.app.json, tsconfig.node.json",
      "keep",
      "TypeScript settings.",
      "One file for code that runs in the browser, one for config that runs in Node, and one that ties them together.",
    ),
    T(
      WEBA,
      "react",
      ".oxlintrc.json",
      "keep",
      "Linter rules.",
      "Oxlint is the fast linter Vite now uses by default instead of ESLint. Run it with `npm run lint`.",
    ),
    T(
      WEBA,
      "react",
      ".gitignore",
      "keep",
      "Node-specific files Git should skip.",
      "Covers `node_modules`, `dist` and log files inside this folder.",
    ),
    T(
      WEBA,
      "react",
      "README.md",
      "delete",
      "Notes from the template about Vite plugins.",
      "Your project gets its own README at the repository root.",
    ),
    T(
      WEBA,
      "react",
      "public/favicon.svg",
      "keep",
      "The icon in the browser tab.",
      "Files in `public/` are served as they are. Keep it until you have a logo of your own.",
    ),
    T(
      WEBA,
      "react",
      "public/icons.svg",
      "delete",
      "A sheet of social-media icons.",
      "Only the demo page used it.",
    ),
    T(
      WEBA,
      "react",
      "src/main.tsx",
      "keep",
      "Starts React in the page.",
      "It finds the `#root` element and renders `<App />` inside StrictMode.",
    ),
    T(
      WEBA,
      "react",
      "src/App.tsx",
      "change",
      "The page you see when you run the app.",
      "It is a demo with a counter, logos and links. We replace it with our own.",
    ),
    T(
      WEBA,
      "react",
      "src/App.css",
      "delete",
      "Styles for `App.tsx`.",
      "They only style the demo.",
    ),
    T(
      WEBA,
      "react",
      "src/index.css",
      "change",
      "Global styles.",
      "The template's are tuned for the demo, so they get a small replacement.",
    ),
    T(
      WEBA,
      "react",
      "src/assets/",
      "delete",
      "Images: `hero.png`, `react.svg`, `vite.svg`.",
      "Only the demo used them.",
    ),
  ];

  const N = (name, note = "") => ({ name, note });
  const trees = {
    small: {
      dotnet: {
        title: "API",
        rows: [
          N("src/ClassroomApp.Api/"),
          N("├── Endpoints/", "HTTP routes, one file per resource"),
          N("│   └── CourseEndpoints.cs"),
          N("├── Models/", "the shapes of the data"),
          N("│   └── Course.cs"),
          N("├── Data/", "where data comes from: memory now, EF Core later"),
          N("│   └── CourseStore.cs"),
          N("├── Properties/launchSettings.json"),
          N("├── appsettings.json"),
          N("└── Program.cs", "wiring only: services and pipeline"),
        ],
      },
      react: {
        title: "React",
        rows: [
          N("src/web/src/"),
          N("├── components/", "reusable UI pieces"),
          N("│   └── CourseCard.tsx"),
          N("├── pages/", "one component per screen"),
          N("│   └── CoursesPage.tsx"),
          N("├── hooks/", "reusable state and effects"),
          N("│   └── useCourses.ts"),
          N("├── lib/", "plain helpers, like calling the API"),
          N("│   └── api.ts"),
          N("├── types/", "shared TypeScript types"),
          N("│   └── course.ts"),
          N("├── App.tsx", "picks the page"),
          N("├── main.tsx", "starts React"),
          N("└── index.css", "global styles"),
        ],
      },
      rules: [
        {
          stack: "dotnet",
          text: "`Program.cs` only wires things up. Endpoints live in `Endpoints/`, data access in `Data/`.",
        },
        {
          stack: "react",
          text: "Imports flow one way: pages use hooks and components, hooks use lib, everything may use types.",
        },
        {
          text: "Fits one team, a handful of screens and endpoints, and a codebase one person can hold in their head.",
        },
      ],
    },
    large: {
      dotnet: {
        title: ".NET solution",
        rows: [
          N("ClassroomApp.slnx"),
          N("src/"),
          N("├── ClassroomApp.Domain/", "business objects; references nothing"),
          N("│   └── Courses/Course.cs"),
          N(
            "├── ClassroomApp.Application/",
            "use cases and the interfaces they need",
          ),
          N("│   └── Courses/GetCourses.cs, ICourseRepository.cs"),
          N(
            "├── ClassroomApp.Infrastructure/",
            "data access; implements those interfaces",
          ),
          N("│   └── Courses/InMemoryCourseRepository.cs"),
          N("└── ClassroomApp.Api/", "endpoints and Program.cs wiring"),
          N("    ├── Endpoints/CourseEndpoints.cs"),
          N("    └── Program.cs"),
          N("tests/"),
          N(
            "└── ClassroomApp.UnitTests/",
            "tests use cases with no server or database",
          ),
          N("    └── GetCoursesTests.cs"),
        ],
      },
      react: {
        title: "React",
        rows: [
          N("src/web/src/"),
          N("├── app/", "the shell: App, later routes and providers"),
          N("│   └── App.tsx"),
          N("├── features/", "one folder per business feature"),
          N("│   └── courses/"),
          N("│       ├── api/getCourses.ts"),
          N("│       ├── components/CourseCard.tsx"),
          N("│       ├── hooks/useCourses.ts"),
          N("│       ├── pages/CoursesPage.tsx"),
          N("│       ├── types.ts"),
          N("│       └── index.ts", "the feature's public API"),
          N("├── shared/", "code any feature may use"),
          N("│   ├── lib/http.ts"),
          N("│   └── ui/", "shared components, once you have some"),
          N("├── main.tsx"),
          N("└── index.css"),
        ],
      },
      rules: [
        {
          stack: "dotnet",
          text: "Domain references nothing, so business rules never depend on a database or the web.",
        },
        {
          stack: "dotnet",
          text: "Application declares interfaces for what it needs; Infrastructure implements them. Swapping memory for EF Core changes one project.",
        },
        {
          stack: "dotnet",
          text: "Api references Application and Infrastructure, and `Program.cs` is the only place that connects them.",
        },
        {
          stack: "react",
          text: "A feature imports from `shared/`, never from another feature's folders.",
        },
        {
          stack: "react",
          text: "Code outside a feature imports only its `index.ts`. `shared/` never imports from `features/` or `app/`.",
        },
      ],
    },
  };

  const signals = [
    "More than one team, or more than four or five people, work in the same app.",
    "A folder such as `components/` or `Services/` passes 15 to 20 files.",
    "One feature change touches four or more folders.",
    "People keep editing the same files and hitting merge conflicts.",
    "You want to test business rules without a database or a browser.",
  ];

  const prep = [
    {
      text: "Install on every machine: .NET 10 SDK, Node.js 22 LTS, Git, and VS Code with the C# Dev Kit extension.",
      variants: {
        react: "Install on every machine: Node.js 22 LTS, Git, and VS Code.",
        dotnet:
          "Install on every machine: .NET 10 SDK, Git, and VS Code with the C# Dev Kit extension.",
      },
    },
    {
      text: "Do the whole lesson once yourself. With the copy buttons it takes about 15 minutes.",
    },
    {
      text: "Warm the caches on lab machines so the class doesn't wait on downloads: run the create commands once in a scratch folder, then delete the folder.",
    },
    {
      text: "Make sure Git knows who is committing:",
      cmd: [
        'git config --global user.name "Your Name"',
        'git config --global user.email "you@example.com"',
      ],
    },
    {
      text: "Windows: if npm reports that running scripts is disabled, run this once per machine:",
      cmd: ["Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"],
      stack: "react",
    },
    {
      text: "Project this page with Teacher notes off. Students open the same link and pick their shell.",
    },
  ];

  const trouble = [
    {
      p: "`dotnet` or `node` is not recognized",
      fix: "Install it, then close and reopen the terminal so it picks up the new PATH.",
    },
    {
      p: "`code` is not recognized on a Mac",
      fix: "In VS Code open the Command Palette and run Shell Command: Install 'code' command in PATH. Or use File, Open Folder.",
    },
    {
      p: "PowerShell: running scripts is disabled on this system",
      fix: "Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then reopen the terminal.",
      stack: "react",
    },
    {
      p: "Windows Terminal warns about pasting several lines",
      fix: "Choose Paste anyway. The lines run one after another.",
    },
    {
      p: "`dotnet new sln` made `ClassroomApp.sln`, not `.slnx`",
      fix: "Your SDK is older than .NET 10. Everything still works; check `dotnet --version`.",
      stack: "dotnet",
    },
    {
      p: "Vite asks which linter to use, or whether to install and start now",
      fix: "A flag got lost while copying. Choose Oxlint, then No.",
      stack: "react",
    },
    {
      p: "Git says: Please tell me who you are",
      fix: 'Run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`, then commit again.',
    },
    {
      p: "`'Course' is a type and must be imported using a type-only import`",
      fix: "Write `import type { Course }`. The template turns on `verbatimModuleSyntax`.",
      stack: "react",
    },
    {
      p: "`Failed to determine the https port for redirect`",
      fix: "Expected on the http profile: HTTPS redirection has no HTTPS port to send you to locally. It is a warning, not an error.",
      stack: "dotnet",
    },
    {
      p: "The page says `Could not load courses: 502 Bad Gateway`",
      fix: "The API isn't running. Start it in a second terminal with `dotnet run --project src/ClassroomApp.Api`.",
      stack: "react",
    },
    {
      p: "Port 5080 is already in use",
      fix: "Pick another port in `launchSettings.json` and use the same number in `vite.config.ts`.",
      stack: "dotnet",
    },
    {
      p: "`git mv`: destination directory does not exist",
      fix: "Run the folder step first, then repeat the moves.",
    },
  ];

  return { tracks, segments, tour, trees, signals, prep, trouble };
}
