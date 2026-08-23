'use client';
import React, { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // paise
  currency: string;
  inventory: number;
  tags: string[];
  active: boolean;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

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
      if (!res.ok) throw new Error('Failed to load catalog');
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || null);
      // derive categories from returned products if not already set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cats = Array.from(new Set((data.products || []).map((p: any) => String(p.category)).filter(Boolean)));
      setCategories(cats as string[]);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // fetchCatalog updates state; avoid the "set-state-in-effect" lint by calling it inside a microtask
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page]);

  function formatPrice(paise: number) {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
    } catch {
      return `INR ${paise / 100}`;
    }
  }

  function availabilityLabel(inv: number) {
    if (inv <= 0) return 'Out of stock';
    if (inv < 5) return 'Low stock';
    return 'In stock';
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Catalog</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search products" className="border rounded px-3 py-2 flex-1" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="ml-auto text-sm text-gray-600">{loading ? 'Loading...' : (pagination ? `${pagination.total} products` : '')}</div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded">Error: {error}</div>}

      {loading && !products.length && <div className="p-8 text-center">Loading catalog...</div>}

      {!loading && products.length === 0 && <div className="p-8 text-center">No products found.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-lg">{p.name}</h2>
              <div className="text-sm text-gray-600">{p.category}</div>
            </div>
            <p className="text-sm text-gray-700 mt-2">{p.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-lg font-semibold">{formatPrice(p.price)}</div>
              <div className="text-sm text-gray-600">{availabilityLabel(p.inventory)}</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Inventory: {p.inventory}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (<span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button className="px-3 py-2 border rounded mr-2" onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={pagination ? pagination.page <= 1 : true}>Previous</button>
        <span className="mx-2">Page {pagination ? pagination.page : page} / {pagination ? pagination.totalPages : '?'}</span>
        <button className="px-3 py-2 border rounded ml-2" onClick={() => setPage((s) => s + 1)} disabled={pagination ? pagination.page >= pagination.totalPages : false}>Next</button>
      </div>
    </div>
  );
}
