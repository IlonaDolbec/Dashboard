# Technical Choices

## Global view

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Backend | Next.js (API / Route Handlers) |
| Frontend | React + Tailwind CSS |
| Database | Container initialized at Docker startup |
 
 
---

## 1. Backend — TypeScript + Next.js
 
**Why TypeScript?**
- End-to-end static typing: fewer bugs, easier maintainability for a two-person team reviewing each other's code.
- A single language across the whole project (front + back), so no context-switching and no type duplication between client and server.
**Why Next.js as the backend?**
- **Route Handlers** (`app/api/.../route.ts`) expose the required REST endpoints directly, including `GET /about.json`, without standing up a separate Express server.
- **BetterAuth.js** (Auth.js) covers exactly the two requirements from the spec:
  - **credentials**-based authentication (email/password) or **OIDC**;
  - **OAuth 2.0** authorization toward external services (GitHub, Steam via a custom provider, etc.), with automatic linking of the third-party account to the existing platform user.
**Limitation to plan for**: Next.js has no built-in scheduler/cron. The **Timer** (periodic widget refresh) will need to be implemented separately — e.g. `node-cron` inside the same process, or a small dedicated worker if the load justifies it.
 
---

## 2. Frontend — React + Tailwind CSS
 
**Why React?**
- It's already Next.js's rendering engine: no extra choice needed, no duplicated logic between server and client rendering.
- Rich ecosystem for exactly what the dashboard needs: draggable/resizable widget grids (`react-grid-layout`, `dnd-kit`), dynamic config forms for widgets, etc. — no need to reinvent the wheel.
- Reusable components fit a modular dashboard well: each widget is an isolated component with its own props/config.

**Why Tailwind CSS?**
- Lets us get a consistent, responsive UI quickly without writing custom CSS for every new widget.
- Particularly well suited to a dashboard made of many similar "cards": utility classes avoid style duplication.
- Integrates natively with Next.js (officially supported, zero config).

---

## 3. Database — container initialized at Docker startup
 
**Why this approach?**
- Directly satisfies the project constraint: `docker-compose up` alone must produce a working application, with no manual database setup step.
- The `db` service in `docker-compose.yml` starts with the required environment variables (database name, user, password), and migrations (Prisma) are applied automatically when the backend container starts (entrypoint script / `prisma migrate deploy`).
**Why PostgreSQL + Prisma (default proposal)?**
- Prisma generates a typed TypeScript client from the schema → consistent with the "all-TypeScript" choice, and reduces query errors.
- Migrations are versioned in the repo (`prisma/migrations`) and replayed automatically on every `docker-compose up`, so grading/setup is reproducible.
- PostgreSQL natively supports JSON types, useful for storing widget configuration `params` without a rigid schema.

---

## 4. Simplified architecture
 
```
[ Browser ]
      │  React (pages/components) + Tailwind
      ▼
[ Next.js — Route Handlers (TypeScript) ]
      │  NextAuth.js (auth + OAuth2/OIDC)
      │  Timer (node-cron)
      ▼
[ Prisma ORM ]
      ▼
[ PostgreSQL (Docker container, initialized at startup) ]
```
 
---

## 5. Summary of justifications
 
| Choice | Justified by |
|---|---|
| TypeScript | End-to-end typing, fewer bugs for a 2-person team, a single language front/back |
| Next.js (backend) | Built-in API (`/about.json` included), BetterAuth ready-made for the spec's auth/OAuth needs, single Docker service |
| React + Tailwind (frontend) | Consistent with Next.js, rich ecosystem for the widget grid, fast and consistent styling |
| PostgreSQL + Prisma (containerized) | Meets the `docker-compose up` constraint with no manual setup, typed, automatic versioned migrations |
