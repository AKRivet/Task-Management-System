# Task Management System

A fullstack project management tool modeled loosely on Azure DevOps: **Projects** contain a
hierarchy of **Work Items** (Feature → Story → Task/Bug), with role-based access control, JWT
authentication, project-level membership, comments, tags, and search/sort/pagination.

Stack: **PostgreSQL** + **ASP.NET Core Web API** (.NET 10, EF Core/Npgsql) + **React 19** (TypeScript,
Vite, Mantine UI).

```
database/    Reference SQL (the EF Core migration in backend/ is the real source of truth)
backend/     ASP.NET Core Web API — Controllers → Services → Repositories → PostgreSQL
frontend/    React + TypeScript (Vite) + Mantine component library
```

---

## 1. Architecture

### Backend — layered, not "thin controller / fat model"

```
Controllers   → HTTP concerns only: routing, [Authorize], model binding, status codes
Services      → business rules, validation, DTO <-> Entity mapping
Repositories  → thin wrapper over EF Core's DbContext (query composition)
Entities      → EF Core-mapped POCOs
DTOs          → the only shapes that cross the API boundary (entities are never serialized directly)
```

Every entity follows this same four-layer shape (`IXService`/`XService`, `IXRepository`/`XRepository`,
one controller). This repetition is deliberate — a reviewer can predict where any piece of logic
lives without reading the whole codebase.

### Frontend — page/component/API separation

```
src/api/         typed fetch wrappers, one file per concern (endpoints.ts, auth.ts, client.ts)
src/context/     AuthContext — the one piece of global state (current user, JWT)
src/components/  reusable, presentational-ish pieces (forms, badges, guards)
src/pages/       one component per route, owns its own data fetching
```

No Redux/Zustand — the app's actual shared state is just "who's logged in," which a single React
Context comfortably covers. Everything else is fetched per-page.

---

## 2. Design patterns and why

| Pattern | Where | Why |
|---|---|---|
| **Repository pattern** | `Repositories/IRepository<T>` + per-entity repos | `DbContext`/`DbSet` already *is* a repository + unit of work, so this is somewhat redundant — kept anyway because layered Controller→Service→Repository is what most .NET shops (and reviewers) expect to see. |
| **DTO pattern** | `DTOs/*.cs` | Entities never leave the Service layer. Decouples the wire format from the EF Core model and avoids over-posting / accidental exposure of fields like `PasswordHash`. |
| **Self-referencing hierarchy** | `WorkItem.ParentWorkItemId` | Feature/Story/Task/Bug are one table with a `Type` discriminator and a nullable self-FK, not four separate tables — this is how Azure DevOps itself models work items. One set of Status/Priority/Comments/Tags machinery serves every type. |
| **Guard/access-check service** | `IProjectAccessService` | Row-level authorization ("can this user see this project?") is centralized in one service and called from every layer that touches project-scoped data (Projects, WorkItems, Comments), instead of being re-implemented per controller. |
| **Global exception middleware** | `Middleware/ExceptionHandlingMiddleware` | A single `AppException` (with a status code) plus a middleware that catches it — no controller action needs its own try/catch. Also catches `DbUpdateException` (e.g. a blocked delete) and maps it to a `409`. |
| **Enum-as-string + CHECK constraint** | `WorkItem.Priority`, `WorkItem.Type`, `User.Role` | See §6 — chosen over native Postgres `enum` types after hitting real EF Core/Npgsql mapping bugs. |
| **JWT stateless auth** | `AuthService`, `TokenService` | No server-side session store; the token itself (id/name/role claims) is the source of truth per request, verified via `ICurrentUserService`. |
| **Snake_case naming convention** | `EFCore.NamingConventions` package | `OnModelCreating` stays focused on relationships/constraints instead of manually renaming every table and column to match Postgres conventions. |

---

## 3. Data model

```
User (Admin | Member) ──< ProjectMember >── Project ──< WorkItem >── Comment
                                               │            │
                                               │            └──< WorkItemTag >── Tag
                                               │
                                               └── WorkItem.ParentWorkItemId (self-referencing)
                                                     Feature ─┬─ Story ─┬─ Task
                                                               │         └─ Bug
                                                               └─ Story ─ ...
```

