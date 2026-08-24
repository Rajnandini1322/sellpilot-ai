# SellPilot AI — AI Revenue Assistant

SellPilot AI is an AI-assisted commerce platform that helps merchants discover products, increase revenue through intelligent recommendations, upselling and cross-selling, manage campaigns, and complete secure customer-approved checkout.

## Overview

SellPilot acts as a revenue assistant for merchants. It analyzes customer shopping intent and the product catalog to identify relevant products and revenue opportunities while keeping payment authorization under explicit customer control.

## Key Features

### AI Revenue Assistant
- Natural-language product search
- Product discovery
- Session-aware recommendations
- Intelligent upselling
- Complementary product cross-selling
- Revenue opportunity detection
- Inventory-aware recommendations

### Merchant Dashboard
- Total revenue tracking
- Paid order tracking
- Conversion rate
- AI-generated revenue opportunities
- Revenue opportunity cards
- Recent agent activity

### Commerce and Secure Checkout
- Product catalog management
- Add-to-cart functionality
- Server-side Razorpay order creation
- Razorpay Test Mode integration
- Server-side payment signature verification
- Payment and order status tracking
- Inventory update after successful payment
- Explicit customer approval before payment

### Campaign Management
- Create campaigns
- Draft and active campaign states
- Campaign activation and deactivation
- Campaign performance tracking
- Revenue tracking

### Audit and Security
- Payment verification audit trail
- Server-side payment verification
- HMAC-SHA256 Razorpay signature verification
- Customer approval before payment
- Environment secrets excluded from Git
- Policy-based transaction validation

## Technology Stack

- Next.js 16
- React
- TypeScript
- Prisma
- SQLite / SQL.js
- Razorpay Test Mode
- Vitest
- ESLint
- Turbopack

## Project Structure

```text
sellpilot-ai/
├── app/
│   ├── api/
│   │   ├── agent/
│   │   ├── audit-trail/
│   │   ├── campaigns/
│   │   ├── catalog/
│   │   ├── checkout/
│   │   ├── dashboard/
│   │   └── orders/
│   ├── agent/
│   ├── audit-trail/
│   ├── campaigns/
│   ├── catalog/
│   ├── checkout/
│   ├── settings/
│   └── page.tsx
│
├── components/
├── lib/
│   ├── ai/
│   ├── catalog/
│   ├── payments/
│   ├── policies/
│   └── db/
│
├── prisma/
├── scripts/
├── tests/
├── types/
├── .env.example
├── package.json
└── README.md