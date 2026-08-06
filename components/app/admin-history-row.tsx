import Link from "next/link";

import { AmountText } from "@/components/app/amount-text";
import { StatusBadge } from "@/components/app/status-badge";
import {
  formatExpenseDate,
  formatShortDate,
} from "@/lib/format";
import type { ExpenseApplication } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function AdminHistoryRow({
  application,
}: {
  application: ExpenseApplication;
}) {
  const href = `/admin/applications/${application.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "relative block border-b border-line px-3 py-3 transition-colors duration-ui last:border-b-0",
        "hover:bg-surface-subtle active:bg-surface-emphasis",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      )}
    >
      {/* xl table-like row */}
      <div className="hidden items-center gap-3 text-[13px] xl:grid xl:grid-cols-[minmax(0,1.1fr)_132px_minmax(0,1.3fr)_104px_100px_112px_84px]">
        <span className="truncate font-medium text-ink">
          {application.applicant_name_snapshot}
        </span>
        <span className="app-no truncate text-ink-muted">
          {application.application_no}
        </span>
        <span className="truncate text-ink">
          {application.category_name_snapshot}
        </span>
        <AmountText amount={application.amount} />
        <span className="whitespace-nowrap text-ink-secondary">
          {formatExpenseDate(application.expense_date)}
        </span>
        <span className="whitespace-nowrap text-ink-muted">
          {formatShortDate(application.submitted_at)}
        </span>
        <StatusBadge status={application.status} />
      </div>

      {/* Mobile / tablet dense row */}
      <div className="xl:hidden">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-[15px] font-semibold leading-snug text-ink">
            {application.applicant_name_snapshot}
          </p>
          <StatusBadge status={application.status} className="shrink-0" />
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-[13px] text-ink-secondary">
            {application.category_name_snapshot}
          </p>
          <AmountText amount={application.amount} className="shrink-0" />
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-ink-muted">
          <span className="shrink-0">
            利用日 {formatExpenseDate(application.expense_date)}
          </span>
          <span className="app-no max-w-full break-all">
            {application.application_no}
          </span>
          <span className="shrink-0">
            申請日 {formatShortDate(application.submitted_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
