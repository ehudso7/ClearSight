import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveClients } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for batch processing

/**
 * POST /api/webhooks/n8n/daily-report
 * Webhook endpoint for n8n to trigger daily report generation for all active clients
 * 
 * Requires webhook secret for authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate webhook request
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] N8N_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { ok: false, error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('[Webhook] Unauthorized webhook attempt');
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Webhook] Daily report batch triggered');

    // Get all active clients
    const clients = await getAllActiveClients();

    if (clients.length === 0) {
      console.log('[Webhook] No active clients found');
      return NextResponse.json({
        ok: true,
        message: 'No active clients',
        processed: 0,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const results = {
      success: [] as string[],
      failed: [] as { clientId: string; error: string }[],
    };

    // Process each client
    for (const client of clients) {
      try {
        console.log(`[Webhook] Processing client: ${client.name} (${client.id})`);

        // Generate report
        const reportResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-daily-report`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: client.id,
              date: today,
            }),
          }
        );

        const reportResult = await reportResponse.json();

        if (!reportResult.ok) {
          results.failed.push({
            clientId: client.id,
            error: reportResult.error || 'Unknown error',
          });
          continue;
        }

        // Send email if client has email configured
        if (client.contact_email) {
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/send-report-email`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportId: reportResult.reportId,
                clientId: client.id,
              }),
            }
          );

          const emailResult = await emailResponse.json();

          if (!emailResult.ok) {
            console.warn(`[Webhook] Failed to send email for ${client.id}:`, emailResult.error);
          }
        }

        results.success.push(client.id);
        console.log(`[Webhook] Successfully processed ${client.name}`);
      } catch (error: any) {
        console.error(`[Webhook] Error processing client ${client.id}:`, error);
        results.failed.push({
          clientId: client.id,
          error: error.message || 'Processing error',
        });
      }
    }

    const summary = {
      ok: true,
      processed: clients.length,
      successful: results.success.length,
      failed: results.failed.length,
      results,
    };

    console.log('[Webhook] Batch complete:', summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('[Webhook] Critical error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/n8n/daily-report
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
