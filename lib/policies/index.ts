/**
 * lib/policies
 * Policy engine abstractions and helpers. Policies are used to ensure every
 * money action is explainable, bounded and gated.
 * Implement deterministic policy checks here (no AI calls).
 */

export type MoneyAction = {
  merchantId: string;
  amount: number; // in smallest currency unit
  reason: string;
};

export function checkMoneyAction(_action: MoneyAction): { allowed: boolean; reason?: string } {
  // Default conservative policy: deny by default until rules are added
  return { allowed: false, reason: "No policy rules configured" };
}
