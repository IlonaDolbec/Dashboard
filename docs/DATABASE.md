# DB / Prisma / Better Auth commands

> Prisma 7 requires Node ≥ 20.19. If you're on Node 18 (`node -v`), run this first:
> ```bash
> source ~/.nvm/nvm.sh && nvm use 22
> ```

## Setup from scratch (first clone of the repo)

```bash
nvm use 22          # or any version >= 20.19
npm install
cp .env.example .env
npx prisma dev      # starts the local Postgres server, leave it running in a separate terminal
npx prisma migrate dev --config prisma7.config.ts   # applies existing migrations + generates the client
```

The URL in `.env.example` is the default template for the local `prisma dev` server (not a secret, see the comment in the file) — it works as-is as long as you haven't changed the server's ports/name.

## Local Prisma Postgres server (dev)

The `DATABASE_URL` in `.env` points to a local Postgres server managed by Prisma (`prisma+postgres://localhost:51213/...`). It must be running before any migration:

```bash
npx prisma dev
```

Leave it running in a separate terminal while you develop.

## Prisma

```bash
# Generate the Prisma client from the schema (src/generated/prisma)
npx prisma generate --config prisma7.config.ts

# Create + apply a dev migration (creates a file under prisma/migrations)
npx prisma migrate dev --name <migration_name> --config prisma7.config.ts

# Sync the schema to the DB without creating a migration file (fast prototyping)
npx prisma db push --config prisma7.config.ts

# Open Prisma Studio (web UI to view/edit data)
npx prisma studio --config prisma7.config.ts

# Validate the schema
npx prisma validate --config prisma7.config.ts

# Format schema.prisma
npx prisma format --config prisma7.config.ts
```

## Better Auth

```bash
# Generate/update the auth models (User, Session, Account, Verification)
# in prisma/schema.prisma from the config in src/lib/auth.ts
npx @better-auth/cli generate --config ./src/lib/auth.ts
```

After a `generate` that changes the schema, apply the migration:

```bash
npx prisma migrate dev --name add_better_auth_tables --config prisma7.config.ts
```

## Canonical config

- `src/lib/auth.ts` is the only Better Auth config file to use (Prisma adapter + `@prisma/adapter-pg`).
- `prisma7.config.ts` defines the schema path, migrations path, and datasource — always pass it via `--config` to Prisma commands.
