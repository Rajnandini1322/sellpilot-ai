/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentInput, AgentResponse, AgentResponseSchema, Intent } from './schema';
import { searchProducts } from './tools';
import { setLastProduct } from './session';

export interface AIProvider {
  generateResponse(input: AgentInput): Promise<AgentResponse>;
}

// Deterministic fallback provider that uses tools
export class DeterministicProvider implements AIProvider {
  async generateResponse(input: AgentInput) {
    const message = input.message.trim();
    // simple intent detection
    const low = message.toLowerCase();
    const intent: Intent = { type: 'UNKNOWN', confidence: 0.5 };
    let products: any[] = [];
    const recommendations: any[] = [];
    let responseText = '';

    if (low.includes('buy') || low.includes('pay') || low.includes('checkout')) {
      intent.type = 'UNKNOWN';
      intent.confidence = 0.9;
      responseText = 'I cannot perform payments. To purchase, please follow the checkout flow which requires explicit approval.';
      // log payment-blocked event will be done by caller
    } else if (low.includes('what') && low.includes('buy')) {
      intent.type = 'RECOMMENDATION';
      intent.confidence = 0.7;
      responseText = "I can recommend products — tell me what you're looking for or share a product id.";
    } else if (low.includes('keyboard') || low.includes('mouse') || low.includes('headphone') || low.includes('webcam')) {
      intent.type = 'SEARCH';
      intent.confidence = 0.8;
      products = await searchProducts({ query: message, limit: 8 });
      responseText = `Found ${products.length} matching products for '${message}'.`;
      if (products.length && input.sessionId) setLastProduct(input.sessionId, products[0].id);
    } else if (low.includes('better') || low.includes('something better')) {
      intent.type = 'UPSELL';
      intent.confidence = 0.8;
      if (input.sessionId) {
        // fetch last product from session
        // session read is handled by caller; use getRecommendations in flow instead
      }
      responseText = 'Suggesting higher-value options based on your last referenced product.';
    } else if (low.includes('what goes well') || low.includes('what goes with') || low.includes('with this') || low.includes('go well')) {
      intent.type = 'CROSS_SELL';
      intent.confidence = 0.8;
      responseText = 'Suggesting complementary products.';
    } else if (low.startsWith('show me') || low.startsWith('do you have') || low.startsWith('show')) {
      intent.type = 'SEARCH';
      intent.confidence = 0.7;
      products = await searchProducts({ query: message, limit: 8 });
      responseText = `Found ${products.length} matching products for '${message}'.`;
    } else {
      intent.type = 'UNKNOWN';
      intent.confidence = 0.5;
      responseText = "I'm sorry — I didn't understand. Try asking 'Find me a keyboard' or 'What goes well with this?'.";
    }

    // If last referenced product exists in session, include recommendations
    if (input.sessionId) {
      // tooling consumer will set lastProduct via other flows; provider may also try to find upsell/cross-sell
      // No direct session access here other than via setLastProduct above
    }

    const out: any = {
      message: responseText,
      intent,
      products,
      recommendations,
      actions: [],
    };

    // validate with Zod
    const parsed = AgentResponseSchema.safeParse(out);
    if (!parsed.success) {
      // fall back to a safe minimal response
      return {
        message: responseText,
        intent,
        products: [],
        recommendations: [],
        actions: [],
      } as any;
    }

    return parsed.data as any;
  }
}
