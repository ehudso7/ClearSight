/**
 * Email delivery using Resend
 */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendReportEmailParams {
  to: string;
  clientName: string;
  reportDate: string;
  reportMarkdown: string;
  reportUrl: string;
  kpiSummary: any[];
  issuesCount: number;
  actionsCount: number;
}

/**
 * Send daily report email
 */
export async function sendReportEmail(params: SendReportEmailParams) {
  const {
    to,
    clientName,
    reportDate,
    reportMarkdown,
    reportUrl,
    kpiSummary,
    issuesCount,
    actionsCount,
  } = params;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ClearSight Ops <reports@clearsightops.com>',
      to: [to],
      subject: `Daily Ops Report – ${reportDate}`,
      html: generateReportEmailHTML(params),
      text: generateReportEmailText(params),
    });

    if (error) {
      console.error('[Email] Error sending report:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email] Report sent successfully:', data?.id);
    return data;
  } catch (error: any) {
    console.error('[Email] Failed to send report email:', error);
    throw error;
  }
}

/**
 * Generate HTML email content
 */
function generateReportEmailHTML(params: SendReportEmailParams): string {
  const { clientName, reportDate, kpiSummary, issuesCount, actionsCount, reportUrl } = params;

  const kpisHTML = kpiSummary.slice(0, 4).map(kpi => `
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">${kpi.label}</p>
      <p style="color: #f1f5f9; font-size: 24px; font-weight: bold; margin: 0;">
        ${kpi.unit === '$' ? '$' : ''}${typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}${kpi.unit && kpi.unit !== '$' ? ` ${kpi.unit}` : ''}
      </p>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Ops Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border-radius: 12px; margin-bottom: 16px;">
        <span style="color: #0f172a; font-size: 24px; font-weight: bold; line-height: 48px;">C</span>
      </div>
      <h1 style="color: #f1f5f9; font-size: 24px; margin: 0;">ClearSight Ops</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0;">Daily Operations Report</p>
    </div>

    <!-- Main Content -->
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h2 style="color: #f1f5f9; font-size: 20px; margin: 0 0 8px 0;">Good Morning, ${clientName}</h2>
      <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">${reportDate}</p>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        ${kpisHTML}
      </div>

      <!-- Summary -->
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #f1f5f9; font-size: 16px; margin: 0 0 12px 0;">Today's Summary</h3>
        <div style="display: flex; gap: 16px;">
          <div style="flex: 1;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Issues Detected</p>
            <p style="color: ${issuesCount > 0 ? '#fbbf24' : '#10b981'}; font-size: 20px; font-weight: bold; margin: 4px 0 0 0;">${issuesCount}</p>
          </div>
          <div style="flex: 1;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Action Items</p>
            <p style="color: #06b6d4; font-size: 20px; font-weight: bold; margin: 4px 0 0 0;">${actionsCount}</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <a href="${reportUrl}" style="display: block; width: 100%; padding: 12px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center;">
        View Full Report →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 16px;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        This is your automated daily operations report
      </p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <a href="${reportUrl}" style="color: #06b6d4; text-decoration: none;">View Report</a> • 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #06b6d4; text-decoration: none;">Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email content (fallback)
 */
function generateReportEmailText(params: SendReportEmailParams): string {
  const { clientName, reportDate, reportMarkdown, reportUrl, issuesCount, actionsCount } = params;

  return `
ClearSight Ops - Daily Operations Report

${clientName}
${reportDate}

Issues Detected: ${issuesCount}
Action Items: ${actionsCount}

View Full Report: ${reportUrl}

---

${reportMarkdown}

---

This is your automated daily operations report.
View online: ${reportUrl}
Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
  `.trim();
}
