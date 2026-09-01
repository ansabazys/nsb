/**
 * Format Date or date string to ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${date}`);
  }
  return d.toISOString().split("T")[0];
}

/**
 * Returns today's date formatted as YYYY-MM-DD in UTC
 */
export function getTodayDateString(): string {
  return formatDateISO(new Date());
}

/**
 * Returns the difference in calendar days between two dates (date2 - date1)
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(formatDateISO(date1) + "T00:00:00.000Z");
  const d2 = new Date(formatDateISO(date2) + "T00:00:00.000Z");
  const differenceInMs = d2.getTime() - d1.getTime();
  return Math.round(differenceInMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates represent the same calendar day (YYYY-MM-DD)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return formatDateISO(date1) === formatDateISO(date2);
}

/**
 * Check if date is yesterday relative to the reference date (defaults to today)
 */
export function isYesterday(date: Date | string, referenceDate: Date | string = new Date()): boolean {
  const diff = getDaysDifference(date, referenceDate);
  return diff === 1;
}

/**
 * Get start and end dates of a given month (YYYY-MM-01 to YYYY-MM-[28-31])
 */
export function getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
  // month is 1-indexed (1 = January, 12 = December)
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return {
    startDate: formatDateISO(start),
    endDate: formatDateISO(end),
  };
}

/**
 * Add days to a date and return ISO date string
 */
export function addDays(date: Date | string, days: number): string {
  const d = new Date(typeof date === "string" ? date : date.toISOString());
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateISO(d);
}
