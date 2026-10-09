# Dashboard

A web application that lets each user build their own customizable dashboard: add widgets from different services (weather, GitHub, Steam, etc...), configure each widget individually, and have the data refresh automatically at a set interval.

## Overview

Dashboard is a personal control panel. Instead of opening many websites to check the weather, your repositories or your feeds, you build one page that shows everything you care about, and it stays up to date by itself.

### How it works

1. **Create an account** and sign in.
2. **Pick a service** (for example Weather). Some services need no external account others ask you to link yours.
3. **Add a widget**: each service offers several widget types (ex: "City temperature"). Choose one, configure it (ex: the city), and set how often it refreshes.
4. **Arrange your dashboard**: drag and drop widgets to reorder them, edit their settings, or delete them.

### Key concepts

| Term | Meaning |
|---|---|
| Service | A source of information (Weather, GitHub, ...) |
| Widget type | A kind of card a service provides (ex: City temperature) |
| Widget instance | A configured copy of a widget type on your dashboard |
| Refresh rate | How often an instance fetches new data, chosen per widget |

Two instances of the same widget type can show different data at the same time, for example the weather in Paris and in Tokyo. Each one has its own settings and its own refresh timer, so one never affects the other.

### Main use cases

- Create an account and sign in.
- Add a widget: choose a type, configure it, set its refresh rate.
- Reconfigure a widget; the change is applied immediately.
- Move (drag and drop) or delete a widget.
- Leave the page open: every widget refreshes on its own schedule.

### Key features

- Authentication, with a separate dashboard for each user
- Services and widgets with configurable parameters
- Drag and drop to rearrange widgets
- Available widgets: see [Available services & widgets](#available-services--widgets)

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Backend | Next.js (Route Handlers) |
| Frontend | React + Tailwind CSS |
| Database | PostgreSQL, containerized via Docker |
| ORM | Prisma 7 |
| Authentication | Better Auth (credentials + OAuth 2.0 / OIDC) |

The comparison of at least 3 options per layer (frontend, backend, database) and the justification of each choice are in [`docs/technical_stack.md`](docs/technical_stack.md).

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
| `BETTER_AUTH_URL` | Base URL of the application (ex: `http://localhost:8080`) |

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
| Weather | `city_temperature` | Current temperature, sky and precipitation for a city | `city` (string) |
| Weather | `forecast_overview` | Daily forecast overview for a city | `city` (string), `days` (integer) |


## Documentation

- [`docs/technical_stack.md`](docs/technical_stack.md), technology choices: comparison of 3+ options per layer, justification, and the simplified architecture diagram
- [`docs/DATABASE.md`](docs/DATABASE.md), Prisma and Better Auth commands (migrations, client generation, Prisma Studio, etc.)
- [`docs/DOCKER.md`](docs/DOCKER.md), Docker Compose commands (build, logs, debugging)
- [`docs/pull_request.md`](docs/pull_request.md), required pull request template