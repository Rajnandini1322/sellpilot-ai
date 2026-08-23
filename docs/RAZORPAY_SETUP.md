# Razorpay Test Mode Setup

SellPilot uses Razorpay Standard Checkout with a server-created Order, server-side payment signature verification, and a webhook endpoint.

## Environment

Copy `.env.example` to `.env` and set:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Never commit `.env`.

## Run

```bash
npm install
node prisma/seed_sql.js
npm run typecheck
npm test
npm run build
npm run dev
```

Open `/catalog`, add a product, and continue to `/checkout`.

## Checkout API

`POST /api/checkout/order`

Creates the local order first, validates inventory and policy limits, then creates the Razorpay Test Mode Order server-side.

`POST /api/checkout/verify`

Checks that the Razorpay order ID matches the server-side order and verifies the payment signature with HMAC-SHA256 before marking the order paid and decrementing inventory.

`POST /api/checkout/webhook`

Validates `X-Razorpay-Signature` and handles `payment.captured`, `payment.failed`, and `order.paid` events with an idempotency table.

## Webhook URL

After deploying to a publicly reachable HTTPS environment, configure:

`https://YOUR_DOMAIN/api/checkout/webhook`

Use a strong webhook secret and subscribe to at least:

- `payment.captured`
- `payment.failed`
- `order.paid`

For local webhook testing, expose the local server through a secure tunnel and use the resulting HTTPS URL in Razorpay Test Mode.

## Security

- Key Secret is server-only.
- Checkout never trusts a client-supplied amount.
- The server recalculates the total from catalog prices.
- Inventory and policy checks run before order creation.
- Payment is not fulfilled until the server verifies the Razorpay signature.
- Signature comparison is timing-safe.
- Duplicate payment/webhook processing is guarded with database records.
