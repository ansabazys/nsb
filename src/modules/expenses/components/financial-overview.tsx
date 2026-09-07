"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_OVERVIEW_CARDS,
  formatINR,
  generateSparklineSvgPath,
  getSparklineCoordinates,
  type FinancialOverviewCardItem,
  type FinancialOverviewCustomData,
  type SparklinePoint,
} from "../expenses.overview";

export interface FinancialOverviewProps {
  customData?: FinancialOverviewCustomData;
  className?: string;
}

interface InteractiveSparklineProps {
  points: SparklinePoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

function InteractiveSparkline({
  points,
  width = 64,
  height = 20,
  strokeColor = "#34d399", // emerald-400
  className,
}: InteractiveSparklineProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const path = React.useMemo(
    () => generateSparklineSvgPath(points, width, height, 2),
    [points, width, height]
  );

  const coords = React.useMemo(
    () => getSparklineCoordinates(points, width, height, 2),
    [points, width, height]
  );

  const lastCoord = coords[coords.length - 1];
  const activeCoord = hoveredIdx !== null ? coords[hoveredIdx] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    if (coords.length === 0) return;

    // Find nearest point along the X axis
    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((coord, idx) => {
      const diff = Math.abs(coord.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoveredIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className={cn("relative flex items-center shrink-0 group/spark", className)}>
      {/* Floating Micro-Tooltip on hover */}
      {activeCoord && (
        <div
          role="tooltip"
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-none bg-neutral-900 border border-neutral-700/80 text-[10px] font-mono text-neutral-200 shadow-xl pointer-events-none whitespace-nowrap z-30 transition-opacity duration-100 uppercase tracking-wider"
        >
          <span>{formatINR(activeCoord.point.value)}</span>
          <span className="text-neutral-500 mx-1">·</span>
          <span className="text-neutral-400">{activeCoord.point.date.toUpperCase()}</span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible cursor-crosshair"
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      >
        {/* Main trend line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="transition-opacity duration-150 opacity-90 group-hover/spark:opacity-100"
        />

        {/* Small terminal dot at current (last) point */}
        {lastCoord && hoveredIdx === null && (
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r="1.5"
            fill={strokeColor}
          />
        )}

        {/* Active hovered point indicator */}
        {activeCoord && (
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="2.5"
            className="fill-emerald-400 stroke-neutral-950 stroke-[1.5]"
          />
        )}
      </svg>
    </div>
  );
}

interface SavingsRingProps {
  percentage: number;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function SavingsRing({
  percentage,
  centerLabel = "44%",
  size = 28,
  strokeWidth = 2.6,
  className,
}: SavingsRingProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference * (1 - clampedPercentage / 100);

  return (
    <div
      className={cn("relative flex items-center justify-center shrink-0 cursor-default", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-hidden="true"
    >
      {/* Floating Micro-Tooltip on hover */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-none bg-neutral-900 border border-neutral-700/80 text-[10px] font-mono text-neutral-200 shadow-xl pointer-events-none whitespace-nowrap z-30 transition-opacity duration-100 uppercase tracking-wider"
        >
          <span>{percentage}% SAVED</span>
          <span className="text-neutral-500 mx-1">·</span>
          <span className="text-emerald-400">₹32,650</span>
        </div>
      )}

      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-neutral-800/90 fill-none"
          strokeWidth={strokeWidth}
        />
        {/* Active Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-emerald-400 fill-none transition-all duration-300 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Centered meaningful percentage text */}
      <span className="absolute text-[8.5px] font-mono font-medium text-emerald-400/90 select-none">
        {centerLabel}
      </span>
    </div>
  );
}

export function FinancialOverview({ customData, className }: FinancialOverviewProps) {
  const cards = React.useMemo<FinancialOverviewCardItem[]>(() => {
    if (!customData) return DEFAULT_OVERVIEW_CARDS;

    return DEFAULT_OVERVIEW_CARDS.map((defCard) => {
      if (defCard.id === "total-balance" && customData.totalBalance) {
        const item = customData.totalBalance;
        return {
          ...defCard,
          amount:
            typeof item.amount === "number"
              ? formatINR(item.amount)
              : item.amount ?? defCard.amount,
          description: item.description ?? defCard.description,
          trend: {
            ...defCard.trend,
            label: item.trendLabel ?? defCard.trend.label,
            direction: item.trendDirection ?? defCard.trend.direction,
          },
          sparkline: item.sparkline ?? defCard.sparkline,
        };
      }

      if (defCard.id === "this-month" && customData.thisMonthExpenses) {
        const item = customData.thisMonthExpenses;
        return {
          ...defCard,
          amount:
            typeof item.amount === "number"
              ? formatINR(item.amount)
              : item.amount ?? defCard.amount,
          description: item.description ?? defCard.description,
          trend: {
            ...defCard.trend,
            label: item.trendLabel ?? defCard.trend.label,
            direction: item.trendDirection ?? defCard.trend.direction,
          },
          sparkline: item.sparkline ?? defCard.sparkline,
        };
      }

      if (defCard.id === "income" && customData.thisMonthIncome) {
        const item = customData.thisMonthIncome;
        return {
          ...defCard,
          amount:
            typeof item.amount === "number"
              ? formatINR(item.amount)
              : item.amount ?? defCard.amount,
          description: item.description ?? defCard.description,
          trend: {
            ...defCard.trend,
            label: item.trendLabel ?? defCard.trend.label,
            direction: item.trendDirection ?? defCard.trend.direction,
          },
          sparkline: item.sparkline ?? defCard.sparkline,
        };
      }

      if (defCard.id === "savings" && customData.savings) {
        const item = customData.savings;
        return {
          ...defCard,
          amount:
            typeof item.amount === "number"
              ? formatINR(item.amount)
              : item.amount ?? defCard.amount,
          description: item.description ?? defCard.description,
          trend: {
            ...defCard.trend,
            label: item.trendLabel ?? defCard.trend.label,
          },
          progressRing: {
            percentage: item.savedPercentage ?? 43.5,
            colorClass: "stroke-emerald-400",
            centerLabel: `${Math.round(item.savedPercentage ?? 43.5)}%`,
          },
        };
      }

      return defCard;
    });
  }, [customData]);

  return (
    <section
      aria-label="Financial overview"
      className={cn("w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex flex-col justify-between rounded-none border border-neutral-800/80 bg-neutral-950/75 p-4 sm:p-5 transition-all duration-150 ease-out hover:border-neutral-700 hover:bg-neutral-900/60 select-none min-h-[128px]"
        >
          {/* Top Row: Uppercase Label + Trend Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
              {card.label}
            </span>
            <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded-none border border-emerald-500/20 shrink-0">
              {card.trend.label}
            </span>
          </div>

          {/* Middle Row: Prominent Amount + Subtle Integrated Visualization */}
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <span className="text-2xl sm:text-[26px] font-semibold tracking-tight text-white leading-none">
              {card.amount}
            </span>
            {card.sparkline && (
              <InteractiveSparkline
                points={card.sparkline}
                width={64}
                height={20}
              />
            )}
            {card.progressRing && (
              <SavingsRing
                percentage={card.progressRing.percentage}
                centerLabel={card.progressRing.centerLabel}
                size={28}
                strokeWidth={2.6}
              />
            )}
          </div>

          {/* Bottom Row: Supporting Description */}
          <span className="mt-3 text-xs text-neutral-400 font-normal leading-tight">
            {card.description}
          </span>
        </div>
      ))}
    </section>
  );
}

export default FinancialOverview;
