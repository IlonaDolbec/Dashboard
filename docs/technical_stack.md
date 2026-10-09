# Technical Choices

For each layer (frontend, backend, database) we compared several options on the same criteria, then chose the one that best fits the project needs and our team's skills (a two-person team, comfortable with TypeScript, React and SQL).

## Global view

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Backend | Next.js (Route Handlers) |
| Frontend | React (Vite) + Tailwind CSS |
| Database | PostgreSQL (Docker) + Prisma |
| Authentication | Better Auth |

---

## 1. Frontend

| Criteria | **React + Vite + Tailwind** | Vue 3 | Angular |
|---|---|---|---|
| Learning curve | Medium, small core API (components + hooks) | Low to medium | High |
| Fit for widgets | Excellent: one component per widget, one hook for the Timer | Excellent | Good, heavier for small components |
| Ecosystem (drag and drop, forms) | Largest | Large | Large, opinionated |
| Auth client | Official Better Auth React client | Official client | Community only |
| TypeScript | First class | Good | Mandatory |
| Team experience | **Yes** | Little | None |

**Choice: React.** A widget is naturally a component, and the Timer is a hook (`useWidgetData`) with one interval per card, so instances stay isolated. The team already knows it and the ecosystem is the largest. Tailwind CSS gives a consistent, responsive UI without writing custom CSS for each widget.

## 2. Backend

| Criteria | **Next.js Route Handlers** | Express / NestJS | Django / FastAPI | Laravel |
|---|---|---|---|---|
| Language shared with frontend | **Yes (TypeScript)** | Yes | No (Python) | No (PHP) |
| Setup effort | Low: file-based routes | Low (Express), medium (Nest) | Low to medium | Medium |
| Auth (credentials + OAuth) | Better Auth, native integration | Better Auth / Passport | Built-in / libraries | Built-in (Socialite) |
| Type-safe DB access | Prisma | Prisma | Django ORM / SQLAlchemy | Eloquent |
| Calling external APIs | `fetch` built in | `fetch` / axios | `requests` / `httpx` | Guzzle |
| Team experience | **Yes** | Partly | Little | Little |

**Choice: Next.js Route Handlers with TypeScript.** One language across the stack, so types are shared and not duplicated. Each endpoint is a plain file (`/api/widgets`, `/api/widgets/:id/data`, `/about.json`), with no separate Express server. Better Auth covers credentials and OAuth 2.0 with account linking, which avoids writing security-critical code ourselves.

## 3. Database

| Criteria | **PostgreSQL** | MySQL / MariaDB | MongoDB | SQLite |
|---|---|---|---|---|
| Data model | Relational + `JSONB` | Relational + `JSON` | Documents | Relational + JSON |
| Fit (user → widgets → config) | **Excellent**: foreign keys and flexible JSON | Good | Good for config, weak for relations | Good |
| Integrity (constraints, transactions) | Strong | Strong | Weaker | Strong |
| Docker, concurrent users | Official image, good concurrency | Official image | Official image | A file, poor concurrency |
| Prisma support | Full | Full | Fewer features | Full |
| Team experience | **Yes** | Yes | Little | Yes |

**Choice: PostgreSQL, containerized with Docker, accessed with Prisma.**
- Relations (user → widget instances → widget type → service) need foreign keys and cascading deletes, while each widget has different parameters, which is what a `JSON` column is for.
- The `postgres` service starts with `docker compose up`, and Prisma migrations (`prisma migrate deploy`) run automatically when the `server` starts, so no manual setup is needed and the result is reproducible.
- Prisma generates a typed client, consistent with the all-TypeScript choice.

---

## 4. Simplified architecture

```
[ Browser ]
      │  React (Vite) + Tailwind
      │  one Timer (setInterval) per widget card
      ▼
[ Next.js, Route Handlers (TypeScript) ]   port 8080
      │  Better Auth (credentials + OAuth 2.0 / OIDC)
      │  /api/widgets, /api/widgets/:id/data, /about.json
      ▼
[ Prisma ORM ]
      ▼
[ PostgreSQL (Docker container) ]
```

## 5. Summary of justifications

| Choice | Justified by |
|---|---|
| TypeScript | End-to-end typing, a single language front and back, fewer bugs for a two-person team |
| React + Tailwind | Component per widget, hook per Timer, known by the team, fast consistent styling |
| Next.js | Built-in API (`/about.json` included), Better Auth integration, one server service |
| PostgreSQL + Prisma | Relations plus JSON config, typed queries, automatic versioned migrations |