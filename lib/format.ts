const tokyoDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const tokyoDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const tokyoShortDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatYen(amount: number): string {
  return `${new Intl.NumberFormat("ja-JP").format(amount)}円`;
}

export function formatExpenseDate(date: string): string {
  // date-only values: treat as calendar date in JP display
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return tokyoDateFormatter.format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function formatDateTime(iso: string): string {
  return tokyoDateTimeFormatter.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return tokyoShortDateFormatter.format(new Date(iso));
}

export function applicationTypeLabel(
  type: "advance" | "after",
): string {
  return type === "advance" ? "事前" : "事後";
}

export function statusLabel(
  status: "pending" | "approved" | "returned",
): string {
  switch (status) {
    case "pending":
      return "確認待ち";
    case "approved":
      return "承認済み";
    case "returned":
      return "差し戻し";
  }
}

export function eventTypeLabel(
  type: "submitted" | "resubmitted" | "approved" | "returned",
): string {
  switch (type) {
    case "submitted":
      return "申請";
    case "resubmitted":
      return "再申請";
    case "approved":
      return "承認";
    case "returned":
      return "差し戻し";
  }
}

export function versionKindLabel(version: number): string {
  return version > 1 ? "再申請" : "新規";
}

export function normalizeLoginId(value: string): string {
  return value.trim().toLowerCase();
}

export function isPdfPath(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf");
}
