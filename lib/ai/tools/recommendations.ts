/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchProducts, getProduct } from './index';

export type RecInput = { productId?: string; query?: string };

// Simple deterministic recommendation engine
export async function getRecommendations({ productId, query }: RecInput) {
  if (productId) {
    const base = await getProduct({ productId });
    if (!base) return [];
    // find same category and shared tags
    const candidates = await searchProducts({ query: undefined, category: base.category, limit: 20 });
    const others = candidates.filter((c: any) => c.id !== base.id && c.inventory > 0);
    // score by shared tags and proximity in price
    const scored = others.map((c: any) => {
      const sharedTags = (c.tags || []).filter((t: string) => (base.tags || []).includes(t)).length;
      const priceDiff = Math.abs(c.price - base.price);
      return { item: c, score: sharedTags * 10 - Math.min(priceDiff / 10000, 10) };
    }).sort((a: any, b: any) => b.score - a.score);
    return scored.slice(0, 5).map((s: any) => ({ product: s.item, reason: `Shared tags: ${ (s.item.tags || []).filter((t: string) => (base.tags || []).includes(t)).join(', ') }` }));
  }
  if (query) {
    const results = await searchProducts({ query, limit: 10 });
    return results.slice(0, 5).map((r: any) => ({ product: r, reason: `Matches query: ${query}` }));
  }
  return [];
}
