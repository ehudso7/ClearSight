import { NextRequest, NextResponse } from "next/server";
import { personalizeSalesOutreach } from "core-agents/src/orchestrator";

/**
 * POST /api/sales/personalize-outreach
 * Personalizes sales outreach emails using AI
 *
 * Body: { lead: any, template: string }
 * Returns: { ok: boolean, subject: string, body: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { lead, template } = await req.json();

    if (!lead || !template) {
      return NextResponse.json(
        { ok: false, error: "lead and template are required" },
        { status: 400 }
      );
    }

    console.log(`[API] Personalizing outreach for lead: ${lead.company || lead.name}`);

    const result = await personalizeSalesOutreach(lead, template);

    console.log(`[API] Generated subject: ${result.subject}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[API] Error personalizing outreach:", e);
    return NextResponse.json(
      { ok: false, error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
