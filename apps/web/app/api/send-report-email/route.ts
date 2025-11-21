import { NextRequest, NextResponse } from 'next/server';
import { sendReportEmail } from '@/lib/email';
import { getClient, markReportAsSent } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/send-report-email
 * Send a report via email
 * 
 * Body: { reportId: string, clientId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { reportId, clientId } = await req.json();

    if (!reportId || !clientId) {
      return NextResponse.json(
        { ok: false, error: 'reportId and clientId are required' },
        { status: 400 }
      );
    }

    console.log(`[Email API] Sending report ${reportId} to client ${clientId}`);

    // Get client info
    const client = await getClient(clientId);

    if (!client || !client.contact_email) {
      return NextResponse.json(
        { ok: false, error: 'Client not found or no email configured' },
        { status: 404 }
      );
    }

    // Get report from database
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = createServiceRoleClient();
    
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { ok: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Send email
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports/${reportId}`;
    
    await sendReportEmail({
      to: client.contact_email,
      clientName: client.name,
      reportDate: report.report_date,
      reportMarkdown: report.body_markdown,
      reportUrl,
      kpiSummary: report.kpi_summary as any[],
      issuesCount: (report.issues_summary as any[])?.length || 0,
      actionsCount: (report.actions as any[])?.length || 0,
    });

    // Mark report as sent
    await markReportAsSent(reportId);

    console.log(`[Email API] Report sent successfully`);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Email API] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
