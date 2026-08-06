"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireApplicant } from "@/lib/auth/session";
import { notifyExpenseEvent } from "@/lib/notifications/send";
import {
  createReceiptSignedUrl,
  deleteReceiptAdmin,
  uploadReceipt,
} from "@/lib/storage/receipts";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseApplication, ExpenseEvent } from "@/lib/types/database";
import {
  approveSchema,
  expenseFormSchema,
  returnNoteSchema,
} from "@/lib/validations/expense";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

function mapDbError(message?: string): string {
  console.error("Expense DB error", { message });
  return "処理に失敗しました。時間をおいて再度お試しください。";
}

export async function createExpenseApplication(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireApplicant();

  const parsed = expenseFormSchema.safeParse({
    applicationType: formData.get("applicationType"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    description: formData.get("description"),
    afterReason: formData.get("afterReason") || null,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first ?? "入力内容を確認してください。" };
  }

  const values = parsed.data;
  const file = formData.get("receipt");
  let receiptPath: string | null = null;

  if (values.applicationType === "after") {
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "事後申請では領収書が必須です。" };
    }
    const uploaded = await uploadReceipt(profile.id, file);
    if ("error" in uploaded) {
      return { ok: false, error: uploaded.error };
    }
    receiptPath = uploaded.path;
  }

  const supabase = await createClient();
  const insertPayload = {
    application_type: values.applicationType,
    category_id: values.categoryId,
    amount: values.amount,
    expense_date: values.expenseDate,
    description: values.description,
    after_reason:
      values.applicationType === "after" ? values.afterReason : null,
    receipt_path: values.applicationType === "after" ? receiptPath : null,
  };

  const { data, error } = await supabase
    .from("expense_applications")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !data) {
    if (receiptPath) {
      await deleteReceiptAdmin(receiptPath);
    }
    return { ok: false, error: mapDbError(error?.message) };
  }

  try {
    await notifyExpenseEvent("submitted", data.id);
  } catch (err) {
    console.error("Post-submit notification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  revalidatePath("/app");
  redirect(`/app/applications/${data.id}`);
}

export async function resubmitExpenseApplication(
  applicationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireApplicant();
  const supabase = await createClient();

  const { data: existing, error: loadError } = await supabase
    .from("expense_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (loadError || !existing) {
    return { ok: false, error: "申請が見つかりません。" };
  }

  if (
    existing.applicant_id !== profile.id ||
    existing.status !== "returned"
  ) {
    return { ok: false, error: "この申請は再申請できません。" };
  }

  const parsed = expenseFormSchema.safeParse({
    applicationType: formData.get("applicationType"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    description: formData.get("description"),
    afterReason: formData.get("afterReason") || null,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first ?? "入力内容を確認してください。" };
  }

  const values = parsed.data;
  const file = formData.get("receipt");
  let receiptPath: string | null = existing.receipt_path;
  let uploadedNewPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadReceipt(profile.id, file);
    if ("error" in uploaded) {
      return { ok: false, error: uploaded.error };
    }
    uploadedNewPath = uploaded.path;
    receiptPath = uploaded.path;
  }

  if (values.applicationType === "after" && !receiptPath) {
    if (uploadedNewPath) await deleteReceiptAdmin(uploadedNewPath);
    return { ok: false, error: "事後申請では領収書が必須です。" };
  }

  const { error } = await supabase.rpc("resubmit_expense_application", {
    p_application_id: applicationId,
    p_application_type: values.applicationType,
    p_category_id: values.categoryId,
    p_amount: values.amount,
    p_expense_date: values.expenseDate,
    p_description: values.description,
    p_after_reason:
      values.applicationType === "after" ? values.afterReason : null,
    p_receipt_path: receiptPath,
  });

  if (error) {
    if (uploadedNewPath) {
      await deleteReceiptAdmin(uploadedNewPath);
    }
    return { ok: false, error: mapDbError(error.message) };
  }

  try {
    await notifyExpenseEvent("resubmitted", applicationId);
  } catch (err) {
    console.error("Post-resubmit notification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  revalidatePath("/app");
  revalidatePath(`/app/applications/${applicationId}`);
  redirect(`/app/applications/${applicationId}`);
}

export async function approveExpenseApplicationAction(
  applicationId: string,
  adminNote?: string | null,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = approveSchema.safeParse({
    applicationId,
    adminNote: adminNote ?? null,
  });
  if (!parsed.success) {
    return { ok: false, error: "入力内容を確認してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_expense_application", {
    p_application_id: parsed.data.applicationId,
    p_admin_note: parsed.data.adminNote || null,
  });

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }

  try {
    await notifyExpenseEvent("approved", applicationId);
  } catch (err) {
    console.error("Post-approve notification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true };
}

export async function returnExpenseApplicationAction(
  applicationId: string,
  adminNote: string,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = returnNoteSchema.safeParse({ applicationId, adminNote });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "差し戻し理由を入力してください。",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("return_expense_application", {
    p_application_id: parsed.data.applicationId,
    p_admin_note: parsed.data.adminNote,
  });

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }

  try {
    await notifyExpenseEvent("returned", applicationId);
  } catch (err) {
    console.error("Post-return notification failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true };
}

export type ApplicationDetail = {
  application: ExpenseApplication;
  events: ExpenseEvent[];
  receiptUrl: string | null;
};

export async function loadApplicationForApplicant(
  id: string,
): Promise<ApplicationDetail | null> {
  const profile = await requireApplicant();
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("expense_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !application || application.applicant_id !== profile.id) {
    return null;
  }

  const { data: events } = await supabase
    .from("expense_events")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  const receiptUrl = application.receipt_path
    ? await createReceiptSignedUrl(application.receipt_path)
    : null;

  return {
    application: application as ExpenseApplication,
    events: (events ?? []) as ExpenseEvent[],
    receiptUrl,
  };
}

export async function loadApplicationForAdmin(
  id: string,
): Promise<ApplicationDetail | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("expense_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    return null;
  }

  const { data: events } = await supabase
    .from("expense_events")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  const receiptUrl = application.receipt_path
    ? await createReceiptSignedUrl(application.receipt_path)
    : null;

  return {
    application: application as ExpenseApplication,
    events: (events ?? []) as ExpenseEvent[],
    receiptUrl,
  };
}
