import Link from "next/link";

import { AmountText } from "@/components/app/amount-text";
import { StatusBadge } from "@/components/app/status-badge";
import {
  applicationTypeLabel,
  formatDateTime,
  formatExpenseDate,
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
    <div className={cn("w-full min-w-0 overflow-x-hidden", className)}>
      {/* PC table only when columns fit naturally */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-surface xl:block">
        <table className="w-full table-fixed border-collapse text-[13px]">
          <thead className="bg-surface-subtle text-left text-[11px] font-semibold tracking-wide text-ink-secondary">
            <tr className="border-b border-line">
              <th className="w-[88px] px-3 py-2.5">区分</th>
              <th className="w-[18%] px-3 py-2.5">申請者</th>
              <th className="w-[64px] px-3 py-2.5">事前／事後</th>
              <th className="px-3 py-2.5">経費項目</th>
              <th className="w-[108px] px-3 py-2.5">日付</th>
              <th className="w-[120px] px-3 py-2.5 text-right">金額</th>
              <th className="w-[96px] px-3 py-2.5">ステータス</th>
              <th className="w-[148px] px-3 py-2.5">受付日時</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className={cn(
                  "border-b border-line last:border-b-0 transition-colors duration-ui hover:bg-surface-subtle",
                  app.status === "pending" && "bg-status-pending/20",
                )}
              >
                <td className="p-0 align-middle">
                  <RowLink href={`/admin/applications/${app.id}`}>
                    <span className="font-medium">
                      {versionKindLabel(app.version)}
                    </span>
                    {app.version > 1 ? (
                      <span className="mt-0.5 block text-[10px] font-normal text-ink-muted">
                        v{app.version}
                      </span>
                    ) : null}
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="truncate font-medium"
                  >
                    {app.applicant_name_snapshot}
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="text-ink-secondary"
                  >
                    {applicationTypeLabel(app.application_type)}
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="truncate"
                  >
                    {app.category_name_snapshot}
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="whitespace-nowrap text-ink-secondary"
                  >
                    {formatExpenseDate(app.expense_date)}
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink href={`/admin/applications/${app.id}`}>
                    <AmountText amount={app.amount} />
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink href={`/admin/applications/${app.id}`}>
                    <StatusBadge status={app.status} />
                  </RowLink>
                </td>
                <td className="p-0 align-middle">
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="whitespace-nowrap text-xs text-ink-muted"
                  >
                    {formatDateTime(app.submitted_at)}
                  </RowLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone + tablet compressed rows */}
      <div className="divide-y divide-line border-y border-line bg-surface xl:hidden">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/admin/applications/${app.id}`}
            className={cn(
              "relative block min-h-[88px] px-3 py-3 transition-colors duration-ui",
              "hover:bg-surface-subtle active:bg-surface-emphasis",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              app.status === "pending" &&
                "before:absolute before:inset-y-2.5 before:left-0 before:w-[2px] before:rounded-r before:bg-status-pending-fg bg-status-pending/15",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-ink">
                    {versionKindLabel(app.version)}
                  </span>
                  <span className="text-[12px] text-ink-secondary">
                    {applicationTypeLabel(app.application_type)}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <p className="mt-1.5 truncate text-[15px] font-semibold leading-snug text-ink">
                  {app.applicant_name_snapshot}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-ink-secondary">
                  {app.category_name_snapshot}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-ink-muted">
                  <span>{formatExpenseDate(app.expense_date)}</span>
                  <span>{formatDateTime(app.submitted_at)}</span>
                </div>
              </div>
              <AmountText amount={app.amount} className="shrink-0 pt-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[52px] flex-col justify-center px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </Link>
  );
}
