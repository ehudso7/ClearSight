import { generateDemoClientData } from "./demoClient";
import { RawClientData } from "shared-types";

const DEMO_CLIENT_ID = "demo-client";

/**
 * Fetches operational data for a client on a specific date
 * In demo mode, generates synthetic data
 * In production, calls real integrations (Shopify, WMS, etc.)
 */
export async function getClientData(clientId: string, date: string): Promise<RawClientData> {
  // Demo mode - return generated data
  if (process.env.CLEARSIGHT_DEMO_MODE === "true" || clientId === DEMO_CLIENT_ID) {
    return generateDemoClientData(date);
  }

  // --- REAL INTEGRATIONS STUBS ---
  // TODO: Implement actual SDK calls for production clients
  //
  // Example pattern for real integrations:
  //
  // const integrations = await getClientIntegrations(clientId);
  //
  // const shopifyData = integrations.shopify
  //   ? await fetchShopifyOrders(integrations.shopify, date)
  //   : null;
  //
  // const wmsData = integrations.wms
  //   ? await fetchWmsMetrics(integrations.wms, date)
  //   : null;
  //
  // const staffData = integrations.payroll
  //   ? await fetchStaffingData(integrations.payroll, date)
  //   : null;
  //
  // const supportData = integrations.gmail
  //   ? await fetchSupportTickets(integrations.gmail, date)
  //   : null;
  //
  // const financeData = integrations.stripe
  //   ? await fetchFinanceData(integrations.stripe, date)
  //   : null;
  //
  // return {
  //   sales: shopifyData || { salesToday: 0, orders: 0, returns: 0 },
  //   warehouse: wmsData || { pickAccuracy: 0, cph: 0, mispicks: 0, overtimeHours: 0, stuckOrders: 0 },
  //   staff: staffData || { headcount: 0, shifts: [], overtimeRisk: false },
  //   support: supportData || { ticketsToday: 0, autoResolved: 0, csat: 0, refundTickets: 0 },
  //   finance: financeData || { revenue: 0, refundsAmount: 0, grossMarginPct: 0 }
  // };

  throw new Error(`Non-demo data fetch not implemented yet for client: ${clientId}`);
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
