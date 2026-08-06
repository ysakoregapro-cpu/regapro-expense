import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ExpenseForm } from "@/components/app/expense-form";
import { InlineAlert } from "@/components/app/inline-alert";
import { LoadingState } from "@/components/app/loading-state";
import { PageHeader } from "@/components/app/page-header";
import { requireApplicant } from "@/lib/auth/session";
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
    <div className="flex flex-col gap-5">
      <PageHeader title="修正して再申請" />
      {application.admin_note ? (
        <InlineAlert title="管理者からの差し戻しコメント">
          {application.admin_note}
        </InlineAlert>
      ) : (
        <InlineAlert title="差し戻し">
          内容を修正して再申請してください。
        </InlineAlert>
      )}
      <div className="rounded-lg border border-line bg-surface px-4 py-5 sm:px-5">
        <ExpenseForm
          mode="resubmit"
          application={application as ExpenseApplication}
          categories={(categories ?? []) as ExpenseCategory[]}
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
