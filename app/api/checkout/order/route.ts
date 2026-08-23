import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductById } from "@/lib/catalog";
import { evaluatePurchasePolicy } from "@/lib/policies/engine";
import { openSqlite, ensureCommerceTables, persistSqlite } from "@/lib/db/sqlite";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import crypto from "crypto";

const BodySchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(5),
  })).min(1).max(20),
  customer: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    contact: z.string().min(10).max(15),
  }),
});

export async function POST(req: Request) {
  let db: any;
  try {
    const body = BodySchema.parse(await req.json());
    const products = [];

    for (const item of body.items) {
      const product = await getProductById(item.productId);
      const decision = evaluatePurchasePolicy(
        {
          sessionId: "checkout",
          productId: item.productId,
          quantity: item.quantity,
          requestedAt: new Date().toISOString(),
        },
        product,
      );

      if (decision.decision !== "REQUIRE_APPROVAL") {
        return NextResponse.json({ error: decision.reason, checks: decision.checks }, { status: 400 });
      }
      products.push({ item, product });
    }

    const amount = products.reduce((sum, x) => sum + x.product!.price * x.item.quantity, 0);
    if (amount <= 0) return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });

    db = await openSqlite();
    ensureCommerceTables(db);

    const merchant = db.exec(`SELECT id, name FROM Merchant ORDER BY "createdAt" ASC LIMIT 1;`);
    const merchantId = merchant?.[0]?.values?.[0]?.[0];
    if (!merchantId) throw new Error("Demo merchant not found. Run the seed first.");

    const localOrderId = crypto.randomUUID().replace(/-/g, "");
    const receipt = `sp_${localOrderId.slice(0, 24)}`;

    db.run(
      `INSERT INTO "Order" (id, merchantId, amount, currency, status, receipt, customerName, customerEmail, customerContact, "createdAt", "updatedAt")
       VALUES (?, ?, ?, 'INR', 'PENDING', ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [localOrderId, merchantId, amount, receipt, body.customer.name, body.customer.email, body.customer.contact],
    );

    for (const { item, product } of products) {
      db.run(
        `INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID().replace(/-/g, ""), localOrderId, product!.id, item.quantity, product!.price],
      );
    }

    const razorpay = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt,
      notes: { local_order_id: localOrderId, merchant_id: String(merchantId) },
    });

    db.run(
      `UPDATE "Order" SET razorpayOrderId = ?, "updatedAt" = datetime('now') WHERE id = ?`,
      [razorpay.id, localOrderId],
    );
    persistSqlite(db);

    return NextResponse.json({
      order: {
        id: localOrderId,
        razorpayOrderId: razorpay.id,
        amount,
        currency: "INR",
        status: "PENDING",
      },
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpay.id,
      },
    });
  } catch (error: any) {
    console.error("Checkout order error:", error);
    return NextResponse.json({ error: error?.message || "Unable to create checkout order" }, { status: 400 });
  } finally {
    db?.close();
  }
}
