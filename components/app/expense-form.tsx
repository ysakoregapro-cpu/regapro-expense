"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Field, FieldError } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { Input } from "@/components/ui/input";
import {
  createExpenseApplication,
  resubmitExpenseApplication,
  type ActionResult,
} from "@/app/actions/expenses";
import type { ExpenseApplication, ExpenseCategory } from "@/lib/types/database";

type Props = {
  categories: ExpenseCategory[];
  mode: "create" | "resubmit";
  application?: ExpenseApplication;
};

const initial: ActionResult = { ok: true };

export function ExpenseForm({ categories, mode, application }: Props) {
  const router = useRouter();
  const [applicationType, setApplicationType] = useState<"advance" | "after">(
    application?.application_type ?? "after",
  );

  async function action(
    _prev: ActionResult,
    formData: FormData,
  ): Promise<ActionResult> {
    if (mode === "create") {
      return createExpenseApplication(formData);
    }
    if (!application) {
      return { ok: false, error: "申請が見つかりません。" };
    }
    return resubmitExpenseApplication(application.id, formData);
  }

  const [state, formAction] = useActionState(action, initial);

  useEffect(() => {
    if (state.ok === false && state.error === "この申請は再申請できません。") {
      router.push("/app");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-[800px] flex-col gap-5">
      <Field label="申請区分" htmlFor="applicationType" required>
        <select
          id="applicationType"
          name="applicationType"
          value={applicationType}
          onChange={(e) =>
            setApplicationType(e.target.value as "advance" | "after")
          }
          className="flex h-[42px] w-full rounded-md border border-line bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="advance">事前申請</option>
          <option value="after">事後申請</option>
        </select>
      </Field>

      <Field label="経費項目" htmlFor="categoryId" required>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={application?.category_id ?? ""}
          className="flex h-[42px] w-full rounded-md border border-line bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled>
            選択してください
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="金額（円）" htmlFor="amount" required>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={application?.amount ?? ""}
            className="amount-cell"
          />
        </Field>
        <Field
          label="発生日または利用予定日"
          htmlFor="expenseDate"
          required
        >
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            required
            defaultValue={application?.expense_date ?? ""}
          />
        </Field>
      </div>

      <Field label="内容・目的" htmlFor="description" required>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={application?.description ?? ""}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      {applicationType === "after" ? (
        <>
          <Field
            label="事後になった理由"
            htmlFor="afterReason"
            required
            hint="申請が事後になった事情を簡潔に記入してください。"
          >
            <textarea
              id="afterReason"
              name="afterReason"
              required
              rows={3}
              defaultValue={application?.after_reason ?? ""}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <Field
            label="領収書"
            htmlFor="receipt"
            required={mode === "create" || !application?.receipt_path}
            hint={
              mode === "resubmit" && application?.receipt_path
                ? "新しいファイルを選ぶと差し替えます。未選択の場合は現在の領収書を維持します。JPEG / PNG / WebP / PDF、10MB以下。"
                : "JPEG / PNG / WebP / PDF、10MB以下。"
            }
          >
            <Input
              id="receipt"
              name="receipt"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              required={mode === "create"}
              className="h-auto py-2"
            />
          </Field>
        </>
      ) : null}

      <FieldError message={state.ok === false ? state.error : null} />

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="h-11 rounded-md px-4 text-sm text-ink-secondary hover:bg-surface-subtle sm:h-10"
          onClick={() => router.back()}
        >
          戻る
        </button>
        <SubmitButton
          className="h-11 w-full sm:h-10 sm:w-auto"
          pendingLabel="送信中…"
        >
          {mode === "resubmit" ? "修正して再申請" : "申請する"}
        </SubmitButton>
      </div>
    </form>
  );
}
