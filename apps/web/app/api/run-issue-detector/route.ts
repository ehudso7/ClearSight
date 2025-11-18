import { NextRequest, NextResponse } from "next/server";
import { analyzeKpis, detectIssues } from "core-agents/src/orchestrator";
import { getClientData } from "@/lib/dataFetchers";
import { saveIssues } from "@/lib/db";

/**
 * POST /api/run-issue-detector
 * Runs the issue detection agent for real-time monitoring
 *
 * Body: { clientId: string, date: string }
 * Returns: { ok: boolean, kpis: KPI[], issues: Issue[] }
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

    console.log(`[API] Running issue detector for ${clientId} on ${date}`);

    // Get raw data
    const raw = await getClientData(clientId, date);

    // Analyze KPIs
    const kpis = await analyzeKpis(raw);

    // Detect issues
    const issues = await detectIssues(raw, kpis);

    // Save critical issues
    const criticalIssues = issues.filter(i => i.severity === 'high' || i.severity === 'critical');
    if (criticalIssues.length > 0) {
      await saveIssues(clientId, criticalIssues);
      console.log(`[API] Saved ${criticalIssues.length} critical issues`);
    }

    return NextResponse.json({ ok: true, kpis, issues });
  } catch (e: any) {
    console.error("[API] Error detecting issues:", e);
    return NextResponse.json(
      { ok: false, error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
