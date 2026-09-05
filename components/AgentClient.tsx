'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  MessageSquare,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

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
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'agent'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const sessionId = 'demo-session-1';
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sellpilot-cart');
      if (raw) setCart(JSON.parse(raw));
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

  function saveCart(nextCart: CartItem[]) {
    setCart(nextCart);
    localStorage.setItem('sellpilot-cart', JSON.stringify(nextCart));
  }

  function addToCart(product: Product) {
    if (product.inventory <= 0) return;

    const existing = cart.find((item) => item.productId === product.id);

    const nextCart = existing
      ? cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Math.min(product.inventory, 5)
                ),
              }
            : item
        )
      : [
          ...cart,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];

    saveCart(nextCart);
  }

  function removeFromCart(productId: string) {
    saveCart(cart.filter((item) => item.productId !== productId));
  }

  function updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, 5) }
          : item
      )
    );
  }

  function goToCheckout() {
    if (cart.length) window.location.href = '/checkout';
  }

  async function send() {
    if (!input.trim() || loading) return;

    const msg = input.trim();

    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: msg }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Agent error');
      }

      setMessages((m) => [
        ...m,
        { from: 'agent', text: data.message || 'I am ready to help.' },
      ]);

      setProducts(Array.isArray(data.products) ? data.products : []);
      setRecommendations(
        Array.isArray(data.recommendations) ? data.recommendations : []
      );
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Unable to contact SellPilot Agent');
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
    <main className="sp-page">
      <div className="sp-page-bg" />

      <div className="sp-page-container">
        <header className="sp-page-header">
          <div>
            <div className="sp-page-kicker">
              <span className="sp-page-kicker-dot" />
              SELLPILOT AI
            </div>

            <h1 className="sp-page-title">
              Revenue <span>Assistant</span>
            </h1>

            <p className="sp-page-subtitle">
              Your intelligent commerce copilot for product discovery,
              recommendations and revenue growth.
            </p>
          </div>

          <button
            onClick={goToCheckout}
            disabled={!cart.length}
            className="sp-page-cart-button"
          >
            <ShoppingCart size={17} />
            Cart
            <span>{cart.length}</span>
          </button>
        </header>

        <section className="sp-agent-layout">
          <div className="sp-agent-main">
            <div className="sp-agent-chat-card">
              <div className="sp-agent-chat-header">
                <div className="sp-agent-identity">
                  <div className="sp-agent-avatar">
                    <Bot size={21} />
                  </div>

                  <div>
                    <div className="sp-agent-name">
                      SellPilot Agent
                      <span className="sp-agent-online">
                        <span />
                        Online
                      </span>
                    </div>
                    <p>AI-powered commerce intelligence</p>
                  </div>
                </div>

                <div className="sp-agent-status">
                  <BrainCircuit size={15} />
                  Intelligence Engine
                </div>
              </div>

              <div className="sp-agent-messages">
                {messages.length === 0 ? (
                  <div className="sp-agent-empty">
                    <div className="sp-agent-empty-icon">
                      <Sparkles size={25} />
                    </div>

                    <h2>How can I grow your revenue?</h2>

                    <p>
                      Ask me to find products, compare options or discover
                      upsell and cross-sell opportunities.
                    </p>

                    <div className="sp-agent-prompts">
                      <button onClick={() => setInput('Find me a programming keyboard')}>
                        <Search size={14} />
                        Find a programming keyboard
                      </button>
                      <button onClick={() => setInput('Show me something better')}>
                        <TrendingUp size={14} />
                        Show me something better
                      </button>
                      <button onClick={() => setInput('What goes well with this?')}>
                        <Sparkles size={14} />
                        Find related products
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`sp-agent-message ${
                        m.from === 'user' ? 'user' : 'agent'
                      }`}
                    >
                      <div className="sp-agent-message-avatar">
                        {m.from === 'user' ? 'Y' : <Bot size={15} />}
                      </div>
                      <div className="sp-agent-message-bubble">
                        {m.text}
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="sp-agent-message agent">
                    <div className="sp-agent-message-avatar">
                      <Bot size={15} />
                    </div>
                    <div className="sp-agent-message-bubble sp-agent-thinking">
                      <span />
                      <span />
                      <span />
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={ref} />
              </div>

              {error && (
                <div className="sp-agent-error">
                  <X size={15} />
                  {error}
                </div>
              )}

              <div className="sp-agent-input-area">
                <div className="sp-agent-input-wrap">
                  <MessageSquare size={17} />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') send();
                    }}
                    placeholder="Ask SellPilot anything about your products..."
                  />
                </div>

                <button
                  className="sp-agent-send"
                  onClick={send}
                  disabled={loading || !input.trim()}
                >
                  {loading ? 'Thinking' : 'Ask Agent'}
                  {!loading && <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            <section className="sp-agent-section">
              <div className="sp-section-heading">
                <div>
                  <div className="sp-section-icon">
                    <Search size={17} />
                  </div>
                  <div>
                    <h2>Product Discovery</h2>
                    <p>Products found by SellPilot</p>
                  </div>
                </div>
                {products.length > 0 && (
                  <span className="sp-section-count">
                    {products.length} results
                  </span>
                )}
              </div>

              {products.length === 0 ? (
                <div className="sp-agent-placeholder">
                  <Package size={25} />
                  <span>Search for a product to see intelligent results here.</span>
                </div>
              ) : (
                <div className="sp-product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatPrice={formatPrice}
                      onAdd={() => addToCart(product)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="sp-agent-section">
              <div className="sp-section-heading">
                <div>
                  <div className="sp-section-icon ai">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h2>AI Recommendations</h2>
                    <p>Personalized upsell and cross-sell opportunities</p>
                  </div>
                </div>
                {recommendations.length > 0 && (
                  <span className="sp-section-count green">
                    {recommendations.length} opportunities
                  </span>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div className="sp-agent-placeholder">
                  <Sparkles size={25} />
                  <span>Recommendations will appear after you interact with the agent.</span>
                </div>
              ) : (
                <div className="sp-recommendation-grid">
                  {recommendations.map((r, idx) => {
                    const product = r.product;

                    return (
                      <div
                        key={`${r.productId || product?.id || idx}`}
                        className="sp-recommendation-card"
                      >
                        <div className="sp-rec-top">
                          <span>{r.type}</span>
                          {product && (
                            <strong>{formatPrice(product.price)}</strong>
                          )}
                        </div>

                        <h3>{product?.name || r.productId}</h3>

                        <p>{r.reason}</p>

                        {product && (
                          <div className="sp-rec-stock">
                            <span />
                            {product.inventory > 0
                              ? `${product.inventory} units available`
                              : 'Out of stock'}
                          </div>
                        )}

                        {product && product.inventory > 0 && (
                          <div className="sp-rec-actions">
                            <button onClick={() => addToCart(product)}>
                              Add to Cart
                            </button>
                            <button
                              className="secondary"
                              onClick={() => {
                                setProducts([product]);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
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
          </div>

          <aside className="sp-agent-sidebar">
            <div className="sp-agent-side-card">
              <div className="sp-side-card-heading">
                <div className="sp-side-icon">
                  <ShoppingCart size={17} />
                </div>
                <div>
                  <h3>Your Cart</h3>
                  <p>{cart.length} item(s) selected</p>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="sp-cart-empty">
                  <ShoppingCart size={23} />
                  <p>Your cart is empty</p>
                  <span>Add products from your AI results.</span>
                </div>
              ) : (
                <>
                  <div className="sp-cart-items">
                    {cart.map((item) => (
                      <div className="sp-cart-item" key={item.productId}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{formatPrice(item.price)} each</span>
                        </div>

                        <div className="sp-cart-controls">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus size={12} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <strong className="sp-cart-price">
                          {formatPrice(item.price * item.quantity)}
                        </strong>

                        <button
                          className="sp-cart-remove"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="sp-cart-total">
                    <span>Total</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  <button className="sp-checkout-button" onClick={goToCheckout}>
                    Proceed to Secure Checkout
                    <ChevronRight size={16} />
                  </button>

                  <p className="sp-checkout-note">
                    <Check size={12} />
                    Customer approval required before payment
                  </p>
                </>
              )}
            </div>

            <div className="sp-agent-side-card sp-opportunity-side">
              <div className="sp-side-card-heading">
                <div className="sp-side-icon green">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <h3>Revenue Opportunity</h3>
                  <p>AI growth signals</p>
                </div>
              </div>

              <div className="sp-opportunity-side-content">
                <div className="sp-opportunity-number">
                  {recommendations.length}
                </div>
                <div>
                  <strong>Growth opportunities</strong>
                  <p>
                    {recommendations.length
                      ? 'Potential upsell and cross-sell actions detected.'
                      : 'Interact with the agent to discover opportunities.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="sp-agent-side-card sp-security-side">
              <div className="sp-security-icon">
                <Zap size={17} />
              </div>
              <div>
                <strong>Commerce Intelligence</strong>
                <p>Powered by SellPilot policy and recommendation engines.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ProductCard({
  product,
  formatPrice,
  onAdd,
}: {
  product: Product;
  formatPrice: (price: number) => string;
  onAdd: () => void;
}) {
  const inStock = product.inventory > 0;

  return (
    <div className="sp-product-card">
      <div className="sp-product-top">
        <span className="sp-product-category">{product.category || 'Product'}</span>
        <span className={inStock ? 'sp-stock green' : 'sp-stock red'}>
          <span />
          {inStock ? `${product.inventory} in stock` : 'Out of stock'}
        </span>
      </div>

      <div className="sp-product-icon">
        <Package size={20} />
      </div>

      <h3>{product.name}</h3>

      <p>{product.description || 'Smart commerce product.'}</p>

      <div className="sp-product-bottom">
        <strong>{formatPrice(product.price)}</strong>
      </div>

      {product.tags && product.tags.length > 0 && (
        <div className="sp-product-tags">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <button disabled={!inStock} onClick={onAdd}>
        {inStock ? (
          <>
            <ShoppingCart size={14} />
            Add to Cart
          </>
        ) : (
          'Out of Stock'
        )}
      </button>
    </div>
  );
}
