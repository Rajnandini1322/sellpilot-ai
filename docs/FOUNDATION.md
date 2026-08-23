SellPilot AI — Foundation

This document describes the foundation created for the SellPilot AI project.

Top-level directories:
- app/ — Next.js App Router pages (existing)
- components/ — UI components (placeholders)
- lib/ — core libraries and boundaries
  - lib/ai/ — AI provider abstraction (no provider yet)
  - lib/catalog/ — catalog helpers and types
  - lib/policies/ — policy engine for money actions
  - lib/payments/ — payment abstraction (no gateway integration)
  - lib/audit/ — audit recording helpers
- prisma/ — Prisma schema and config (configured for SQLite dev)
- types/ — shared TypeScript types
- tests/ — test placeholders (Vitest)
- docs/ — documentation (this file)

Key decisions and reasoning:
- Local dev database uses SQLite (Prisma) to avoid requiring Postgres installation.
- Prisma schema generator updated to the Prisma 7 style (prisma-client-js).
- .env is ignored; .env.example provided with SQLite URL and placeholder Razorpay keys.
- No AI or payment provider keys are committed.

Next manual steps (developer):
1. Copy .env.example to .env and (optionally) change DATABASE_URL when switching to Postgres in later milestones.
2. npm install
3. npx prisma generate
4. npx prisma db push (creates dev.sqlite database at file:./dev.db)
5. npm run dev

Notes:
- This foundation intentionally avoids implementing AI or payment integrations.
- The policy engine denies money actions by default; explicit rules will be added in later milestones.
