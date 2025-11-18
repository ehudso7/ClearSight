import { NextRequest, NextResponse } from "next/server";
import { generateSupportReply } from "core-agents/src/orchestrator";

/**
 * POST /api/support/auto-reply
 * Generates automated support replies using AI
 *
 * Body: { subject: string, body: string, history?: string, clientConfig?: any }
 * Returns: { ok: boolean, classification: string, urgency: string, reply: string, needsHumanReview: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const { subject, body, history, clientConfig } = await req.json();

    if (!subject || !body) {
      return NextResponse.json(
        { ok: false, error: "subject and body are required" },
        { status: 400 }
      );
    }

    console.log(`[API] Generating support reply for: ${subject}`);

    const result = await generateSupportReply(
      subject,
      body,
      history || "",
      clientConfig || {}
    );

    console.log(`[API] Classification: ${result.classification}, Urgency: ${result.urgency}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[API] Error generating support reply:", e);
    return NextResponse.json(
      { ok: false, error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}
