import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/app/empty-state";
import { ExpenseListRow } from "@/components/app/expense-list-row";
import { InlineAlert } from "@/components/app/inline-alert";
import { InlineSummary } from "@/components/app/inline-summary";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
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
    <div className="flex flex-col gap-4">
      <PageHeader
        title="経費申請"
        actions={
          <Button asChild className="h-11 w-full sm:h-10 sm:w-auto">
            <Link href="/app/new">新規申請</Link>
          </Button>
        }
      />

      <InlineSummary
        items={[
          { label: "要対応", value: `${returned.length}件` },
          { label: "確認待ち", value: `${pending}件` },
          { label: "承認済み", value: `${approved}件` },
        ]}
      />

      {returned.length > 0 ? (
        <InlineAlert title="差し戻しへの対応が必要です">
          {returned.length === 1
            ? `申請 ${returned[0].application_no} が差し戻されています。内容を修正して再申請してください。`
            : `${returned.length}件の申請が差し戻されています。一覧から修正してください。`}
        </InlineAlert>
      ) : null}

      <section className="border-y border-line bg-surface">
        <div className="hidden border-b border-line px-3 py-2 text-xs font-medium text-ink-secondary lg:grid lg:grid-cols-[84px_40px_minmax(0,1.4fr)_minmax(96px,120px)_100px_132px_128px] lg:gap-3">
          <span>ステータス</span>
          <span>区分</span>
          <span>経費項目</span>
          <span className="text-right">金額</span>
          <span>日付</span>
          <span>申請番号</span>
          <span>更新日時</span>
        </div>
        {sorted.length === 0 ? (
          <EmptyState
            title="申請はまだありません"
            description="経費が発生したら新規申請から登録してください。"
            actionHref="/app/new"
            actionLabel="新規申請"
          />
        ) : (
          <div className="px-2 lg:px-3">
            {sorted.map((app) => (
              <ExpenseListRow key={app.id} application={app} />
            ))}
          </div>
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
