import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { ExpenseListRow } from "@/components/app/expense-list-row";
import { InlineAlert } from "@/components/app/inline-alert";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusSummaryBar } from "@/components/app/status-summary-bar";
import { Button } from "@/components/ui/button";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication, ExpenseStatus } from "@/lib/types/database";

const statusRank: Record<ExpenseStatus, number> = {
  returned: 0,
  pending: 1,
  approved: 2,
};

async function ApplicantHomeContent() {
  await requireApplicant();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expense_applications")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Applicant list failed", { code: error.code });
  }

  const applications = (data ?? []) as ExpenseApplication[];
  const sorted = [...applications].sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return (
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  const returned = applications.filter((a) => a.status === "returned");
  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        category="経費管理"
        title="経費申請"
        description="申請の作成と現在の承認状況を確認できます"
        actions={
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-md px-4 md:h-10 md:w-auto md:px-3.5"
          >
            <Link href="/app/new">
              <Plus className="h-4 w-4 opacity-90" />
              新規申請
            </Link>
          </Button>
        }
      />

      <StatusSummaryBar
        returned={returned.length}
        pending={pending}
        approved={approved}
      />

      {returned.length > 0 ? (
        <InlineAlert title="修正が必要です">
          {returned.length === 1
            ? `申請 ${returned[0].application_no} が差し戻されています。内容を確認して再申請してください。`
            : `${returned.length}件の申請が差し戻されています。一覧から修正してください。`}
        </InlineAlert>
      ) : null}

      <section className="ledger-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-ink">最近の申請</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {applications.length}件
          </span>
        </div>
        <div className="hidden border-b border-line px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-muted lg:grid lg:grid-cols-[84px_40px_minmax(0,1.5fr)_100px_132px_minmax(104px,120px)] lg:gap-3">
          <span>ステータス</span>
          <span>区分</span>
          <span>経費項目</span>
          <span>日付</span>
          <span>申請番号</span>
          <span className="text-right">金額</span>
        </div>
        {sorted.length === 0 ? (
          <EmptyState
            title="申請はまだありません"
            description="経費が発生したら新規申請から登録してください。"
            actionHref="/app/new"
            actionLabel="新規申請"
          />
        ) : (
          sorted.map((app) => (
            <ExpenseListRow key={app.id} application={app} />
          ))
        )}
      </section>
    </div>
  );
}

export default function ApplicantHomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ApplicantHomeContent />
    </Suspense>
  );
}
