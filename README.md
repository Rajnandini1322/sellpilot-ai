# SellPilot AI - AI Revenue Assistant

SellPilot AI is an AI-assisted commerce platform designed to help merchants increase revenue through intelligent product discovery, recommendations, upselling, cross-selling, campaigns, secure checkout, and revenue analytics.

## Overview

SellPilot acts as a revenue assistant for merchants. It analyzes the product catalog and customer shopping intent to identify relevant products and revenue opportunities.

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
- Total revenue
- Paid orders
- Conversion rate
- AI revenue opportunity
- Revenue opportunity cards
- Recent agent activity

### Commerce and Checkout
- Product catalog
- Add-to-cart functionality
- Server-side Razorpay order creation
- Razorpay Test Mode integration
- Server-side payment signature verification
- Payment and order status tracking
- Inventory update after successful payment

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

## Local Setup

npm install
copy .env.example .env
node prisma/seed_sql.js
npx prisma generate
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev

## Project Status

SellPilot AI is implemented as a working prototype for AI-assisted merchant revenue optimization using Razorpay Test Mode.
