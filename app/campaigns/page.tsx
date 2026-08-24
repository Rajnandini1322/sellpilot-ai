"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Plus,
  TrendingUp,
  Users,
  Zap,
  X,
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  audience: string;
  performance: number;
  revenue: number;
};

type Stats = {
  active: number;
  revenue: number;
  customersReached: number;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats>({
    active: 0,
    revenue: 0,
    customersReached: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("Upsell");
  const [audience, setAudience] = useState("All customers");

  async function loadCampaigns() {
    try {
      setLoading(true);

      const response = await fetch("/api/campaigns", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load campaigns");
      }

      setCampaigns(data.campaigns || []);
      setStats(
        data.stats || {
          active: 0,
          revenue: 0,
          customersReached: 0,
        }
      );
    } catch (error) {
      console.error("Campaign loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function toggleCampaign(campaign: Campaign) {
    try {
      setUpdatingId(campaign.id);
      const nextStatus = campaign.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
      const response = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update campaign");
      await loadCampaigns();
    } catch (error: any) {
      alert(error?.message || "Failed to update campaign");
    } finally {
      setUpdatingId(null);
    }
  }

  async function createCampaign() {
    if (!name.trim()) {
      alert("Please enter campaign name.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          audience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      setName("");
      setType("Upsell");
      setAudience("All customers");
      setShowCreate(false);

      await loadCampaigns();
    } catch (error: any) {
      alert(error?.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  }

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

            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200"
            >
              <Plus size={16} />
              Create Campaign
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat
              icon={<Zap size={18} />}
              title="Active Campaigns"
              value={String(stats.active)}
            />

            <Stat
              icon={<TrendingUp size={18} />}
              title="Attributed Revenue"
              value={`₹${stats.revenue.toLocaleString("en-IN")}`}
            />

            <Stat
              icon={<Users size={18} />}
              title="Customers Reached"
              value={stats.customersReached.toLocaleString("en-IN")}
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

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <Megaphone
                  size={28}
                  className="mx-auto text-gray-600"
                />

                <p className="mt-3 text-sm text-gray-400">
                  No campaigns yet.
                </p>

                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black"
                >
                  Create your first campaign
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
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
                              campaign.status === "ACTIVE"
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

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleCampaign(campaign)}
                          disabled={updatingId === campaign.id}
                          className={`rounded-lg px-3 py-2 text-xs font-medium ${
                            campaign.status === "ACTIVE"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-emerald-400/10 text-emerald-400"
                          } disabled:opacity-50`}
                        >
                          {updatingId === campaign.id
                            ? "Updating..."
                            : campaign.status === "ACTIVE"
                              ? "Set Draft"
                              : "Activate"}
                        </button>

                        <div className="flex gap-8">
                        <Metric
                          label="Conversion"
                          value={
                            campaign.performance
                              ? `${campaign.performance}%`
                              : "—"
                          }
                        />

                        <Metric
                          label="Revenue"
                          value={`₹${Number(
                            campaign.revenue || 0
                          ).toLocaleString("en-IN")}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
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

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0d12] p-6 shadow-2xl">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Campaign
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Create a new revenue campaign.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Campaign Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Keyboard Upsell"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Campaign Type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111218] px-4 py-3 text-sm outline-none"
                >
                  <option value="Upsell">Upsell</option>
                  <option value="Cross-sell">Cross-sell</option>
                  <option value="Recommendation">
                    Recommendation
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Audience
                </label>

                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111218] px-4 py-3 text-sm outline-none"
                >
                  <option value="All customers">
                    All customers
                  </option>
                  <option value="Recent shoppers">
                    Recent shoppers
                  </option>
                  <option value="Keyboard buyers">
                    Keyboard buyers
                  </option>
                  <option value="High-value customers">
                    High-value customers
                  </option>
                </select>
              </div>

              <button
                onClick={createCampaign}
                disabled={creating}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
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

      <p className="mt-5 text-2xl font-semibold">
        {value}
      </p>
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
      <p className="text-[11px] text-gray-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}






