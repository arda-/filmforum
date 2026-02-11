/**
 * Parses a date range string into ISO 8601 start and end dates.
 *
 * Supports multiple formats:
 * - Single month: "Feb 6–26, 2026"
 * - Two months: "January 15 - February 28, 2026"
 * - Cross-year: "December 20, 2025 - January 10, 2026"
 * - Various separators: -, –, —
 *
 * @param dateRange - The date range string to parse
 * @param contextId - Optional context identifier for error logging
 * @returns Object with startDate and endDate in YYYY-MM-DD format, or empty strings if parsing fails
 */
export function parseDateRange(
  dateRange: string,
  contextId?: string
): { startDate: string; endDate: string } {
  const context = contextId ? `[${contextId}] ` : '';

  // Normalize separators (en-dash, em-dash to regular hyphen)
  const normalized = dateRange.replace(/[–—]/g, '-');

  // Try single-month format: "Feb 6-26, 2026"
  let match = normalized.match(/([A-Za-z]+)\s+(\d+)\s*-\s*(\d+),\s*(\d{4})/);
  if (match) {
    const [, month, startDay, endDay, year] = match;
    const monthNum = new Date(`${month} 1, ${year}`).getMonth() + 1;
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.error(`${context}Failed to parse month: ${month} in date range: "${dateRange}"`);
      return { startDate: '', endDate: '' };
    }
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  // Try two-month format with single year: "January 15 - February 28, 2026"
  match = normalized.match(/([A-Za-z]+)\s+(\d+)\s*-\s*([A-Za-z]+)\s+(\d+),\s*(\d{4})/);
  if (match) {
    const [, startMonth, startDay, endMonth, endDay, year] = match;
    const startMonthNum = new Date(`${startMonth} 1, ${year}`).getMonth() + 1;
    const endMonthNum = new Date(`${endMonth} 1, ${year}`).getMonth() + 1;

    if (isNaN(startMonthNum) || startMonthNum < 1 || startMonthNum > 12) {
      console.error(`${context}Failed to parse start month: ${startMonth} in date range: "${dateRange}"`);
      return { startDate: '', endDate: '' };
    }
    if (isNaN(endMonthNum) || endMonthNum < 1 || endMonthNum > 12) {
      console.error(`${context}Failed to parse end month: ${endMonth} in date range: "${dateRange}"`);
      return { startDate: '', endDate: '' };
    }

    const startDate = `${year}-${String(startMonthNum).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const endDate = `${year}-${String(endMonthNum).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  // Try two-month format with separate years: "December 20, 2025 - January 10, 2026"
  match = normalized.match(/([A-Za-z]+)\s+(\d+),\s*(\d{4})\s*-\s*([A-Za-z]+)\s+(\d+),\s*(\d{4})/);
  if (match) {
    const [, startMonth, startDay, startYear, endMonth, endDay, endYear] = match;
    const startMonthNum = new Date(`${startMonth} 1, ${startYear}`).getMonth() + 1;
    const endMonthNum = new Date(`${endMonth} 1, ${endYear}`).getMonth() + 1;

    if (isNaN(startMonthNum) || startMonthNum < 1 || startMonthNum > 12) {
      console.error(`${context}Failed to parse start month: ${startMonth} in date range: "${dateRange}"`);
      return { startDate: '', endDate: '' };
    }
    if (isNaN(endMonthNum) || endMonthNum < 1 || endMonthNum > 12) {
      console.error(`${context}Failed to parse end month: ${endMonth} in date range: "${dateRange}"`);
      return { startDate: '', endDate: '' };
    }

    const startDate = `${startYear}-${String(startMonthNum).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const endDate = `${endYear}-${String(endMonthNum).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  // No match found
  console.error(`${context}Failed to parse date range: "${dateRange}". No matching format found.`);
  console.error(`${context}Expected formats: "Feb 6–26, 2026" or "January 15 - February 28, 2026" or "December 20, 2025 - January 10, 2026"`);
  return { startDate: '', endDate: '' };
}
