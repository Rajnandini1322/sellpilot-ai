/* eslint-disable @typescript-eslint/no-explicit-any */
import { searchProducts, getProduct } from './index';

export type CrossSellInput = { productId: string };

const complementary: Record<string, string[]> = {
  'Keyboards': ['Mice', 'Laptop Accessories'],
  'Mice': ['Keyboards', 'Laptop Accessories'],
  'Headphones': ['Webcams', 'Laptop Accessories'],
  'Webcams': ['Headphones', 'USB Hubs'],
  'USB Hubs': ['Laptop Accessories'],
  'Laptop Accessories': ['USB Hubs', 'Keyboards'],
};

export async function getCrossSell({ productId }: CrossSellInput) {
  const base = await getProduct({ productId });
  if (!base) return [];
  const comps = complementary[base.category] || [];
  const results: Array<any> = [];
  for (const cat of comps) {
    const items = await searchProducts({ category: cat, limit: 10 });
    const available = items.filter((i: any) => i.inventory > 0);
    if (available.length) {
      results.push({ category: cat, items: available.slice(0, 3), reason: `Complementary category: ${cat}` });
    }
  }
  return results;
}
