"use client";

import { useEffect } from "react";

import { getActionBadgeCount } from "@/app/actions/push";

async function applyBadge(count: number) {
  try {
    if (!("setAppBadge" in navigator)) return;
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else if ("clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
    }
  } catch {
    // best-effort
  }
}

export function AppBadgeSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const count = await getActionBadgeCount();
        if (!cancelled) await applyBadge(count);
      } catch {
        // ignore
      }
    };

    void sync();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
