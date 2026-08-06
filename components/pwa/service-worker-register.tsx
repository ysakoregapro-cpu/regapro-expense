"use client";

import { useEffect, useRef } from "react";

const SW_PATH = "/sw.js";

function isLocalhostHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

export function ServiceWorkerRegister() {
  const registering = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const { protocol, hostname } = window.location;
    const allow =
      protocol === "https:" || isLocalhostHost(hostname);
    if (!allow) return;
    if (registering.current) return;
    registering.current = true;

    let cancelled = false;

    (async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration("/");
        if (existing) {
          // Soft update check — do not force reload loops
          try {
            await existing.update();
          } catch {
            // ignore update errors
          }
          return;
        }

        if (cancelled) return;
        await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
      } catch (err) {
        console.error("Service Worker registration failed", {
          name: err instanceof Error ? err.name : "unknown",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