- **User** — `Name, Email, PasswordHash, Role (Admin/Member)`.
- **Project** — `Name, Description`; membership is many-to-many via **ProjectMember** (no single "owner").
- **WorkItem** — `Title, Description, Type (Feature/Story/Task/Bug), Priority, StatusId, AssignedUserId, ParentWorkItemId, DueDate`. Self-referencing for the hierarchy.
- **Status** — seeded lookup (`To Do`, `In Progress`, `Done`, `Blocked`), not user-editable.
- **Comment** — belongs to a WorkItem and a User.
- **Tag** / **WorkItemTag** — free-form labels, many-to-many with WorkItems.

**Delete behavior:**
- Delete a Project → cascades to its WorkItems (and their Comments/Tags via WorkItem's own cascade).
- Delete a WorkItem → cascades to its Comments, its Tags associations, **and its entire child subtree** (deleting a Feature deletes its Stories and their Tasks).
- Delete a User → **blocked** (409, with a specific message) if they're still a project member, assigned to any work item, or have written comments — the caller has to reassign/remove those first rather than silently losing data.

---

## 4. Roles and permissions

Two roles: **Admin** and **Member**. One seeded Admin account ships with the migration (see Setup);
anyone else who registers becomes a Member.

| Action | Admin | Member |
|---|---|---|
| Log in / register | ✅ | ✅ |
| View a project they belong to (or are assigned work in) | ✅ | ✅ |
| View a project they have **no** relation to | ✅ (sees everything) | ❌ `403 Forbidden` |
| Create a project | ✅ | ❌ `403 Forbidden` |
| Edit a project (rename, change members) | ✅ | ✅ — *if* they already have access to it |
| Delete a project | ✅ | ❌ `403 Forbidden` |
| Create/edit/delete a work item | ✅ | ✅ — *if* they have access to that work item's project |
| Delete a person (User) | ✅ | ❌ `403 Forbidden` |
| Delete a tag | ✅ | ❌ `403 Forbidden` |

This is deliberately lightweight — there's no per-permission matrix or custom roles, just two roles
and one row-level rule (project access). A full RBAC system with configurable permissions would be
over-engineering for this scope.

---

## 5. Business rules

- **Project visibility ("who can see what")** — a Member can see a project if they are an explicit
  `ProjectMember` of it, **or** have at least one work item assigned to them within it. This is
  enforced by `IProjectAccessService.EnsureAccessAsync`, called from every service that touches
  project-scoped data (not just the Projects list) — so a Member can't bypass it by guessing a
  project ID or a work item ID directly.
- **A project needs at least one member.** Create/update both reject an empty member list.
- **Work item hierarchy type rules are soft guidance, not hard constraints.** The UI's "Parent"
  picker only offers sensible parents (a Story's parent must be a Feature; a Task/Bug's parent must
  be a Story or another Task), but this isn't enforced at the database level — building a full
  backlog-rules engine (like Azure DevOps' configurable backlog levels) was judged out of scope.
  What **is** hard-enforced server-side: a parent must belong to the same project, and setting a
  parent can't create a cycle (an item becoming its own ancestor) — `WorkItemService.EnsureParentValid`
  walks the ancestor chain on every create/update.
- **Deleting a User is blocked, never silent**, if they still have dependent data (project
  membership, assigned work items, or comments) — see §3. The error message says exactly what's
  blocking it (e.g. *"is a member of 2 project(s) and is assigned 1 work item(s)"*) instead of a
  generic foreign-key error.
- **Login/registration give the same error for a bad email or a bad password** ("Invalid email or
  password") — so the endpoint can't be used to enumerate which emails are registered.

---

## 6. Notable engineering decisions

- **Priority/Type/Role are stored as `text` + a `CHECK` constraint, not native Postgres `enum` types.**
  The first version of this schema used a real Postgres `enum` (`CREATE TYPE task_priority AS ENUM (...)`),
  wired up via `NpgsqlDataSourceBuilder.MapEnum` + `HasPostgresEnum`. End-to-end testing against a
  real database caught a real bug: EF Core silently sent `INSERT`/`UPDATE` values as plain integers
  instead of the enum type, and any query filtering by priority failed outright with
  `operator does not exist: task_priority = integer`. Rather than keep fighting that specific
  Npgsql/EF Core interaction, the fix was `HasConversion<string>()` + a `CHECK` constraint — same
  intent (readable, constrained values), a well-supported EF Core pattern instead of fragile
  ADO-level enum wiring.
- **A Repository layer on top of EF Core** is somewhat redundant (see §2's pattern table) but kept
  deliberately, since layered architecture is explicitly what's being evaluated here.
- **No ASP.NET Core Identity.** Auth is a lightweight custom JWT + `BCrypt.Net-Next` implementation
  (`AuthController`/`AuthService`/`TokenService`) rather than the full Identity framework — Identity's
  schema and API surface is heavier than a two-role system needs.
- **Client-side search/sort for the work item hierarchy view**, but **server-side pagination for the
  flat Projects list.** Paginating a *hierarchy* correctly (a page boundary shouldn't split a parent
  from its children) is a genuinely harder problem than paginating a flat list; given the expected
  scale (a project's total work items), doing it client-side over the already-filtered dataset was
  the pragmatic tradeoff instead of building boundary-aware server-side hierarchy pagination.

---

## 7. API surface (selected)

| Endpoint | Notes |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login` | Public, returns `{ token, user }` |
| `GET /api/projects?search=&sortBy=&sortDir=&page=&pageSize=` | Paginated, scoped to the caller's accessible projects |
| `POST /api/projects` | **Admin only** |
| `DELETE /api/projects/{id}`, `DELETE /api/users/{id}`, `DELETE /api/tags/{id}` | **Admin only** |
| `GET /api/workitems?projectId=&statusId=&priority=&type=&parentWorkItemId=&topLevelOnly=&search=` | All filters optional and combinable |
| `GET/POST /api/workitems/{workItemId}/comments` | |

Full interactive docs: Swagger UI at `/swagger` when running the API in Development — includes an
"Authorize" button to paste a JWT and exercise protected endpoints directly.

---

## 8. Prerequisites

- .NET SDK 10
- Node.js 20+ and npm
- PostgreSQL running locally, with pgAdmin (or any client) to create the database

## 9. Setup

### Database
In pgAdmin: right-click **Databases → Create → Database**, name it `task_management_db`.

### Backend
```bash
cd backend/TaskManagementSystem.Api
```
Open `appsettings.Development.json` (git-ignored — never committed) and fill in your real local
Postgres password and a JWT signing key:
```json
"ConnectionStrings": { "Default": "Host=localhost;Port=5432;Database=task_management_db;Username=postgres;Password=<your password>" },
"Jwt": { "Key": "<any long random string>", "Issuer": "TaskManagementSystem.Api", "Audience": "TaskManagementSystem.Client", "ExpiryMinutes": 120 }
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

### Frontend
```bash
cd frontend/task-management-ui
npm install
npm run dev
```
Open http://localhost:5173. The frontend calls the API at `http://localhost:5174/api` (see
`src/api/client.ts`) — no extra configuration needed for local dev.

### First run
The migration seeds one Admin account: **admin@taskms.local / Admin@123**. Log in as Admin to
create the first project(s) and add People (via Register) as members; Members can then log in and
will only see projects they belong to or have work assigned in.

---

## 10. Explicitly out of scope

Considered and deliberately not built, to keep scope matched to what was asked rather than
over-engineering:

- Backend unit/integration tests
- Docker / docker-compose
- CI/CD pipeline
- File attachments on work items
- Work item activity/audit history (a timeline of status/priority changes)
- A full configurable backlog-rules engine (hard type-hierarchy enforcement, custom work item types)
- Multi-project layered architecture (separate Domain/Application/Infrastructure assemblies) — one
  well-organized Web API project was judged the right size for this scope.
