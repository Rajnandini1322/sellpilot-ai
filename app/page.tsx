"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Bot,
  Package,
  Megaphone,
  ShieldCheck,
  Settings,
  TrendingUp,
  ArrowUpRight,
  ShoppingCart,
  Sparkles,
  Activity,
} from "lucide-react";

const opportunityStats = [
  { title: "Total Revenue", key: "revenue", icon: TrendingUp },
  { title: "AI Generated Revenue", key: "aiRevenue", icon: Sparkles },
  { title: "Orders", key: "orders", icon: ShoppingCart },
  { title: "Conversion Rate", key: "conversion", icon: Activity },
];

export default function Home() {
  const [dashboard, setDashboard] = useState({ revenue: 0, paidOrders: 0, totalOrders: 0, conversionRate: 0, activities: [] as Array<{ action: string; reason: string; amount?: number; status: string; createdAt: string }> });

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then((data) => setDashboard(data)).catch(() => undefined);
  }, []);

  const stats = opportunityStats.map((s) => ({
    ...s,
    value:
      s.key === "revenue" ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dashboard.revenue / 100) :
      s.key === "aiRevenue" ? "—" :
      s.key === "orders" ? String(dashboard.paidOrders) :
      `${dashboard.conversionRate}%`,
    change: s.key === "aiRevenue" ? "recommendations" : "live",
  }));

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0c0d12] px-5 py-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Sparkles size={21} />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              SellPilot
            </h1>
            <p className="text-xs text-gray-500">AI Commerce Agent</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavItem icon={<LayoutDashboard size={18} />} text="Dashboard" active />
          <NavItem icon={<Bot size={18} />} text="AI Agent" href="/agent" />
          <NavItem icon={<Package size={18} />} text="Catalog" href="/catalog" />
          <NavItem icon={<Megaphone size={18} />} text="Campaigns" />
          <NavItem icon={<ShieldCheck size={18} />} text="Audit Trail" />
        </nav>

        <div className="mt-auto">
          <NavItem icon={<Settings size={18} />} text="Settings" />

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">Merchant account</p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                RC
              </div>

              <div>
                <p className="text-sm font-medium">
                  Rajnandini
                </p>
                <p className="text-xs text-gray-500">
                  Test Merchant
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="ml-64 min-h-screen px-8 py-7">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Merchant Dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Good evening, Rajnandini
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-400">
              ● Razorpay Test Mode
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              RC
            </div>
          </div>
        </header>

        {/* Revenue highlight */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">
                AI Revenue Opportunity
              </p>

              <div className="mt-3 flex items-end gap-3">
                <h3 className="text-4xl font-semibold tracking-tight">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dashboard.revenue / 100)}
                </h3>

                <span className="mb-1 flex items-center gap-1 text-sm text-emerald-400">
                  <ArrowUpRight size={15} />
                  18.4%
                </span>
              </div>

              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Estimated additional revenue from AI recommendations,
                upsells and cross-sell opportunities.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:block">
              <Sparkles className="text-white" size={25} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-[#0c0d12] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <Icon size={18} className="text-gray-500" />
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-2xl font-semibold">
                    {stat.value}
                  </p>

                  <span className="text-xs text-emerald-400">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lower section */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Opportunities */}
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  AI Growth Opportunities
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Actions recommended by SellPilot
                </p>
              </div>

              <button className="text-xs text-gray-400 hover:text-white">
                View all
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <Opportunity
                title="Keyboard → Mouse Bundle"
                description="Customers buying keyboards frequently need a mouse."
                value="₹18,400"
              />

              <Opportunity
                title="Headphones → Carrying Case"
                description="Add a complementary accessory during checkout."
                value="₹12,800"
              />

              <Opportunity
                title="Laptop → Extended Warranty"
                description="Offer warranty to high-intent laptop buyers."
                value="₹11,600"
              />
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
            <h3 className="font-semibold">
              Recent Agent Activity
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Latest actions performed by SellPilot
            </p>

            <div className="mt-6 space-y-5">
              {dashboard.activities.length === 0 && (
                <p className="text-sm text-gray-500">No agent or payment activity yet.</p>
              )}
              {dashboard.activities.map((activity, index) => (
                <div key={`${activity.action}-${index}`} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{activity.reason}</p>
                    <p className="mt-1 text-[11px] text-gray-600">{activity.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent CTA */}
        <div className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#0c0d12] p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
              <Bot size={24} />
            </div>

            <div>
              <h3 className="font-semibold">
                Talk to your AI Revenue Agent
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Ask SellPilot to find opportunities or analyze your catalog.
              </p>
            </div>
          </div>

          <a href="/agent" className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-gray-200">
            Open AI Agent
          </a>
        </div>
      </section>
    </main>
  );
}

function NavItem({
  icon,
  text,
  active = false,
  href,
}: {
  icon: ReactNode;
  text: string;
  active?: boolean;
  href?: string;
}) {
  return (
    <a href={href || "#"}
      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-white text-black"
          : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}

function Opportunity({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <TrendingUp size={16} />
        </div>

        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">{value}</p>
        <p className="mt-1 text-[11px] text-emerald-400">
          opportunity
        </p>
      </div>
    </div>
  );
}
