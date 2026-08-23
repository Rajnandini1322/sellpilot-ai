import crypto from "crypto";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return { keyId, keySecret, webhookSecret };
}

function requireServerConfig() {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay Test Mode keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.");
  }
  return { keyId, keySecret };
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = requireServerConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
      capture: "automatic",
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || "Razorpay order creation failed");
  }
  return data as {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
  };
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = requireServerConfig();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest();
  const received = Buffer.from(signature || "", "hex");
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}
