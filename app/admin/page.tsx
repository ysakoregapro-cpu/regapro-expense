import { Suspense } from "react";

import { EmptyState } from "@/components/app/empty-state";
import { ExpenseDataTable } from "@/components/app/expense-data-table";
import { InlineSummary } from "@/components/app/inline-summary";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { formatYen } from "@/lib/format";
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
  await requireAdmin();
  const { view } = await searchParams;
  const viewAll = view === "all";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Admin list failed", { code: error.code });
  }

  const all = (data ?? []) as ExpenseApplication[];
  const pendingList = all.filter((a) => a.status === "pending");
  const list = viewAll ? all : pendingList;

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
      <PageHeader title={viewAll ? "全申請" : "未確認申請"} />

      <InlineSummary
        items={[
          { label: "未確認", value: `${pendingList.length}件` },
          { label: "本日の新規", value: `${todayNew}件` },
          { label: "再申請", value: `${resubmitPending}件` },
          { label: "今月承認額", value: formatYen(monthApprovedAmount) },
        ]}
      />

      {sorted.length === 0 ? (
        <EmptyState
          title={
            viewAll ? "申請はまだありません" : "未確認の申請はありません"
          }
        />
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
