# Dashboard

A web application that lets each user build their own customizable dashboard: add widgets from different services (weather, GitHub, Steam, etc...), configure each widget individually, and have the data refresh automatically at a set interval.

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Backend | Next.js (Route Handlers) |
| Frontend | React + Tailwind CSS |
| Database | PostgreSQL, containerized via Docker |
| ORM | Prisma 7 |
| Authentication | Better Auth (credentials + OAuth 2.0 / OIDC) |

The full rationale behind each choice is documented in [`docs/technical_stack.md`](docs/technical_stack.md).

## Getting started

### With Docker (recommended)

```bash
git clone <repo-url>
cd <repository>
cp .env.example .env      # fill in the required values, see below
docker compose up -d --build
```

The `server` container applies pending Prisma migrations automatically on startup, no extra step needed.

Full command reference (logs, rebuilding, debugging): [`docs/DOCKER.md`](docs/DOCKER.md).

### Without Docker (local dev)

```bash
nvm use 22
npm install
cp .env.example .env
npx prisma dev
npx prisma migrate dev --config prisma7.config.ts
npm run dev
```

Full Prisma / Better Auth command reference: [`docs/DATABASE.md`](docs/DATABASE.md).

## Environment variables

All variables are documented in `.env.example`. Summary:

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | Host-side port exposed for PostgreSQL |
| `SERVER_PORT` | Host-side port exposed for the application |
| `DATABASE_URL` | Prisma connection string |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth to sign sessions and hash passwords. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL of the application (e.g. `http://localhost:8080`) |

> ⚠️ Never commit your real `.env` file, only `.env.example` should be version-controlled.

## Running the project

Once the containers are up (or `npm run dev` locally), the application is available at:

```
http://localhost:<SERVER_PORT>
```

## Checking that everything works

The server exposes a diagnostic endpoint at the root, `/about.json`, which returns the client's IP, the server time, and the list of available services and widgets:

```bash
curl http://localhost:<SERVER_PORT>/about.json
```

## Available services & widgets

<!-- TODO: list here, as they get implemented, each service and its widgets, with a short description and each one's configurable parameters. -->

| Service | Widget | Description | Parameters |
|---|---|---|---|
| _to be filled in_ | _to be filled in_ | _to be filled in_ | _to be filled in_ |


## Documentation

- [`docs/technical_stack.md`](docs/technical_stack.md), why each technology was chosen, and the simplified architecture diagram
- [`docs/DATABASE.md`](docs/DATABASE.md), Prisma and Better Auth commands (migrations, client generation, Prisma Studio, etc.)
- [`docs/DOCKER.md`](docs/DOCKER.md), Docker Compose commands (build, logs, debugging)
- [`docs/pull_request.md`](docs/pull_request.md), required pull request template