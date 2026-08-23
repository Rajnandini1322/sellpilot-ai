/**
 * lib/payments
 * Payment service abstraction. The goal is to keep payment orchestration separated
 * from AI and policies. This module intentionally does not perform any network
 * operation or money action — it only defines typed request/response shapes.
 */

export type PaymentRequest = {
  merchantId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "failed" | "succeeded";
};

export async function createPaymentIntent(_req: PaymentRequest): Promise<PaymentIntent> {
  // Placeholder: return a stubbed intent
  return { id: "stub_intent", amount: _req.amount, currency: _req.currency ?? "INR", status: "created" };
}
