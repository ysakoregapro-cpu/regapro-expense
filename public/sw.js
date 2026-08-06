/* Service Worker — no offline cache (auth/DB apps must not show stale data). */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function safeParsePayload(raw) {
  if (!raw) return {};
  try {
    const text = typeof raw === "string" ? raw : String(raw);
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore
  }
  return {};
}

function sanitizePath(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) {
    return "/";
  }
  try {
    const resolved = new URL(url, self.location.origin);
    if (resolved.origin !== self.location.origin) return "/";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}

async function applyBadge(badgeCount) {
  try {
    if (typeof badgeCount !== "number" || !Number.isFinite(badgeCount)) return;
    if (!("setAppBadge" in navigator)) return;
    if (badgeCount > 0) {
      await navigator.setAppBadge(Math.floor(badgeCount));
    } else if ("clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
    }
  } catch {
    // badge is best-effort
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = safeParsePayload(event.data ? event.data.text() : null);
      } catch {
        payload = {};
      }

      const title =
        typeof payload.title === "string" && payload.title
          ? payload.title
          : "レガプロ経費申請";
      const body =
        typeof payload.body === "string" && payload.body
          ? payload.body
          : "新しい通知があります";
      const url = sanitizePath(payload.url);
      const tag =
        typeof payload.tag === "string" && payload.tag
          ? payload.tag
          : "expense-notification";
      const icon =
        typeof payload.icon === "string" && payload.icon.startsWith("/")
          ? payload.icon
          : "/icons/icon-192.png";
      const badge =
        typeof payload.badge === "string" && payload.badge.startsWith("/")
          ? payload.badge
          : "/icons/badge-96.png";

      try {
        await applyBadge(payload.badgeCount);
      } catch {
        // continue
      }

      try {
        await self.registration.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          data: { url },
          renotify: true,
        });
      } catch (err) {
        try {
          await self.registration.showNotification(title, {
            body,
            data: { url },
          });
        } catch {
          console.error("sw push notification failed", {
            name: err && err.name,
          });
        }
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl =
    event.notification &&
    event.notification.data &&
    event.notification.data.url;
  const targetUrl = sanitizePath(rawUrl);

  event.waitUntil(
    (async () => {
      try {
        const allClients = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of allClients) {
          if ("focus" in client) {
            try {
              const clientUrl = new URL(client.url);
              if (clientUrl.origin === self.location.origin) {
                await client.focus();
                if (
                  "navigate" in client &&
                  typeof client.navigate === "function"
                ) {
                  try {
                    await client.navigate(targetUrl);
                  } catch {
                    // focus only
                  }
                }
                return;
              }
            } catch {
              // ignore client
            }
          }
        }
        if (clients.openWindow) {
          await clients.openWindow(targetUrl);
        }
      } catch (err) {
        console.error("sw notificationclick failed", {
          name: err && err.name,
        });
      }
    })(),
  );
});
