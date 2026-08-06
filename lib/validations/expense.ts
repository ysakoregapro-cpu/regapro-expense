import { z } from "zod";

export const loginSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(1, "ログインIDを入力してください")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const receiptMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export const expenseFormSchema = z
  .object({
    applicationType: z.enum(["advance", "after"]),
    categoryId: z.coerce.number().int().positive("経費項目を選択してください"),
    amount: z.coerce
      .number()
      .int("金額は整数で入力してください")
      .positive("金額は1円以上で入力してください"),
    expenseDate: z
      .string()
      .min(1, "日付を入力してください")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません"),
    description: z
      .string()
      .trim()
      .min(1, "内容・目的を入力してください"),
    afterReason: z.string().trim().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.applicationType === "after") {
      if (!data.afterReason || data.afterReason.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["afterReason"],
          message: "事後になった理由を入力してください",
        });
      }
    }
  });

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function isAllowedReceiptFile(file: File): boolean {
  if (file.size <= 0 || file.size > MAX_RECEIPT_BYTES) return false;
  return (receiptMimeTypes as readonly string[]).includes(file.type);
}

export const returnNoteSchema = z.object({
  applicationId: z.string().uuid(),
  adminNote: z
    .string()
    .trim()
    .min(1, "差し戻し理由を入力してください"),
});

export const approveSchema = z.object({
  applicationId: z.string().uuid(),
  adminNote: z.string().trim().optional().nullable(),
});
