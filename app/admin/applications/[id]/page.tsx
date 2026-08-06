import { notFound } from "next/navigation";
import { Suspense } from "react";

import { loadApplicationForAdmin } from "@/app/actions/expenses";
import { AdminReviewActions } from "@/components/app/admin-review-actions";
import { ApplicationMeta } from "@/components/app/application-meta";
import { EventTimeline } from "@/components/app/event-timeline";
import { InlineAlert } from "@/components/app/inline-alert";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { ReceiptPreview } from "@/components/app/receipt-preview";

async function AdminDetailContent({ id }: { id: string }) {
  const detail = await loadApplicationForAdmin(id);
  if (!detail) notFound();

  const { application, events, receiptUrl } = detail;

  return (
    <div className="flex flex-col gap-5 pb-24 lg:pb-6">
      <PageHeader title="申請詳細" />

      {application.status === "returned" && application.admin_note ? (
        <InlineAlert title="差し戻しコメント">{application.admin_note}</InlineAlert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-5">
          <section className="rounded-lg border border-line bg-surface px-4 py-4">
            <ApplicationMeta application={application} />
            <div className="mt-4 border-t border-line pt-4">
              <h2 className="text-base font-semibold text-ink">内容・目的</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                {application.description}
              </p>
              {application.after_reason ? (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    事後理由
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">
                    {application.after_reason}
                  </p>
                </>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface px-4 py-4">
            <h2 className="mb-3 text-base font-semibold text-ink">操作履歴</h2>
            <EventTimeline events={events} />
          </section>

          <div className="lg:hidden">
            <ReceiptPreview
              path={application.receipt_path}
              url={receiptUrl}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-4">
            <ReceiptPreview
              path={application.receipt_path}
              url={receiptUrl}
            />
          </div>
        </div>
      </div>

      <AdminReviewActions
        applicationId={application.id}
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
