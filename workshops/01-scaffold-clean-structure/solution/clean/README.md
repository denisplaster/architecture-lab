# Classroom App

An ASP.NET Core Web API and a React front end in one repository.

| Folder                 | What it is                   | Run it                                       |
| ---------------------- | ---------------------------- | -------------------------------------------- |
| `src/ClassroomApp.Api` | ASP.NET Core Web API, .NET 10 | `dotnet run --project src/ClassroomApp.Api`  |
| `src/web`              | React + TypeScript with Vite | `cd src/web` then `npm run dev`              |

The API listens on http://localhost:5080. The React dev server runs on
http://localhost:5173 and forwards every `/api` request to the API.
