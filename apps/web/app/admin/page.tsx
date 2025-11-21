import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdmin();

  const supabase = createClient();

  // Get all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  // Get system stats
  const { count: totalReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });

  const { count: activeIssues } = await supabase
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: recentUploads } = await supabase
    .from('csv_uploads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
                  <span className="text-amber-400 text-xl font-bold">C</span>
                </div>
                <span className="font-semibold text-lg text-slate-50">Admin Panel</span>
              </Link>
              <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Super Admin
              </span>
            </div>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-neo-turquoise transition">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* System Health */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-50 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-2">Total Clients</p>
                <p className="text-3xl font-bold text-slate-50">{clients?.length || 0}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-2">Total Reports</p>
                <p className="text-3xl font-bold text-neo-turquoise">{totalReports || 0}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-2">Active Issues</p>
                <p className="text-3xl font-bold text-amber-400">{activeIssues || 0}</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <p className="text-sm text-slate-400 mb-2">Uploads (7d)</p>
                <p className="text-3xl font-bold text-slate-50">{recentUploads || 0}</p>
              </div>
            </div>
          </div>

          {/* Client Management */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-50">Clients</h2>
              <Link
                href="/admin/clients/new"
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 transition"
              >
                + Add Client
              </Link>
            </div>

            {!clients || clients.length === 0 ? (
              <p className="text-center py-8 text-slate-400">No clients yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-100">{client.name}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">{client.contact_name || '—'}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{client.contact_email || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300 capitalize">
                            {client.subscription_tier || 'starter'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            client.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {client.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="text-sm text-neo-turquoise hover:underline"
                          >
                            View →
                          </Link>
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
    </div>
  );
}
