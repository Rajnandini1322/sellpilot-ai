 
import { getProducts } from '../../catalog';

export type SearchInput = { query?: string; category?: string; limit?: number };

export async function searchProducts({ query, category, limit = 10 }: SearchInput) {
  // Use the catalog service to fetch matching products
  const pageLimit = Math.min(limit, 50);
  const res = await getProducts({ q: query, category, page: 1, limit: pageLimit });
  // Return structured results with minimal fields suitable for the agent
  return res.products.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    currency: p.currency,
    inventory: p.inventory,
    tags: p.tags || [],
  }));
}
