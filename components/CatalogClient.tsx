'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  inventory: number;
  tags: string[];
  active: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function CatalogClient() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  async function fetchCatalog() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (q) params.set('q', q);
      if (category) params.set('category', category);

      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch('/api/catalog?' + params.toString());

      if (!res.ok) {
        throw new Error('Failed to load catalog');
      }

      const data = await res.json();

      setProducts(data.products || []);
      setPagination(data.pagination || null);

      const cats = Array.from(
        new Set(
          (data.products || [])
            .map((p: Product) => String(p.category))
            .filter(Boolean)
        )
      );

      setCategories(cats as string[]);
    } catch (e: unknown) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : 'Unable to load catalog'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page]);

  function formatPrice(paise: number) {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(paise / 100);
    } catch {
      return `INR ${paise / 100}`;
    }
  }

  function availabilityLabel(inv: number) {
    if (inv <= 0) return 'Out of stock';
    if (inv < 5) return 'Low stock';
    return 'In stock';
  }

  function addToCart(product: Product) {
    try {
      const current = JSON.parse(
        localStorage.getItem('sellpilot-cart') || '[]'
      );

      const found = current.find(
        (i: { productId: string }) => i.productId === product.id
      );

      const next = found
        ? current.map(
            (i: { productId: string; quantity: number }) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: Math.min(5, i.quantity + 1),
                  }
                : i
          )
        : [
            ...current,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          ];

      localStorage.setItem(
        'sellpilot-cart',
        JSON.stringify(next)
      );

      window.location.href = '/checkout';
    } catch {
      setError('Unable to create cart.');
    }
  }

  return (
    <main className="sp-page">
      <div className="sp-page-bg" />

      <div className="sp-page-container">
        <header className="sp-page-header">
          <div>
            <div className="sp-page-kicker">
              <span className="sp-page-kicker-dot" />
              SELLPILOT COMMERCE
            </div>

            <h1 className="sp-page-title">
              Product <span>Catalog</span>
            </h1>

            <p className="sp-page-subtitle">
              Explore your active product inventory and move directly
              from discovery to secure checkout.
            </p>
          </div>

          <a href="/checkout" className="sp-page-cart-button">
            <ShoppingCart size={17} />
            Checkout
          </a>
        </header>

        <section className="sp-catalog-toolbar">
          <div className="sp-catalog-search">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search products, categories or keywords..."
            />
          </div>

          <div className="sp-catalog-filter">
            <SlidersHorizontal size={15} />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sp-catalog-count">
            <Package size={15} />
            {loading
              ? 'Loading...'
              : pagination
                ? `${pagination.total} products`
                : 'Catalog'}
          </div>
        </section>

        {error && (
          <div className="sp-catalog-error">
            {error}
          </div>
        )}

        {loading && !products.length && (
          <div className="sp-catalog-empty">
            <Package size={25} />
            <strong>Loading catalog</strong>
            <span>Fetching your latest products...</span>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="sp-catalog-empty">
            <Search size={25} />
            <strong>No products found</strong>
            <span>Try changing your search or category filter.</span>
          </div>
        )}

        <div className="sp-catalog-grid">
          {products.map((product) => {
            const stock =
              product.inventory <= 0
                ? 'out'
                : product.inventory < 5
                  ? 'low'
                  : 'good';

            return (
              <article
                key={product.id}
                className="sp-catalog-card"
              >
                <div className="sp-catalog-card-top">
                  <span className="sp-catalog-category">
                    {product.category || 'Product'}
                  </span>

                  <span className={`sp-catalog-stock ${stock}`}>
                    <span />
                    {availabilityLabel(product.inventory)}
                  </span>
                </div>

                <div className="sp-catalog-product-icon">
                  <Package size={22} />
                </div>

                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <div className="sp-catalog-price-row">
                  <strong>{formatPrice(product.price)}</strong>

                  <span>
                    {product.inventory} units
                  </span>
                </div>

                {product.tags?.length > 0 && (
                  <div className="sp-catalog-tags">
                    {product.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <button
                  disabled={product.inventory <= 0}
                  onClick={() => addToCart(product)}
                  className="sp-catalog-buy"
                >
                  {product.inventory > 0 ? (
                    <>
                      <ShoppingCart size={14} />
                      Buy / Checkout
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </article>
            );
          })}
        </div>

        {pagination && pagination.totalPages > 0 && (
          <div className="sp-pagination">
            <button
              onClick={() =>
                setPage((value) => Math.max(1, value - 1))
              }
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span>
              Page <strong>{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong>
            </span>

            <button
              onClick={() =>
                setPage((value) => value + 1)
              }
              disabled={
                pagination.page >= pagination.totalPages
              }
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        <div className="sp-catalog-insight">
          <div>
            <Sparkles size={18} />
          </div>
          <section>
            <strong>SellPilot Commerce Intelligence</strong>
            <p>
              Product discovery, inventory awareness and checkout
              are connected through the same commerce flow.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
