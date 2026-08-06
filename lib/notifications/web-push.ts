import "server-only";

import webpush from "web-push";

let configured = false;

export type PushSubscriptionKeys = {
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

function configureWebPush() {
  if (configured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    console.error("Web Push VAPID env is incomplete");
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type SendPushResult =
  | { ok: true; statusCode?: number }
  | {
      ok: false;
      statusCode?: number;
      errorCode?: string;
      errorMessage?: string;
      expired?: boolean;
    };

export async function sendWebPush(
  subscription: PushSubscriptionKeys,
  payload: unknown,
): Promise<SendPushResult> {
  if (!configureWebPush()) {
    return {
      ok: false,
      errorCode: "vapid_missing",
      errorMessage: "VAPID configuration missing",
    };
  }

  try {
    const result = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth_key,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60 * 12,
        urgency: "normal",
      },
    );

    return { ok: true, statusCode: result.statusCode };
  } catch (err) {
    const statusCode =
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : undefined;

    const expired = statusCode === 404 || statusCode === 410;
    const bodyMessage =
      typeof err === "object" &&
      err !== null &&
      "body" in err &&
      typeof (err as { body?: unknown }).body === "string"
        ? (err as { body: string }).body.slice(0, 200)
        : err instanceof Error
          ? err.message.slice(0, 200)
          : "push_send_failed";

    console.error("Web Push send failed", {
      statusCode,
      expired,
      message: bodyMessage,
    });

    return {
      ok: false,
      statusCode,
      errorCode: expired ? "subscription_expired" : "push_failed",
      errorMessage: bodyMessage,
      expired,
    };
  }
}
