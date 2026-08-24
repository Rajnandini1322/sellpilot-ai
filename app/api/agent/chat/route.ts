import { NextResponse } from 'next/server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AgentInputSchema } from '../../../../lib/ai/schema';
import { DeterministicProvider } from '../../../../lib/ai/provider';
import {
  checkForPaymentIntent,
  filterRecommendations,
} from '../../../../lib/ai/guardrails';
import { recordEvent } from '../../../../lib/audit';

import {
  getUpsell,
  getCrossSell,
  getRecommendations,
} from '../../../../lib/ai/tools';

import {
  getSession,
  setLastProduct,
} from '../../../../lib/ai/session';

const BodySchema = AgentInputSchema;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data as {
      sessionId?: string;
      message: string;
    };

    // Payment guardrail
    if (checkForPaymentIntent(input.message)) {
      recordEvent({
        action: 'PAYMENT_REQUEST_BLOCKED',
        merchantId: 'demo',
        reason: 'User requested payment via chat',
      });

      return NextResponse.json(
        {
          message:
            'Payment flows are blocked in chat. Please use the checkout flow.',
          intent: {
            type: 'UNKNOWN',
            confidence: 1,
          },
          products: [],
          recommendations: [],
          actions: [],
        },
        { status: 200 }
      );
    }

    const provider = new DeterministicProvider();

    const resp = await provider.generateResponse(input as any);

    const recs: any[] = [];

    /*
     * RECOMMENDATION
     */
    if (
      resp.intent.type === 'RECOMMENDATION' &&
      input.sessionId
    ) {
      const session = getSession(input.sessionId);

      if (session.lastProductId) {
        const results = await getRecommendations({
          productId: session.lastProductId,
        });

        const filtered = filterRecommendations(
          results.map((x: any) => ({
            product: x.product,
            reason: x.reason,
            type: 'RECOMMENDATION',
          }))
        );

        recs.push(...filtered);

        if (filtered.length) {
          recordEvent({
            action: 'RECOMMENDATION_GENERATED',
            merchantId: 'demo',
            reason: 'Session-based recommendation',
            metadata: {
              productIds: filtered.map(
                (r: any) => r.product.id
              ),
            },
          });
        }
      }
    }

    /*
     * UPSELL
     */
    if (
      resp.intent.type === 'UPSELL' &&
      input.sessionId
    ) {
      const session = getSession(input.sessionId);

      console.log(
        'UPSELL SESSION:',
        session
      );

      if (session.lastProductId) {
        const ups = await getUpsell({
          productId: session.lastProductId,
        });

        console.log(
          'UPSELL RESULTS:',
          ups
        );

        const filtered = filterRecommendations(
          ups.map((u: any) => ({
            product: u.product,
            reason: u.reason,
            type: 'UPSELL',
          }))
        );

        recs.push(...filtered);

        if (filtered.length) {
          recordEvent({
            action: 'UPSELL_GENERATED',
            merchantId: 'demo',
            reason: 'Upsell from last product',
            metadata: {
              productIds: filtered.map(
                (r: any) => r.product.id
              ),
            },
          });
        }
      } else {
        console.log(
          'UPSELL: No lastProductId in session'
        );
      }
    }

    /*
     * CROSS SELL
     */
    if (
      resp.intent.type === 'CROSS_SELL' &&
      input.sessionId
    ) {
      const session = getSession(input.sessionId);

      if (session.lastProductId) {
        const cross = await getCrossSell({
          productId: session.lastProductId,
        });

        const flat: any[] = [];

        for (const category of cross) {
          for (const item of category.items) {
            flat.push({
              product: item,
              reason: category.reason,
              type: 'CROSS_SELL',
            });
          }
        }

        const filtered = filterRecommendations(flat);

        recs.push(...filtered);

        if (filtered.length) {
          recordEvent({
            action: 'CROSS_SELL_GENERATED',
            merchantId: 'demo',
            reason: 'Cross-sell from last product',
            metadata: {
              productIds: filtered.map(
                (r: any) => r.product.id
              ),
            },
          });
        }
      }
    }

    /*
     * SEARCH PRODUCTS
     */
    let products = Array.isArray(resp.products)
      ? [...resp.products]
      : [];

    /*
     * Add recommendation products to response
     */
    if (recs.length) {
      const recommendationData = recs.map(
        (r: any) => ({
          productId: r.product.id,
          product: r.product,
          reason: r.reason,
          type: r.type,
        })
      );

      resp.recommendations = recommendationData;

      /*
       * For upsell / cross-sell:
       * also expose recommended products.
       */
      const recommendedProducts = recs
        .map((r: any) => r.product)
        .filter(Boolean);

      products = [
        ...products,
        ...recommendedProducts,
      ];
    } else {
      resp.recommendations = [];
    }

    /*
     * Remove duplicate products
     */
    const uniqueProducts = new Map<
      string,
      any
    >();

    for (const product of products) {
      if (product?.id) {
        uniqueProducts.set(
          product.id,
          product
        );
      }
    }

    resp.products = Array.from(
      uniqueProducts.values()
    ).slice(0, 20);

    /*
     * Save first product in session
     */
    if (
      input.sessionId &&
      resp.products.length
    ) {
      setLastProduct(
        input.sessionId,
        resp.products[0].id
      );
    }

    /*
     * Audit
     */
    recordEvent({
      action: 'AGENT_REQUEST',
      merchantId: 'demo',
      reason: resp.message,
      metadata: {
        sessionId: input.sessionId,
      },
    });

    return NextResponse.json(resp);
  } catch (e) {
    console.error(
      'Agent chat error',
      e
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}