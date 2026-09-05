"use client";

import { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  contact: string;
  totalOrders: number;
  paidOrders: number;
  totalSpent: number;
  lastOrderAt: string;
};

function money(value: number) {
  return `₹${(value / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.email.toLowerCase().includes(query.toLowerCase())
      ),
    [customers, query]
  );

  const revenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Customer Intelligence
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Understand customer activity, spending and purchase behaviour.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-zinc-500">Total Customers</p>
            <p className="mt-2 text-2xl font-bold">{customers.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-zinc-500">Active Customers</p>
            <p className="mt-2 text-2xl font-bold">
              {customers.filter((c) => c.paidOrders > 0).length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-zinc-500">Customer Revenue</p>
            <p className="mt-2 text-2xl font-bold">{money(revenue)}</p>
          </div>
        </div>

        <div className="mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-500/50"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="p-10 text-center text-zinc-500">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Orders</th>
                    <th className="px-5 py-4">Paid Orders</th>
                    <th className="px-5 py-4">Lifetime Value</th>
                    <th className="px-5 py-4">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold">{customer.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{customer.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {customer.contact}
                      </td>
                      <td className="px-5 py-4 text-sm">{customer.totalOrders}</td>
                      <td className="px-5 py-4 text-sm text-emerald-400">
                        {customer.paidOrders}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        {money(customer.totalSpent)}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {customer.lastOrderAt
                          ? new Date(customer.lastOrderAt).toLocaleDateString("en-IN")
                          : "—"}
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
