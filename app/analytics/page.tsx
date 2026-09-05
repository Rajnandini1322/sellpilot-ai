"use client";

import { useEffect, useState } from "react";

type Analytics = {
  summary: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    failedOrders: number;
    revenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  monthly: { month: string; orders: number; revenue: number }[];
  topProducts: {
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }[];
  categories: { category: string; revenue: number }[];
};

function money(value: number) {
  return `₹${(value / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090d] p-10 text-zinc-400">
        Loading analytics...
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#08090d] p-10 text-red-400">
        Unable to load analytics.
      </main>
    );
  }

  const maxRevenue = Math.max(
    ...data.monthly.map((item) => item.revenue),
    1
  );

  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Business Intelligence
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Track revenue, conversion, order performance and product growth.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Revenue", money(data.summary.revenue)],
            ["Paid Orders", data.summary.paidOrders],
            ["Avg. Order Value", money(data.summary.averageOrderValue)],
            ["Conversion", `${data.summary.conversionRate}%`],
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

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Revenue Trend</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Monthly paid revenue
              </p>
            </div>

            {data.monthly.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-zinc-600">
                No revenue data yet.
              </div>
            ) : (
              <div className="flex h-64 items-end gap-3 overflow-x-auto">
                {data.monthly.map((item) => (
                  <div
                    key={item.month}
                    className="flex min-w-[54px] flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-[10px] text-zinc-500">
                      {money(item.revenue)}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-violet-500/70 transition-all"
                      style={{
                        height: `${Math.max(
                          8,
                          (item.revenue / maxRevenue) * 180
                        )}px`,
                      }}
                    />
                    <span className="text-[10px] text-zinc-600">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Order Funnel</h2>
            <div className="mt-6 space-y-5">
              {[
                ["Total Orders", data.summary.totalOrders],
                ["Paid", data.summary.paidOrders],
                ["Pending", data.summary.pendingOrders],
                ["Failed", data.summary.failedOrders],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{
                        width: `${
                          data.summary.totalOrders
                            ? (Number(value) / data.summary.totalOrders) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <div className="mt-5 space-y-3">
              {data.topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">
                  No product sales yet.
                </p>
              ) : (
                data.topProducts.map((product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {product.category} · {product.unitsSold} units
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {money(product.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Category Performance</h2>
            <div className="mt-5 space-y-4">
              {data.categories.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">
                  No category data yet.
                </p>
              ) : (
                data.categories.map((category) => {
                  const total = data.summary.revenue || 1;
                  const percentage = Math.round(
                    (category.revenue / total) * 100
                  );

                  return (
                    <div key={category.category}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-zinc-300">
                          {category.category}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {money(category.revenue)} · {percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-400/70"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
