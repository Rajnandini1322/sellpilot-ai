"use client";

import Link from "next/link";
import { ArrowLeft, Megaphone, Plus, TrendingUp, Users, Zap } from "lucide-react";

const campaigns = [
  {
    name: "Keyboard Upsell",
    type: "Upsell",
    status: "Active",
    audience: "Recent shoppers",
    performance: "12.4%",
    revenue: "₹8,450",
  },
  {
    name: "Accessory Cross-sell",
    type: "Cross-sell",
    status: "Active",
    audience: "Keyboard buyers",
    performance: "8.7%",
    revenue: "₹5,280",
  },
  {
    name: "New Product Launch",
    type: "Recommendation",
    status: "Draft",
    audience: "All customers",
    performance: "—",
    revenue: "₹0",
  },
];

export default function CampaignsPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <section className="ml-0 min-h-screen px-8 py-7 md:ml-64">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
                  <Megaphone size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    SellPilot
                  </p>
                  <h1 className="text-2xl font-semibold">
                    Campaigns
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                Manage revenue campaigns, upsells and cross-sell strategies.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200">
              <Plus size={16} />
              Create Campaign
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat
              icon={<Zap size={18} />}
              title="Active Campaigns"
              value="2"
            />

            <Stat
              icon={<TrendingUp size={18} />}
              title="Attributed Revenue"
              value="₹13,730"
            />

            <Stat
              icon={<Users size={18} />}
              title="Customers Reached"
              value="1,248"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
            <div className="mb-5">
              <h2 className="font-semibold">
                Revenue Campaigns
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Campaigns designed to increase merchant revenue.
              </p>
            </div>

            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.name}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">
                          {campaign.name}
                        </h3>

                        <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-gray-400">
                          {campaign.type}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] ${
                            campaign.status === "Active"
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Audience: {campaign.audience}
                      </p>
                    </div>

                    <div className="flex gap-8">
                      <Metric
                        label="Conversion"
                        value={campaign.performance}
                      />

                      <Metric
                        label="Revenue"
                        value={campaign.revenue}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-6">
            <p className="text-sm font-medium text-emerald-400">
              AI Campaign Insight
            </p>

            <p className="mt-2 text-sm text-gray-400">
              SellPilot can automatically identify high-value upsell
              and cross-sell opportunities from customer and catalog activity.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0d12] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-gray-500">{icon}</span>
      </div>

      <p className="mt-5 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-right">
      <p className="text-[11px] text-gray-600">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
