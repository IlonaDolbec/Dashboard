# Docker commands

## Setup from scratch (first clone of the repo)

```bash
cp .env.example .env       # fill in DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SERVER_PORT, DATABASE_URL
docker compose build
docker compose up -d
```

The `server` container applies pending Prisma migrations (`prisma migrate deploy`) automatically on startup, no manual migration step needed for this path.

## Day-to-day

```bash
# Start the containers in the background
docker compose up -d

# Stop and remove the containers (keeps the postgres_data volume)
docker compose down

# Stop containers and also wipe the database volume (clean slate)
docker compose down -v

# Rebuild the images (needed after a Dockerfile or dependency change)
docker compose build

# Rebuild + restart in one go
docker compose up -d --build
```

## Logs & debugging

```bash
# Follow the server logs live
docker compose logs -f server

# Follow the postgres logs live
docker compose logs -f postgres

# Follow all services at once
docker compose logs -f

# Check container status / health
docker compose ps
```

## Checking the app is up

```bash
curl http://localhost:<SERVER_PORT>/about.json
```

Replace `<SERVER_PORT>` with the value from your `.env` (default `8080`). A JSON response confirms the `server` container is healthy and can reach the database.

## Running a one-off command inside the server container

```bash
# open a shell inside the running server container
docker compose exec server sh

# run a Prisma command against the containerized database
docker compose exec server npx prisma studio --config prisma7.config.ts
```

## Common issues

| Symptom | Likely cause |
|---|---|
| `server` container exits immediately | Check `docker compose logs server`, often a missing/invalid env var or a failed migration |
| Connection refused on `DB_PORT` | `postgres` container not yet healthy, `depends_on: condition: service_healthy` should handle this, but check `docker compose ps` |
| Changes to code not reflected | Image wasn't rebuilt, run `docker compose up -d --build` |