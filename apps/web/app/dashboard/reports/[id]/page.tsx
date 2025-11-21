import { createClient } from '@/lib/supabase/server';
import { getUserClientId, isAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const clientId = await getUserClientId();
  const admin = await isAdmin();
  const supabase = createClient();

  // Fetch report
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !report) {
    notFound();
  }

  // Check authorization (must be owner or admin)
  if (!admin && report.client_id !== clientId) {
    notFound();
  }

  const kpis = report.kpi_summary as any[];
  const issues = report.issues_summary as any[];
  const actions = report.actions as any[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-neo-turquoise transition mb-2 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">{report.subject}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{format(new Date(report.report_date), 'EEEE, MMMM d, yyyy')}</span>
            <span>•</span>
            <span className="capitalize">{report.type} Report</span>
            {report.sent_at && (
              <>
                <span>•</span>
                <span className="text-emerald-400">Sent via email</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      {kpis && kpis.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-50">
                    {kpi.unit === '$' && '$'}
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                    {kpi.unit && kpi.unit !== '$' && ` ${kpi.unit}`}
                  </p>
                  {kpi.trend && (
                    <span className={`text-xs ${
                      kpi.trend === 'up' ? 'text-emerald-400' :
                      kpi.trend === 'down' ? 'text-red-400' :
                      'text-slate-500'
                    }`}>
                      {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {issues && issues.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Issues Detected</h2>
          <div className="space-y-3">
            {issues.map((issue: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
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

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Recommended Actions</h2>
          <div className="space-y-3">
            {actions.map((action: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{action.title}</h3>
                    {action.description && (
                      <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {action.impactScore && (
                      <span className="text-xs text-slate-500">
                        Impact: {action.impactScore}/10
                      </span>
                    )}
                    {action.confidence && (
                      <span className="text-xs text-slate-500">
                        Confidence: {action.confidence}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Report Markdown */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Full Report</h2>
        <div className="prose prose-invert prose-slate max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-mono bg-slate-950 rounded-lg p-6 border border-slate-800">
            {report.body_markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}
