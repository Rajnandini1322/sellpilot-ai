import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

const DB_PATH = './dev.db';

async function openDb() {
  const wasmPath = path.join(
    process.cwd(),
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm'
  );

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  const file = fs.readFileSync(DB_PATH);
  return new SQL.Database(new Uint8Array(file));
}

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // paise
  currency: string;
  inventory: number;
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export async function getProducts({ q, category, page = 1, limit = 10 }: { q?: string; category?: string; page?: number; limit?: number; }) {
  const db = await openDb();
  const offset = (page - 1) * limit;

  // Build where clauses
  const where: string[] = ["active = 1"];
  if (q) {
    const ql = q.toLowerCase().replace(/'/g, "''");
    where.push(`(lower(name) LIKE '%${ql}%' OR lower(description) LIKE '%${ql}%' OR lower(tags) LIKE '%${ql}%')`);
  }
  if (category) {
    const c = category.replace(/'/g, "''");
    where.push(`category = '${c}'`);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const countRes = db.exec(`SELECT COUNT(*) as cnt FROM Product ${whereSql};`);
  const total = countRes && countRes[0] && countRes[0].values && countRes[0].values[0] ? countRes[0].values[0][0] : 0;

  const res = db.exec(`SELECT id, name, description, category, price, currency, inventory, tags, active, createdAt, updatedAt FROM Product ${whereSql} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset};`);
  const products: CatalogProduct[] = [];
  if (res && res[0]) {
    const { columns, values } = res[0];
    for (const row of values) {
      const item: Record<string, unknown> = {};
      columns.forEach((c: string, i: number) => {
        item[c] = row[i];
      });
      // tags stored as JSON string in DB; parse if needed
      let tags: string[] = [];
      try {
        const raw = item['tags'];
        if (typeof raw === 'string') tags = JSON.parse(raw as string);
        else if (Array.isArray(raw)) tags = raw as string[];
      } catch (_err) {
        tags = [];
      }
      products.push({
        id: String(item['id'] ?? ''),
        name: String(item['name'] ?? ''),
        description: String(item['description'] ?? ''),
        category: String(item['category'] ?? ''),
        price: Number(item['price'] ?? 0),
        currency: String(item['currency'] ?? 'INR'),
        inventory: Number(item['inventory'] ?? 0),
        tags,
        active: Boolean(item['active']),
        createdAt: String(item['createdAt'] ?? ''),
        updatedAt: item['updatedAt'] ? String(item['updatedAt']) : null,
      });
    }
  }

  db.close();
  return {
    products,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function getProductById(id: string) {
  const db = await openDb();
  const res = db.exec(`SELECT id, name, description, category, price, currency, inventory, tags, active, createdAt, updatedAt FROM Product WHERE id = '${id}' LIMIT 1;`);
  if (!res || !res[0] || !res[0].values || res[0].values.length === 0) {
    db.close();
    return null;
  }
  const row = res[0].values[0];
  const item: Record<string, unknown> = {};
  res[0].columns.forEach((c: string, i: number) => (item[c] = row[i]));

  let tags: string[] = [];
  try {
    const raw = item['tags'];
    if (typeof raw === 'string') tags = JSON.parse(raw as string);
    else if (Array.isArray(raw)) tags = raw as string[];
  } catch (_err) { tags = []; }

  db.close();

  if (!item['active']) return null;

  const out: CatalogProduct = {
    id: String(item['id'] ?? ''),
    name: String(item['name'] ?? ''),
    description: String(item['description'] ?? ''),
    category: String(item['category'] ?? ''),
    price: Number(item['price'] ?? 0),
    currency: String(item['currency'] ?? 'INR'),
    inventory: Number(item['inventory'] ?? 0),
    tags,
    active: Boolean(item['active']),
    createdAt: String(item['createdAt'] ?? ''),
    updatedAt: item['updatedAt'] ? String(item['updatedAt']) : null,
  };

  return out;
}

export async function getAgentCatalog() {
  const db = await openDb();
  // Use the demo merchant (first merchant)
  const mres = db.exec(`SELECT id, name FROM Merchant LIMIT 1;`);
  const merchant = mres && mres[0] && mres[0].values && mres[0].values[0] ? { id: mres[0].values[0][0], name: mres[0].values[0][1] } : { id: 'unknown', name: 'Unknown' };

  const pres = db.exec(`SELECT id, name, description, category, price, currency, inventory, tags FROM Product WHERE active = 1 ORDER BY createdAt DESC;`);
  const products: Array<Record<string, unknown>> = [];
  if (pres && pres[0]) {
    const { columns, values } = pres[0];
    for (const row of values) {
      const item: Record<string, unknown> = {};
      columns.forEach((c: string, i: number) => (item[c] = row[i]));
      let tags: string[] = [];
      try {
        const raw = item['tags'];
        if (typeof raw === 'string') tags = JSON.parse(raw as string);
        else if (Array.isArray(raw)) tags = raw as string[];
      } catch (_err) { tags = []; }
      let availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      const inv = Number(item['inventory'] ?? 0);
      if (inv <= 0) availability = 'OUT_OF_STOCK';
      else if (inv < 5) availability = 'LOW_STOCK';

      products.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        currency: item.currency,
        availability,
        category: item.category,
        tags,
      });
    }
  }

  db.close();

  return {
    merchant,
    currency: 'INR',
    products,
  };
}
