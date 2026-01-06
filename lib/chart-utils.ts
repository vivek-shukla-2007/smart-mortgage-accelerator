/**
 * Chart Utilities - Generate chart data from mortgage calculations
 */

import { PaymentRecord } from "./mortgage-calculator";

/**
 * Chart data point
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

/**
 * Amortization chart data
 */
export interface AmortizationChartData {
  principalData: ChartDataPoint[];
  interestData: ChartDataPoint[];
  balanceData: ChartDataPoint[];
  labels: string[];
}

/**
 * Generate amortization chart data from payment schedule
 * Shows principal vs interest over time
 */
export function generateAmortizationChartData(
  schedule: PaymentRecord[],
  intervalMonths: number = 12
): AmortizationChartData {
  const principalData: ChartDataPoint[] = [];
  const interestData: ChartDataPoint[] = [];
  const balanceData: ChartDataPoint[] = [];
  const labels: string[] = [];

  // Sample every N months to avoid too many data points
  for (let i = 0; i < schedule.length; i += intervalMonths) {
    const record = schedule[i];
    const monthLabel = `M${record.month}`;
    const yearLabel = record.year > 0 ? `Y${record.year + 1}` : "Y1";

    labels.push(yearLabel);
    principalData.push({
      x: i,
      y: Math.round(record.principal),
      label: monthLabel,
    });
    interestData.push({
      x: i,
      y: Math.round(record.interest),
      label: monthLabel,
    });
    balanceData.push({
      x: i,
      y: Math.round(record.balance),
      label: monthLabel,
    });
  }

  return { principalData, interestData, balanceData, labels };
}

/**
 * Generate comparison chart data for multiple scenarios
 */
export interface ScenarioComparison {
  name: string;
  monthlyEMI: number;
  totalInterest: number;
  tenure: number;
  totalAmount: number;
}

export function generateComparisonChartData(scenarios: ScenarioComparison[]) {
  return {
    emiData: scenarios.map((s, i) => ({
      x: i,
      y: Math.round(s.monthlyEMI),
      label: s.name,
    })),
    interestData: scenarios.map((s, i) => ({
      x: i,
      y: Math.round(s.totalInterest),
      label: s.name,
    })),
    tenureData: scenarios.map((s, i) => ({
      x: i,
      y: s.tenure,
      label: s.name,
    })),
    labels: scenarios.map((s) => s.name),
  };
}

/**
 * Generate principal payoff timeline chart
 * Shows how principal decreases over time
 */
export function generatePrincipalPayoffChart(schedule: PaymentRecord[]) {
  const data: ChartDataPoint[] = [];
  const interval = Math.max(1, Math.floor(schedule.length / 20)); // Max 20 points

  for (let i = 0; i < schedule.length; i += interval) {
    const record = schedule[i];
    data.push({
      x: record.month + record.year * 12,
      y: Math.round(record.balance),
    });
  }

  // Add final point if not already included
  if (schedule.length > 0) {
    const lastRecord = schedule[schedule.length - 1];
    if (data[data.length - 1].x !== lastRecord.month + lastRecord.year * 12) {
      data.push({
        x: lastRecord.month + lastRecord.year * 12,
        y: Math.round(lastRecord.balance),
      });
    }
  }

  return data;
}

/**
 * Generate interest paid over time chart
 */
export function generateInterestPaidChart(schedule: PaymentRecord[]) {
  const data: ChartDataPoint[] = [];
  let cumulativeInterest = 0;
  const interval = Math.max(1, Math.floor(schedule.length / 20)); // Max 20 points

  for (let i = 0; i < schedule.length; i += interval) {
    const record = schedule[i];
    cumulativeInterest += record.interest;
    data.push({
      x: record.month + record.year * 12,
      y: Math.round(cumulativeInterest),
    });
  }

  // Add final point if not already included
  if (schedule.length > 0) {
    const lastRecord = schedule[schedule.length - 1];
    let finalInterest = cumulativeInterest;
    for (let i = Math.floor(schedule.length / interval) * interval; i < schedule.length; i++) {
      finalInterest += schedule[i].interest;
    }
    if (data[data.length - 1].x !== lastRecord.month + lastRecord.year * 12) {
      data.push({
        x: lastRecord.month + lastRecord.year * 12,
        y: Math.round(finalInterest),
      });
    }
  }

  return data;
}

/**
 * Generate pie chart data for loan composition
 */
export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

export function generateLoanCompositionChart(
  principal: number,
  totalInterest: number
): PieChartData[] {
  const total = principal + totalInterest;
  return [
    {
      label: "Principal",
      value: Math.round((principal / total) * 100),
      color: "#1E3A8A", // Deep Blue
    },
    {
      label: "Interest",
      value: Math.round((totalInterest / total) * 100),
      color: "#F59E0B", // Amber
    },
  ];
}

/**
 * Generate savings comparison chart
 */
export function generateSavingsChart(
  originalInterest: number,
  newInterest: number,
  originalTenure: number,
  newTenure: number
) {
  return {
    interestSavings: Math.round(originalInterest - newInterest),
    tenureSavings: originalTenure - newTenure,
    interestSavingsPercentage: Math.round(
      ((originalInterest - newInterest) / originalInterest) * 100
    ),
  };
}

/**
 * Format chart labels for display
 */
export function formatChartLabel(value: number, type: "currency" | "months" | "percentage"): string {
  switch (type) {
    case "currency":
      return `$${(value / 1000).toFixed(1)}K`;
    case "months":
      const years = Math.floor(value / 12);
      const months = value % 12;
      return years > 0 ? `${years}y ${months}m` : `${months}m`;
    case "percentage":
      return `${value}%`;
    default:
      return value.toString();
  }
}

