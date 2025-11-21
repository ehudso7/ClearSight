import { createClient } from '@/lib/supabase/server';
import { getUserClientId } from '@/lib/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ReportsListPage() {
  const clientId = await getUserClientId();

  if (!clientId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No client account found</p>
      </div>
    );
  }

  const supabase = createClient();

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('client_id', clientId)
    .order('report_date', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">All Reports</h1>
          <p className="text-slate-400">View your complete reporting history</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-neo-turquoise transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        {!reports || reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No reports yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Upload your operational data to generate your first report
            </p>
            <Link
              href="/dashboard/uploads"
              className="inline-block px-4 py-2 rounded-lg bg-neo-turquoise text-slate-950 font-medium hover:bg-neo-turquoise/90 transition"
            >
              Upload Data
            </Link>
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
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{report.subject}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                      <span>{format(new Date(report.report_date), 'MMMM d, yyyy')}</span>
                      <span>•</span>
                      <span className="capitalize">{report.type}</span>
                      {report.sent_at && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Sent</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
