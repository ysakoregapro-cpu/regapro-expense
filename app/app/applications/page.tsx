import { Suspense } from "react";
import { connection } from "next/server";

import { EmptyState } from "@/components/app/empty-state";
import { ExpenseListRow } from "@/components/app/expense-list-row";
import {
  PaginationNav,
  StatusFilterTabs,
} from "@/components/app/list-controls";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication, ExpenseStatus } from "@/lib/types/database";

const PAGE_SIZE = 30;

function parseStatus(raw: string | undefined): "" | ExpenseStatus {
  if (raw === "pending" || raw === "approved" || raw === "returned") {
    return raw;
  }
  return "";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return 1;
  return n;
}

async function AllApplicationsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await connection();
  const profile = await requireApplicant();
  const params = await searchParams;
  const status = parseStatus(params.status);
  const page = parsePage(params.page);

  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("expense_applications")
    .select("*", { count: "exact" })
    .eq("applicant_id", profile.id)
    .order("submitted_at", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Applicant all-list failed", { code: error.code });
  }

  const applications = (data ?? []) as ExpenseApplication[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const buildHref = (nextPage: number) => {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (nextPage > 1) qs.set("page", String(nextPage));
    const s = qs.toString();
    return s ? `/app/applications?${s}` : "/app/applications";
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        category="経費管理"
        title="全申請"
        description="ご自身の申請をすべて確認できます"
      />

      <StatusFilterTabs
        basePath="/app/applications"
        current={status}
      />

      <section className="ledger-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="text-[13px] font-semibold text-ink">申請一覧</h2>
          <span className="text-[12px] tabular-nums text-ink-muted">
            {total}件
          </span>
        </div>

        <div className="hidden border-b border-line px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-muted xl:grid xl:grid-cols-[84px_minmax(0,1.4fr)_100px_132px_minmax(104px,120px)] xl:gap-3">
          <span>状態</span>
          <span>経費項目</span>
          <span>利用日</span>
          <span>申請番号</span>
          <span className="text-right">金額</span>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="申請がありません"
            description={
              status
                ? "このステータスの申請はありません。"
                : "まだ申請がありません。"
            }
            actionHref="/app/new"
            actionLabel="新規申請"
          />
        ) : (
          applications.map((app) => (
            <ExpenseListRow key={app.id} application={app} />
          ))
        )}

        <PaginationNav
          page={safePage}
          totalPages={totalPages}
          buildHref={buildHref}
        />
      </section>
    </div>
  );
}

export default function AllApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AllApplicationsContent searchParams={searchParams} />
    </Suspense>
  );
}
