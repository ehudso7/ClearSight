"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      contact_name: formData.get('contact_name') as string,
      contact_email: formData.get('contact_email') as string,
      subscription_tier: formData.get('subscription_tier') as string,
    };

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error || 'Failed to create client');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-slate-400 hover:text-neo-turquoise transition mb-4 inline-block">
          ← Back to Admin
        </Link>

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8">
          <h1 className="text-2xl font-semibold text-slate-50 mb-6">Add New Client</h1>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-slate-300 mb-2">
                Contact Name
              </label>
              <input
                id="contact_name"
                name="contact_name"
                type="text"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-slate-300 mb-2">
                Contact Email *
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="john@acme.com"
              />
            </div>

            <div>
              <label htmlFor="subscription_tier" className="block text-sm font-medium text-slate-300 mb-2">
                Subscription Tier
              </label>
              <select
                id="subscription_tier"
                name="subscription_tier"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="starter">Starter ($1,500/mo)</option>
                <option value="pro">Pro ($3,500-$7,000/mo)</option>
                <option value="enterprise">Enterprise ($10,000+/mo)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
