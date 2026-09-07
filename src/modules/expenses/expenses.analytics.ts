import { formatINR } from "./expenses.overview";

export type SpendingPeriod = "7D" | "30D" | "3M" | "1Y";

export interface SpendingTrendPoint {
  date: string;
  displayDate: string;
  amount: number;
}

export interface CategorySpendingItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  hex: string;
}

export interface SpendingAnalyticsData {
  period: SpendingPeriod;
  comparisonText: string;
  trendPoints: Record<SpendingPeriod, SpendingTrendPoint[]>;
  categories: CategorySpendingItem[];
  totalSpending: number;
}

export interface DonutSegment {
  category: CategorySpendingItem;
  strokeDasharray: string;
  strokeDashoffset: number;
  percentage: number;
}

/**
 * 6 Core Categories with NSB Accent Colors
 */
export const DEFAULT_SPENDING_CATEGORIES: CategorySpendingItem[] = [
  {
    id: "food",
    name: "Food",
    amount: 14200,
    percentage: 33.5,
    color: "text-emerald-400",
    hex: "#34d399",
  },
  {
    id: "shopping",
    name: "Shopping",
    amount: 9850,
    percentage: 23.3,
    color: "text-sky-400",
    hex: "#38bdf8",
  },
  {
    id: "transport",
    name: "Transport",
    amount: 6400,
    percentage: 15.1,
    color: "text-amber-400",
    hex: "#fbbf24",
  },
  {
    id: "bills",
    name: "Bills",
    amount: 5800,
    percentage: 13.7,
    color: "text-purple-400",
    hex: "#c084fc",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    amount: 3900,
    percentage: 9.2,
    color: "text-rose-400",
    hex: "#fb7185",
  },
  {
    id: "other",
    name: "Other",
    amount: 2200,
    percentage: 5.2,
    color: "text-neutral-400",
    hex: "#a3a3a3",
  },
];

/**
 * Total Spending computed from categories: ₹42,350
 */
export const DEFAULT_TOTAL_SPENDING = DEFAULT_SPENDING_CATEGORIES.reduce(
  (sum, c) => sum + c.amount,
  0
);

/**
 * Daily spending across all 30 days of the current month (September 2026).
 * Exactly 30 daily bars representing daily spending.
 */
export const DEFAULT_MONTH_DAILY_SPENDING: SpendingTrendPoint[] = Array.from(
  { length: 30 },
  (_, idx) => {
    const day = idx + 1;
    const date = `2026-09-${String(day).padStart(2, "0")}`;
    const displayDate = `Sep ${String(day).padStart(2, "0")}`;

    const dailySpendMap: Record<number, number> = {
      1: 1420,
      2: 2150,
      3: 890,
      4: 3200,
      5: 1680,
      6: 950,
      7: 1240, // Sep 07: ₹1,240
      9: 2450,
      11: 3820,
      13: 780,
      15: 4300,
      17: 1250,
      19: 2400,
      22: 1340,
      24: 3100,
      26: 1650,
      28: 1700,
      30: 2800,
    };

    return {
      date,
      displayDate,
      amount: dailySpendMap[day] ?? 0,
    };
  }
);

/**
 * Mock Trend Data across Periods (7D, 30D, 3M, 1Y)
 */
