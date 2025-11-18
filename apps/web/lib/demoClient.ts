import { RawClientData } from "shared-types";

/**
 * Generates realistic demo data for showcasing ClearSight Ops
 * @param date - The date for the data (ISO format)
 * @returns Simulated client operational data
 */
export function generateDemoClientData(date: string): RawClientData {
  // Seed the random number generator based on date for consistency
  const dateSeed = new Date(date).getTime();

  const random = (min: number, max: number, seed: number = 0): number => {
    // Simple seeded pseudo-random for demo consistency
    const x = Math.sin(seed + dateSeed) * 10000;
    const rand = x - Math.floor(x);
    return Math.round((rand * (max - min) + min) * 100) / 100;
  };

  const baseSales = 12000;
  const salesToday = baseSales + random(-2500, 3500, 1);
  const avgOrderValue = random(25, 45, 2);
  const orders = Math.round(salesToday / avgOrderValue);
  const returnRate = random(0.01, 0.03, 3);
  const returns = Math.round(orders * returnRate);

  const warehouse = {
    pickAccuracy: random(97.5, 99.4, 4),
    cph: random(24, 32, 5),
    mispicks: Math.round(random(1, 6, 6)),
    overtimeHours: random(1.5, 6.5, 7),
    stuckOrders: Math.round(random(0, 5, 8))
  };

  const staff = {
    headcount: 18,
    shifts: [
      { name: "Morning", workers: 7 },
      { name: "Afternoon", workers: 7 },
      { name: "Night", workers: 4 }
    ],
    overtimeRisk: warehouse.overtimeHours > 4
  };

  const support = {
    ticketsToday: Math.round(random(6, 24, 9)),
    autoResolved: Math.round(random(3, 18, 10)),
    csat: random(4.1, 4.8, 11),
    refundTickets: returns
  };

  const finance = {
    revenue: salesToday,
    refundsAmount: random(150, 750, 12),
    grossMarginPct: random(32, 48, 13)
  };

  return {
    sales: { salesToday, orders, returns },
    warehouse,
    staff,
    support,
    finance
  };
}
