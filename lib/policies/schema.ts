import { z } from "zod";

export const PurchaseRequestSchema = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  requestedAt: z.string().datetime(),
});

export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;

export const PolicyDecisionSchema = z.object({
  decision: z.enum(["REQUIRE_APPROVAL", "BLOCK"]),
  allowed: z.boolean(),
  reason: z.string().min(1),
  checks: z.array(
    z.object({
      name: z.string(),
      passed: z.boolean(),
      reason: z.string(),
    }),
  ),
});

export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;