export const DEFAULT_TREND_DATA: Record<SpendingPeriod, SpendingTrendPoint[]> = {
  "7D": [
    { date: "2026-09-01", displayDate: "Sep 01", amount: 1420 },
    { date: "2026-09-02", displayDate: "Sep 02", amount: 2150 },
    { date: "2026-09-03", displayDate: "Sep 03", amount: 890 },
    { date: "2026-09-04", displayDate: "Sep 04", amount: 3200 },
    { date: "2026-09-05", displayDate: "Sep 05", amount: 1680 },
    { date: "2026-09-06", displayDate: "Sep 06", amount: 950 },
    { date: "2026-09-07", displayDate: "Sep 07", amount: 1350 },
  ],
  "30D": [
    { date: "2026-08-09", displayDate: "Aug 09", amount: 1200 },
    { date: "2026-08-11", displayDate: "Aug 11", amount: 2400 },
    { date: "2026-08-13", displayDate: "Aug 13", amount: 1650 },
    { date: "2026-08-15", displayDate: "Aug 15", amount: 3100 },
    { date: "2026-08-17", displayDate: "Aug 17", amount: 1890 },
    { date: "2026-08-19", displayDate: "Aug 19", amount: 950 },
    { date: "2026-08-21", displayDate: "Aug 21", amount: 2750 },
    { date: "2026-08-23", displayDate: "Aug 23", amount: 1420 },
    { date: "2026-08-25", displayDate: "Aug 25", amount: 2100 },
    { date: "2026-08-27", displayDate: "Aug 27", amount: 1540 },
    { date: "2026-08-29", displayDate: "Aug 29", amount: 2800 },
    { date: "2026-08-31", displayDate: "Aug 31", amount: 1980 },
    { date: "2026-09-02", displayDate: "Sep 02", amount: 1450 },
    { date: "2026-09-04", displayDate: "Sep 04", amount: 2320 },
    { date: "2026-09-06", displayDate: "Sep 06", amount: 1100 },
    { date: "2026-09-07", displayDate: "Sep 07", amount: 1350 },
  ],
  "3M": [
    { date: "2026-06-15", displayDate: "Mid Jun", amount: 11200 },
    { date: "2026-06-30", displayDate: "End Jun", amount: 12400 },
    { date: "2026-07-15", displayDate: "Mid Jul", amount: 13900 },
    { date: "2026-07-31", displayDate: "End Jul", amount: 11800 },
    { date: "2026-08-15", displayDate: "Mid Aug", amount: 10600 },
    { date: "2026-08-31", displayDate: "End Aug", amount: 11200 },
    { date: "2026-09-07", displayDate: "Sep 07", amount: 6200 },
  ],
  "1Y": [
    { date: "2025-10", displayDate: "Oct 25", amount: 38400 },
    { date: "2025-11", displayDate: "Nov 25", amount: 41200 },
    { date: "2025-12", displayDate: "Dec 25", amount: 49500 },
    { date: "2026-01", displayDate: "Jan 26", amount: 43100 },
    { date: "2026-02", displayDate: "Feb 26", amount: 39800 },
    { date: "2026-03", displayDate: "Mar 26", amount: 44200 },
    { date: "2026-04", displayDate: "Apr 26", amount: 41500 },
    { date: "2026-05", displayDate: "May 26", amount: 43800 },
    { date: "2026-06", displayDate: "Jun 26", amount: 46200 },
    { date: "2026-07", displayDate: "Jul 26", amount: 45100 },
    { date: "2026-08", displayDate: "Aug 26", amount: 44800 },
    { date: "2026-09", displayDate: "Sep 26", amount: 42350 },
  ],
};

/**
 * Calculates SVG Path and Point Coordinates for the Spending Line Chart
 */
export function calculateLineChartGeometry(
  points: SpendingTrendPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number } = {
    top: 16,
    right: 16,
    bottom: 24,
    left: 42,
  }
) {
  if (!points || points.length === 0) {
    return {
      path: "",
      pointsWithCoords: [],
      yTicks: [],
      xTicks: [],
      maxY: 0,
      minY: 0,
    };
  }

  const values = points.map((p) => p.amount);
  const rawMax = Math.max(...values);
  // Round max up to a clean multiple
  const maxY = Math.ceil(rawMax / 500) * 500 || 500;
  const minY = 0;
  const yRange = maxY - minY;

  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;

  const pointsWithCoords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? padding.left + usableWidth / 2
        : padding.left + (idx / (points.length - 1)) * usableWidth;
    const y =
      padding.top + usableHeight - ((p.amount - minY) / yRange) * usableHeight;
    return {
      ...p,
      x,
      y,
    };
  });

  const path = pointsWithCoords
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // 3-4 Horizontal Reference Y-Ticks
  const yTicks = [
    { value: 0, label: "₹0", y: padding.top + usableHeight },
    { value: Math.round(maxY / 2), label: formatINR(Math.round(maxY / 2)), y: padding.top + usableHeight / 2 },
    { value: maxY, label: formatINR(maxY), y: padding.top },
  ];

  // 4-5 Reference X-Ticks
  const step = Math.max(1, Math.floor((points.length - 1) / 4));
  const xTicks = pointsWithCoords.filter(
    (_, idx) => idx === 0 || idx === pointsWithCoords.length - 1 || idx % step === 0
  );

  return {
    path,
    pointsWithCoords,
    yTicks,
    xTicks,
    maxY,
    minY,
  };
}

