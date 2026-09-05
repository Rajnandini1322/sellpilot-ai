import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables } from "@/lib/db/sqlite";

export async function GET() {
  let db: any;

  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const result = db.exec(`
      SELECT
        COALESCE(NULLIF(TRIM(customerEmail), ''), 'guest-' || id) as customerKey,
        MAX(COALESCE(NULLIF(TRIM(customerName), ''), 'Guest Customer')) as customerName,
        MAX(COALESCE(NULLIF(TRIM(customerEmail), ''), '—')) as customerEmail,
        MAX(COALESCE(NULLIF(TRIM(customerContact), ''), '—')) as customerContact,
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paidOrders,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as totalSpent,
        MAX(createdAt) as lastOrderAt
      FROM "Order"
      GROUP BY customerKey
      ORDER BY totalSpent DESC, lastOrderAt DESC;
    `);

    const customers = (result?.[0]?.values || []).map((row: any[]) => ({
      id: String(row[0]),
      name: String(row[1] || "Guest Customer"),
      email: String(row[2] || "—"),
      contact: String(row[3] || "—"),
      totalOrders: Number(row[4] || 0),
      paidOrders: Number(row[5] || 0),
      totalSpent: Number(row[6] || 0),
      lastOrderAt: row[7],
    }));

    const activeCustomers = customers.filter(
      (customer: any) => customer.paidOrders > 0
    );

    const totalRevenue = customers.reduce(
      (sum: number, customer: any) => sum + Number(customer.totalSpent || 0),
      0
    );

    return NextResponse.json({
      customers,
      stats: {
        total: customers.length,
        active: activeCustomers.length,
        revenue: totalRevenue,
        averageOrderValue: activeCustomers.length
          ? Math.round(totalRevenue / activeCustomers.reduce(
              (sum: number, customer: any) =>
                sum + Number(customer.paidOrders || 0),
              0
            ))
          : 0,
      },
    });
  } catch (error: any) {
    console.error("Customers GET error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load customers",
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
