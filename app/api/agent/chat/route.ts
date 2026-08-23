import { NextResponse } from 'next/server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentInputSchema } from '../../../../lib/ai/schema';
import { DeterministicProvider } from '../../../../lib/ai/provider';
import { checkForPaymentIntent, filterRecommendations } from '../../../../lib/ai/guardrails';
import { recordEvent } from '../../../../lib/audit';
import { getUpsell, getCrossSell, getRecommendations } from '../../../../lib/ai/tools';
import { getSession, setLastProduct } from '../../../../lib/ai/session';

const BodySchema = AgentInputSchema;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }
    const input = parsed.data as { sessionId?: string; message: string };

    // Guardrails: block payment intents
    if (checkForPaymentIntent(input.message)) {
      recordEvent({ action: 'PAYMENT_REQUEST_BLOCKED', merchantId: 'demo', reason: 'User requested payment via chat' });
      return NextResponse.json({ message: 'Payment flows are blocked in chat. Please use the checkout flow.' }, { status: 200 });
    }

    const provider = new DeterministicProvider();
    const resp = await provider.generateResponse(input as any);

    // Post-process recommendations/upsell/cross-sell if needed using tools and guardrails
    const recs: any[] = [];
    if (resp.intent.type === 'RECOMMENDATION' && input.sessionId) {
      const s = getSession(input.sessionId as string);
      if (s.lastProductId) {
        const r = await getRecommendations({ productId: s.lastProductId });
        const filtered = filterRecommendations(r.map((x: any) => ({ product: x.product, reason: x.reason, type: 'RECOMMENDATION' })));
        recs.push(...filtered.map((f: any) => ({ product: f.product, reason: f.reason, type: 'RECOMMENDATION' })));
        if (recs.length) recordEvent({ action: 'RECOMMENDATION_GENERATED', merchantId: 'demo', reason: 'Session-based recommendation', metadata: { productIds: recs.map((r:any)=>r.product.id) } });
      }
    }

    if (resp.intent.type === 'UPSELL' && input.sessionId) {
      const s = getSession(input.sessionId as string);
      if (s.lastProductId) {
        const ups = await getUpsell({ productId: s.lastProductId });
        const filtered = filterRecommendations(ups.map((u: any) => ({ product: u.product, reason: u.reason, type: 'UPSELL' })));
        recs.push(...filtered);
        if (filtered.length) recordEvent({ action: 'UPSELL_GENERATED', merchantId: 'demo', reason: 'Upsell from last product', metadata: { productIds: filtered.map((r:any)=>r.product.id) } });
      }
    }

    if (resp.intent.type === 'CROSS_SELL' && input.sessionId) {
      const s = getSession(input.sessionId as string);
      if (s.lastProductId) {
        const cross = await getCrossSell({ productId: s.lastProductId });
        // cross returns grouped categories; flatten
        const flat: any[] = [];
        for (const c of cross) {
          for (const it of c.items) {
            flat.push({ product: it, reason: c.reason, type: 'CROSS_SELL' });
          }
        }
        const filtered = filterRecommendations(flat);
        recs.push(...filtered);
        if (filtered.length) recordEvent({ action: 'CROSS_SELL_GENERATED', merchantId: 'demo', reason: 'Cross-sell from last product', metadata: { productIds: filtered.map((r:any)=>r.product.id) } });
      }
    }

    // If provider returned search products directly include them
    let products = resp.products || [];
    if (recs.length) {
      // attach recommendations into response
      resp.recommendations = (resp.recommendations || []).concat(recs.map((r:any)=>({ productId: r.product.id, reason: r.reason, type: r.type })));
      // ensure products include referenced items
      const referenced = recs.map((r:any)=>r.product);
      products = products.concat(referenced).slice(0, 20);
    }

    // If sessionId and provider found explicit products, set lastProduct for context
    if (input.sessionId && products.length) {
      setLastProduct(input.sessionId, products[0].id);
    }

    // audit request
    recordEvent({ action: 'AGENT_REQUEST', merchantId: 'demo', reason: resp.message, metadata: { sessionId: input.sessionId } });

    // return structured response
    return NextResponse.json(resp);
  } catch (e) {
    console.error('Agent chat error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
