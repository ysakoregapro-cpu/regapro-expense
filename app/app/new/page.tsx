import { Suspense } from "react";

import { ExpenseForm } from "@/components/app/expense-form";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireApplicant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseCategory } from "@/lib/types/database";

async function NewExpenseContent() {
  await requireApplicant();
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
    <div className="flex flex-col gap-6">
      <PageHeader title="新規申請" />
      <div className="rounded-lg border border-line bg-surface px-4 py-5 sm:px-5">
        <ExpenseForm
          mode="create"
          categories={(data ?? []) as ExpenseCategory[]}
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
