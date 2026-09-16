# Dashboard

A web application that lets each user build their own customizable dashboard: add widgets from different services (weather, GitHub, Steam, etc...), configure each widget individually, and have the data refresh automatically at a set interval.

## Tech stack

| Component | Technology |
|---|---|
| Web framework | [Next.js](https://nextjs.org/) 16 (React 19) |
| Database | PostgreSQL 16 |
| ORM | [Prisma](https://www.prisma.io/) 7 |
| Styling | Tailwind CSS 4 |
| Containerization | Docker / Docker Compose |
| Language | TypeScript |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- or, for fully local development: [Node.js](https://nodejs.org/) 22+, [npm](https://www.npmjs.com/), and an accessible PostgreSQL 16 instance

## Installation

### Option A: With Docker (recommended)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repository>
   ```

2. Copy the example file and fill it in (see the Environment variables section):
   ```bash
   cp .env.example .env
   ```

3. Build the images:
   ```bash
   docker compose build
   ```

4. Start the containers:
   ```bash
   docker compose up -d
   ```

### Option B: Locally, without Docker

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd <repository>
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the variables, pointing `DATABASE_URL` to your own local PostgreSQL instance.

3. Apply the migrations:
   ```bash
   npx prisma migrate dev --config prisma7.config.ts
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment variables

All variables are documented in `.env.example`. Summary:

| Variable | Description |
|---|---|
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | Host-side port exposed for PostgreSQL (the container always listens internally on `5432`) |
| `SERVER_PORT` | Host-side port exposed for the application (the container always listens internally on `8080`) |
| `DATABASE_URL` | Prisma connection string, must match the `DB_*` values above |

> ⚠️ Never commit your real `.env` file — only `.env.example` should be version-controlled.

## Running the project

Once `docker compose up -d` has run (or `npm run dev` locally), the application is available at:

```
http://localhost:<SERVER_PORT>
```

(replace `<SERVER_PORT>` with the value defined in your `.env`, default `8080`).

## Checking that everything works

The server exposes a diagnostic endpoint at the root, `/about.json`, which returns the client's IP, the server time, and the list of available services and widgets:

```bash
curl http://localhost:<SERVER_PORT>/about.json
```

To follow the server logs live (useful for debugging a startup issue):

```bash
docker compose logs -f server
```

## Available services & widgets

<!-- TODO: list here, as they get implemented, each service and its widgets, with a short description and each one's configurable parameters. -->

| Service | Widget | Description | Parameters |
|---|---|---|---|
| _to be filled in_ | _to be filled in_ | _to be filled in_ | _to be filled in_ |

## Useful commands

| Command | Effect |
|---|---|
| `docker compose build` | Rebuilds the images |
| `docker compose up -d` | Starts the containers in the background |
| `docker compose down` | Stops and removes the containers |
| `docker compose logs -f server` | Follows the server logs live |
| `npx prisma studio --config prisma7.config.ts` | GUI to browse the database |
| `npx prisma migrate dev --config prisma7.config.ts` | Creates and applies a new migration (dev) |