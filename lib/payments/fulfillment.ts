export function fulfillPaidOrder(db: any, orderId: string) {
  const safeOrderId = orderId.replace(/'/g, "''");

  const orderRows = db.exec(`
    SELECT id, merchantId, amount, status, inventoryDeducted
    FROM "Order"
    WHERE id = '${safeOrderId}'
    LIMIT 1;
  `);

  const order = orderRows?.[0]?.values?.[0];

  if (!order) {
    throw new Error("Order not found during fulfillment");
  }

  const alreadyDeducted = Number(order[4] ?? 0) === 1;

  if (alreadyDeducted) {
    return {
      inventoryDeducted: false,
      alreadyFulfilled: true,
    };
  }

  const itemRows = db.exec(`
    SELECT productId, quantity
    FROM OrderItem
    WHERE orderId = '${safeOrderId}';
  `);

  for (const item of itemRows?.[0]?.values || []) {
    const productId = String(item[0]);
    const quantity = Number(item[1]);

    if (!productId || quantity <= 0) {
      throw new Error("Invalid order item during fulfillment");
    }

    const productRows = db.exec(`
      SELECT inventory
      FROM Product
      WHERE id = '${productId.replace(/'/g, "''")}'
      LIMIT 1;
    `);

    const product = productRows?.[0]?.values?.[0];

    if (!product) {
      throw new Error(`Product not found during fulfillment: ${productId}`);
    }

    const inventory = Number(product[0]);

    if (inventory < quantity) {
      throw new Error(
        `Insufficient inventory for product ${productId}. Available: ${inventory}, required: ${quantity}`
      );
    }

    db.run(
      `UPDATE Product
       SET inventory = inventory - ?,
           "updatedAt" = datetime('now')
       WHERE id = ?`,
      [quantity, productId],
    );
  }

  db.run(
    `UPDATE "Order"
     SET inventoryDeducted = 1,
         status = 'PAID',
         "updatedAt" = datetime('now')
     WHERE id = ?`,
    [orderId],
  );

  return {
    inventoryDeducted: true,
    alreadyFulfilled: false,
  };
}


