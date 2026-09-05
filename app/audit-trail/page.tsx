"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSearch,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type AuditEvent = {
  id: string;
  action: string;
  reason: string;
  amount: number | null;
  status: string;
  metadata: string | null;
  createdAt: string;
};

type AuditStats = {
  total: number;
  successful: number;
  lastActivity: string | null;
};

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    successful: 0,
    lastActivity: null,
  });

  const [loading, setLoading] = useState(true);

  async function loadAuditTrail() {
    try {
      setLoading(true);

      const response = await fetch("/api/audit-trail", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load audit trail");
      }

      setEvents(data.events || []);

      setStats(
        data.stats || {
          total: 0,
          successful: 0,
          lastActivity: null,
        }
      );
    } catch (error) {
      console.error("Audit trail loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditTrail();
  }, []);

  function formatTime(value: string | null) {
    if (!value) return "No activity";

    const date = new Date(value.replace(" ", "T") + "Z");

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
  }

  function formatAction(action: string) {
    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <main className="sp-route-page sp-route-page min-h-screen bg-[#08090d] text-white">
      <section className="ml-0 min-h-screen px-8 py-7 md:ml-64">
        <div className="mx-auto max-w-6xl">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                SellPilot Security
              </p>

              <h1 className="text-2xl font-semibold">
                Audit Trail
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Track agent actions, checkout events, policy decisions and payment activity.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

            <Stat
              icon={<FileSearch size={18} />}
              title="Total Events"
              value={String(stats.total)}
            />

            <Stat
              icon={<CheckCircle2 size={18} />}
              title="Successful"
              value={String(stats.successful)}
            />

            <Stat
              icon={<Clock3 size={18} />}
              title="Last Activity"
              value={formatTime(stats.lastActivity)}
            />

          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

            <div className="mb-6">
              <h2 className="font-semibold">
                Activity Log
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Live record of important commerce and agent events.
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading audit events...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <FileSearch
                  size={28}
                  className="mx-auto text-gray-600"
                />

                <p className="mt-3 text-sm text-gray-400">
                  No audit events yet.
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Commerce and agent activity will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {events.map((event) => {
                  const success = event.status === "SUCCESS";

                  return (
                    <div
                      key={event.id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div className="flex gap-3">

                          <div className="mt-0.5">
                            {success ? (
                              <CheckCircle2
                                size={18}
                                className="text-emerald-400"
                              />
                            ) : (
                              <XCircle
                                size={18}
                                className="text-red-400"
                              />
                            )}
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-medium">
                                {formatAction(event.action)}
                              </h3>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] ${
                                  success
                                    ? "bg-emerald-400/10 text-emerald-400"
                                    : "bg-red-400/10 text-red-400"
                                }`}
                              >
                                {event.status}
                              </span>

                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                              {event.reason}
                            </p>

                            {event.amount !== null && (
                              <p className="mt-2 text-xs text-gray-600">
                                Amount: ₹
                                {event.amount.toLocaleString("en-IN")}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">

                              <span>
                                Actor: SellPilot
                              </span>

                              <span>
                                Resource: Commerce
                              </span>

                            </div>

                          </div>

                        </div>

                        <span className="shrink-0 text-[11px] text-gray-600">
                          {formatTime(event.createdAt)}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">

            <h2 className="font-semibold">
              Security & Compliance
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              SellPilot records important commerce decisions so merchant
              actions and agent-assisted transactions can be reviewed.
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

        <p className="text-sm text-gray-500">
          {title}
        </p>

        <span className="text-gray-500">
          {icon}
        </span>

      </div>

      <p className="mt-5 text-2xl font-semibold">
        {value}
      </p>

    </div>
  );
}


