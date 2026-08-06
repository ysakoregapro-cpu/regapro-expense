import Link from "next/link";
import { Suspense } from "react";

import { ExpenseForm } from "@/components/app/expense-form";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseCategory } from "@/lib/types/database";

async function NewExpenseContent() {
  const profile = await requireApplicant();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("id, code, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Categories load failed", { code: error.code });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/app"
          className="text-[12px] font-medium text-ink-secondary transition-colors duration-ui hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← 申請一覧へ戻る
        </Link>
        <PageHeader
          className="mt-3"
          category="経費管理"
          title="新規申請"
          description="申請内容を入力して送信してください"
        />
      </div>
      <div className="mx-auto w-full max-w-[800px] ledger-panel px-4 py-5 sm:px-6">
        <ExpenseForm
          mode="create"
          categories={(data ?? []) as ExpenseCategory[]}
          applicantName={profile.display_name}
        />
      </div>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewExpenseContent />
    </Suspense>
  );
}
