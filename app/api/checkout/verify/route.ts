import { NextResponse } from "next/server";
import { z } from "zod";
import { openSqlite, ensureCommerceTables, persistSqlite } from "@/lib/db/sqlite";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const BodySchema = z.object({
  localOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: Request) {
  let db: any;
  try {
    const body = BodySchema.parse(await req.json());
    db = await openSqlite();
    ensureCommerceTables(db);

    const result = db.exec(`SELECT id, razorpayOrderId, amount, status FROM "Order" WHERE id = ? LIMIT 1;`);
    // sql.js exec does not bind parameters; safely escape our server-generated IDs.
    const safeId = body.localOrderId.replace(/'/g, "''");
    const rows = db.exec(`SELECT id, razorpayOrderId, amount, status FROM "Order" WHERE id = '${safeId}' LIMIT 1;`);
    const row = rows?.[0]?.values?.[0];
    if (!row) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const serverOrderId = String(row[1] || "");
    if (!serverOrderId || serverOrderId !== body.razorpayOrderId) {
      return NextResponse.json({ error: "Razorpay order mismatch" }, { status: 400 });
    }

    if (String(row[3]) === "PAID") {
      return NextResponse.json({ success: true, status: "PAID", message: "Payment already verified." });
    }

    const valid = verifyPaymentSignature(serverOrderId, body.razorpayPaymentId, body.razorpaySignature);
    if (!valid) {
      db.run(`UPDATE "Order" SET status = 'PAYMENT_VERIFICATION_FAILED', "updatedAt" = datetime('now') WHERE id = ?`, [body.localOrderId]);
      persistSqlite(db);
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    const paymentId = body.razorpayPaymentId.replace(/'/g, "''");
    const existing = db.exec(`SELECT id FROM Payment WHERE razorpayPaymentId = '${paymentId}' LIMIT 1;`);
    if (existing?.[0]?.values?.length) {
      return NextResponse.json({ success: true, status: "PAID", message: "Payment already recorded." });
    }

    db.run(`INSERT INTO Payment (id, orderId, razorpayPaymentId, razorpayOrderId, signature, amount, currency, status)
      VALUES (?, ?, ?, ?, ?, ?, 'INR', 'CAPTURED')`,
      [cryptoRandom(), body.localOrderId, body.razorpayPaymentId, serverOrderId, body.razorpaySignature, Number(row[2])]);

    db.run(`UPDATE "Order" SET status = 'PAID', razorpayPaymentId = ?, razorpaySignature = ?, "updatedAt" = datetime('now') WHERE id = ?`,
      [body.razorpayPaymentId, body.razorpaySignature, body.localOrderId]);

    // Decrement inventory only once, after verified payment.
    const items = db.exec(`SELECT productId, quantity FROM OrderItem WHERE orderId = '${body.localOrderId.replace(/'/g,"''")}'`);
    for (const item of items?.[0]?.values || []) {
      db.run(`UPDATE Product SET inventory = CASE WHEN inventory >= ? THEN inventory - ? ELSE 0 END, "updatedAt" = datetime('now') WHERE id = ?`,
        [Number(item[1]), Number(item[1]), String(item[0])]);
    }

    db.run(`INSERT INTO AuditLog (id, merchantId, orderId, action, reason, amount, status, metadata, "createdAt")
      SELECT ?, merchantId, id, 'PAYMENT_VERIFIED', 'Razorpay checkout signature verified server-side', amount, 'SUCCESS', ?, datetime('now')
      FROM "Order" WHERE id = ?`,
      [cryptoRandom(), JSON.stringify({ razorpayPaymentId: body.razorpayPaymentId }), body.localOrderId]);

    persistSqlite(db);
    return NextResponse.json({ success: true, status: "PAID", orderId: body.localOrderId });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error?.message || "Unable to verify payment" }, { status: 400 });
  } finally {
    db?.close();
  }
}

function cryptoRandom() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}
