import Link from "next/link";

import { StatusBadge } from "@/components/app/status-badge";
import {
  applicationTypeLabel,
  formatDateTime,
  formatExpenseDate,
  formatYen,
} from "@/lib/format";
import type { ExpenseApplication } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function ExpenseListRow({
  application,
  className,
}: {
  application: ExpenseApplication;
  className?: string;
}) {
  return (
    <Link
      href={`/app/applications/${application.id}`}
      className={cn(
        "block border-b border-line px-1 py-3 transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        application.status === "returned" && "border-l-[3px] border-l-status-returned-fg pl-2",
        className,
      )}
    >
      <div className="hidden items-center gap-3 text-sm md:grid md:grid-cols-[88px_48px_minmax(0,1.2fr)_110px_110px_140px_140px]">
        <StatusBadge status={application.status} />
        <span className="text-ink-secondary">
          {applicationTypeLabel(application.application_type)}
        </span>
        <span className="truncate font-medium text-ink">
          {application.category_name_snapshot}
        </span>
        <span className="amount-cell font-medium text-ink">
          {formatYen(application.amount)}
        </span>
        <span className="text-ink-secondary">
          {formatExpenseDate(application.expense_date)}
        </span>
        <span className="app-no text-ink-secondary">
          {application.application_no}
        </span>
        <span className="text-xs text-ink-muted">
          {formatDateTime(application.updated_at)}
        </span>
      </div>

      <div className="md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={application.status} />
              <span className="text-xs text-ink-secondary">
                {applicationTypeLabel(application.application_type)}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-medium text-ink">
              {application.category_name_snapshot}
            </p>
          </div>
          <p className="amount-cell shrink-0 text-sm font-medium text-ink">
            {formatYen(application.amount)}
          </p>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span>{formatExpenseDate(application.expense_date)}</span>
          <span className="app-no">{application.application_no}</span>
        </div>
      </div>
    </Link>
  );
}
