"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Field, FieldError, FormSection } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { Button } from "@/components/ui/button";
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
  applicantName?: string;
};

const initial: ActionResult = { ok: true };

const selectClass =
  "control-base appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-9";
const selectArrow =
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%235F6C78%22 stroke-width=%221.5%22%3E%3Cpath d=%22m2 4 4 4 4-4%22/%3E%3C/svg%3E')]";

export function ExpenseForm({
  categories,
  mode,
  application,
  applicantName,
}: Props) {
  const router = useRouter();
  const [applicationType, setApplicationType] = useState<"advance" | "after">(
    application?.application_type ?? "after",
  );
  const [receiptName, setReceiptName] = useState<string | null>(null);

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
    <form action={formAction} className="flex w-full flex-col pb-form-sticky md:pb-0">
      {applicantName ? (
        <p className="mb-4 text-[12px] text-ink-muted">
          申請者{" "}
          <span className="font-medium text-ink-secondary">{applicantName}</span>
        </p>
      ) : null}

      <div className="space-y-6">
        <FormSection index="1" title="申請内容">
          <Field label="申請区分" htmlFor="applicationType" required>
            <select
              id="applicationType"
              name="applicationType"
              value={applicationType}
              onChange={(e) =>
                setApplicationType(e.target.value as "advance" | "after")
              }
              className={`${selectClass} ${selectArrow}`}
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
              className={`${selectClass} ${selectArrow}`}
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

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="金額" htmlFor="amount" required>
              <div className="relative">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  step={1}
                  required
                  defaultValue={application?.amount ?? ""}
                  className="amount-cell pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-ink-muted">
                  円
                </span>
              </div>
            </Field>
            <Field label="発生日または利用予定日" htmlFor="expenseDate" required>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                required
                defaultValue={application?.expense_date ?? ""}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          index="2"
          title="利用目的"
          description={
            applicationType === "after"
              ? "事後申請の場合は理由も記入してください。"
              : undefined
          }
        >
          <Field label="内容・目的" htmlFor="description" required>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              defaultValue={application?.description ?? ""}
              className="control-base h-auto min-h-[88px] resize-y py-2.5"
            />
          </Field>

          {applicationType === "after" ? (
            <Field
              label="事後になった理由"
              htmlFor="afterReason"
              required
              hint="事後になった事情を簡潔に記入してください。"
            >
              <textarea
                id="afterReason"
                name="afterReason"
                required
                rows={2}
                defaultValue={application?.after_reason ?? ""}
                className="control-base h-auto min-h-[72px] resize-y py-2.5"
              />
            </Field>
          ) : null}
        </FormSection>

        {applicationType === "after" ? (
          <FormSection
            index="3"
            title="証憑"
            description="JPEG / PNG / WebP / PDF、10MB以下。カメラ撮影も利用できます。"
          >
            <Field
              label="領収書"
              htmlFor="receipt"
              required={mode === "create" || !application?.receipt_path}
              hint={
                mode === "resubmit" && application?.receipt_path
                  ? "新しいファイルを選ぶと差し替えます。未選択の場合は現在の領収書を維持します。"
                  : undefined
              }
            >
              <Input
                id="receipt"
                name="receipt"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*,application/pdf"
                required={mode === "create"}
                className="h-auto py-2.5 file:mr-3 file:rounded file:border-0 file:bg-primary-soft file:px-2.5 file:py-1.5 file:text-[13px] file:font-medium file:text-primary"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setReceiptName(file ? file.name : null);
                }}
              />
              {receiptName ? (
                <p className="mt-1.5 break-all text-[12px] text-ink-secondary">
                  選択中: {receiptName}
                </p>
              ) : mode === "resubmit" && application?.receipt_path ? (
                <p className="mt-1.5 text-[12px] text-ink-muted">
                  現在の領収書を維持します
                </p>
              ) : null}
            </Field>
          </FormSection>
        ) : null}
      </div>

      <div className="mt-4">
        <FieldError message={state.ok === false ? state.error : null} />
      </div>

      <div className="sticky-surface fixed inset-x-0 bottom-0 z-30 px-4 pt-3 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex w-full max-w-[800px] flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full md:h-10 md:w-auto"
            onClick={() => router.back()}
          >
            戻る
          </Button>
          <SubmitButton
            className="h-12 w-full px-5 md:h-10 md:w-auto"
            size="lg"
            pendingLabel="送信中…"
          >
            {mode === "resubmit" ? "修正して再申請" : "申請する"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
