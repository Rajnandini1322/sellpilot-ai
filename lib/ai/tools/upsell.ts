/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchProducts, getProduct } from "./index";

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

  // Only available products that are more expensive than the base product.
  const higherValue = candidates
    .filter(
      (c: any) =>
        c.id !== base.id &&
        c.inventory > 0 &&
        Number(c.price) > Number(base.price)
    )
    .sort(
      (a: any, b: any) =>
        Number(a.price) - Number(b.price)
    );

  // Prefer the closest higher-priced product.
  if (higherValue.length > 0) {
    return higherValue.slice(0, 3).map((p: any) => ({
      product: p,
      reason: `Premium upgrade: ${p.name} costs more than ${base.name}.`,
    }));
  }

  // No premium product available.
  // Return alternatives, but NEVER return the base product itself.
  const alternatives = candidates
    .filter(
      (c: any) =>
        c.id !== base.id &&
        c.inventory > 0
    )
    .sort(
      (a: any, b: any) =>
        Math.abs(Number(a.price) - Number(base.price)) -
        Math.abs(Number(b.price) - Number(base.price))
    );

  return alternatives.slice(0, 3).map((p: any) => ({
    product: p,
    reason: `Alternative ${base.category} option that may suit your needs.`,
  }));
}