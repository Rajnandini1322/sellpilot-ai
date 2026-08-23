/* DEPRECATED: inspect_tables is a dev helper. Use prisma/seed.ts for canonical seeding. */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const initSqlJs = require('sql.js');
(async function(){
  const SQL = await initSqlJs();
  const file = fs.readFileSync('./dev.db');
  const db = new SQL.Database(new Uint8Array(file));
  const res = db.exec("PRAGMA table_info('Product')");
  console.dir(res, { depth: null });
  const res2 = db.exec("PRAGMA table_info('Merchant')");
  console.dir(res2, { depth: null });
  db.close();
})();
