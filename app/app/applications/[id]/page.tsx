import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { loadApplicationForApplicant } from "@/app/actions/expenses";
import { AmountText } from "@/components/app/amount-text";
import { ApplicationMeta } from "@/components/app/application-meta";
import { EventTimeline } from "@/components/app/event-timeline";
import { InlineAlert } from "@/components/app/inline-alert";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { ReceiptPreview } from "@/components/app/receipt-preview";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";

async function DetailContent({ id }: { id: string }) {
  const detail = await loadApplicationForApplicant(id);
  if (!detail) notFound();

  const { application, events, receiptUrl } = detail;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/app"
          className="text-[12px] font-medium text-ink-secondary transition-colors duration-ui hover:text-ink"
        >
          ← 申請一覧へ戻る
        </Link>
        <PageHeader
          className="mt-3"
          category="経費管理"
          title="申請詳細"
          actions={
            application.status === "returned" ? (
              <Button asChild className="h-10 w-full sm:w-auto">
                <Link href={`/app/applications/${application.id}/edit`}>
                  修正して再申請
                </Link>
              </Button>
            ) : undefined
          }
        />
      </div>

      {application.status === "returned" && application.admin_note ? (
        <div className="rounded-lg border border-line border-l-[3px] border-l-status-returned-fg bg-status-returned/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="returned" />
            <p className="text-[13px] font-semibold text-status-returned-fg">
              修正が必要です
            </p>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink">
            {application.admin_note}
          </p>
        </div>
      ) : null}

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
          <ApplicationMeta application={application} showApplicant={false} />
        </div>
      </section>

      <section className="ledger-panel px-4 py-4">
        <h2 className="text-[15px] font-semibold text-ink">
          内容・目的
        </h2>
        <p className="mt-3 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {application.description}
        </p>
        {application.after_reason ? (
          <>
            <h3 className="mt-4 text-[13px] font-semibold text-ink">事後理由</h3>
            <p className="mt-1 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
              {application.after_reason}
            </p>
          </>
        ) : null}
        {application.admin_note && application.status !== "returned" ? (
          <InlineAlert className="mt-4" title="管理者備考">
            {application.admin_note}
          </InlineAlert>
        ) : null}
      </section>

      <ReceiptPreview path={application.receipt_path} url={receiptUrl} />

      <section className="ledger-panel px-4 py-4">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">
          操作履歴
        </h2>
        <EventTimeline events={events} />
      </section>
    </div>
  );
}

export default async function ApplicantApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <DetailContent id={id} />
    </Suspense>
  );
}
