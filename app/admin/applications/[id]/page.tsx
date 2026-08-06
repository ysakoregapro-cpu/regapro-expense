import { notFound } from "next/navigation";
import { Suspense } from "react";

import { loadApplicationForAdmin } from "@/app/actions/expenses";
import { AdminReviewActions } from "@/components/app/admin-review-actions";
import { AmountText } from "@/components/app/amount-text";
import { ApplicationMeta } from "@/components/app/application-meta";
import { EventTimeline } from "@/components/app/event-timeline";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { ReceiptPreview } from "@/components/app/receipt-preview";
import { StatusBadge } from "@/components/app/status-badge";

async function AdminDetailContent({ id }: { id: string }) {
  const detail = await loadApplicationForAdmin(id);
  if (!detail) notFound();

  const { application, events, receiptUrl } = detail;

  return (
    <div className="flex flex-col gap-4 pb-sticky-safe xl:pb-4">
      <PageHeader
        category="運用"
        title="申請詳細"
        description={`${application.applicant_name_snapshot} の申請を確認します`}
      />

      {application.status === "returned" && application.admin_note ? (
        <div className="rounded-lg border border-line border-l-[3px] border-l-status-returned-fg bg-status-returned/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="returned" />
            <p className="text-[13px] font-semibold text-status-returned-fg">
              差し戻し済み
            </p>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-[13px] text-ink">
            {application.admin_note}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(300px,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="ledger-panel overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line bg-surface-subtle px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={application.status} />
                  <span className="app-no text-ink-muted">
                    {application.application_no}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[15px] font-semibold text-ink">
                  {application.category_name_snapshot}
                </p>
              </div>
              <AmountText amount={application.amount} strong className="text-lg" />
            </div>
            <div className="px-4 py-4">
              <ApplicationMeta application={application} />
              <div className="mt-4 border-t border-line pt-4">
                <h2 className="text-[15px] font-semibold text-ink">
                  内容・目的
                </h2>
                <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {application.description}
                </p>
                {application.after_reason ? (
                  <>
                    <h3 className="mt-4 text-[13px] font-semibold text-ink">
                      事後理由
                    </h3>
                    <p className="mt-1 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                      {application.after_reason}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <div className="xl:hidden">
            <ReceiptPreview
              path={application.receipt_path}
              url={receiptUrl}
            />
          </div>

          <section className="ledger-panel px-4 py-4">
            <h2 className="mb-3 text-[15px] font-semibold text-ink">
              操作履歴
            </h2>
            <EventTimeline events={events} />
          </section>
        </div>

        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-4">
            <ReceiptPreview
              path={application.receipt_path}
              url={receiptUrl}
              framed
            />
          </div>
        </div>
      </div>

      <AdminReviewActions
        applicationId={application.id}
        applicationNo={application.application_no}
        status={application.status}
        canReview={application.status === "pending"}
      />
    </div>
  );
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminDetailContent id={id} />
    </Suspense>
  );
}
