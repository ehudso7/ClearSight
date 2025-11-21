import { openai } from "./openaiClient";
import { KPI, Issue, ActionRecommendation, DailyReportPayload, RawClientData } from "shared-types";

/**
 * Call OpenAI with proper error handling and retries
 */
async function callModel(
  system: string, 
  user: string, 
  options: { 
    model?: string; 
    temperature?: number; 
    maxTokens?: number;
    jsonMode?: boolean;
  } = {}
) {
  const {
    model = "gpt-4o", // Latest GPT-4o model - faster and cheaper than gpt-4-turbo
    temperature = 0.7,
    maxTokens = 2000,
    jsonMode = false,
  } = options;

  try {
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode && { response_format: { type: "json_object" } }),
    });

    const msg = res.choices[0]?.message?.content;
    if (!msg) {
      throw new Error("No response from model");
    }
    return msg;
  } catch (error: any) {
    console.error('[AI] OpenAI API error:', error.message);
    
    // Retry logic for rate limits
    if (error?.status === 429) {
      console.log('[AI] Rate limited, waiting 2s before retry...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Retry once
      const res = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature,
        max_tokens: maxTokens,
      });
      
      const msg = res.choices[0]?.message?.content;
      if (!msg) {
        throw new Error("No response from model after retry");
      }
      return msg;
    }
    
    throw error;
  }
}

/** Worker B – KPI ANALYZER */
export async function analyzeKpis(raw: RawClientData): Promise<KPI[]> {
  const text = await callModel(
    `You are the KPI ANALYZER for ClearSight Ops.
    Analyze the operational data and return a JSON array of KPIs.
    Each KPI must have: key, label, value, unit, trend (up/down/flat).
    
    Example output format:
    [
      {"key": "sales", "label": "Total Sales", "value": 14329, "unit": "$", "trend": "up"},
      {"key": "orders", "label": "Orders", "value": 421, "unit": "orders", "trend": "flat"}
    ]
    
    Return ONLY the JSON array, nothing else.`,
    JSON.stringify(raw),
    { model: "gpt-4o-mini", temperature: 0.3, maxTokens: 1000 } // Use mini for cost savings on simple task
  );

  // Clean potential markdown formatting
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    const kpis = JSON.parse(cleanText);
    if (!Array.isArray(kpis)) {
      throw new Error('Response is not an array');
    }
    return kpis;
  } catch (error) {
    console.error("Failed to parse KPI analysis response:", cleanText.substring(0, 200));
    throw new Error(`Failed to parse KPI analysis: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/** Worker C – ISSUE DETECTOR */
export async function detectIssues(raw: RawClientData, kpis: KPI[]): Promise<Issue[]> {
  const text = await callModel(
    `You are the ISSUE DETECTOR for ClearSight Ops.
    Find any operational abnormalities.
    Output JSON array of {severity,title,description,meta}.
    Only output valid JSON array, no markdown formatting.`,
    JSON.stringify({ raw, kpis })
  );

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse issue detection response:", cleanText.substring(0, 200));
    throw new Error(`Failed to parse issue detection: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/** Worker D – STRATEGIST */
export async function generateActions(kpis: KPI[], issues: Issue[]): Promise<ActionRecommendation[]> {
  const text = await callModel(
    `You are the AI STRATEGIST for ClearSight Ops.
    Propose the top 3–7 operations actions.
    Return JSON array of {title,description,impactScore,confidence}.
    Only output valid JSON array, no markdown formatting.`,
    JSON.stringify({ kpis, issues })
  );

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse strategist response:", cleanText.substring(0, 200));
    throw new Error(`Failed to parse action recommendations: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/** Worker E – REPORT GENERATOR */
export async function createDailyReport(payload: DailyReportPayload): Promise<string> {
  const text = await callModel(
    `You are the REPORT GENERATOR for ClearSight Ops.
    Create a concise but detailed DAILY OPERATIONS REPORT in clean text format.

    Structure:
    📊 DAILY OPS REPORT – [Date]

    OVERVIEW
    - Sales, Orders, Returns summary

    WAREHOUSE KPIs
    - Pick Accuracy
    - CPH (Cases Per Hour)
    - Overtime Hours
    - Mispicks

    STAFFING
    - Headcount and shift distribution

    ISSUES DETECTED
    - List each issue with severity

    TOP ACTIONS FOR TODAY
    - Prioritized action items

    TOMORROW FORECAST
    - Brief forecast

    Tone: professional, direct, actionable.
    Use emojis sparingly for visual hierarchy.`,
    JSON.stringify(payload)
  );

  return text;
}

/** Worker F – SOP WRITER */
export async function createSOP(topic: string, context: string): Promise<string> {
  const text = await callModel(
    `You are the SOP WRITER for ClearSight Ops.
    Create a clear, step-by-step Standard Operating Procedure.
    Format as numbered steps with clear actions.
    Keep it concise and actionable.`,
    `Topic: ${topic}\nContext: ${context}`
  );

  return text;
}

/** Support Agent */
export async function generateSupportReply(subject: string, body: string, history: string, clientConfig: any): Promise<any> {
  const text = await callModel(
    `You are the AI CUSTOMER SUPPORT AGENT for ClearSight Ops.
    Goal: draft accurate, polite replies that follow the client's tone and policy.
    If you are not sure, ask for human review.
    Return JSON: {classification, urgency, reply, needsHumanReview}.
    Only output valid JSON, no markdown formatting.`,
    JSON.stringify({ subject, body, history, clientConfig })
  );

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse support reply response:", cleanText.substring(0, 200));
    throw new Error(`Failed to parse support reply: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

/** Sales SDR Agent */
export async function personalizeSalesOutreach(lead: any, template: string): Promise<any> {
  const text = await callModel(
    `You are the AI SALES SDR AGENT for ClearSight Ops.
    Personalize cold emails to operations leaders.
    Return JSON: {subject, body}.
    Only output valid JSON, no markdown formatting.`,
    JSON.stringify({ lead, template })
  );

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse sales outreach response:", cleanText.substring(0, 200));
    throw new Error(`Failed to parse sales outreach: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}
