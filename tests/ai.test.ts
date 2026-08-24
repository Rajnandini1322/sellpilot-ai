import { describe, it, expect, beforeAll } from 'vitest';
 
import { seed } from '../prisma/seed';
import { searchProducts } from '../lib/ai/tools/searchProducts';
import { getProduct } from '../lib/ai/tools/getProduct';
import { getRecommendations } from '../lib/ai/tools/recommendations';
import { getUpsell } from '../lib/ai/tools/upsell';
import { getCrossSell } from '../lib/ai/tools/crosssell';
import { checkForPaymentIntent, filterRecommendations } from '../lib/ai/guardrails';
import { DeterministicProvider } from '../lib/ai/provider';
import { AgentResponseSchema } from '../lib/ai/schema';

beforeAll(async () => {
  await seed();
});

describe('AI Tools', () => {
  it('searchProducts returns results', async () => {
    const res = await searchProducts({ query: 'keyboard', limit: 10 });
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('getProduct returns product by id', async () => {
    const res = await searchProducts({ query: 'Novaforge', limit: 1 });
    expect(res.length).toBeGreaterThan(0);
    const p = await getProduct({ productId: res[0].id });
    expect(p).toHaveProperty('id');
  });

  it('recommendation engine returns items', async () => {
    const res = await searchProducts({ query: 'Mechanical Keyboard', limit: 5 });
    const r = await getRecommendations({ productId: res[0].id });
    expect(Array.isArray(r)).toBe(true);
  });

  it('upsell returns higher priced same-category items', async () => {
    const res = await searchProducts({ query: 'Compact Mechanical Mini Keyboard', limit: 1 });
    const ups = await getUpsell({ productId: res[0].id });
    expect(Array.isArray(ups)).toBe(true);
  });

  it('cross-sell returns complementary categories', async () => {
    const res = await searchProducts({ query: 'Novaforge Mechanical Keyboard', limit: 1 });
    const cross = await getCrossSell({ productId: res[0].id });
    expect(Array.isArray(cross)).toBe(true);
  });

  it('inactive or out-of-stock products are filtered', async () => {
    const res = await searchProducts({ query: 'Ergo Travel Mouse', limit: 1 });
    expect(res[0].inventory).toBe(0);
    const filtered = filterRecommendations([{ product: res[0], reason: 'test', type: 'RECOMMENDATION' }]);
    expect(filtered.length).toBe(0);
  });

  it('guardrails detect payment intent', () => {
    expect(checkForPaymentIntent('Buy this now')).toBe(true);
    expect(checkForPaymentIntent('Show me keyboards')).toBe(false);
  });

  it('provider returns structured response', async () => {
    const prov = new DeterministicProvider();
    const resp = await prov.generateResponse({ message: 'Find me a keyboard', sessionId: 'test-session' } as any);
    const parsed = AgentResponseSchema.safeParse(resp);
    expect(parsed.success).toBe(true);
  });
});
