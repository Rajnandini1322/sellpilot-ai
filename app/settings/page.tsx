"use client";

import Link from "next/link";
import { ArrowLeft, Settings, ShieldCheck, CreditCard, Bot } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#08090d] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <Settings size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-gray-500">
              Manage SellPilot configuration and security settings.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center gap-3">
              <Bot size={20} />
              <h2 className="font-medium">AI Revenue Assistant</h2>
            </div>
            <p className="text-sm text-gray-400">
              AI recommendations are enabled. The assistant can recommend
              products, upsells, and cross-sells but cannot directly make
              payments.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck size={20} />
              <h2 className="font-medium">Purchase Safety</h2>
            </div>
            <p className="text-sm text-gray-400">
              Purchases are protected by inventory, quantity, price, and
              transaction-limit policy checks.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <CreditCard size={20} />
              <h2 className="font-medium">Payment Configuration</h2>
            </div>
            <p className="text-sm text-gray-400">
              Razorpay Test Mode is configured for secure server-side order
              creation and payment verification.
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Environment</span>
                <span className="text-sm font-medium">Test Mode</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
