import Link from "next/link";

import { AmountText } from "@/components/app/amount-text";
import { StatusBadge } from "@/components/app/status-badge";
import {
  applicationTypeLabel,
  formatExpenseDate,
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
  const accent =
    application.status === "returned"
      ? "before:bg-status-returned-fg"
      : application.status === "pending"
        ? "before:bg-status-pending-fg/60"
        : "before:bg-transparent";

  return (
    <Link
      href={`/app/applications/${application.id}`}
      className={cn(
        "relative block min-h-[76px] border-b border-line px-3 py-3 transition-colors duration-ui last:border-b-0",
        "hover:bg-surface-subtle active:bg-surface-emphasis",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "before:absolute before:inset-y-2.5 before:left-0 before:w-[2px] before:rounded-r",
        accent,
        className,
      )}
    >
      {/* Desktop comparison row */}
      <div className="hidden items-center gap-3 text-[13px] lg:grid lg:grid-cols-[84px_40px_minmax(0,1.5fr)_100px_132px_minmax(104px,120px)]">
        <StatusBadge status={application.status} />
        <span className="text-ink-secondary">
          {applicationTypeLabel(application.application_type)}
        </span>
        <span className="truncate font-medium text-ink">
          {application.category_name_snapshot}
        </span>
        <span className="whitespace-nowrap text-ink-secondary">
          {formatExpenseDate(application.expense_date)}
        </span>
        <span className="app-no truncate text-ink-muted">
          {application.application_no}
        </span>
        <AmountText amount={application.amount} />
      </div>

      {/* Phone / tablet dense row */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <StatusBadge status={application.status} />
            <span className="text-xs text-ink-secondary">
              {applicationTypeLabel(application.application_type)}
            </span>
          </div>
          <AmountText amount={application.amount} className="shrink-0" />
        </div>
        <p className="mt-1.5 truncate text-[15px] font-medium leading-snug text-ink">
          {application.category_name_snapshot}
        </p>
        <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
          <span className="shrink-0">
            {formatExpenseDate(application.expense_date)}
          </span>
          <span className="app-no max-w-full break-all">
            {application.application_no}
          </span>
        </div>
      </div>
    </Link>
  );
}
