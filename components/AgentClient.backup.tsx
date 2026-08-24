'use client';

import React, { useEffect, useRef, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  inventory: number;
  tags?: string[];
};

type Recommendation = {
  product?: Product;
  productId?: string;
  reason: string;
  type: string;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export default function AgentClient() {
  const [messages, setMessages] = useState<
    Array<{ from: 'user' | 'agent'; text: string }>
  >([]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const sessionId = 'demo-session-1';
  const ref = useRef<HTMLDivElement | null>(null);

  /*
   * Load existing cart
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sellpilot-cart');

      if (raw) {
        setCart(JSON.parse(raw));
      }
    } catch {
      setCart([]);
    }
  }, []);

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price / 100);
  }

  /*
   * Save cart
   */
  function saveCart(nextCart: CartItem[]) {
    setCart(nextCart);
    localStorage.setItem('sellpilot-cart', JSON.stringify(nextCart));
  }

  /*
   * Add product to cart
   */
  function addToCart(product: Product) {
    if (product.inventory <= 0) return;

    const existing = cart.find(
      (item) => item.productId === product.id
    );

    let nextCart: CartItem[];

    if (existing) {
      nextCart = cart.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                Math.min(product.inventory, 5)
              ),
            }
          : item
      );
    } else {
      nextCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    }

    saveCart(nextCart);
  }

  /*
   * Remove product from cart
   */
  function removeFromCart(productId: string) {
    const nextCart = cart.filter(
      (item) => item.productId !== productId
    );

    saveCart(nextCart);
  }

  /*
   * Update quantity
   */
  function updateCartQuantity(
    productId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const nextCart = cart.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: Math.min(quantity, 5),
          }
        : item
    );

    saveCart(nextCart);
  }

  /*
   * Go to checkout
   */
  function goToCheckout() {
    if (!cart.length) return;

    window.location.href = '/checkout';
  }

  /*
   * Ask Agent
   */
  async function send() {
    if (!input.trim() || loading) return;

    const msg = input.trim();

    setMessages((m) => [
      ...m,
      {
        from: 'user',
        text: msg,
      },
    ]);

    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: msg,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Agent error');
      }

      setMessages((m) => [
        ...m,
        {
          from: 'agent',
          text: data.message || '...',
        },
      ]);

      /*
       * Search products
       */
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

      /*
       * Recommendations
       */
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (e: any) {
      console.error(e);

      setError(
        e?.message || 'Unable to contact SellPilot Agent'
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 50);
    }
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#08090d] text-white">

      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm text-gray-500">
              SellPilot AI
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Revenue Assistant
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Search products, discover recommendations and identify revenue opportunities.
            </p>
          </div>

          {/* CART BUTTON */}
          <button
            onClick={goToCheckout}
            disabled={!cart.length}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            🛒 Cart ({cart.length})
          </button>

        </div>

        {/* CHAT */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0d12] p-5">

          <div className="mb-5 min-h-[180px] max-h-[360px] overflow-y-auto">

            {messages.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-gray-500">

                Try:

                <div className="mt-3 space-y-2">

                  <p>• Find me a programming keyboard</p>

                  <p>• Show me something better</p>

                  <p>• What goes well with this?</p>

                </div>

              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`my-3 flex ${
                  m.from === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    m.from === 'user'
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/[0.04] text-gray-300'
                  }`}
                >
                  {m.text}
                </div>

              </div>
            ))}

            <div ref={ref} />

          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* INPUT */}

          <div className="flex gap-3">

            <input
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  send();
                }
              }}
              placeholder="Ask SellPilot... e.g. Find me a keyboard"
            />

            <button
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={send}
              disabled={loading}
            >
              {loading ? 'Thinking...' : 'Send'}
            </button>

          </div>

        </div>

        {/* SEARCH RESULTS */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

          <div className="mb-5">

            <h2 className="text-lg font-semibold">
              Search Results
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Products found by SellPilot
            </p>

          </div>

          {products.length === 0 ? (

            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-600">
              Search for a product to see results here.
            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.04]"
                >

                  <div className="mb-3 flex items-start justify-between gap-2">

                    <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-gray-400">
                      {product.category}
                    </span>

                    <span
                      className={`text-[10px] ${
                        product.inventory > 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {product.inventory > 0
                        ? `${product.inventory} in stock`
                        : 'Out of stock'}
                    </span>

                  </div>

                  <h3 className="font-medium">
                    {product.name}
                  </h3>

                  <p className="mt-2 min-h-[40px] text-xs leading-5 text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </span>

                    {product.inventory > 0 && (
                      <span className="text-[10px] text-emerald-400">
                        Available
                      </span>
                    )}

                  </div>

                  {product.tags &&
                    product.tags.length > 0 && (

                    <div className="mt-3 flex flex-wrap gap-1">

                      {product.tags.slice(0, 3).map((tag) => (

                        <span
                          key={tag}
                          className="rounded-md bg-white/[0.04] px-2 py-1 text-[9px] text-gray-500"
                        >
                          {tag}
                        </span>

                      ))}

                    </div>
                  )}

                  {/* ADD TO CART */}

                  <button
                    disabled={product.inventory <= 0}
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {product.inventory > 0
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* AI RECOMMENDATIONS */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

          <div className="mb-5">

            <h2 className="text-lg font-semibold">
              AI Recommendations
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Upsell and cross-sell opportunities
            </p>

          </div>

          {recommendations.length === 0 ? (

            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-600">
              No recommendations yet.
            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

              {recommendations.map((r, idx) => {

                const product = r.product;

                return (

                  <div
                    key={`${r.productId || product?.id || idx}`}
                    className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4"
                  >

                    <div className="flex items-center justify-between">

                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                        {r.type}
                      </span>

                      {product && (
                        <span className="text-sm font-semibold">
                          {formatPrice(product.price)}
                        </span>
                      )}

                    </div>

                    <h3 className="mt-4 font-medium">
                      {product?.name || r.productId}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {r.reason}
                    </p>

                    {product && (
                      <p className="mt-3 text-[11px] text-gray-600">
                        {product.inventory > 0
                          ? `${product.inventory} units available`
                          : 'Out of stock'}
                      </p>
                    )}

                    {/* RECOMMENDATION ACTIONS */}

                    {product && product.inventory > 0 && (

                      <div className="mt-4 flex gap-2">

                        <button
                          onClick={() => addToCart(product)}
                          className="flex-1 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-medium text-black transition hover:bg-emerald-300"
                        >
                          Add to Cart
                        </button>

                        <button
                          onClick={() => {
                            setProducts([product]);
                            window.scrollTo({
                              top: 0,
                              behavior: 'smooth',
                            });
                          }}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.05]"
                        >
                          View
                        </button>

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          )}

        </section>

        {/* CART */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold">
                Your Cart
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Products selected through SellPilot
              </p>

            </div>

            <span className="text-sm text-gray-400">
              {cart.length} item(s)
            </span>

          </div>

          {cart.length === 0 ? (

            <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-600">
              Your cart is empty.
            </div>

          ) : (

            <div className="mt-5 space-y-3">

              {cart.map((item) => (

                <div
                  key={item.productId}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <p className="text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatPrice(item.price)} each
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.quantity - 1
                        )
                      }
                      className="h-8 w-8 rounded-lg border border-white/10"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.quantity + 1
                        )
                      }
                      className="h-8 w-8 rounded-lg border border-white/10"
                    >
                      +
                    </button>

                    <span className="ml-3 w-24 text-right text-sm font-semibold">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </span>

                    <button
                      onClick={() =>
                        removeFromCart(item.productId)
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

              {/* TOTAL */}

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">

                <span className="text-gray-400">
                  Cart Total
                </span>

                <span className="text-2xl font-semibold">
                  {formatPrice(cartTotal)}
                </span>

              </div>

              {/* CHECKOUT */}

              <button
                onClick={goToCheckout}
                className="mt-4 w-full rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200"
              >
                Proceed to Secure Checkout
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-600">
                Payment requires explicit customer approval.
              </p>

            </div>

          )}

        </section>

        {/* REVENUE OPPORTUNITY */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

          <h2 className="font-semibold">
            Revenue Opportunity
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Potential revenue actions identified by SellPilot
          </p>

          <div className="mt-5 rounded-xl bg-white/[0.02] p-5">

            {recommendations.length > 0 ? (

              <div>

                <p className="text-sm text-emerald-400">
                  {recommendations.length}{' '}
                  revenue opportunit
                  {recommendations.length > 1
                    ? 'ies'
                    : 'y'}{' '}
                  identified
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  SellPilot found products that can increase
                  order value through upselling or cross-selling.
                </p>

              </div>

            ) : (

              <p className="text-sm text-gray-600">
                No immediate opportunities identified.
              </p>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}