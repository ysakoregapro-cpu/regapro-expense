import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AmountText } from "@/components/app/amount-text";
import { EmptyState } from "@/components/app/empty-state";
import { ExpenseListRow } from "@/components/app/expense-list-row";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import {
  expenseMonthRange,
  parseYearMonthParam,
  shiftYearMonth,
  tokyoYmd,
  yearMonthLabel,
} from "@/lib/date/tokyo";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication } from "@/lib/types/database";
import { cn } from "@/lib/utils";

async function HistoryContent({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  await connection();
  const profile = await requireApplicant();
  const params = await searchParams;
  const { year, month } = parseYearMonthParam(params.year, params.month);
  const { start, endExclusive } = expenseMonthRange(year, month);
  const now = tokyoYmd();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_applications")
    .select("*")
    .eq("applicant_id", profile.id)
    .gte("expense_date", start)
    .lt("expense_date", endExclusive)
    .order("expense_date", { ascending: false })
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Applicant history failed", { code: error.code });
  }

  const applications = (data ?? []) as ExpenseApplication[];
  const totalAmount = applications.reduce((sum, a) => sum + a.amount, 0);
  const prev = shiftYearMonth(year, month, -1);
  const next = shiftYearMonth(year, month, 1);

  const years = Array.from({ length: 8 }, (_, i) => now.year - i).filter(
    (y) => y >= 2000,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => {
    if (year < now.year) return true;
    return m <= now.month;
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        category="経費管理"
        title="申請履歴"
        description="利用日の年月で過去の申請を確認できます"
      />

      <section className="ledger-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={
                prev
                  ? `/app/history?year=${prev.year}&month=${prev.month}`
                  : "#"
              }
              aria-disabled={!prev}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle hover:text-ink",
                !prev && "pointer-events-none opacity-40",
              )}
              aria-label="前月"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <p className="text-[15px] font-semibold tabular-nums text-ink">
              {yearMonthLabel(year, month)}
            </p>
            <Link
              href={
                next
                  ? `/app/history?year=${next.year}&month=${next.month}`
                  : "#"
              }
              aria-disabled={!next}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle hover:text-ink",
                !next && "pointer-events-none opacity-40",
              )}
              aria-label="翌月"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <form
            className="flex flex-wrap items-end gap-2"
            action="/app/history"
            method="get"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[11px] text-ink-muted">年</span>
              <select
                name="year"
                defaultValue={year}
                className="control-base h-11 w-full rounded-md border border-line bg-surface px-2 text-[16px] text-ink md:h-10 md:text-[13px]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[11px] text-ink-muted">月</span>
              <select
                name="month"
                defaultValue={month}
                className="control-base h-11 w-full rounded-md border border-line bg-surface px-2 text-[16px] text-ink md:h-10 md:text-[13px]"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-11 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-subtle md:h-10"
            >
              表示
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
            <span>
              件数{" "}
              <span className="font-medium tabular-nums text-ink">
                {applications.length}件
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              合計
              <AmountText
                amount={totalAmount}
                className="text-[13px] font-medium text-ink"
              />
            </span>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="この月の申請はありません"
            description="年月を変更するか、新規申請から登録してください。"
          />
        ) : (
          applications.map((app) => (
            <ExpenseListRow key={app.id} application={app} />
          ))
        )}
      </section>
    </div>
  );
}

export default function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <HistoryContent searchParams={searchParams} />
    </Suspense>
  );
}
