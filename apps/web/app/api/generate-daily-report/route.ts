import { NextRequest } from "next/server";
import { analyzeKpis, detectIssues, generateActions, createDailyReport } from "core-agents/src/orchestrator";
import { DailyReportPayload } from "shared-types";
import { getClientData } from "@/lib/dataFetchers";
import { saveReport, saveIssues, saveActions, verifyClient } from "@/lib/db";
import { generateReportSchema } from "@/lib/validation";
import { rateLimit, authorizeClient, errorResponse, successResponse } from "@/lib/middleware";

/**
 * POST /api/generate-daily-report
 * Generates a comprehensive daily operations report for a client
 *
 * Headers: x-api-key (optional)
 * Body: { clientId: string, date: string }
 * Returns: { ok: boolean, markdown: string, payload: DailyReportPayload }
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    if (!rateLimit(req)) {
      return errorResponse("Rate limit exceeded", 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = generateReportSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { clientId, date } = validation.data;

    // Authorization check
    const apiKey = req.headers.get('x-api-key');
    if (!authorizeClient(clientId, apiKey)) {
      return errorResponse("Unauthorized", 403);
    }

    // Verify client (skip in demo mode)
    const isDemoMode = process.env.CLEARSIGHT_DEMO_MODE === 'true';
    const isDemoClient = clientId === '00000000-0000-0000-0000-000000000001';

    if (!isDemoMode && !isDemoClient) {
      const isValid = await verifyClient(clientId);
      if (!isValid) {
        return errorResponse("Client not found", 404);
      }
    }

    console.log(`[API] Generating daily report for ${clientId} on ${date}`);

    // Step 1: Worker A - Get raw client data
    const raw = await getClientData(clientId, date);

    // Step 2: Worker B - Analyze KPIs
    console.log("[API] Analyzing KPIs...");
    const kpis = await analyzeKpis(raw);

    // Step 3: Worker C - Detect issues
    console.log("[API] Detecting issues...");
    const issues = await detectIssues(raw, kpis);

    // Step 4: Worker D - Generate action recommendations
    console.log("[API] Generating actions...");
    const actions = await generateActions(kpis, issues);

    // Step 5: Build payload
    const payload: DailyReportPayload = {
      date,
      kpis,
      issues,
      actions,
      forecast: undefined // TODO: Add forecasting logic
    };

    // Step 6: Worker E - Create the final report
    console.log("[API] Creating final report...");
    const markdown = await createDailyReport(payload);

    // Step 7: Save to database (skip if no Supabase configured)
    const hasDatabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasDatabase) {
      try {
        await saveReport(clientId, {
          type: "daily",
          report_date: date,
          subject: `Daily Ops Report – ${date}`,
          body_markdown: markdown,
          kpi_summary: kpis,
          issues_summary: issues,
          actions
        });

        await saveIssues(clientId, issues);
        await saveActions(clientId, actions);
      } catch (dbError: any) {
        console.error("[API] Database save failed:", dbError.message);
        // Continue - report was still generated
      }
    }

    console.log("[API] Report generated successfully");

    return successResponse({ markdown, payload });
  } catch (e: any) {
    console.error("[API] Error generating report:", e);
    const message = process.env.NODE_ENV === 'production'
      ? "Failed to generate report"
      : e.message;
    return errorResponse(message, 500);
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
