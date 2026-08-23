/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchProducts, getProduct } from './index';

export type UpsellInput = { productId: string };

export async function getUpsell({ productId }: UpsellInput) {
  const base = await getProduct({ productId });
  if (!base) return [];
  // find higher-priced products within same category
  const candidates = await searchProducts({ category: base.category, limit: 50 });
  const viable = candidates.filter((c: any) => c.id !== base.id && c.inventory > 0 && c.price > base.price);
  // sort by price ascending (closest higher price)
  viable.sort((a: any, b: any) => a.price - b.price);
  return viable.slice(0, 3).map((p: any) => ({ product: p, reason: `Higher-priced option in same category (price ₹${p.price/100})` }));
}
