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
    <div className="flex flex-col gap-4 pb-28 xl:pb-4">
      <PageHeader title="申請詳細" />

      {application.status === "returned" && application.admin_note ? (
        <InlineAlert title="差し戻しコメント">{application.admin_note}</InlineAlert>
      ) : null}

      {/*
        Mobile/tablet: vertical — 概要 → 内容 → 領収書 → 履歴 → actions
        Desktop xl+: split ~65/35 with sticky receipt
      */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(300px,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="border-y border-line bg-surface px-4 py-4 xl:rounded-lg xl:border">
            <ApplicationMeta application={application} />
            <div className="mt-4 border-t border-line pt-4">
              <h2 className="text-base font-semibold text-ink">内容・目的</h2>
              <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {application.description}
              </p>
              {application.after_reason ? (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    事後理由
                  </h3>
                  <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
                    {application.after_reason}
                  </p>
                </>
              ) : null}
            </div>
          </section>

          <div className="xl:hidden">
            <ReceiptPreview
              path={application.receipt_path}
              url={receiptUrl}
            />
          </div>

          <section className="border-y border-line bg-surface px-4 py-4 xl:rounded-lg xl:border">
            <h2 className="mb-3 text-base font-semibold text-ink">操作履歴</h2>
            <EventTimeline events={events} />
          </section>
        </div>

        <div className="hidden min-w-0 xl:block">
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
