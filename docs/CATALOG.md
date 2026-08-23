# Catalog

This document describes the SellPilot AI catalog implemented in Milestone 1.

Overview
- Database-backed merchant catalog (SQLite dev.db)
- API endpoints:
  - GET /api/catalog
  - GET /api/catalog/[id]
  - GET /api/agent/catalog

Seeding
- Canonical seed script: `prisma/seed.ts`
- To seed the local dev database run:

  node -e "require('./prisma/seed').seed().catch(e=>{console.error(e);process.exit(1)})"

  Or with ts-node:

  npx ts-node prisma/seed.ts

The seed is idempotent and creates:
- One demo merchant: SellPilot Demo Store (demo@sellpilot.local)
- 15+ realistic products across categories: Keyboards, Mice, Headphones, Laptop Accessories, Webcams, USB Hubs

Money representation
- Prices are stored as integer paise (no floating point). API responses keep price as integer paise.

Agent-readable catalog
- GET /api/agent/catalog returns machine-readable structure with limited merchant info (id, name only) and products having availability: IN_STOCK, LOW_STOCK, OUT_OF_STOCK.

Database / runtime adapter
- Current strategy: The application uses a local SQLite dev database (dev.db) and reads/writes it at runtime using sql.js (WASM). This avoids native build toolchain requirements and keeps the repo self-contained for local development and CI.
- Prisma 7 is used for schema and migrations. PrismaClient requires a runtime driver adapter to instantiate a client in some environments; to avoid coupling the application to a specific adapter (and native build steps) the runtime code in `lib/catalog` uses `sql.js` to read the local SQLite file directly.
- The canonical seeder `prisma/seed.ts` also uses `sql.js`. This keeps a single, deterministic seeding approach that is idempotent.
- Long-term: for production, migrate to a proper Prisma driver adapter (for example `@prisma/adapter-better-sqlite3` or a hosted libSQL adapter) and instantiate `PrismaClient({ adapter })` in server runtime code. That change should be performed once a target production DB is chosen.

Security
- No merchant email or secrets are exposed in public APIs.
- dev.db and .env are ignored in .gitignore.

API notes
- GET /api/catalog supports q, category, page, limit. Uses Zod validation with a sensible max limit (50).
- GET /api/catalog returns only active products.

