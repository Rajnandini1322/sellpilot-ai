import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables } from "@/lib/db/sqlite";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let db: any;
  try {
    const { id } = await ctx.params;
    const safe = id.replace(/'/g, "''");
    db = await openSqlite();
    ensureCommerceTables(db);
    const rows = db.exec(`SELECT id, amount, currency, status, razorpayOrderId, razorpayPaymentId, customerName, customerEmail, createdAt FROM "Order" WHERE id = '${safe}' LIMIT 1;`);
    const row = rows?.[0]?.values?.[0];
    if (!row) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({
      order: {
        id: row[0], amount: row[1], currency: row[2], status: row[3],
        razorpayOrderId: row[4], razorpayPaymentId: row[5],
        customerName: row[6], customerEmail: row[7], createdAt: row[8],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to load order" }, { status: 500 });
  } finally {
    db?.close();
  }
}
