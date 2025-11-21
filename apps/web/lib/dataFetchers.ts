import { generateDemoClientData } from "./demoClient";
import { RawClientData } from "shared-types";
import { createServiceRoleClient } from "./supabase/server";

const DEMO_CLIENT_ID = "demo-client";

/**
 * Fetches operational data for a client on a specific date
 * Priority: CSV uploads → Integrations → Demo data
 */
export async function getClientData(clientId: string, date: string): Promise<RawClientData> {
  // Demo mode - return generated data
  if (process.env.CLEARSIGHT_DEMO_MODE === "true" || clientId === DEMO_CLIENT_ID) {
    return generateDemoClientData(date);
  }

  // Try to get data from recent CSV uploads
  const csvData = await getDataFromCSVUploads(clientId);
  if (csvData) {
    console.log('[DataFetchers] Using data from CSV uploads');
    return csvData;
  }

  // Try integrations (if configured)
  // const integrationData = await getDataFromIntegrations(clientId, date);
  // if (integrationData) {
  //   return integrationData;
  // }

  // Fallback: Return empty/default data
  console.warn('[DataFetchers] No data source found, using defaults');
  return getDefaultClientData();
}

/**
 * Get data from recent CSV uploads
 * Combines data from the most recent upload of each type
 */
async function getDataFromCSVUploads(clientId: string): Promise<RawClientData | null> {
  const supabase = createServiceRoleClient();

  // Get most recent processed uploads for each data type
  const { data: uploads, error } = await supabase
    .from('csv_uploads')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'processed')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !uploads || uploads.length === 0) {
    console.log('[DataFetchers] No CSV uploads found');
    return null;
  }

  // Combine data from uploads
  let result: Partial<RawClientData> = {};

  for (const upload of uploads) {
    const uploadData = upload.processed_data as Partial<RawClientData>;
    if (uploadData) {
      result = {
        ...result,
        ...uploadData,
      };
    }
  }

  // Fill in missing sections with defaults
  return {
    sales: result.sales || { salesToday: 0, orders: 0, returns: 0 },
    warehouse: result.warehouse || { pickAccuracy: 0, cph: 0, mispicks: 0, overtimeHours: 0, stuckOrders: 0 },
    staff: result.staff || { headcount: 0, shifts: [], overtimeRisk: false },
    support: result.support || { ticketsToday: 0, autoResolved: 0, csat: 0, refundTickets: 0 },
    finance: result.finance || { revenue: 0, refundsAmount: 0, grossMarginPct: 0 },
  };
}

/**
 * Get default/empty client data
 */
function getDefaultClientData(): RawClientData {
  return {
    sales: { salesToday: 0, orders: 0, returns: 0 },
    warehouse: { pickAccuracy: 0, cph: 0, mispicks: 0, overtimeHours: 0, stuckOrders: 0 },
    staff: { headcount: 0, shifts: [], overtimeRisk: false },
    support: { ticketsToday: 0, autoResolved: 0, csat: 0, refundTickets: 0 },
    finance: { revenue: 0, refundsAmount: 0, grossMarginPct: 0 },
  };
}

/**
 * Placeholder for fetching Shopify data
 */
async function fetchShopifyOrders(config: any, date: string) {
  // TODO: Implement Shopify API integration
  // import Shopify from 'shopify-api-node';
  // const shopify = new Shopify(config);
  // const orders = await shopify.order.list({ created_at_min: date });
  // return processShopifyData(orders);
  throw new Error("Shopify integration not implemented");
}

/**
 * Placeholder for fetching WMS/warehouse data
 */
async function fetchWmsMetrics(config: any, date: string) {
  // TODO: Implement WMS integration
  // Could be CSV upload, API, or database connection
  throw new Error("WMS integration not implemented");
}

/**
 * Placeholder for fetching staffing/payroll data
 */
async function fetchStaffingData(config: any, date: string) {
  // TODO: Implement staffing system integration
  throw new Error("Staffing integration not implemented");
}

/**
 * Placeholder for fetching support tickets
 */
async function fetchSupportTickets(config: any, date: string) {
  // TODO: Implement support system integration (Gmail, Zendesk, etc.)
  throw new Error("Support integration not implemented");
}

/**
 * Placeholder for fetching financial data
 */
async function fetchFinanceData(config: any, date: string) {
  // TODO: Implement financial system integration (Stripe, QuickBooks, etc.)
  throw new Error("Finance integration not implemented");
}
