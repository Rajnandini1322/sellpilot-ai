/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchProducts, getProduct } from './index';

export type UpsellInput = {
  productId: string;
};

export async function getUpsell({ productId }: UpsellInput) {
  const base = await getProduct({ productId });

  if (!base) return [];

  const candidates = await searchProducts({
    category: base.category,
    limit: 50,
  });

  // First preference:
  // higher-priced products from same category
  const higherValue = candidates
    .filter(
      (c: any) =>
        c.id !== base.id &&
        c.inventory > 0 &&
        c.price > base.price
    )
    .sort((a: any, b: any) => a.price - b.price);

  if (higherValue.length > 0) {
    return higherValue.slice(0, 3).map((p: any) => ({
      product: p,
      reason: `Higher-value option in the same ${base.category} category.`,
    }));
  }

  // Fallback:
  // If no higher-priced product exists, return
  // other available products from the same category.
  const alternatives = candidates
    .filter(
      (c: any) =>
        c.id !== base.id &&
        c.inventory > 0
    )
    .sort(
      (a: any, b: any) =>
        Math.abs(a.price - base.price) -
        Math.abs(b.price - base.price)
    );

  return alternatives.slice(0, 3).map((p: any) => ({
    product: p,
    reason: `Alternative ${base.category} option that may suit your needs.`,
  }));
}