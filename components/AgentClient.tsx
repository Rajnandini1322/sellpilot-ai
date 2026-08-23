'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';

export default function AgentClient() {
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'agent'; text: string; }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const sessionId = 'demo-session-1';
  const ref = useRef<HTMLDivElement | null>(null);

  async function send() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agent/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, message: msg }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Agent error');
      setMessages((m) => [...m, { from: 'agent', text: data.message || '...' }]);
      setRecommendations(data.recommendations || []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
      // scroll
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">SellPilot AI — Revenue Assistant</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border rounded p-4 bg-white shadow-sm flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex-1 overflow-auto mb-4">
            {messages.length === 0 && <div className="text-sm text-gray-500">Try prompts: &quot;Find me a programming keyboard&quot;, &quot;What goes well with this?&quot;, &quot;Show me something better&quot;</div>}
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'text-right my-2' : 'text-left my-2'}>
                <div className={`inline-block px-3 py-2 rounded ${m.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
              </div>
            ))}
            <div ref={ref} />
          </div>

          {error && <div className="p-2 bg-red-50 text-red-700 rounded mb-2">{error}</div>}

          <div className="flex gap-2">
            <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI (example: Find me a keyboard)" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={send} disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
          </div>
        </div>

        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-2">Recommendations</h2>
          {recommendations.length === 0 && <div className="text-sm text-gray-500">No recommendations yet.</div>}
          <div className="flex flex-col gap-3">
            {recommendations.map((r: any, idx: number) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.product?.name || r.productId}</div>
                  <div className="text-sm text-gray-600">{r.type}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{r.reason}</div>
                <div className="text-sm text-gray-500 mt-2">Price: {r.product ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((r.product.price||0)/100) : 'N/A'}</div>
                <div className="text-sm text-gray-500">Availability: {r.product ? (r.product.inventory>0 ? (r.product.inventory<5 ? 'Low stock' : 'In stock') : 'Out of stock') : 'N/A'}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Revenue Opportunity</h3>
            <div className="text-sm text-gray-600 mt-2">{recommendations.length ? 'Upsell or cross-sell opportunities identified from catalog rules.' : 'No immediate opportunities identified.'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
