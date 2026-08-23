# SellPilot AI — Revenue Assistant

SellPilot is a professional AI-assisted commerce prototype for merchant revenue growth.

## Core capabilities

- Merchant dashboard
- Machine-readable product catalog
- Search and product discovery
- Deterministic AI revenue assistant
- Recommendation, upsell and cross-sell tools
- Inventory-aware guardrails
- Explicit approval boundary before payment
- Razorpay Test Mode Standard Checkout
- Server-side order creation
- Server-side HMAC-SHA256 payment verification
- Idempotent payment/webhook records
- Audit logging
- Automated tests

## Tech stack

Next.js 16, React 19, TypeScript, Tailwind CSS, Zod, SQL.js/SQLite, Razorpay Test Mode.

## Local setup

```bash
npm install
copy .env.example .env
node prisma/seed_sql.js
npm run typecheck
npm test
npm run build
npm run dev
```

Open:

- `/` — merchant dashboard
- `/catalog` — catalog and checkout entry
- `/agent` — revenue assistant
- `/checkout` — secure Razorpay checkout

For Razorpay setup, see `docs/RAZORPAY_SETUP.md`.

## Security model

The AI agent can recommend products but cannot directly charge a customer. Checkout recalculates totals from the server catalog, applies deterministic purchase policy checks, creates the Razorpay Order on the server, and verifies the payment signature before marking an order paid.

Never commit `.env` or a Razorpay Key Secret.
