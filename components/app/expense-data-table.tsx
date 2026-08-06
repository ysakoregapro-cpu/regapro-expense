import Link from "next/link";

import { StatusBadge } from "@/components/app/status-badge";
import {
  applicationTypeLabel,
  formatDateTime,
  formatExpenseDate,
  formatYen,
  versionKindLabel,
} from "@/lib/format";
import type { ExpenseApplication } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function ExpenseDataTable({
  applications,
  className,
}: {
  applications: ExpenseApplication[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden overflow-hidden rounded-lg border border-line bg-surface lg:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-subtle text-left text-xs font-medium text-ink-secondary">
            <tr className="border-b border-line">
              <th className="px-3 py-3 font-medium">新規／再申請</th>
              <th className="px-3 py-3 font-medium">申請者</th>
              <th className="px-3 py-3 font-medium">事前／事後</th>
              <th className="px-3 py-3 font-medium">経費項目</th>
              <th className="px-3 py-3 font-medium">日付</th>
              <th className="px-3 py-3 font-medium text-right">金額</th>
              <th className="px-3 py-3 font-medium">ステータス</th>
              <th className="px-3 py-3 font-medium">受付日時</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-line last:border-b-0 hover:bg-surface-subtle"
              >
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    {versionKindLabel(app.version)}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 font-medium text-ink"
                  >
                    {app.applicant_name_snapshot}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 text-ink-secondary"
                  >
                    {applicationTypeLabel(app.application_type)}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 text-ink"
                  >
                    {app.category_name_snapshot}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 text-ink-secondary"
                  >
                    {formatExpenseDate(app.expense_date)}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="amount-cell block px-3 py-3 font-medium text-ink"
                  >
                    {formatYen(app.amount)}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3"
                  >
                    <StatusBadge status={app.status} />
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="block px-3 py-3 text-xs text-ink-muted"
                  >
                    {formatDateTime(app.submitted_at)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line rounded-lg border border-line bg-surface lg:hidden">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/admin/applications/${app.id}`}
            className="block px-3 py-3 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-ink-secondary">
                    {versionKindLabel(app.version)} ·{" "}
                    {applicationTypeLabel(app.application_type)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-ink">
                  {app.applicant_name_snapshot}
                </p>
                <p className="truncate text-sm text-ink-secondary">
                  {app.category_name_snapshot}
                </p>
              </div>
              <p className="amount-cell shrink-0 text-sm font-medium">
                {formatYen(app.amount)}
              </p>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-muted">
              <span>{formatExpenseDate(app.expense_date)}</span>
              <span>{formatDateTime(app.submitted_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
