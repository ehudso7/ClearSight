import { NextRequest, NextResponse } from "next/server";
import { analyzeKpis, detectIssues, generateActions, createDailyReport } from "core-agents/src/orchestrator";
import { DailyReportPayload } from "shared-types";
import { getClientData } from "@/lib/dataFetchers";
import { saveReport, saveIssues, saveActions } from "@/lib/db";

/**
 * POST /api/generate-daily-report
 * Generates a comprehensive daily operations report for a client
 *
 * Body: { clientId: string, date: string }
 * Returns: { ok: boolean, markdown: string, payload: DailyReportPayload }
 */
export async function POST(req: NextRequest) {
  try {
    const { clientId, date } = await req.json();

    if (!clientId || !date) {
      return NextResponse.json(
        { ok: false, error: "clientId and date are required" },
        { status: 400 }
      );
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

    // Step 7: Save to database
    const reportId = await saveReport(clientId, {
      type: "daily",
      report_date: date,
      subject: `Daily Ops Report – ${date}`,
      body_markdown: markdown,
      kpi_summary: kpis,
      issues_summary: issues,
      actions
    });

    // Save issues and actions separately for tracking
    if (issues.length > 0) {
      await saveIssues(clientId, issues);
    }
    if (actions.length > 0) {
      await saveActions(clientId, actions);
    }

    console.log("[API] Report generated successfully:", reportId);

    return NextResponse.json({ ok: true, reportId, markdown, payload });
  } catch (e: any) {
    console.error("[API] Error generating report:", e);
    return NextResponse.json(
      { ok: false, error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
