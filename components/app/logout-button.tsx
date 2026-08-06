"use client";

import { useState, useTransition } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function getCurrentPushEndpoint(): Promise<string | null> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null;
    }
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg) return null;
    const subscription = await reg.pushManager.getSubscription();
    const endpoint = subscription?.endpoint?.trim();
    if (!endpoint || !endpoint.startsWith("https://")) return null;
    return endpoint;
  } catch {
    return null;
  }
}

export function LogoutButton({
  className,
  size = "sm",
  onBeforeLogout,
}: {
  className?: string;
  size?: "sm" | "default" | "compact";
  onBeforeLogout?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    if (pending) return;
    setError(null);
    onBeforeLogout?.();

    startTransition(async () => {
      try {
        // Order: deactivate this device push row → local signOut → cookies → replace
        const endpoint = await getCurrentPushEndpoint();
        const result = await logoutAction({ endpoint });
        if (!result.ok) {
          setError(result.error ?? "ログアウトに失敗しました。");
          return;
        }
        // Hard replace: clears history entry so back cannot reopen auth screens.
        window.location.replace("/login");
      } catch {
        setError("ログアウトに失敗しました。");
      }
    });
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size={size}
        disabled={pending}
        onClick={handleLogout}
        aria-busy={pending}
      >
        {pending ? "処理中…" : "ログアウト"}
      </Button>
      {error ? (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
