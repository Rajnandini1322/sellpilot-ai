import { NextResponse } from "next/server";
import {
  openSqlite,
  ensureCommerceTables,
} from "@/lib/db/sqlite";

export async function GET() {
  let db: any;

  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const merchantResult = db.exec(`
      SELECT id
      FROM Merchant
      ORDER BY "createdAt" ASC
      LIMIT 1;
    `);

    const merchantId = merchantResult?.[0]?.values?.[0]?.[0];

    if (!merchantId) {
      return NextResponse.json({
        events: [],
        stats: {
          total: 0,
          successful: 0,
          lastActivity: null,
        },
      });
    }

    const safeMerchantId = String(merchantId).replace(/'/g, "''");

    const result = db.exec(`
      SELECT
        id,
        action,
        reason,
        amount,
        status,
        metadata,
        "createdAt"
      FROM AuditLog
      WHERE merchantId = '${safeMerchantId}'
      ORDER BY "createdAt" DESC
      LIMIT 100;
    `);

    const rows = result?.[0]?.values || [];

    const events = rows.map((row: any[]) => ({
      id: String(row[0]),
      action: String(row[1]),
      reason: String(row[2]),
      amount: row[3] === null ? null : Number(row[3]),
      status: String(row[4]),
      metadata: row[5],
      createdAt: row[6],
    }));

    const successful = events.filter(
      (event: any) => event.status === "SUCCESS"
    ).length;

    return NextResponse.json({
      events,
      stats: {
        total: events.length,
        successful,
        lastActivity:
          events.length > 0
            ? events[0].createdAt
            : null,
      },
    });
  } catch (error) {
    console.error("Audit GET error:", error);

    return NextResponse.json(
      { error: "Failed to load audit trail" },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
