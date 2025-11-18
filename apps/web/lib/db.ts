import { createClient } from '@supabase/supabase-js';
import { KPI, Issue, ActionRecommendation } from 'shared-types';

/**
 * Database utilities for ClearSight Ops with real Supabase operations
 */

export interface ReportData {
  type: string;
  report_date: string;
  subject: string;
  body_markdown: string;
  kpi_summary: KPI[];
  issues_summary: Issue[];
  actions: ActionRecommendation[];
}

export interface ClientIntegration {
  id: string;
  client_id: string;
  type: string;
  config: Record<string, unknown>;
  is_active: boolean;
}

/**
 * Creates a Supabase client with service role (server-side only)
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Saves a generated report to the database
 */
export async function saveReport(clientId: string, report: ReportData): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('reports')
    .insert({
      client_id: clientId,
      ...report,
      sent_at: new Date().toISOString()
    });

  if (error) {
    console.error("[DB] Error saving report:", error);
    throw new Error(`Failed to save report: ${error.message}`);
  }

  console.log("[DB] Report saved successfully for client:", clientId, report.type, report.report_date);
}

/**
 * Saves detected issues to the database
 */
export async function saveIssues(clientId: string, issues: Issue[]): Promise<void> {
  if (issues.length === 0) return;

  const supabase = getSupabaseClient();

  const issuesData = issues.map(issue => ({
    client_id: clientId,
    severity: issue.severity,
    title: issue.title,
    description: issue.description,
    data: issue.meta || {},
    detected_at: new Date().toISOString(),
    status: 'open'
  }));

  const { error } = await supabase
    .from('issues')
    .insert(issuesData);

  if (error) {
    console.error("[DB] Error saving issues:", error);
    throw new Error(`Failed to save issues: ${error.message}`);
  }

  console.log("[DB] Issues saved successfully for client:", clientId, issues.length);
}

/**
 * Saves recommended actions to the database
 */
export async function saveActions(clientId: string, actions: ActionRecommendation[]): Promise<void> {
  if (actions.length === 0) return;

  const supabase = getSupabaseClient();

  const actionsData = actions.map(action => ({
    client_id: clientId,
    title: action.title,
    description: action.description,
    impact_score: action.impactScore,
    confidence: action.confidence,
    status: 'open',
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('actions')
    .insert(actionsData);

  if (error) {
    console.error("[DB] Error saving actions:", error);
    throw new Error(`Failed to save actions: ${error.message}`);
  }

  console.log("[DB] Actions saved successfully for client:", clientId, actions.length);
}

/**
 * Gets client integrations configuration
 */
export async function getClientIntegrations(clientId: string): Promise<ClientIntegration[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('client_integrations')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (error) {
    console.error("[DB] Error getting integrations:", error);
    throw new Error(`Failed to get integrations: ${error.message}`);
  }

  console.log("[DB] Integrations retrieved for client:", clientId, data?.length || 0);
  return data || [];
}

/**
 * Verifies that a client exists and is active
 */
export async function verifyClient(clientId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error} = await supabase
    .from('clients')
    .select('id, active')
    .eq('id', clientId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.active === true;
}

/**
 * Gets client information
 */
export async function getClient(clientId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    console.error("[DB] Error getting client:", error);
    throw new Error(`Failed to get client: ${error.message}`);
  }

  return data;
}
