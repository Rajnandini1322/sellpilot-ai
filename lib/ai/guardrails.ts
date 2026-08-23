/* eslint-disable @typescript-eslint/no-explicit-any */
export function checkForPaymentIntent(message: string) {
  const low = message.toLowerCase();
  const triggers = ['buy', 'pay', 'checkout', 'purchase', 'order now', 'charge'];
  return triggers.some((t) => low.includes(t));
}

export function ensureNoFinancialActions(requestedActions: any[]) {
  // This simple guard disallows any action named 'charge' or 'createOrder' etc.
  const forbidden = ['charge', 'createOrder', 'refund', 'modifyInventory', 'setPrice'];
  for (const a of requestedActions || []) {
    if (typeof a === 'string' && forbidden.includes(a)) return false;
    if (a && a.type && forbidden.includes(a.type)) return false;
  }
  return true;
}

export function filterRecommendations(recs: any[]) {
  // remove any recs that are not available
  return (recs || []).filter((r: any) => {
    const p = r.product || r;
    if (!p) return false;
    if (p.active === false) return false;
    if (typeof p.inventory === 'number' && p.inventory <= 0) return false;
    return true;
  });
}
