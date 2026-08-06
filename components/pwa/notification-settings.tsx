"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deactivatePushSubscription,
  isOwnPushSubscriptionActive,
  savePushSubscription,
} from "@/app/actions/push";
import { Button } from "@/components/ui/button";
import {
  getPublicVapidKey,
  isIosLike,
  isStandaloneDisplay,
  supportsWebPush,
  urlBase64ToUint8Array,
} from "@/lib/pwa/client";
import { cn } from "@/lib/utils";

type UiState =
  | "loading"
  | "enable"
  | "enabled"
  | "blocked"
  | "unsupported"
  | "need_homescreen"
  | "busy"
  | "error";

const DISMISS_INSTALL_KEY = "regapro_pwa_install_dismissed_at";

export function openInstallHintEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("regapro:show-install-hint"));
}

export function NotificationSettings({ className }: { className?: string }) {
  const [state, setState] = useState<UiState>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!supportsWebPush()) {
        setState("unsupported");
        return;
      }

      if (isIosLike() && !isStandaloneDisplay()) {
        setState("need_homescreen");
        return;
      }

      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub?.endpoint) {
        const active = await isOwnPushSubscriptionActive({
          endpoint: sub.endpoint,
        });
        setState(active ? "enabled" : "enable");
        return;
      }

      setState("enable");
    } catch {
      setState("unsupported");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = async () => {
    setMessage(null);
    setState("busy");

    try {
      if (!supportsWebPush()) {
        setState("unsupported");
        return;
      }

      if (isIosLike() && !isStandaloneDisplay()) {
        setState("need_homescreen");
        return;
      }

      const vapid = getPublicVapidKey();
      if (!vapid) {
        setState("error");
        setMessage("通知設定が未構成です。管理者にお問い合わせください。");
        return;
      }

      let reg = await navigator.serviceWorker.getRegistration("/");
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
      await navigator.serviceWorker.ready;

      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "blocked" : "enable");
          return;
        }
      }

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            vapid,
          ) as BufferSource,
        });
      }

      const json = subscription.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;

      if (!endpoint || !p256dh || !auth) {
        setState("error");
        setMessage("通知の登録に失敗しました。");
        return;
      }

      const result = await savePushSubscription({
        endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      });

      if (!result.ok) {
        setState("error");
        setMessage(result.error ?? "通知の登録に失敗しました。");
        return;
      }

      setState("enabled");
    } catch {
      setState("error");
      setMessage("通知の登録に失敗しました。");
    }
  };

  const disable = async () => {
    setMessage(null);
    setState("busy");

    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const subscription = reg
        ? await reg.pushManager.getSubscription()
        : null;

      const endpoint = subscription?.endpoint;

      try {
        if (subscription) {
          await subscription.unsubscribe();
        }
      } catch {
        // continue to server deactivate
      }

      if (endpoint) {
        await deactivatePushSubscription({ endpoint });
      }

      setState("enable");
    } catch {
      setState("error");
      setMessage("通知の解除に失敗しました。再試行してください。");
      await refresh();
    }
  };

  const label = (() => {
    switch (state) {
      case "loading":
        return "確認中…";
      case "busy":
        return "登録処理中";
      case "enable":
        return "通知を有効にする";
      case "enabled":
        return "通知有効";
      case "blocked":
        return "通知がブロックされています";
      case "unsupported":
        return "この端末では利用できません";
      case "need_homescreen":
        return "ホーム画面への追加が必要です";
      case "error":
        return "通知設定";
      default:
        return "通知設定";
    }
  })();

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        通知
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {state === "enable" || state === "error" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void enable()}
          >
            通知を有効にする
          </Button>
        ) : null}

        {state === "enabled" ? (
          <>
            <span className="text-[13px] text-ink">{label}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void disable()}
            >
              登録解除
            </Button>
          </>
        ) : null}

        {state === "busy" || state === "loading" ? (
          <span className="text-[13px] text-ink-muted">{label}</span>
        ) : null}

        {state === "blocked" ||
        state === "unsupported" ||
        state === "need_homescreen" ? (
          <span className="text-[13px] text-ink-secondary">{label}</span>
        ) : null}
      </div>

      {state === "need_homescreen" ? (
        <p className="text-[12px] leading-relaxed text-ink-muted">
          ホーム画面に追加後、ホーム画面のアイコンから起動してください。
          <button
            type="button"
            className="ml-1 text-primary underline-offset-2 hover:underline"
            onClick={() => {
              try {
                localStorage.removeItem(DISMISS_INSTALL_KEY);
              } catch {
                // ignore
              }
              openInstallHintEvent();
            }}
          >
            手順を表示
          </button>
        </p>
      ) : null}

      {state === "blocked" ? (
        <p className="text-[12px] leading-relaxed text-ink-muted">
          ブラウザのサイト設定から通知を許可してください。
        </p>
      ) : null}

      {message ? (
        <p className="text-[12px] text-destructive">{message}</p>
      ) : null}
    </div>
  );
}
