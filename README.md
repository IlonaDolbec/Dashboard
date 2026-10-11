# Dashboard

A web application that lets each user build their own customizable dashboard: add widgets from different services (weather, GitHub, Steam, etc...), configure each widget individually, and have the data refresh automatically at a set interval.

## Overview

Dashboard is a personal control panel. Instead of opening many websites to check the weather, your games or the time in another city, you build one page that shows everything you care about, and it stays up to date by itself.

### How it works

1. **Create an account**, confirm your registration and sign in.
2. **Pick a service** (for example Weather). Some services need no external account, others ask you to link yours.
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
- Subscribe to a service (link your Steam account, for example).
- Add a widget: choose a type, configure it, set its refresh rate.
- Reconfigure a widget; the change is applied immediately.
- Move (drag and drop) or delete a widget.
- Leave the page open: every widget refreshes on its own schedule.

### Key features

- Authentication, with a separate dashboard for each user
- Administration section to manage users
- Account linking to third-party services (OAuth 2.0 / OpenID)
- Services and widgets with configurable parameters
- Drag and drop to rearrange widgets
- Automatic refresh of each widget at its own interval
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

## Project structure

```
.
├── backend/          Next.js API (auth, services, widgets, about.json) + Prisma
│   ├── prisma/       Schema, migrations and seed
│   └── src/lib/      One file per service (weather.ts, steam.ts, time.ts, ...)
├── frontend/         React + Vite app (dashboard, login, admin)
├── docs/             Technical documentation
└── docker-compose.yml
```

## Getting started

### With Docker (recommended)

```bash
git clone <repo-url>
cd <repository>
cp .env.example .env      # fill in the required values, see below
docker compose up -d --build
```

The `server` container applies pending Prisma migrations automatically on startup. The seed step registers the services and widget types in the database: run it once after the first start, and again whenever you add a service or a widget (it is safe to run several times).

Full command reference (logs, rebuilding, debugging): [`docs/DOCKER.md`](docs/DOCKER.md).

### Without Docker (local dev)

```bash
nvm use 22
npm install
cp .env.example .env
npx prisma dev
npx prisma migrate dev --config prisma7.config.ts
npx prisma db seed
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
| `SERVER_PORT` | Host-side port exposed for the application (default `8080`) |
| `DATABASE_URL` | Prisma connection string (the host is the Postgres service name, ex: `postgres`) |
| `FRONTEND_PORT` | Host-side port exposed for the frontend (default `5173`) |
| `FRONTEND_URL` | Base URL of the frontend (ex: `http://localhost:5173`) |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth to sign sessions. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL of the backend (ex: `http://localhost:8080`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth credentials for "Sign in with Google" (optional) |
| `GITHUB_LOGIN_CLIENT_ID` / `GITHUB_LOGIN_CLIENT_SECRET` | OAuth app used to **sign in** with GitHub (optional) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth app used by the **GitHub service** (widgets). Without them, the seed skips the GitHub service |
| `STEAM_API_KEY` | Steam Web API key, required by the Steam widgets. Get one at https://steamcommunity.com/dev/apikey |

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

| Service | Account needed | Widget | Description | Parameters |
|---|---|---|---|---|
| Weather | No | `city_temperature` | Current temperature, sky and precipitation for a city | `city` (string) |
| Weather | No | `forecast_overview` | Daily forecast overview for a city | `city` (string), `days` (integer) |
| Steam | Yes (OpenID) | `currently_playing` | The game your linked Steam account is playing right now | `display_mode` (string: `compact` or `detailed`) |
| Steam | Yes (OpenID) | `most_played_games` | Games sorted by total playtime | `order` (string: `most` or `least`), `game_count` (integer) |
| Time | No | `timezone_clock` | Current time and date in a given timezone | `timezone` (string, ex: `Europe/Paris`) |
| Time | No | `countdown` | Time remaining until a given date | `label` (string), `target_date` (string, ex: `2026-10-26`) |

## Documentation

- [`docs/technical_stack.md`](docs/technical_stack.md), technology choices: comparison of 3+ options per layer, justification, and the simplified architecture diagram
- [`docs/DATABASE.md`](docs/DATABASE.md), Prisma and Better Auth commands (migrations, client generation, Prisma Studio, etc.)
- [`docs/DOCKER.md`](docs/DOCKER.md), Docker Compose commands (build, logs, debugging)
- [`docs/pull_request.md`](docs/pull_request.md), required pull request template