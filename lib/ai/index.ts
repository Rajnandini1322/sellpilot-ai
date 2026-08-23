/**
 * lib/ai
 * Placeholder AI provider abstraction. Implementations will be added later.
 * Exports a typed interface that higher layers (catalog, policies, approval gate)
 * will depend on. This file intentionally does not call any external AI service.
 */

export type AIRequest = {
  prompt: string;
  userId?: string;
};

export type AIResponse = {
  text: string;
  score?: number;
};

export async function suggest(_req: AIRequest): Promise<AIResponse> {
  // Placeholder: return a deterministic safe response for now
  return { text: "[stub] no AI provider configured", score: 0 };
}
