/** Tokyo calendar helpers for expense_date month windows. */

export type TokyoYmd = {
  year: number;
  month: number;
  day: number;
};

export function tokyoYmd(date = new Date()): TokyoYmd {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  return { year, month, day };
}

export function parseYearMonthParam(
  yearRaw: string | undefined,
  monthRaw: string | undefined,
): { year: number; month: number } {
  const now = tokyoYmd();
  let year = Number(yearRaw);
  let month = Number(monthRaw);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    year = now.year;
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    month = now.month;
  }

  // Do not allow future months (Tokyo).
  if (year > now.year || (year === now.year && month > now.month)) {
    year = now.year;
    month = now.month;
  }

  return { year, month };
}

/** Inclusive start date (YYYY-MM-01) and exclusive end (next month start). */
export function expenseMonthRange(
  year: number,
  month: number,
): { start: string; endExclusive: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const endExclusive = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, endExclusive };
}

export function shiftYearMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } | null {
  const now = tokyoYmd();
  let y = year;
  let m = month + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  if (y > now.year || (y === now.year && m > now.month)) {
    return null;
  }
  if (y < 2000) return null;
  return { year: y, month: m };
}

export function yearMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}
