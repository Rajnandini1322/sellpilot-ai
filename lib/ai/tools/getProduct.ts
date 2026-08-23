/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProductById } from '../../catalog';

export type GetProductInput = { productId: string };

export async function getProduct({ productId }: GetProductInput) {
  const p = await getProductById(productId);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    currency: p.currency,
    inventory: p.inventory,
    tags: p.tags || [],
    active: p.active,
  };
}
