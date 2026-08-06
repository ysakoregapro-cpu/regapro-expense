import { Suspense } from "react";
import { connection } from "next/server";

import { AdminViewTabs } from "@/components/app/admin-view-tabs";
import { EmptyState } from "@/components/app/empty-state";
import { ExpenseDataTable } from "@/components/app/expense-data-table";
import { LoadingState } from "@/components/app/loading-state";
import { OpsSummaryBar } from "@/components/app/ops-summary-bar";
import { PageHeader } from "@/components/app/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication, ExpenseStatus } from "@/lib/types/database";

const statusRank: Record<ExpenseStatus, number> = {
  pending: 0,
  returned: 1,
  approved: 2,
};

function tokyoYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function tokyoMonthPrefix(date = new Date()): string {
  return tokyoYmd(date).slice(0, 7);
}

async function AdminHomeContent({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await connection();
  await requireAdmin();
  const { view } = await searchParams;
  const viewAll = view === "all";

  const supabase = await createClient();
  let query = supabase
    .from("expense_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (!viewAll) {
    query = query.eq("status", "pending");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Admin list failed", { code: error.code });
  }

  const list = (data ?? []) as ExpenseApplication[];

  // Summary metrics need the full set (pending counts / month approved).
  const { data: summaryData } = await supabase
    .from("expense_applications")
    .select("id, status, version, submitted_at, reviewed_at, amount");
  const all = (summaryData ?? []) as Pick<
    ExpenseApplication,
    "id" | "status" | "version" | "submitted_at" | "reviewed_at" | "amount"
  >[];
  const pendingList = all.filter((a) => a.status === "pending");

  const sorted = [...list].sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return (
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  });

  const today = tokyoYmd();
  const month = tokyoMonthPrefix();

  const todayNew = all.filter((a) => {
    const submittedDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(a.submitted_at));
    return submittedDay === today && a.version === 1;
  }).length;

  const resubmitPending = pendingList.filter((a) => a.version > 1).length;

  const monthApprovedAmount = all
    .filter((a) => {
      if (a.status !== "approved" || !a.reviewed_at) return false;
      const reviewedMonth = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date(a.reviewed_at))
        .slice(0, 7);
      return reviewedMonth === month;
    })
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        category="運用"
        title="承認管理"
        description={
          viewAll
            ? "すべての申請を確認できます"
            : "未確認の申請を優先して処理できます"
        }
      />

      <OpsSummaryBar
        pending={pendingList.length}
        resubmit={resubmitPending}
        monthApprovedAmount={monthApprovedAmount}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminViewTabs
          viewAll={viewAll}
          pendingCount={pendingList.length}
          allCount={all.length}
        />
        <p className="text-[12px] text-ink-muted">
          本日の新規申請{" "}
          <span className="font-medium tabular-nums text-ink-secondary">
            {todayNew}件
          </span>
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="ledger-panel">
          <EmptyState
            title={
              viewAll ? "申請はまだありません" : "未確認の申請はありません"
            }
          />
        </div>
      ) : (
        <ExpenseDataTable applications={sorted} />
      )}
    </div>
  );
}

export default function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminHomeContent searchParams={searchParams} />
    </Suspense>
  );
}
