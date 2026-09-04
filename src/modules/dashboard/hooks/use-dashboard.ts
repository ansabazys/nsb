"use client";

import { useState } from "react";
import type { DashboardTodaySummary } from "../dashboard.types";

export function useDashboard(initialSummary: DashboardTodaySummary) {
  const [summary, setSummary] = useState<DashboardTodaySummary>(initialSummary);

  return {
    summary,
    setSummary,
  };
}
