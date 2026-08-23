# SellPilot Professional Architecture

```text
Customer
   |
   v
Next.js UI
   |---------------------> Catalog API
   |---------------------> AI Agent API
   |---------------------> Checkout API
   |                             |
   |                             v
   |                        Policy Engine
   |                             |
   |                             v
   |                       Local Order DB
   |                             |
   |                             v
   |                       Razorpay Orders API
   |                             |
   |                             v
   |                       Razorpay Checkout
   |                             |
   |                             v
   |                       Verify Signature
   |                             |
   |                             v
   |                       Order = PAID
   |                             |
   |                             v
   |                       Inventory update
   |
   +-----------------------> Webhook API
                                  |
                                  v
                           Idempotent event log
```

## Revenue agent

The agent is deliberately constrained:

1. Read catalog data.
2. Search products.
3. Generate recommendation, upsell and cross-sell opportunities.
4. Apply availability and policy filters.
5. Never charge a customer directly from chat.
6. Require explicit checkout approval before payment.

## Professional boundary

The AI layer recommends; deterministic business logic authorizes. Payment execution is isolated in the checkout/payment service.
