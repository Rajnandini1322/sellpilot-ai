import { NextResponse } from "next/server";
import { openSqlite, ensureCommerceTables } from "@/lib/db/sqlite";

export async function GET() {
  let db: any;

  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const summaryResult = db.exec(`
      SELECT
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paidOrders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status IN ('FAILED', 'CANCELLED') THEN 1 END) as failedOrders,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as revenue,
        COALESCE(AVG(CASE WHEN status = 'PAID' THEN amount END), 0) as averageOrderValue
      FROM "Order";
    `);

    const summary = summaryResult?.[0]?.values?.[0] || [];

    const monthlyResult = db.exec(`
      SELECT
        substr(createdAt, 1, 7) as month,
        COUNT(*) as orders,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as revenue
      FROM "Order"
      GROUP BY substr(createdAt, 1, 7)
      ORDER BY month ASC
      LIMIT 12;
    `);

    const monthly = (monthlyResult?.[0]?.values || []).map((row: any[]) => ({
      month: String(row[0]),
      orders: Number(row[1] || 0),
      revenue: Number(row[2] || 0),
    }));

    const productsResult = db.exec(`
      SELECT
        p.name,
        p.category,
        COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN oi.quantity ELSE 0 END), 0) as unitsSold,
        COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN oi.quantity * oi.price ELSE 0 END), 0) as revenue
      FROM Product p
      LEFT JOIN OrderItem oi ON oi.productId = p.id
      LEFT JOIN "Order" o ON o.id = oi.orderId
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 8;
    `);

    const topProducts = (productsResult?.[0]?.values || []).map(
      (row: any[]) => ({
        name: String(row[0]),
        category: String(row[1]),
        unitsSold: Number(row[2] || 0),
        revenue: Number(row[3] || 0),
      })
    );

    const categoryResult = db.exec(`
      SELECT
        p.category,
        COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN oi.quantity * oi.price ELSE 0 END), 0) as revenue
      FROM Product p
      LEFT JOIN OrderItem oi ON oi.productId = p.id
      LEFT JOIN "Order" o ON o.id = oi.orderId
      GROUP BY p.category
      ORDER BY revenue DESC;
    `);

    const categories = (categoryResult?.[0]?.values || []).map(
      (row: any[]) => ({
        category: String(row[0]),
        revenue: Number(row[1] || 0),
      })
    );

    const totalOrders = Number(summary[0] || 0);
    const paidOrders = Number(summary[1] || 0);

    return NextResponse.json({
      summary: {
        totalOrders,
        paidOrders,
        pendingOrders: Number(summary[2] || 0),
        failedOrders: Number(summary[3] || 0),
        revenue: Number(summary[4] || 0),
        averageOrderValue: Math.round(Number(summary[5] || 0)),
        conversionRate: totalOrders
          ? Number(((paidOrders / totalOrders) * 100).toFixed(1))
          : 0,
      },
      monthly,
      topProducts,
      categories,
    });
  } catch (error: any) {
    console.error("Analytics GET error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load analytics",
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
