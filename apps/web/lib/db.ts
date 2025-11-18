/**
 * Database utilities for ClearSight Ops
 *
 * TODO: Add Supabase client when ready to connect to real database
 * For now, these are stubs that log operations
 */

export interface ReportData {
  type: string;
  report_date: string;
  subject: string;
  body_markdown: string;
  kpi_summary: any;
  issues_summary: any;
  actions: any;
}

/**
 * Saves a generated report to the database
 */
export async function saveReport(clientId: string, report: ReportData): Promise<void> {
  // TODO: Implement Supabase insert
  // import { createClient } from '@supabase/supabase-js';
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!
  // );
  //
  // const { error } = await supabase
  //   .from('reports')
  //   .insert({
  //     client_id: clientId,
  //     ...report,
  //     sent_at: new Date().toISOString()
  //   });
  //
  // if (error) throw error;

  console.log("[DB] Report saved for client:", clientId, report.type, report.report_date);
}

/**
 * Saves detected issues to the database
 */
export async function saveIssues(clientId: string, issues: any[]): Promise<void> {
  // TODO: Implement Supabase insert
  console.log("[DB] Issues saved for client:", clientId, issues.length);
}

/**
 * Saves recommended actions to the database
 */
export async function saveActions(clientId: string, actions: any[]): Promise<void> {
  // TODO: Implement Supabase insert
  console.log("[DB] Actions saved for client:", clientId, actions.length);
}

/**
 * Gets client integrations configuration
 */
export async function getClientIntegrations(clientId: string): Promise<any> {
  // TODO: Implement Supabase query
  console.log("[DB] Getting integrations for client:", clientId);
  return {};
}
