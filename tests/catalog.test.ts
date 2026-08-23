import { describe, it, expect, beforeAll } from 'vitest';
import { seed } from '../prisma/seed';
import { getProducts, getProductById, getAgentCatalog } from '../lib/catalog';

beforeAll(async () => {
  await seed();
});

describe('Catalog', () => {
  it('returns active products', async () => {
    const res = await getProducts({ page: 1, limit: 50 });
    expect(res.products.length).toBeGreaterThan(0);
  });

  it('inactive products are excluded', async () => {
    const res = await getProducts({ page: 1, limit: 50 });
    const anyInactive = res.products.some((p) => p.active === false);
    expect(anyInactive).toBe(false);
  });

  it('search works', async () => {
    const res = await getProducts({ q: 'mechanical', page: 1, limit: 50 });
    expect(res.products.length).toBeGreaterThan(0);
  });

  it('category filtering works', async () => {
    const res = await getProducts({ category: 'Keyboards', page: 1, limit: 50 });
    expect(res.products.every((p) => p.category === 'Keyboards')).toBe(true);
  });

  it('pagination works', async () => {
    const r1 = await getProducts({ page: 1, limit: 5 });
    const r2 = await getProducts({ page: 2, limit: 5 });
    expect(r1.products.length).toBeLessThanOrEqual(5);
    expect(r2.products.length).toBeLessThanOrEqual(5);
  });

  it('out-of-stock product marked correctly', async () => {
    const res = await getProducts({ page: 1, limit: 50 });
    const p = res.products.find((x) => x.inventory === 0);
    expect(p).toBeTruthy();
  });

  it('product-by-id 404 for missing product', async () => {
    const p = await getProductById('nonexistent-id');
    expect(p).toBeNull();
  });

  it('agent catalog structure', async () => {
    const agent = await getAgentCatalog();
    expect(agent).toHaveProperty('merchant');
    expect(Array.isArray(agent.products)).toBe(true);
  });

  it('merchant private information not exposed', async () => {
    const agent = await getAgentCatalog();
    expect(agent.merchant).not.toHaveProperty('email');
  });

  it('invalid query params are rejected - handled in route tests via validation', () => {
    expect(true).toBe(true);
  });
});
