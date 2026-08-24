# SellPilot AI — Revenue Assistant


# SellPilot AI is an AI-assisted commerce platform designed to help merchants increase revenue through intelligent product discovery, upselling, cross-selling, secure checkout, and revenue analytics.


# \## 🚀 Key Features


# \- Merchant revenue dashboard

# \- AI-powered product search and discovery

# \- Session-aware recommendations

# \- Intelligent upselling

# \- Complementary product cross-selling

# \- Inventory-aware recommendations

# \- Revenue opportunity detection

# \- Add-to-cart functionality

# \- Secure Razorpay Test Mode checkout

# \- Server-side Razorpay order creation

# \- HMAC-SHA256 payment signature verification

# \- Payment and order status tracking

# \- Inventory updates after successful payment

# \- Audit trail for important commerce events

# \- Explicit customer approval before payment


# \## 🧠 AI Revenue Flow


# Customer Query

# → Product Search

# → Recommendation

# → Upsell / Cross-sell

# → Add to Cart

# → Secure Checkout

# → Customer Approval

# → Razorpay Payment

# → Server-side Verification

# → Order Confirmation

# → Inventory Update

# → Revenue Dashboard


# \## 🛠️ Tech Stack


# \- Next.js 16

# \- React 19

# \- TypeScript

# \- Tailwind CSS

# \- Zod

# \- SQL.js / SQLite

# \- Prisma

# \- Razorpay Test Mode

# \- REST APIs


# \## 📂 Main Routes


# | Route | Purpose |

# |---|---|

# | `/` | Merchant Dashboard |

# | `/catalog` | Product Catalog |

# | `/agent` | AI Revenue Assistant |

# | `/checkout` | Secure Checkout |


# \## 🔐 Security


# SellPilot AI follows an explicit approval boundary for payments.


# The AI agent can recommend products and identify revenue opportunities, but it cannot directly charge customers.


# Checkout:


# 1\. Recalculates the order total from the server-side catalog.

# 2\. Validates the purchase policy.

# 3\. Creates the Razorpay order server-side.

# 4\. Keeps the Razorpay secret key server-side.

# 5\. Verifies the Razorpay payment signature using HMAC-SHA256.

# 6\. Marks the order as paid only after successful verification.

# 7\. Updates inventory after successful payment.


# Never commit `.env` or any Razorpay secret key.


# \## ⚙️ Local Setup


# ```bash

# npm install

# copy .env.example .env

# node prisma/seed\_sql.js

# npx prisma generate

# npm run typecheck

# npm test

# npm run build

# npm run dev
