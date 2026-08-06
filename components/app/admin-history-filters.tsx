"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { yearMonthLabel } from "@/lib/date/tokyo";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ApplicantOption = {
  id: string;
  displayName: string;
};

type StatusFilter = "approved" | "pending" | "returned" | "all";

function buildHistoryHref(input: {
  year: number;
  month: number;
  applicant: string;
  status: StatusFilter;
  page?: number;
}): string {
  const params = new URLSearchParams();
  params.set("year", String(input.year));
  params.set("month", String(input.month));
  if (input.applicant !== "all") params.set("applicant", input.applicant);
  if (input.status !== "approved") params.set("status", input.status);
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const qs = params.toString();
  return qs ? `/admin/history?${qs}` : "/admin/history";
}

const selectClass =
  "control-base h-11 w-full rounded-md border border-line bg-surface px-2 text-[16px] text-ink md:h-10 md:text-[13px]";

export function AdminHistoryFilters({
  year,
  month,
  applicant,
  status,
  applicants,
  years,
  months,
  prev,
  next,
}: {
  year: number;
  month: number;
  applicant: string;
  status: StatusFilter;
  applicants: ApplicantOption[];
  years: number[];
  months: number[];
  prev: { year: number; month: number } | null;
  next: { year: number; month: number } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
      router.refresh();
    });
  };

  const onChange = (patch: {
    year?: number;
    month?: number;
    applicant?: string;
    status?: StatusFilter;
  }) => {
    navigate(
      buildHistoryHref({
        year: patch.year ?? year,
        month: patch.month ?? month,
        applicant: patch.applicant ?? applicant,
        status: patch.status ?? status,
        page: 1,
      }),
    );
  };

  return (
    <div className={cn("flex flex-col gap-3", pending && "opacity-80")}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!prev || pending}
          aria-label="前月"
          onClick={() =>
            prev &&
            onChange({ year: prev.year, month: prev.month })
          }
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[15px] font-semibold tabular-nums text-ink">
          {yearMonthLabel(year, month)}
        </p>
        <button
          type="button"
          disabled={!next || pending}
          aria-label="翌月"
          onClick={() =>
            next &&
            onChange({ year: next.year, month: next.month })
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] text-ink-muted">年</span>
          <select
            className={selectClass}
            value={year}
            disabled={pending}
            onChange={(e) => onChange({ year: Number(e.target.value) })}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] text-ink-muted">月</span>
          <select
            className={selectClass}
            value={month}
            disabled={pending}
            onChange={(e) => onChange({ month: Number(e.target.value) })}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] text-ink-muted">申請者</span>
        <select
          className={selectClass}
          value={applicant}
          disabled={pending}
          onChange={(e) => onChange({ applicant: e.target.value })}
        >
          <option value="all">すべての申請者</option>
          {applicants.map((a) => (
            <option key={a.id} value={a.id}>
              {a.displayName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1">
        <span className="text-[11px] text-ink-muted">ステータス</span>
        <select
          className={selectClass}
          value={status}
          disabled={pending}
          onChange={(e) =>
            onChange({ status: e.target.value as StatusFilter })
          }
        >
          <option value="approved">{statusLabel("approved")}</option>
          <option value="pending">{statusLabel("pending")}</option>
          <option value="returned">{statusLabel("returned")}</option>
          <option value="all">すべて</option>
        </select>
      </label>
    </div>
  );
}

export function AdminHistoryPagination({
  page,
  totalPages,
  year,
  month,
  applicant,
  status,
}: {
  page: number;
  totalPages: number;
  year: number;
  month: number;
  applicant: string;
  status: StatusFilter;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const go = (nextPage: number) => {
    startTransition(() => {
      router.push(
        buildHistoryHref({
          year,
          month,
          applicant,
          status,
          page: nextPage,
        }),
      );
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5">
      <button
        type="button"
        disabled={page <= 1 || pending}
        onClick={() => go(page - 1)}
        className="rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-surface-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        前へ
      </button>
      <p className="text-[12px] tabular-nums text-ink-muted">
        {page} / {totalPages}
      </p>
      <button
        type="button"
        disabled={page >= totalPages || pending}
        onClick={() => go(page + 1)}
        className="rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-surface-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        次へ
      </button>
    </div>
  );
}

export { buildHistoryHref };
