import { Suspense } from "react";
import { connection } from "next/server";

import {
  AdminHistoryFilters,
  AdminHistoryPagination,
  type ApplicantOption,
} from "@/components/app/admin-history-filters";
import { AdminHistoryRow } from "@/components/app/admin-history-row";
import { AmountText } from "@/components/app/amount-text";
import { EmptyState } from "@/components/app/empty-state";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireAdmin } from "@/lib/auth/session";
import {
  expenseMonthRange,
  parseYearMonthParam,
  shiftYearMonth,
  tokyoYmd,
  yearMonthLabel,
} from "@/lib/date/tokyo";
import { statusLabel } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication, ExpenseStatus } from "@/lib/types/database";

const PAGE_SIZE = 50;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StatusFilter = ExpenseStatus | "all";

function parseStatus(raw: string | undefined): StatusFilter {
  if (raw === "pending" || raw === "returned" || raw === "all") return raw;
  return "approved";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

function parseApplicantId(
  raw: string | undefined,
  knownIds: Set<string>,
): string {
  if (!raw || raw === "all") return "all";
  if (!UUID_RE.test(raw)) return "all";
  if (!knownIds.has(raw)) return "all";
  return raw;
}

function totalLabel(status: StatusFilter): string {
  switch (status) {
    case "approved":
      return "承認済み合計";
    case "pending":
      return "未確認合計";
    case "returned":
      return "差し戻し合計";
    case "all":
      return "全ステータス合計";
  }
}

async function loadApplicantOptions(): Promise<ApplicantOption[]> {
  // Prefer distinct applicants from applications (includes inactive past users).
  const supabase = await createClient();
  const { data: fromApps, error: appsError } = await supabase
    .from("expense_applications")
    .select("applicant_id, applicant_name_snapshot");

  if (appsError) {
    console.error("Admin history applicants from apps failed", {
      code: appsError.code,
    });
  }

  const byId = new Map<string, string>();
  for (const row of fromApps ?? []) {
    const id = row.applicant_id as string;
    const name = (row.applicant_name_snapshot as string) || "不明";
    if (!byId.has(id)) byId.set(id, name);
  }

  // Enrich with current display_name when profiles are readable.
  // Admin Client only after requireAdmin has already run in the caller.
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("role", ["applicant", "admin", "system_admin"]);

    if (!error && profiles) {
      for (const p of profiles) {
        const id = p.id as string;
        const name = (p.display_name as string) || byId.get(id);
        if (name) {
          // Keep anyone who already has applications; also allow active profiles
          // that might apply in the month but currently have no rows yet.
          if (byId.has(id)) {
            byId.set(id, name);
          }
        }
      }
    }
  } catch (err) {
    console.error("Admin history profile enrich failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  return Array.from(byId.entries())
    .map(([id, displayName]) => ({ id, displayName }))
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "ja", { sensitivity: "base" }),
    );
}

