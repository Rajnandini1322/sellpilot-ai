"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  itemCount: number;
};

function money(value: number) {
  return `₹${(value / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.customerName.toLowerCase().includes(query.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(query.toLowerCase()) ||
        order.id.toLowerCase().includes(query.toLowerCase());

      const matchesFilter = filter === "ALL" || order.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [orders, query, filter]);

  const revenue = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Commerce
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Monitor transactions, payment status and order activity.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3">
            <p className="text-xs text-zinc-500">Paid Revenue</p>
            <p className="text-xl font-bold">{money(revenue)}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Total Orders", orders.length],
            ["Paid", orders.filter((o) => o.status === "PAID").length],
            ["Pending", orders.filter((o) => o.status === "PENDING").length],
            ["Failed", orders.filter((o) => ["FAILED", "CANCELLED"].includes(o.status)).length],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, email or order ID..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#111217] px-4 py-3 text-sm outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="p-10 text-center text-zinc-500">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-violet-300">
                          #{order.id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {order.itemCount}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        {money(order.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : order.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
