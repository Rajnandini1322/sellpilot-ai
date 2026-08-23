 "use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

type CartItem = { productId: string; name: string; price: number; quantity: number };

declare global {
  interface Window {
    Razorpay: any;
  }
}

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
}

export default function CheckoutClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("Demo Customer");
  const [email, setEmail] = useState("customer@example.com");
  const [contact, setContact] = useState("9876543210");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sellpilot-cart");
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
  }, []);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  function updateQuantity(productId: string, quantity: number) {
    const next = cart
      .map((i) => i.productId === productId ? { ...i, quantity: Math.max(0, Math.min(5, quantity)) } : i)
      .filter((i) => i.quantity > 0);
    setCart(next);
    localStorage.setItem("sellpilot-cart", JSON.stringify(next));
  }

  async function startCheckout() {
    setError("");
    setStatus("");
    if (!cart.length) return setError("Your cart is empty.");
    if (!window.Razorpay) return setError("Razorpay Checkout is still loading. Please try again.");

    setBusy(true);
    try {
      const orderRes = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: { name, email, contact },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData?.error || "Unable to create order");

      const options = {
        key: orderData.razorpay.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SellPilot Demo Store",
        description: "AI-assisted commerce checkout",
        order_id: orderData.razorpay.orderId,
        prefill: { name, email, contact: `+91${contact.replace(/^\+91/, "")}` },
        theme: { color: "#111827" },
        handler: async (response: any) => {
          setStatus("Verifying payment securely...");
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              localOrderId: orderData.order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData?.error || "Payment verification failed");

          localStorage.removeItem("sellpilot-cart");
          setCart([]);
          setStatus(`Payment successful. Order ${orderData.order.id} is confirmed.`);
        },
        modal: {
          ondismiss: () => setStatus("Checkout closed. Your order remains unpaid."),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setError(response?.error?.description || "Payment failed. Please retry.");
      });
      razorpay.open();
    } catch (e: any) {
      setError(e?.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <main className="min-h-screen bg-[#08090d] text-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm text-gray-500">SellPilot Commerce</p>
            <h1 className="mt-1 text-3xl font-semibold">Secure Test Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">AI recommendations can influence the cart, but payment always requires explicit customer approval.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <section className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
              <h2 className="font-semibold">Customer details</h2>
              <div className="mt-5 grid gap-4">
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none" placeholder="Full name" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none" placeholder="Email" type="email" />
                <input value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, "").slice(0, 10))} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none" placeholder="10-digit mobile" />
              </div>

              {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">{error}</div>}
              {status && <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{status}</div>}
            </section>

            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Order summary</h2>
                <span className="text-xs text-gray-500">{cart.length} item(s)</span>
              </div>

              <div className="mt-5 space-y-4">
                {cart.length === 0 && <p className="text-sm text-gray-500">Your cart is empty. Add products from Catalog.</p>}
                {cart.map((item) => (
                  <div key={item.productId} className="border-b border-white/10 pb-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{money(item.price)} each</p>
                      </div>
                      <p className="text-sm font-semibold">{money(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-8 w-8 rounded-lg border border-white/10">−</button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-8 w-8 rounded-lg border border-white/10">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-semibold">{money(total)}</span>
              </div>

              <button disabled={busy || !cart.length} onClick={startCheckout} className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? "Creating secure order..." : "Pay securely with Razorpay"}
              </button>

              <p className="mt-4 text-center text-[11px] text-gray-600">Test Mode • Secret key stays server-side • Signature verified before fulfillment</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
