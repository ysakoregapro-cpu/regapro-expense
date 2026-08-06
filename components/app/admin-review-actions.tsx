"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  approveExpenseApplicationAction,
  returnExpenseApplicationAction,
} from "@/app/actions/expenses";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { StatusBadge } from "@/components/app/status-badge";
import { StickyActionBar } from "@/components/app/sticky-action-bar";
import { Button } from "@/components/ui/button";
import type { ExpenseStatus } from "@/lib/types/database";

export function AdminReviewActions({
  applicationId,
  applicationNo,
  status,
  canReview,
}: {
  applicationId: string;
  applicationNo: string;
  status: ExpenseStatus;
  canReview: boolean;
}) {
  const router = useRouter();
  const [returnNote, setReturnNote] = useState("");
  const [approveNote, setApproveNote] = useState("");

  return (
    <StickyActionBar>
      <div className="mb-1 flex flex-wrap items-center gap-2 sm:mb-0 sm:mr-auto">
        <span className="app-no break-all text-ink-muted">{applicationNo}</span>
        <StatusBadge status={status} />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="h-12 w-full sm:h-10 sm:w-auto"
        onClick={() => router.push("/admin")}
      >
        戻る
      </Button>

      {canReview ? (
        <>
          <ConfirmDialog
            title="申請を差し戻しますか？"
            description="差し戻し理由は申請者に表示されます。"
            confirmLabel="差し戻す"
            confirmVariant="warning"
            trigger={
              <Button
                type="button"
                variant="warning"
                className="h-12 w-full sm:h-10 sm:w-auto"
              >
                差し戻し
              </Button>
            }
            extra={
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="adminNote"
                  className="text-[13px] font-semibold text-ink"
                >
                  差し戻し理由{" "}
                  <span className="text-[10px] font-medium text-ink-muted">
                    必須
                  </span>
                </label>
                <textarea
                  id="adminNote"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  rows={3}
                  className="control-base h-auto min-h-[96px] py-2.5"
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
              <Button type="button" className="h-12 w-full sm:h-10 sm:w-auto">
                承認
              </Button>
            }
            extra={
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="approveNote"
                  className="text-[13px] font-semibold text-ink"
                >
                  備考（任意）
                </label>
                <textarea
                  id="approveNote"
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  rows={2}
                  className="control-base h-auto min-h-[72px] py-2.5"
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
        </>
      ) : null}
    </StickyActionBar>
  );
}
