"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileSearch,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const events = [
  {
    action: "Payment verified",
    actor: "Razorpay",
    resource: "Order",
    status: "SUCCESS",
    time: "Today, 08:12",
    details: "Customer payment signature successfully verified.",
  },
  {
    action: "Checkout order created",
    actor: "SellPilot",
    resource: "Order",
    status: "SUCCESS",
    time: "Today, 08:11",
    details: "Customer-approved checkout order was created.",
  },
  {
    action: "Recommendation generated",
    actor: "Revenue Agent",
    resource: "Catalog",
    status: "SUCCESS",
    time: "Today, 08:10",
    details: "Upsell and cross-sell opportunities evaluated.",
  },
  {
    action: "Purchase policy evaluated",
    actor: "Policy Engine",
    resource: "Checkout",
    status: "SUCCESS",
    time: "Today, 08:09",
    details: "Transaction passed quantity and amount safety checks.",
  },
];

export default function AuditTrailPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
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
              value="4"
            />

            <Stat
              icon={<CheckCircle2 size={18} />}
              title="Successful"
              value="4"
            />

            <Stat
              icon={<Clock3 size={18} />}
              title="Last Activity"
              value="08:12"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0d12] p-6">
            <div className="mb-6">
              <h2 className="font-semibold">
                Activity Log
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Immutable-style record of important commerce events.
              </p>
            </div>

            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={`${event.action}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {event.status === "SUCCESS" ? (
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
                            {event.action}
                          </h3>

                          <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                            {event.status}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                          {event.details}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
                          <span>Actor: {event.actor}</span>
                          <span>Resource: {event.resource}</span>
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 text-[11px] text-gray-600">
                      {event.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-gray-500">{icon}</span>
      </div>

      <p className="mt-5 text-2xl font-semibold">{value}</p>
    </div>
  );
}
