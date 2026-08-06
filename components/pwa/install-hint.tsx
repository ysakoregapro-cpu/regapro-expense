"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isIosLike, isStandaloneDisplay } from "@/lib/pwa/client";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "regapro_pwa_install_dismissed_at";
const DISMISS_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function PwaInstallHint({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [force, setForce] = useState(false);

  const evaluate = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) {
      setVisible(false);
      return;
    }

    const dismissOk = force || !wasDismissedRecently();
    if (!dismissOk) {
      setVisible(false);
      return;
    }

    if (isIosLike()) {
      setMode("ios");
      setVisible(true);
      return;
    }

    // Android / desktop Chromium: show only when we have beforeinstallprompt
    // or force from settings
    if (deferred || force) {
      setMode("android");
      setVisible(true);
      return;
    }

    setVisible(false);
  }, [deferred, force]);

  useEffect(() => {
    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    const onShow = () => {
      setForce(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("regapro:show-install-hint", onShow);
    window.addEventListener("appinstalled", () => {
      setDeferred(null);
      setVisible(false);
      markDismissed();
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("regapro:show-install-hint", onShow);
    };
  }, []);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  if (!visible || !mode) return null;

  const dismiss = () => {
    markDismissed();
    setForce(false);
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // ignore
    } finally {
      setDeferred(null);
      dismiss();
    }
  };

  return (
    <div
      className={cn(
        "border-b border-line bg-surface px-4 py-2.5",
        className,
      )}
      role="status"
    >
      <div className="mx-auto flex max-w-[1080px] items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">
            ホーム画面に追加
          </p>
          {mode === "ios" ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              Safari の共有ボタンから「ホーム画面に追加」を選び、追加したアイコンから起動してください。
            </p>
          ) : (
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
              アプリとしてインストールすると、閉じた状態でも通知を受け取れます。
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {mode === "android" && deferred ? (
            <Button type="button" size="sm" onClick={() => void install()}>
              追加する
            </Button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-subtle hover:text-ink"
            aria-label="閉じる"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
