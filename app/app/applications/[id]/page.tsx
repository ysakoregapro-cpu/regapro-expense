import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { loadApplicationForApplicant } from "@/app/actions/expenses";
import { ApplicationMeta } from "@/components/app/application-meta";
import { EventTimeline } from "@/components/app/event-timeline";
import { InlineAlert } from "@/components/app/inline-alert";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { ReceiptPreview } from "@/components/app/receipt-preview";
import { Button } from "@/components/ui/button";

async function DetailContent({ id }: { id: string }) {
  const detail = await loadApplicationForApplicant(id);
  if (!detail) notFound();

  const { application, events, receiptUrl } = detail;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="申請詳細"
        actions={
          application.status === "returned" ? (
            <Button asChild className="h-11 w-full sm:h-10 sm:w-auto">
              <Link href={`/app/applications/${application.id}/edit`}>
                修正して再申請
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="h-11 sm:h-10">
              <Link href="/app">一覧へ</Link>
            </Button>
          )
        }
      />

      {application.status === "returned" && application.admin_note ? (
        <InlineAlert title="管理者からの差し戻しコメント">
          {application.admin_note}
        </InlineAlert>
      ) : null}

      <section className="border-y border-line bg-surface px-4 py-4 sm:rounded-lg sm:border">
        <ApplicationMeta application={application} showApplicant={false} />
      </section>

      <section className="border-y border-line bg-surface px-4 py-4 sm:rounded-lg sm:border">
        <h2 className="text-base font-semibold text-ink">内容・目的</h2>
        <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {application.description}
        </p>
        {application.after_reason ? (
          <>
            <h3 className="mt-4 text-sm font-semibold text-ink">事後理由</h3>
            <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
              {application.after_reason}
            </p>
          </>
        ) : null}
        {application.admin_note && application.status !== "returned" ? (
          <>
            <h3 className="mt-4 text-sm font-semibold text-ink">管理者備考</h3>
            <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
              {application.admin_note}
            </p>
          </>
        ) : null}
      </section>

      <ReceiptPreview path={application.receipt_path} url={receiptUrl} />

      <section className="border-y border-line bg-surface px-4 py-4 sm:rounded-lg sm:border">
        <h2 className="mb-3 text-base font-semibold text-ink">操作履歴</h2>
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