async function AdminHistoryContent({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    applicant?: string;
    status?: string;
    page?: string;
  }>;
}) {
  await connection();
  await requireAdmin();

  const params = await searchParams;
  const { year, month } = parseYearMonthParam(params.year, params.month);
  const status = parseStatus(params.status);
  const pageRequested = parsePage(params.page);
  const { start, endExclusive } = expenseMonthRange(year, month);
  const now = tokyoYmd();

  const applicantOptions = await loadApplicantOptions();
  const knownIds = new Set(applicantOptions.map((a) => a.id));
  const applicant = parseApplicantId(params.applicant, knownIds);

  const supabase = await createClient();

  let totalsQuery = supabase
    .from("expense_applications")
    .select("amount, status")
    .gte("expense_date", start)
    .lt("expense_date", endExclusive);

  if (applicant !== "all") {
    totalsQuery = totalsQuery.eq("applicant_id", applicant);
  }
  if (status !== "all") {
    totalsQuery = totalsQuery.eq("status", status);
  }

  const { data: totalsRows, error: totalsError } = await totalsQuery;
  if (totalsError) {
    console.error("Admin history totals failed", { code: totalsError.code });
  }

  const totalsList = totalsRows ?? [];
  const totalCount = totalsList.length;
  const totalAmount = totalsList.reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );

  const breakdown =
    status === "all"
      ? {
          approved: totalsList
            .filter((r) => r.status === "approved")
            .reduce((s, r) => s + Number(r.amount ?? 0), 0),
          pending: totalsList
            .filter((r) => r.status === "pending")
            .reduce((s, r) => s + Number(r.amount ?? 0), 0),
          returned: totalsList
            .filter((r) => r.status === "returned")
            .reduce((s, r) => s + Number(r.amount ?? 0), 0),
        }
      : null;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(pageRequested, totalPages);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let listQuery = supabase
    .from("expense_applications")
    .select("*")
    .gte("expense_date", start)
    .lt("expense_date", endExclusive)
    .order("expense_date", { ascending: false })
    .order("submitted_at", { ascending: false })
    .order("application_no", { ascending: false })
    .range(from, to);

  if (applicant !== "all") {
    listQuery = listQuery.eq("applicant_id", applicant);
  }
  if (status !== "all") {
    listQuery = listQuery.eq("status", status);
  }

  const { data: listData, error: listError } = await listQuery;
  if (listError) {
    console.error("Admin history list failed", { code: listError.code });
  }

  const applications = (listData ?? []) as ExpenseApplication[];
  const prev = shiftYearMonth(year, month, -1);
  const next = shiftYearMonth(year, month, 1);

  const years = Array.from({ length: 8 }, (_, i) => now.year - i).filter(
    (y) => y >= 2000,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => {
    if (year < now.year) return true;
    return m <= now.month;
  });

  const applicantLabel =
    applicant === "all"
      ? "すべての申請者"
      : (applicantOptions.find((a) => a.id === applicant)?.displayName ??
        "選択中の申請者");

  const statusDisplay =
    status === "all" ? "すべて" : statusLabel(status);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        category="運用"
        title="経費申請履歴"
        description="給与支払い時の経費照合用に、利用日の年月で申請を確認できます"
      />

      <section className="ledger-panel overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <AdminHistoryFilters
            year={year}
            month={month}
            applicant={applicant}
            status={status}
            applicants={applicantOptions}
            years={years}
            months={months}
            prev={prev}
            next={next}
          />
        </div>

        <div className="space-y-1.5 border-b border-line px-4 py-3 text-[12px] text-ink-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{yearMonthLabel(year, month)}</span>
            <span className="text-line-strong" aria-hidden>
              |
            </span>
            <span>{applicantLabel}</span>
            <span className="text-line-strong" aria-hidden>
              |
            </span>
            <span>{statusDisplay}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              対象件数{" "}
              <span className="font-medium tabular-nums text-ink">
                {totalCount}件
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              {totalLabel(status)}
              <AmountText
                amount={totalAmount}
                className="text-[13px] font-semibold text-ink"
              />
            </span>
          </div>
          {breakdown ? (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span>
                承認済み{" "}
                <AmountText
                  amount={breakdown.approved}
                  className="text-[11px] font-medium text-ink-secondary"
                />
              </span>
              <span>
                未確認{" "}
                <AmountText
                  amount={breakdown.pending}
                  className="text-[11px] font-medium text-ink-secondary"
                />
              </span>
              <span>
                差し戻し{" "}
                <AmountText
                  amount={breakdown.returned}
                  className="text-[11px] font-medium text-ink-secondary"
                />
              </span>
            </div>
          ) : null}
        </div>

        <div className="hidden border-b border-line px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-muted xl:grid xl:grid-cols-[minmax(0,1.1fr)_132px_minmax(0,1.3fr)_104px_100px_112px_84px] xl:gap-3">
          <span>申請者</span>
          <span>申請番号</span>
          <span>経費項目</span>
          <span>金額</span>
          <span>利用日</span>
          <span>申請日</span>
          <span>状態</span>
        </div>

        {applications.length === 0 ? (
          <EmptyState title="選択した条件の経費申請はありません" />
        ) : (
          applications.map((app) => (
            <AdminHistoryRow key={app.id} application={app} />
          ))
        )}

        <AdminHistoryPagination
          page={page}
          totalPages={totalPages}
          year={year}
          month={month}
          applicant={applicant}
          status={status}
        />
      </section>
    </div>
  );
}

export default function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    applicant?: string;
    status?: string;
    page?: string;
  }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminHistoryContent searchParams={searchParams} />
    </Suspense>
  );
}
