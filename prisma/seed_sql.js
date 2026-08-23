/* DEPRECATED: This JS seeder is kept for compatibility. The canonical seeder is prisma/seed.ts. */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const initSqlJs = require('sql.js');

async function seed() {
  const SQL = await initSqlJs();
  const path = './dev.db';
  let filebuffer = fs.existsSync(path) ? fs.readFileSync(path) : null;
  const db = filebuffer ? new SQL.Database(new Uint8Array(filebuffer)) : new SQL.Database();

  // Ensure merchants table exists (created by prisma db push previously)
  // Use INSERT ... ON CONFLICT for idempotency
  const merchantEmail = 'demo@sellpilot.local';
  const merchantName = 'SellPilot Demo Store';

  db.run(`INSERT INTO Merchant (id, name, email, "createdAt", "updatedAt") VALUES (replace(hex(randomblob(16)), '-', ''), ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(email) DO UPDATE SET name = excluded.name, "updatedAt" = datetime('now');`, [merchantName, merchantEmail]);

  // Get merchant id
  const mRes = db.exec(`SELECT id FROM Merchant WHERE email = '${merchantEmail}'`);
  if (!mRes || mRes.length === 0) {
    throw new Error('Failed to find or create merchant');
  }
  const merchantId = mRes[0].values[0][0];

  const products = [
    { name: 'Novaforge Mechanical Keyboard', description: 'Tactile hot-swap mechanical keyboard with ergonomic layout and white backlight.', category: 'Keyboards', price: 749900, inventory: 25, tags: ['mechanical','hot-swap','ergonomic','rgb'] },
    { name: 'AeroSwift Wireless Mouse', description: 'Compact wireless mouse with high-precision sensor and long battery life.', category: 'Mice', price: 239900, inventory: 80, tags: ['wireless','ergonomic','usb-receiver'] },
    { name: 'SilencePro ANC Headphones', description: 'Over-ear noise cancelling headphones with balanced audio and comfortable cushions.', category: 'Headphones', price: 1299900, inventory: 40, tags: ['anc','bluetooth','over-ear'] },
    { name: 'FlexStand Laptop Riser', description: 'Adjustable aluminum laptop stand for better ergonomics and airflow.', category: 'Laptop Accessories', price: 199900, inventory: 60, tags: ['stand','aluminum','adjustable'] },
    { name: 'ClearView 1080p Webcam', description: 'Full HD 1080p webcam with built-in microphone and low-light correction.', category: 'Webcams', price: 359900, inventory: 30, tags: ['1080p','usb','low-light'] },
    { name: 'PortMaster USB-C 7-in-1 Hub', description: 'Multiport USB-C hub with HDMI, Ethernet, USB-A, and SD card reader.', category: 'USB Hubs', price: 289900, inventory: 45, tags: ['usb-c','hdmi','ethernet','sd-card'] },
    { name: 'Compact Mechanical Mini Keyboard', description: '60% mechanical keyboard suited for programmers and compact setups.', category: 'Keyboards', price: 499900, inventory: 10, tags: ['60%','mechanical','compact'] },
    { name: 'Ergo Travel Mouse', description: 'Portable travel mouse with Bluetooth and foldable design.', category: 'Mice', price: 159900, inventory: 0, tags: ['portable','bluetooth','travel'] },
    { name: 'Studio Monitoring Headset', description: 'Closed-back headset for monitoring and studio use.', category: 'Headphones', price: 699900, inventory: 5, tags: ['studio','closed-back','wired'] },
    { name: 'LapEase Cushioned Lap Desk', description: 'Cushioned lap desk with wrist support for comfortable laptop use.', category: 'Laptop Accessories', price: 99900, inventory: 120, tags: ['lap-desk','cushion','portable'] },
    { name: 'StreamLens 2K Webcam', description: '2K webcam with wide dynamic range and advanced low-light performance.', category: 'Webcams', price: 549900, inventory: 15, tags: ['2k','streaming','autofocus'] },
    { name: 'UltraPort USB-C Hub Slim', description: 'Slim USB-C hub designed for ultrabooks with pass-through charging.', category: 'USB Hubs', price: 219900, inventory: 50, tags: ['usb-c','pass-through','slim'] },
    { name: 'OfficePro Mechanical Keyboard', description: 'Quiet mechanical switches optimized for office environments.', category: 'Keyboards', price: 399900, inventory: 22, tags: ['mechanical','quiet','office'] },
    { name: 'Precision Gaming Mouse', description: 'High-DPI wired gaming mouse with programmable buttons.', category: 'Mice', price: 329900, inventory: 18, tags: ['gaming','wired','high-dpi'] },
    { name: 'ComfortFold Laptop Sleeve', description: 'Protective laptop sleeve with extra padding and water-resistant fabric.', category: 'Laptop Accessories', price: 89900, inventory: 70, tags: ['sleeve','padded','water-resistant'] },
  ];

  for (const p of products) {
    const tagsJson = JSON.stringify(p.tags).replace(/'/g, "''");
    const sql = `INSERT INTO Product (id, merchantId, name, description, category, price, currency, inventory, tags, active, "createdAt", "updatedAt") VALUES (replace(hex(randomblob(16)), '-', ''), '${merchantId}', '${p.name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', '${p.category.replace(/'/g, "''")}', ${p.price}, 'INR', ${p.inventory}, '${tagsJson}', 1, datetime('now'), datetime('now')) ON CONFLICT(merchantId, name) DO UPDATE SET description=excluded.description, category=excluded.category, price=excluded.price, inventory=excluded.inventory, tags=excluded.tags, active=1, "updatedAt"=datetime('now');`;
    db.run(sql);
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path, buffer);
  db.close();
  console.log('Seed (sql.js) complete');
}

if (require.main === module) {
  seed().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { seed };
