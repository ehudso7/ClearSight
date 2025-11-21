/**
 * CSV parsing and validation utilities
 */
import Papa from 'papaparse';
import { RawClientData } from 'shared-types';

export interface CSVParseResult {
  success: boolean;
  data?: Partial<RawClientData>;
  error?: string;
  rowCount?: number;
}

/**
 * Parse CSV file and extract operational data
 * Supports multiple CSV formats:
 * - Sales data (orders, revenue, returns)
 * - Warehouse data (pick accuracy, CPH, overtime)
 * - Staff data (headcount, shifts)
 * - Support data (tickets, CSAT)
 * - Finance data (revenue, margins)
 */
export async function parseOperationalCSV(
  file: File,
  dataType: 'sales' | 'warehouse' | 'staff' | 'support' | 'finance' | 'mixed'
): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          
          if (rows.length === 0) {
            resolve({ success: false, error: 'CSV file is empty' });
            return;
          }

          let parsedData: Partial<RawClientData> = {};

          switch (dataType) {
            case 'sales':
              parsedData = parseSalesData(rows);
              break;
            case 'warehouse':
              parsedData = parseWarehouseData(rows);
              break;
            case 'staff':
              parsedData = parseStaffData(rows);
              break;
            case 'support':
              parsedData = parseSupportData(rows);
              break;
            case 'finance':
              parsedData = parseFinanceData(rows);
              break;
            case 'mixed':
              parsedData = parseMixedData(rows);
              break;
          }

          resolve({
            success: true,
            data: parsedData,
            rowCount: rows.length,
          });
        } catch (error: any) {
          resolve({
            success: false,
            error: `Failed to parse CSV: ${error.message}`,
          });
        }
      },
      error: (error: any) => {
        resolve({
          success: false,
          error: `CSV parsing error: ${error.message}`,
        });
      },
    });
  });
}

/**
 * Parse sales data from CSV
 * Expected columns: sales, orders, returns (or similar variations)
 */
function parseSalesData(rows: any[]): Partial<RawClientData> {
  const latestRow = rows[rows.length - 1];
  
  return {
    sales: {
      salesToday: parseNumber(latestRow.sales || latestRow.revenue || latestRow.total_sales || 0),
      orders: parseNumber(latestRow.orders || latestRow.order_count || latestRow.total_orders || 0),
      returns: parseNumber(latestRow.returns || latestRow.return_count || 0),
    },
  };
}

/**
 * Parse warehouse data from CSV
 * Expected columns: pick_accuracy, cph, mispicks, overtime_hours, stuck_orders
 */
function parseWarehouseData(rows: any[]): Partial<RawClientData> {
  const latestRow = rows[rows.length - 1];
  
  return {
    warehouse: {
      pickAccuracy: parseNumber(latestRow.pick_accuracy || latestRow.accuracy || 95),
      cph: parseNumber(latestRow.cph || latestRow.cases_per_hour || 0),
      mispicks: parseNumber(latestRow.mispicks || latestRow.errors || 0),
      overtimeHours: parseNumber(latestRow.overtime_hours || latestRow.overtime || 0),
      stuckOrders: parseNumber(latestRow.stuck_orders || latestRow.delayed_orders || 0),
    },
  };
}

/**
 * Parse staff data from CSV
 * Expected columns: headcount, shift, workers, overtime_risk
 */
function parseStaffData(rows: any[]): Partial<RawClientData> {
  const totalHeadcount = rows.reduce((sum, row) => 
    sum + parseNumber(row.headcount || row.workers || row.employees || 0), 0
  );
  
  const shifts = rows.map(row => ({
    name: row.shift || row.shift_name || 'Shift',
    workers: parseNumber(row.workers || row.headcount || 0),
  }));
  
  const overtimeRisk = rows.some(row => 
    parseNumber(row.overtime_hours || row.overtime || 0) > 40
  );
  
  return {
    staff: {
      headcount: totalHeadcount,
      shifts,
      overtimeRisk,
    },
  };
}

/**
 * Parse support data from CSV
 * Expected columns: tickets, resolved, csat, refund_tickets
 */
function parseSupportData(rows: any[]): Partial<RawClientData> {
  const latestRow = rows[rows.length - 1];
  
  return {
    support: {
      ticketsToday: parseNumber(latestRow.tickets || latestRow.ticket_count || 0),
      autoResolved: parseNumber(latestRow.auto_resolved || latestRow.resolved || 0),
      csat: parseNumber(latestRow.csat || latestRow.satisfaction || 0),
      refundTickets: parseNumber(latestRow.refund_tickets || latestRow.refunds || 0),
    },
  };
}

/**
 * Parse finance data from CSV
 * Expected columns: revenue, refunds, gross_margin
 */
function parseFinanceData(rows: any[]): Partial<RawClientData> {
  const latestRow = rows[rows.length - 1];
  
  return {
    finance: {
      revenue: parseNumber(latestRow.revenue || latestRow.total_revenue || 0),
      refundsAmount: parseNumber(latestRow.refunds || latestRow.refund_amount || 0),
      grossMarginPct: parseNumber(latestRow.gross_margin || latestRow.margin_pct || 0),
    },
  };
}

/**
 * Parse mixed data (all categories in one CSV)
 * This is more flexible but requires more columns
 */
function parseMixedData(rows: any[]): Partial<RawClientData> {
  const latestRow = rows[rows.length - 1];
  
  return {
    sales: {
      salesToday: parseNumber(latestRow.sales || 0),
      orders: parseNumber(latestRow.orders || 0),
      returns: parseNumber(latestRow.returns || 0),
    },
    warehouse: {
      pickAccuracy: parseNumber(latestRow.pick_accuracy || 95),
      cph: parseNumber(latestRow.cph || 0),
      mispicks: parseNumber(latestRow.mispicks || 0),
      overtimeHours: parseNumber(latestRow.overtime_hours || 0),
      stuckOrders: parseNumber(latestRow.stuck_orders || 0),
    },
    staff: {
      headcount: parseNumber(latestRow.headcount || 0),
      shifts: [{ name: 'Day', workers: parseNumber(latestRow.headcount || 0) }],
      overtimeRisk: parseNumber(latestRow.overtime_hours || 0) > 40,
    },
    support: {
      ticketsToday: parseNumber(latestRow.tickets || 0),
      autoResolved: parseNumber(latestRow.auto_resolved || 0),
      csat: parseNumber(latestRow.csat || 0),
      refundTickets: parseNumber(latestRow.refund_tickets || 0),
    },
    finance: {
      revenue: parseNumber(latestRow.revenue || 0),
      refundsAmount: parseNumber(latestRow.refunds || 0),
      grossMarginPct: parseNumber(latestRow.gross_margin || 0),
    },
  };
}

/**
 * Safely parse number from string or number
 */
function parseNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}
