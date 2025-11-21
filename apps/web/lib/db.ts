/**
 * Database utilities for ClearSight Ops
 * Real Supabase operations - production ready
 */

import { createServiceRoleClient } from './supabase/server'
import { Database } from './supabase/types'
import { Issue, ActionRecommendation } from 'shared-types'

type ReportInsert = Database['public']['Tables']['reports']['Insert']
type IssueInsert = Database['public']['Tables']['issues']['Insert']
type ActionInsert = Database['public']['Tables']['actions']['Insert']

export interface ReportData {
  type: 'daily' | 'weekly' | 'monthly';
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
export async function saveReport(clientId: string, report: ReportData): Promise<string> {
  const supabase = createServiceRoleClient()

  const reportData: ReportInsert = {
    client_id: clientId,
    type: report.type,
    report_date: report.report_date,
    subject: report.subject,
    body_markdown: report.body_markdown,
    kpi_summary: report.kpi_summary,
    issues_summary: report.issues_summary,
    actions: report.actions,
    sent_at: null, // Will be updated when email is sent
  }

  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select('id')
    .single()

  if (error) {
    console.error('[DB] Error saving report:', error)
    throw new Error(`Failed to save report: ${error.message}`)
  }

  console.log('[DB] Report saved successfully:', data.id)
  return data.id
}

/**
 * Marks a report as sent
 */
export async function markReportAsSent(reportId: string): Promise<void> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('reports')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', reportId)

  if (error) {
    console.error('[DB] Error marking report as sent:', error)
    throw new Error(`Failed to mark report as sent: ${error.message}`)
  }
}

/**
 * Saves detected issues to the database
 */
export async function saveIssues(clientId: string, issues: Issue[]): Promise<void> {
  if (issues.length === 0) {
    console.log('[DB] No issues to save')
    return
  }

  const supabase = createServiceRoleClient()

  const issuesData: IssueInsert[] = issues.map(issue => ({
    client_id: clientId,
    severity: issue.severity,
    title: issue.title,
    description: issue.description || null,
    data: issue.meta || null,
    status: 'open',
  }))

  const { error } = await supabase
    .from('issues')
    .insert(issuesData)

  if (error) {
    console.error('[DB] Error saving issues:', error)
    throw new Error(`Failed to save issues: ${error.message}`)
  }

  console.log('[DB] Issues saved successfully:', issues.length)
}

/**
 * Saves recommended actions to the database
 */
export async function saveActions(clientId: string, actions: ActionRecommendation[]): Promise<void> {
  if (actions.length === 0) {
    console.log('[DB] No actions to save')
    return
  }

  const supabase = createServiceRoleClient()

  const actionsData: ActionInsert[] = actions.map(action => ({
    client_id: clientId,
    title: action.title,
    description: action.description || null,
    impact_score: action.impactScore,
    confidence: action.confidence,
    status: 'open',
  }))

  const { error } = await supabase
    .from('actions')
    .insert(actionsData)

  if (error) {
    console.error('[DB] Error saving actions:', error)
    throw new Error(`Failed to save actions: ${error.message}`)
  }

  console.log('[DB] Actions saved successfully:', actions.length)
}

/**
 * Gets client integrations configuration
 */
export async function getClientIntegrations(clientId: string): Promise<any[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('client_integrations')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)

  if (error) {
    console.error('[DB] Error fetching integrations:', error)
    throw new Error(`Failed to fetch integrations: ${error.message}`)
  }

  console.log('[DB] Fetched integrations for client:', clientId, data?.length || 0)
  return data || []
}

/**
 * Gets client by ID
 */
export async function getClient(clientId: string) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) {
    console.error('[DB] Error fetching client:', error)
    throw new Error(`Failed to fetch client: ${error.message}`)
  }

  return data
}

/**
 * Gets client by user ID (for authenticated requests)
 */
export async function getClientByUserId(userId: string) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('[DB] Error fetching client by user:', error)
    throw new Error(`Failed to fetch client: ${error.message}`)
  }

  return data
}

/**
 * Gets all active clients (for batch processing)
 */
export async function getAllActiveClients() {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, contact_email, user_id')
    .eq('active', true)

  if (error) {
    console.error('[DB] Error fetching active clients:', error)
    throw new Error(`Failed to fetch active clients: ${error.message}`)
  }

  return data || []
}
