export const POLICY_LIMITS = {
  MAX_QUANTITY: 5,

  // ₹50,000 = 5,000,000 paise
  // This is a demo safety limit for customer-approved checkout.
  MAX_TRANSACTION_AMOUNT_PAISE: 5_000_000,
} as const;