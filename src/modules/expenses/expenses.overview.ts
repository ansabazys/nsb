export interface SparklinePoint {
  date: string;
  value: number;
}

export interface MetricTrendInfo {
  label: string;
  direction?: "up" | "down" | "neutral";
  tone?: "positive" | "negative" | "neutral";
}

export interface FinancialOverviewCardItem {
  id: string;
  label: string;
  amount: string;
  description: string;
  trend: MetricTrendInfo;
  sparkline?: SparklinePoint[];
  progressRing?: {
    percentage: number;
    colorClass?: string;
    centerLabel?: string;
  };
}

export interface FinancialOverviewCustomData {
  totalBalance?: {
    amount?: number | string;
    trendLabel?: string;
    trendDirection?: "up" | "down" | "neutral";
    sparkline?: SparklinePoint[];
    description?: string;
  };
  thisMonthExpenses?: {
    amount?: number | string;
    trendLabel?: string;
    trendDirection?: "up" | "down" | "neutral";
    sparkline?: SparklinePoint[];
    description?: string;
  };
  thisMonthIncome?: {
    amount?: number | string;
    trendLabel?: string;
    trendDirection?: "up" | "down" | "neutral";
    sparkline?: SparklinePoint[];
    description?: string;
  };
  savings?: {
    amount?: number | string;
    savedPercentage?: number;
    trendLabel?: string;
    description?: string;
  };
}

/**
 * Currency formatter for Indian Rupee values
 */
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Generates an SVG path string from an array of SparklinePoint objects.
 * Keeps calculation logic strictly separate from the card UI.
 */
export function generateSparklineSvgPath(
  points: SparklinePoint[],
  width: number = 64,
  height: number = 20,
  padding: number = 2
): string {
  if (!points || points.length === 0) {
    return `M 0,${(height / 2).toFixed(1)} L ${width},${(height / 2).toFixed(1)}`;
  }
  if (points.length === 1) {
    return `M 0,${(height / 2).toFixed(1)} L ${width},${(height / 2).toFixed(1)}`;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - padding * 2;

  return values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Calculates (x, y) coordinates for interactive sparkline points.
 */
export function getSparklineCoordinates(
  points: SparklinePoint[],
  width: number = 64,
  height: number = 20,
  padding: number = 2
): { x: number; y: number; point: SparklinePoint }[] {
  if (!points || points.length === 0) return [];
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - padding * 2;

  return points.map((p, idx) => {
    const x = points.length === 1 ? width / 2 : (idx / (points.length - 1)) * width;
    const y = height - padding - ((p.value - min) / range) * usableHeight;
    return { x, y, point: p };
  });
}

/**
 * Default mock series representing realistic financial trajectories.
 * Structured so real Supabase transaction series can cleanly replace them.
 */
export const DEFAULT_OVERVIEW_CARDS: FinancialOverviewCardItem[] = [
  {
    id: "total-balance",
    label: "TOTAL BALANCE",
    amount: "₹87,490",
    description: "Current available balance",
    trend: {
      label: "+4.2% this month",
      direction: "up",
      tone: "positive",
    },
    sparkline: [
      { date: "Aug 12", value: 83900 },
      { date: "Aug 17", value: 84400 },
      { date: "Aug 22", value: 83800 },
      { date: "Aug 27", value: 85200 },
      { date: "Sep 01", value: 86100 },
      { date: "Sep 05", value: 86900 },
      { date: "Sep 07", value: 87490 },
    ],
  },
  {
    id: "this-month",
    label: "THIS MONTH",
    amount: "₹42,350",
    description: "Total expenses this month",
    trend: {
      label: "↓ 8.4% vs last month",
      direction: "down",
      tone: "positive",
    },
    sparkline: [
      { date: "Aug 10", value: 51800 },
      { date: "Aug 17", value: 49400 },
      { date: "Aug 24", value: 47100 },
      { date: "Aug 31", value: 44600 },
      { date: "Sep 07", value: 42350 },
    ],
  },
  {
    id: "income",
    label: "INCOME",
    amount: "₹75,000",
    description: "Total income this month",
    trend: {
      label: "+5.2% vs last month",
      direction: "up",
      tone: "positive",
    },
    sparkline: [
      { date: "May", value: 68000 },
      { date: "Jun", value: 69500 },
      { date: "Jul", value: 71200 },
      { date: "Aug", value: 72800 },
      { date: "Sep", value: 75000 },
    ],
  },
  {
    id: "savings",
    label: "SAVINGS",
    amount: "₹32,650",
    description: "43.5% saved this month",
    trend: {
      label: "43.5% saved",
      direction: "neutral",
      tone: "positive",
    },
    progressRing: {
      percentage: 43.5,
      colorClass: "stroke-emerald-400",
      centerLabel: "44%",
    },
  },
];
