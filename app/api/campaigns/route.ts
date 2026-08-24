import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  openSqlite,
  ensureCommerceTables,
  persistSqlite,
} from "@/lib/db/sqlite";

function getMerchantId(db: any) {
  const result = db.exec(`
    SELECT id
    FROM "Merchant"
    ORDER BY "createdAt" ASC
    LIMIT 1;
  `);

  return result?.[0]?.values?.[0]?.[0] ?? null;
}

export async function GET() {
  let db: any;

  try {
    db = await openSqlite();
    ensureCommerceTables(db);

    const merchantId = getMerchantId(db);

    if (!merchantId) {
      return NextResponse.json({
        campaigns: [],
        stats: {
          active: 0,
          revenue: 0,
          customersReached: 0,
        },
      });
    }

    const safeMerchantId = String(merchantId).replace(/'/g, "''");

    const result = db.exec(`
      SELECT
        id,
        name,
        type,
        status,
        audience,
        performance,
        revenue,
        "createdAt",
        "updatedAt"
      FROM "Campaign"
      WHERE merchantId = '${safeMerchantId}'
      ORDER BY "createdAt" DESC;
    `);

    const campaigns =
      result?.[0]?.values?.map((row: any[]) => ({
        id: String(row[0]),
        name: String(row[1]),
        type: String(row[2]),
        status: String(row[3]),
        audience: String(row[4]),
        performance: Number(row[5] ?? 0),
        revenue: Number(row[6] ?? 0),
        createdAt: row[7],
        updatedAt: row[8],
      })) ?? [];

    const active = campaigns.filter(
      (campaign: any) => campaign.status === "ACTIVE"
    ).length;

    const revenue = campaigns.reduce(
      (sum: number, campaign: any) =>
        sum + Number(campaign.revenue || 0),
      0
    );

    const customersReached = campaigns.length * 100;

    return NextResponse.json({
      campaigns,
      stats: {
        active,
        revenue,
        customersReached,
      },
    });
  } catch (error) {
    console.error("Campaign GET error:", error);

    return NextResponse.json(
      { error: "Failed to load campaigns" },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}

export async function POST(request: Request) {
  let db: any;

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const type = String(body.type || "Recommendation").trim();
    const audience = String(
      body.audience || "All customers"
    ).trim();

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    db = await openSqlite();
    ensureCommerceTables(db);

    const merchantId = getMerchantId(db);

    if (!merchantId) {
      return NextResponse.json(
        { error: "Demo merchant not found. Run the seed first." },
        { status: 404 }
      );
    }

    const id = crypto.randomUUID().replace(/-/g, "");
    const now = new Date().toISOString();

    db.run(
      `
      INSERT INTO "Campaign"
      (
        id,
        merchantId,
        name,
        type,
        status,
        audience,
        performance,
        revenue,
        "createdAt",
        "updatedAt"
      )
      VALUES (?, ?, ?, ?, 'DRAFT', ?, 0, 0, ?, ?)
      `,
      [
        id,
        String(merchantId),
        name,
        type,
        audience,
        now,
        now,
      ]
    );

    persistSqlite(db);

    return NextResponse.json(
      {
        id,
        merchantId: String(merchantId),
        name,
        type,
        status: "DRAFT",
        audience,
        performance: 0,
        revenue: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campaign POST error:", error);

    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
