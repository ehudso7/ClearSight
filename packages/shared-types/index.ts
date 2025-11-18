export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface KPI {
  key: string;
  label: string;
  value: number;
  unit?: string;
  target?: number | null;
  trend?: 'up' | 'down' | 'flat';
}

export interface Issue {
  id?: string;
  severity: Severity;
  title: string;
  description: string;
  meta?: Record<string, unknown>;
}

export interface ActionRecommendation {
  title: string;
  description: string;
  impactScore: number;   // 1–10
  confidence: number;    // 0–100
}

export interface DailyReportPayload {
  date: string;
  kpis: KPI[];
  issues: Issue[];
  actions: ActionRecommendation[];
  forecast?: string;
}

export interface RawClientData {
  sales: {
    salesToday: number;
    orders: number;
    returns: number;
  };
  warehouse: {
    pickAccuracy: number;
    cph: number;
    mispicks: number;
    overtimeHours: number;
    stuckOrders: number;
  };
  staff: {
    headcount: number;
    shifts: Array<{ name: string; workers: number }>;
    overtimeRisk: boolean;
  };
  support: {
    ticketsToday: number;
    autoResolved: number;
    csat: number;
    refundTickets: number;
  };
  finance: {
    revenue: number;
    refundsAmount: number;
    grossMarginPct: number;
  };
}
