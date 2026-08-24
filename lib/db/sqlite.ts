import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

const DB_PATH = path.join(process.cwd(), "dev.db");
const WASM_PATH = path.join(
  process.cwd(),
  "node_modules",
  "sql.js",
  "dist",
  "sql-wasm.wasm"
);

export async function openSqlite() {
  const SQL = await initSqlJs({
    locateFile: () => WASM_PATH,
  });

  const file = fs.existsSync(DB_PATH)
    ? fs.readFileSync(DB_PATH)
    : null;

  const db = file
    ? new SQL.Database(new Uint8Array(file))
    : new SQL.Database();

  return db;
}

type SqliteDatabase = Awaited<ReturnType<typeof openSqlite>>;

export function persistSqlite(db: SqliteDatabase) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function closeSqlite(
  db: SqliteDatabase,
  persist = false
) {
  if (persist) {
    persistSqlite(db);
  }

  db.close();
}

export function ensureCommerceTables(db: SqliteDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS Payment (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      razorpayPaymentId TEXT UNIQUE,
      razorpayOrderId TEXT,
      signature TEXT,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'CREATED',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS WebhookEvent (
      id TEXT PRIMARY KEY,
      event TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const cols = db.exec(
    `PRAGMA table_info("Order");`
  )[0]?.values ?? [];

  const names = new Set(
    cols.map((r: unknown[]) => String(r[1]))
  );

  const add = (
    name: string,
    sqlType: string
  ) => {
    if (!names.has(name)) {
      db.run(
        `ALTER TABLE "Order" ADD COLUMN "${name}" ${sqlType};`
      );
    }
  };

  add("receipt", "TEXT");
  add("razorpayPaymentId", "TEXT");
  add("razorpaySignature", "TEXT");
  add("customerName", "TEXT");
  add("customerEmail", "TEXT");
  add("customerContact", "TEXT");
}

