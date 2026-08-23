import { z } from 'zod';

export const AgentInputSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(500),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const RecommendationType = z.enum(['RECOMMENDATION', 'UPSELL', 'CROSS_SELL']);

export const RecommendationSchema = z.object({
  productId: z.string(),
  reason: z.string(),
  type: RecommendationType,
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const IntentType = z.enum(['SEARCH', 'PRODUCT_INFO', 'RECOMMENDATION', 'UPSELL', 'CROSS_SELL', 'UNKNOWN']);
export const IntentSchema = z.object({
  type: IntentType,
  confidence: z.number().min(0).max(1),
});
export type Intent = z.infer<typeof IntentSchema>;

export const AgentResponseSchema = z.object({
  message: z.string(),
  intent: IntentSchema,
  products: z.array(z.any()), // product shaping left flexible to match catalog Product
  recommendations: z.array(RecommendationSchema),
  actions: z.array(z.any()),
});
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
