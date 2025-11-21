import { createClient } from '@/lib/supabase/server';
import { getUserClientId } from '@/lib/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const clientId = await getUserClientId();

  if (!clientId) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-50 mb-2">No Client Account Found</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Your account has been created, but an admin needs to set up your client profile.
          Please contact support@clearsightops.com
        </p>
      </div>
    );
  }

  const supabase = createClient();

  // Fetch recent reports
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', clientId)
    .order('report_date', { ascending: false })
    .limit(10);

  // Fetch active issues
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch pending actions
  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'open')
    .order('impact_score', { ascending: false })
    .limit(5);

  if (reportsError || issuesError || actionsError) {
    console.error('Dashboard fetch errors:', { reportsError, issuesError, actionsError });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">Dashboard</h1>
          <p className="text-slate-400">Your operations intelligence at a glance</p>
        </div>
        <Link
          href="/dashboard/uploads"
          className="px-4 py-2 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 transition"
        >
          Upload Data
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Total Reports</p>
          <p className="text-3xl font-bold text-slate-50">{reports?.length || 0}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Active Issues</p>
          <p className="text-3xl font-bold text-amber-400">{issues?.length || 0}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-2">Pending Actions</p>
          <p className="text-3xl font-bold text-neo-turquoise">{actions?.length || 0}</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-50">Recent Reports</h2>
          <Link href="/dashboard/reports" className="text-sm text-neo-turquoise hover:underline">
            View all
          </Link>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No reports yet</p>
            <p className="text-sm text-slate-500">
              Upload your operational data to generate your first report
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="block p-4 rounded-lg border border-slate-700 hover:border-neo-turquoise hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-100">{report.subject}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {format(new Date(report.report_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.sent_at && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Sent
                      </span>
                    )}
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Issues */}
      {issues && issues.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-50">Active Issues</h2>
            <Link href="/dashboard/issues" className="text-sm text-neo-turquoise hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-lg border border-slate-700"
              >
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
