"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  approveExpenseApplicationAction,
  returnExpenseApplicationAction,
} from "@/app/actions/expenses";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { StickyActionBar } from "@/components/app/sticky-action-bar";
import { Button } from "@/components/ui/button";

export function AdminReviewActions({
  applicationId,
  canReview,
}: {
  applicationId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [returnNote, setReturnNote] = useState("");
  const [approveNote, setApproveNote] = useState("");

  if (!canReview) {
    return (
      <StickyActionBar>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full sm:h-10 sm:w-auto"
          onClick={() => router.push("/admin")}
        >
          戻る
        </Button>
      </StickyActionBar>
    );
  }

  return (
    <StickyActionBar>
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full sm:h-10 sm:w-auto"
        onClick={() => router.push("/admin")}
      >
        戻る
      </Button>

      <ConfirmDialog
        title="申請を差し戻しますか？"
        description="差し戻し理由は申請者に表示されます。"
        confirmLabel="差し戻す"
        confirmVariant="warning"
        trigger={
          <Button
            type="button"
            variant="warning"
            className="h-11 w-full sm:h-10 sm:w-auto"
          >
            差し戻し
          </Button>
        }
        extra={
          <div className="flex flex-col gap-1.5">
            <label htmlFor="adminNote" className="text-sm font-medium text-ink">
              差し戻し理由 <span className="text-xs text-destructive">必須</span>
            </label>
            <textarea
              id="adminNote"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        }
        onConfirm={async () => {
          const result = await returnExpenseApplicationAction(
            applicationId,
            returnNote,
          );
          if (result.ok) {
            setReturnNote("");
            router.refresh();
          }
          return result;
        }}
      />

      <ConfirmDialog
        title="この申請を承認しますか？"
        description="承認後は申請者へ承認済みとして表示されます。"
        confirmLabel="承認する"
        confirmVariant="default"
        trigger={
          <Button type="button" className="h-11 w-full sm:h-10 sm:w-auto">
            承認
          </Button>
        }
        extra={
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="approveNote"
              className="text-sm font-medium text-ink"
            >
              備考（任意）
            </label>
            <textarea
              id="approveNote"
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="必要に応じて入力"
            />
          </div>
        }
        onConfirm={async () => {
          const result = await approveExpenseApplicationAction(
            applicationId,
            approveNote || null,
          );
          if (result.ok) {
            setApproveNote("");
            router.refresh();
          }
          return result;
        }}
      />
    </StickyActionBar>
  );
}
