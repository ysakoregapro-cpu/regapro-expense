import {
  applicationTypeLabel,
  formatDateTime,
  formatExpenseDate,
  formatYen,
} from "@/lib/format";
import type { ExpenseApplication } from "@/lib/types/database";
import { StatusBadge } from "@/components/app/status-badge";

export function ApplicationMeta({
  application,
  showApplicant = true,
}: {
  application: ExpenseApplication;
  showApplicant?: boolean;
}) {
  return (
    <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
      <MetaItem label="申請番号">
        <span className="app-no break-all">{application.application_no}</span>
      </MetaItem>
      <MetaItem label="ステータス">
        <StatusBadge status={application.status} />
      </MetaItem>
      <MetaItem label="申請区分">
        {applicationTypeLabel(application.application_type)}申請
      </MetaItem>
      {showApplicant ? (
        <MetaItem label="申請者">
          <span className="break-words">{application.applicant_name_snapshot}</span>
        </MetaItem>
      ) : null}
      <MetaItem label="経費項目">
        <span className="break-words">{application.category_name_snapshot}</span>
      </MetaItem>
      <MetaItem label="金額">
        <span className="amount-cell inline-block whitespace-nowrap font-medium">
          {formatYen(application.amount)}
        </span>
      </MetaItem>
      <MetaItem label="日付">{formatExpenseDate(application.expense_date)}</MetaItem>
      <MetaItem label="バージョン">v{application.version}</MetaItem>
      <MetaItem label="申請日時">
        {formatDateTime(application.submitted_at)}
      </MetaItem>
      <MetaItem label="確認日時">
        {application.reviewed_at
          ? formatDateTime(application.reviewed_at)
          : "—"}
      </MetaItem>
    </dl>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}
