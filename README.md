# Task Management System

A fullstack assessment project: PostgreSQL + ASP.NET Core Web API + React (TypeScript).
Single-user system (no login) — a project has an owner and a task has an assignee, both
picked from a simple "People" list, but there's no authentication.

## Architecture

```
database/    Reference SQL (the EF Core migration in backend/ is the real source of truth)
backend/     ASP.NET Core Web API (.NET 10), EF Core + Npgsql against PostgreSQL
frontend/    React + TypeScript (Vite), consumes the API over HTTP
```

**Entities:** Users, Projects, Statuses (seeded lookup: To Do / In Progress / Done / Blocked),
Tasks, Comments, Tags, and a `task_tags` join table for the Tasks↔Tags many-to-many. `Priority`
on a Task is a native PostgreSQL `enum` type (`task_priority`), not just a plain column — see
`database/schema-reference.sql` for the full DDL and `backend/TaskManagementSystem.Api/Data/AppDbContext.cs`
for how EF Core maps it.

**Backend layers:** Controllers → Services (business rules, DTO mapping) → Repositories (thin
wrapper over EF Core's `DbContext`) → PostgreSQL. Each entity has full CRUD except Statuses
(fixed lookup, read-only) and Tags (no update — renaming wasn't a needed feature).

## Prerequisites

- .NET SDK 10
- Node.js 20+ and npm
- PostgreSQL running locally, with pgAdmin (or any client) to create the database

## Setup

### 1. Database

In pgAdmin: right-click **Databases → Create → Database**, name it `task_management_db`.

### 2. Backend

```bash
cd backend/TaskManagementSystem.Api
```

Open `appsettings.Development.json` (git-ignored — never committed) and set your real local
Postgres password:

```json
"ConnectionStrings": { "Default": "Host=localhost;Port=5432;Database=task_management_db;Username=postgres;Password=<your password>" }
```

Restore the `dotnet-ef` tool and create the schema:

```bash
dotnet tool restore
dotnet tool run dotnet-ef database update
```

Run the API:

```bash
dotnet run
```

Swagger UI: http://localhost:5174/swagger

### 3. Frontend

```bash
cd frontend/task-management-ui
npm install
npm run dev
```

Open http://localhost:5173. The frontend is hardcoded to call the API at
`http://localhost:5174/api` (see `src/api/client.ts`) — that's the backend's `http` launch
profile, so no extra configuration is needed for local dev.

### First run

The database starts with no People or Tags (only Statuses are seeded). Go to **People** and add
at least one person before creating a Project — every project needs an owner.

## Notes on some design choices

- **Why a Repository layer on top of EF Core**, when `DbContext`/`DbSet` already implements the
  repository + unit-of-work patterns? Mainly to demonstrate the pattern explicitly for this
  assessment — it's a common expectation in .NET codebases even though it's somewhat redundant
  with EF Core itself.
- **`EFCore.NamingConventions`** (snake_case) is used instead of manually renaming every
  table/column via Fluent API, so `OnModelCreating` stays focused on relationships and
  constraints rather than repetitive naming boilerplate.
- **A global `ExceptionHandlingMiddleware`** converts thrown `AppException`s (404/409/400) and
  `DbUpdateException`s (e.g. a blocked delete due to a foreign key) into consistent JSON error
  responses, instead of every controller action needing its own try/catch.
