import { createClient } from '@/lib/supabase/server';
import { getUserClientId } from '@/lib/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function IssuesPage() {
  const clientId = await getUserClientId();

  if (!clientId) {
    return <div className="text-center py-12"><p className="text-slate-400">No client account found</p></div>;
  }

  const supabase = createClient();

  const { data: issues, error } = await supabase
    .from('issues')
    .select('*')
    .eq('client_id', clientId)
    .order('detected_at', { ascending: false });

  if (error) {
    console.error('Error fetching issues:', error);
  }

  const openIssues = issues?.filter(i => i.status === 'open') || [];
  const closedIssues = issues?.filter(i => i.status === 'resolved') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">Issues</h1>
          <p className="text-slate-400">Track and resolve operational problems</p>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-neo-turquoise transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Open Issues */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Open Issues ({openIssues.length})</h2>
        {openIssues.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No open issues - everything looks good! ✓</p>
        ) : (
          <div className="space-y-3">
            {openIssues.map((issue) => (
              <div key={issue.id} className="p-4 rounded-lg border border-slate-700">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    issue.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                    issue.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    issue.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                  }`}>
                    {issue.severity}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{issue.title}</h3>
                    {issue.description && (
                      <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Detected {format(new Date(issue.detected_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Issues */}
      {closedIssues.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Resolved ({closedIssues.length})</h2>
          <div className="space-y-3">
            {closedIssues.map((issue) => (
              <div key={issue.id} className="p-4 rounded-lg border border-slate-700 opacity-60">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    resolved
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{issue.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Resolved {issue.resolved_at && format(new Date(issue.resolved_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
