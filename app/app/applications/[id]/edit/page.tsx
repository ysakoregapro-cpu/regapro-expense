import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ExpenseForm } from "@/components/app/expense-form";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { requireApplicant } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type {
  ExpenseApplication,
  ExpenseCategory,
} from "@/lib/types/database";

async function EditContent({ id }: { id: string }) {
  const profile = await requireApplicant();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("expense_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!application || application.applicant_id !== profile.id) {
    notFound();
  }

  if (application.status !== "returned") {
    redirect(`/app/applications/${id}`);
  }

  const { data: categories } = await supabase
    .from("expense_categories")
    .select("id, code, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/app/applications/${id}`}
          className="text-[12px] font-medium text-ink-secondary transition-colors duration-ui hover:text-ink"
        >
          ← 申請詳細へ戻る
        </Link>
        <PageHeader
          className="mt-3"
          category="経費管理"
          title="申請を修正"
          description="差し戻し内容を反映して再申請します"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-line border-l-[3px] border-l-status-returned-fg bg-status-returned/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="returned" />
          <p className="text-[13px] font-semibold text-status-returned-fg">
            修正が必要です
          </p>
        </div>
        {application.admin_note ? (
          <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink">
            {application.admin_note}
          </p>
        ) : (
          <p className="mt-2 text-[13px] text-ink-secondary">
            管理者コメントはありません。内容を見直して再申請してください。
          </p>
        )}
        {application.reviewed_at ? (
          <p className="mt-2 text-[11px] text-ink-muted">
            差し戻し日時 {formatDateTime(application.reviewed_at)}
          </p>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-[800px] ledger-panel px-4 py-5 sm:px-6">
        <ExpenseForm
          mode="resubmit"
          application={application as ExpenseApplication}
          categories={(categories ?? []) as ExpenseCategory[]}
          applicantName={profile.display_name}
        />
      </div>
    </div>
  );
}

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <EditContent id={id} />
    </Suspense>
  );
}
