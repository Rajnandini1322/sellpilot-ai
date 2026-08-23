import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables } from "@/lib/db/sqlite";

export async function GET() {
  let db: any;
  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const summary = db.exec(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as revenue,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paidOrders,
        COUNT(*) as totalOrders
      FROM "Order";
    `)?.[0]?.values?.[0] || [0, 0, 0];

    const recent = db.exec(`
      SELECT action, reason, amount, status, createdAt
      FROM AuditLog
      ORDER BY datetime(createdAt) DESC
      LIMIT 8;
    `)?.[0];

    const activities = (recent?.values || []).map((r: any[]) => ({
      action: r[0],
      reason: r[1],
      amount: r[2],
      status: r[3],
      createdAt: r[4],
    }));

    return NextResponse.json({
      revenue: Number(summary[0] || 0),
      paidOrders: Number(summary[1] || 0),
      totalOrders: Number(summary[2] || 0),
      conversionRate: Number(summary[2] || 0) ? Number(((Number(summary[1] || 0) / Number(summary[2] || 0)) * 100).toFixed(2)) : 0,
      activities,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to load dashboard" }, { status: 500 });
  } finally {
    db?.close();
  }
}
