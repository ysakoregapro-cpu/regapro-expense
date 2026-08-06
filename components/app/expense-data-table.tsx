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
    <div className={cn("w-full min-w-0", className)}>
      {/* PC table — never force horizontal scroll on smaller viewports */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-surface xl:block">
        <table className="w-full table-fixed border-collapse text-[13px]">
          <thead className="bg-surface-subtle text-left text-xs font-medium text-ink-secondary">
            <tr className="border-b border-line">
              <th className="w-[88px] px-3 py-2.5 font-medium">新規／再申請</th>
              <th className="w-[18%] px-3 py-2.5 font-medium">申請者</th>
              <th className="w-[64px] px-3 py-2.5 font-medium">区分</th>
              <th className="px-3 py-2.5 font-medium">経費項目</th>
              <th className="w-[108px] px-3 py-2.5 font-medium">日付</th>
              <th className="w-[120px] px-3 py-2.5 font-medium text-right">
                金額
              </th>
              <th className="w-[96px] px-3 py-2.5 font-medium">ステータス</th>
              <th className="w-[148px] px-3 py-2.5 font-medium">受付日時</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-line last:border-b-0 hover:bg-surface-subtle"
              >
                <td className="p-0 align-middle">
                  <RowLink href={`/admin/applications/${app.id}`}>
                    {versionKindLabel(app.version)}
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
                  <RowLink
                    href={`/admin/applications/${app.id}`}
                    className="amount-cell whitespace-nowrap font-medium"
                  >
                    {formatYen(app.amount)}
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

      {/* Phone + tablet dense rows */}
      <div className="divide-y divide-line border-y border-line bg-surface xl:hidden">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/admin/applications/${app.id}`}
            className="block px-1 py-2.5 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
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
                <p className="mt-1 truncate text-sm font-medium text-ink">
                  {app.applicant_name_snapshot}
                </p>
                <p className="truncate text-sm text-ink-secondary">
                  {app.category_name_snapshot}
                </p>
              </div>
              <p className="amount-cell shrink-0 whitespace-nowrap text-sm font-medium">
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
        "block px-3 py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </Link>
  );
}
