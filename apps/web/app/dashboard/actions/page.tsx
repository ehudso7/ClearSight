import { createClient } from '@/lib/supabase/server';
import { getUserClientId } from '@/lib/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ActionsPage() {
  const clientId = await getUserClientId();

  if (!clientId) {
    return <div className="text-center py-12"><p className="text-slate-400">No client account found</p></div>;
  }

  const supabase = createClient();

  const { data: actions, error } = await supabase
    .from('actions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching actions:', error);
  }

  const openActions = actions?.filter(a => a.status === 'open') || [];
  const inProgressActions = actions?.filter(a => a.status === 'in_progress') || [];
  const doneActions = actions?.filter(a => a.status === 'done') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">Action Items</h1>
          <p className="text-slate-400">AI-recommended actions to improve operations</p>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-neo-turquoise transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Open Actions */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">To Do ({openActions.length})</h2>
        {openActions.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No pending actions</p>
        ) : (
          <div className="space-y-3">
            {openActions.map((action) => (
              <div key={action.id} className="p-4 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{action.title}</h3>
                    {action.description && (
                      <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Created {format(new Date(action.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {action.impact_score && (
                      <span className="text-xs px-2 py-1 rounded bg-neo-turquoise/10 text-neo-turquoise border border-neo-turquoise/30">
                        Impact: {action.impact_score}/10
                      </span>
                    )}
                    {action.confidence && (
                      <span className="text-xs text-slate-500">
                        {action.confidence}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In Progress */}
      {inProgressActions.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">In Progress ({inProgressActions.length})</h2>
          <div className="space-y-3">
            {inProgressActions.map((action) => (
              <div key={action.id} className="p-4 rounded-lg border border-amber-700/50 bg-amber-500/5">
                <h3 className="font-medium text-slate-100">{action.title}</h3>
                {action.description && (
                  <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {doneActions.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Done ({doneActions.length})</h2>
          <div className="space-y-3">
            {doneActions.slice(0, 10).map((action) => (
              <div key={action.id} className="p-4 rounded-lg border border-slate-700 opacity-60">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-100">{action.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Completed {action.completed_at && format(new Date(action.completed_at), 'MMM d, yyyy')}
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
