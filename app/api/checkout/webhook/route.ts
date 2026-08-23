import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables, persistSqlite } from "@/lib/db/sqlite";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(req: Request) {
  let db: any;
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    if (!verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(raw);
    const eventId = String(payload?.id || `${payload?.event}_${payload?.created_at}`);
    const event = String(payload?.event || "unknown");

    db = await openSqlite();
    ensureCommerceTables(db);

    const safeEventId = eventId.replace(/'/g, "''");
    const existing = db.exec(`SELECT id FROM WebhookEvent WHERE id = '${safeEventId}' LIMIT 1;`);
    if (existing?.[0]?.values?.length) return NextResponse.json({ received: true, duplicate: true });

    db.run(`INSERT INTO WebhookEvent (id, event, payload) VALUES (?, ?, ?)`, [eventId, event, raw]);

    const razorpayOrderId =
      payload?.payload?.payment?.entity?.order_id ||
      payload?.payload?.order?.entity?.id;

    if (razorpayOrderId) {
      const safeOrder = String(razorpayOrderId).replace(/'/g, "''");
      let status: string | null = null;
      if (event === "payment.captured" || event === "order.paid") status = "PAID";
      if (event === "payment.failed") status = "PAYMENT_FAILED";

      if (status) {
        db.run(`UPDATE "Order" SET status = ?, "updatedAt" = datetime('now') WHERE razorpayOrderId = ?`, [status, razorpayOrderId]);
      }

      if (event === "payment.captured") {
        const payment = payload?.payload?.payment?.entity;
        if (payment?.id) {
          const safePayment = String(payment.id).replace(/'/g, "''");
          const already = db.exec(`SELECT id FROM Payment WHERE razorpayPaymentId = '${safePayment}' LIMIT 1;`);
          if (!already?.[0]?.values?.length) {
            db.run(`INSERT INTO Payment (id, orderId, razorpayPaymentId, razorpayOrderId, amount, currency, status)
              SELECT ?, id, ?, razorpayOrderId, ?, currency, 'CAPTURED' FROM "Order" WHERE razorpayOrderId = ?`,
              [eventId, payment.id, Number(payment.amount || 0), String(razorpayOrderId)]);
          }
        }
      }
    }

    persistSqlite(db);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing failed" }, { status: 400 });
  } finally {
    db?.close();
  }
}
