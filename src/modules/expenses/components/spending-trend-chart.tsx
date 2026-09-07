"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  DEFAULT_MONTH_DAILY_SPENDING,
  calculateBarChartGeometry,
  type SpendingTrendPoint,
} from "../expenses.analytics";
import { formatINR } from "../expenses.overview";

export interface SpendingTrendChartProps {
  dailyPoints?: SpendingTrendPoint[];
  comparisonText?: string;
  monthName?: string;
  year?: number;
  className?: string;
}

export function SpendingTrendChart({
  dailyPoints = DEFAULT_MONTH_DAILY_SPENDING,
  comparisonText = "↓ 8.4% vs last month",
  monthName = "SEPTEMBER",
  year = 2026,
  className,
}: SpendingTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  // Chart coordinate space tightly fitted to 30 bars without changing bar size
  const chartWidth = 480;
  const chartHeight = 150;
  const padding = { top: 20, right: 0, bottom: 2, left: 0 };

  const geometry = React.useMemo(() => {
    return calculateBarChartGeometry(dailyPoints, chartWidth, chartHeight, padding);
  }, [dailyPoints]);

  const activeBar =
    hoveredIdx !== null && geometry.bars[hoveredIdx]
      ? geometry.bars[hoveredIdx]
      : null;

  // Clamp tooltip position so it never overflows card boundaries on Day 1 or Day 30
  const tooltipXPercent = activeBar
    ? Math.max(10, Math.min(90, ((activeBar.x + activeBar.width / 2) / chartWidth) * 100))
    : 50;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-none border border-neutral-800/80 bg-neutral-950/75 p-5 transition-all duration-150 ease-out hover:border-neutral-700 select-none w-full lg:w-fit lg:shrink-0",
        className
      )}
    >
      {/* Header: Title + Comparison badge + Month Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/60">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
            SPENDING TREND
          </span>
          <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded-none border border-emerald-500/20">
            {comparisonText}
          </span>
        </div>

        {/* 1-Month indicator tag */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 bg-neutral-900/90 px-2 py-0.5 border border-neutral-800 rounded-none">
            {monthName} {year} · {dailyPoints.length} DAYS
          </span>
        </div>
      </div>

      {/* 30-Day Daily Bars Canvas */}
      <div className="relative w-full max-w-[480px] mt-4">
        {/* Floating Tooltip - ONLY shown on hover with exact value & date */}
        {activeBar && (
          <div
            role="tooltip"
            className="absolute -top-7 px-2 py-1 rounded-none bg-neutral-900/95 border border-neutral-700 text-[11px] font-mono text-neutral-100 shadow-2xl pointer-events-none whitespace-nowrap z-20 transition-opacity duration-100 flex items-center gap-1.5 uppercase tracking-wider"
            style={{
              left: `${tooltipXPercent}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span
              className={cn(
                "font-semibold",
                activeBar.amount > 0 ? "text-emerald-400" : "text-neutral-400"
              )}
            >
              {formatINR(activeBar.amount)}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">{activeBar.displayDate.toUpperCase()}</span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-36 sm:h-40 overflow-visible"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Subtle Baseline */}
          <line
            x1={0}
            y1={chartHeight - 1}
            x2={chartWidth}
            y2={chartHeight - 1}
            stroke="#262626"
            strokeWidth="1"
          />

          {/* 30 Daily Bar Columns (Edge-to-edge across full width) */}
          {geometry.bars.map((bar, idx) => {
            const isHovered = hoveredIdx === idx;
            const hasSpend = bar.amount > 0;
            const isToday = bar.date === "2026-09-07";

            return (
              <g
                key={bar.date || idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Invisible hit slot covering full column height */}
                <rect
                  x={bar.slotX}
                  y={padding.top}
                  width={bar.slotWidth}
                  height={chartHeight - padding.top - padding.bottom}
                  fill={isHovered ? "rgba(255, 255, 255, 0.06)" : "transparent"}
                  className="transition-colors duration-100"
                />

                {/* Day Bar */}
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={
                    isHovered
                      ? "#34d399"
                      : hasSpend
                      ? isToday
                        ? "#10b981"
                        : "#059669"
                      : "#262626"
                  }
                  stroke={
                    isHovered
                      ? "#6ee7b7"
                      : isToday
                      ? "#34d399"
                      : "none"
                  }
                  strokeWidth={isHovered || isToday ? 1 : 0}
                  className={cn(
                    "transition-all duration-150",
                    isHovered
                      ? "opacity-100"
                      : hasSpend
                      ? "opacity-90"
                      : "opacity-40"
                  )}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default SpendingTrendChart;
