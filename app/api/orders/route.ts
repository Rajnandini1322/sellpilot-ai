import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables } from "@/lib/db/sqlite";

export async function GET() {
  let db: any;

  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const result = db.exec(`
      SELECT
        o.id,
        o.customerName,
        o.customerEmail,
        o.customerContact,
        o.amount,
        o.currency,
        o.status,
        o.razorpayOrderId,
        o.razorpayPaymentId,
        o.createdAt,
        o.updatedAt,
        COUNT(oi.id) as itemCount
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi.orderId = o.id
      GROUP BY o.id
      ORDER BY datetime(o.createdAt) DESC;
    `);

    const orders = (result?.[0]?.values || []).map((row: any[]) => ({
      id: String(row[0]),
      customerName: row[1] ? String(row[1]) : "Guest Customer",
      customerEmail: row[2] ? String(row[2]) : "—",
      customerContact: row[3] ? String(row[3]) : "—",
      amount: Number(row[4] || 0),
      currency: String(row[5] || "INR"),
      status: String(row[6] || "PENDING"),
      razorpayOrderId: row[7] ? String(row[7]) : null,
      razorpayPaymentId: row[8] ? String(row[8]) : null,
      createdAt: row[9],
      updatedAt: row[10],
      itemCount: Number(row[11] || 0),
    }));

    const paid = orders.filter((o: any) => o.status === "PAID");

    return NextResponse.json({
      orders,
      stats: {
        total: orders.length,
        paid: paid.length,
        pending: orders.filter((o: any) => o.status === "PENDING").length,
        failed: orders.filter((o: any) =>
          ["FAILED", "CANCELLED"].includes(o.status)
        ).length,
        revenue: paid.reduce(
          (sum: number, o: any) => sum + Number(o.amount || 0),
          0
        ),
      },
    });
  } catch (error: any) {
    console.error("Orders GET error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load orders",
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
