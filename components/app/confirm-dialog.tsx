"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  onConfirm,
  extra,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: "default" | "warning" | "secondary";
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content
          className={cn(
            "fixed z-50 border border-line bg-surface shadow-float focus:outline-none",
            // Mobile: bottom sheet — stays usable with keyboard
            "inset-x-0 bottom-0 max-h-[min(90dvh,100%)] w-full overflow-y-auto rounded-t-[10px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
            // Tablet/desktop: centered dialog
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-dialog sm:p-5",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-[16px] font-semibold text-ink">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-2 text-[13px] text-ink-secondary">
              {description}
            </Dialog.Description>
          ) : null}
          {extra ? <div className="mt-4">{extra}</div> : null}
          {error ? (
            <p className="mt-3 text-[13px] text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-12 sm:h-10"
                disabled={pending}
              >
                キャンセル
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant={confirmVariant}
              className="h-12 sm:h-10"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await onConfirm();
                  if (!result.ok) {
                    setError(result.error ?? "処理に失敗しました。");
                    return;
                  }
                  setOpen(false);
                });
              }}
            >
              {pending ? "処理中…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