export interface BarChartItem {
  date: string;
  displayDate: string;
  amount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  slotX: number;
  slotWidth: number;
}

export interface BarChartGeometry {
  bars: BarChartItem[];
  yTicks: { value: number; label: string; y: number }[];
  xTicks: { displayDate: string; x: number }[];
  maxY: number;
  minY: number;
}

/**
 * Calculates SVG geometry for the Spending Trend Bar Chart
 */
export function calculateBarChartGeometry(
  points: SpendingTrendPoint[],
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; right: number; bottom: number; left: number } = {
    top: 20,
    right: 0,
    bottom: 2,
    left: 0,
  }
): BarChartGeometry {
  if (!points || points.length === 0) {
    return {
      bars: [],
      yTicks: [],
      xTicks: [],
      maxY: 0,
      minY: 0,
    };
  }

  const values = points.map((p) => p.amount);
  const rawMax = Math.max(...values);
  const maxY = Math.ceil(rawMax / 500) * 500 || 500;
  const minY = 0;
  const yRange = maxY - minY;

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;
  const count = points.length;
  const slotWidth = usableWidth / count;

  // Determine proportional bar width based on count
  const fillRatio = count <= 7 ? 0.45 : count <= 16 ? 0.55 : 0.65;
  const barWidth = Math.max(4, Math.min(22, Math.round(slotWidth * fillRatio)));

  const bars: BarChartItem[] = points.map((p, idx) => {
    const slotX = padding.left + idx * slotWidth;
    const x = slotX + (slotWidth - barWidth) / 2;
    const barHeight = Math.max(2, Math.round(((p.amount - minY) / yRange) * usableHeight));
    const y = padding.top + usableHeight - barHeight;

    return {
      date: p.date,
      displayDate: p.displayDate,
      amount: p.amount,
      x,
      y,
      width: barWidth,
      height: barHeight,
      slotX,
      slotWidth,
    };
  });

  const yTicks = [
    { value: 0, label: "₹0", y: padding.top + usableHeight },
    { value: Math.round(maxY / 2), label: formatINR(Math.round(maxY / 2)), y: padding.top + usableHeight / 2 },
    { value: maxY, label: formatINR(maxY), y: padding.top },
  ];

  const step = Math.max(1, Math.floor((count - 1) / 4));
  const xTicks = bars
    .filter((_, idx) => idx === 0 || idx === count - 1 || idx % step === 0)
    .map((b) => ({
      displayDate: b.displayDate,
      x: b.x + b.width / 2,
    }));

  return {
    bars,
    yTicks,
    xTicks,
    maxY,
    minY,
  };
}

/**
 * Computes Donut Segments with Gap Separation for SVG rendering
 */
export function calculateDonutSegments(
  categories: CategorySpendingItem[],
  radius: number = 58,
  gapPx: number = 2
): DonutSegment[] {
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;

  return categories.map((cat) => {
    const segmentLength = (cat.percentage / 100) * circumference;
    const visibleLength = Math.max(0, segmentLength - gapPx);
    const strokeDasharray = `${visibleLength.toFixed(2)} ${(
      circumference - visibleLength
    ).toFixed(2)}`;
    const strokeDashoffset = -accumulatedLength;

    accumulatedLength += segmentLength;

    return {
      category: cat,
      strokeDasharray,
      strokeDashoffset,
      percentage: cat.percentage,
    };
  });
}
