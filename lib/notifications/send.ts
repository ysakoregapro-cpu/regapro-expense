import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ExpenseApplication } from "@/lib/types/database";
import {
  buildExpensePushPayload,
  type NotificationEventType,
} from "@/lib/notifications/payloads";
import { sendWebPush } from "@/lib/notifications/web-push";

type DeliveryStatus = "sent" | "failed" | "skipped" | "expired";

type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  is_active: boolean;
};

async function logDelivery(input: {
  applicationId: string;
  recipientUserId: string | null;
  subscriptionId: string | null;
  eventType: NotificationEventType;
  status: DeliveryStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("notification_delivery_logs").insert({
      application_id: input.applicationId,
      recipient_user_id: input.recipientUserId,
      subscription_id: input.subscriptionId,
      event_type: input.eventType,
      channel: "web_push",
      status: input.status,
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
    });
  } catch (err) {
    console.error("Failed to write notification_delivery_logs", {
      eventType: input.eventType,
      status: input.status,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

async function getAdminRecipientIds(): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["admin", "system_admin"])
    .eq("is_active", true);

  if (error) {
    console.error("Failed to load admin recipients", { code: error.code });
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
}

async function getBadgeCountForUser(
  userId: string,
  role: "admin" | "applicant",
): Promise<number> {
  const admin = createAdminClient();

  if (role === "admin") {
    const { count, error } = await admin
      .from("expense_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (error) {
      console.error("Failed to count pending for badge", { code: error.code });
      return 0;
    }
    return count ?? 0;
  }

  const { count, error } = await admin
    .from("expense_applications")
    .select("id", { count: "exact", head: true })
    .eq("applicant_id", userId)
    .eq("status", "returned");
  if (error) {
    console.error("Failed to count returned for badge", { code: error.code });
    return 0;
  }
  return count ?? 0;
}

async function loadApplication(
  applicationId: string,
): Promise<ExpenseApplication | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("expense_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to load application for notification", {
      applicationId,
      code: error?.code,
    });
    return null;
  }

  return data as ExpenseApplication;
}

async function getActiveSubscriptions(
  userId: string,
): Promise<PushSubscriptionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth_key, is_active")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to load push subscriptions", {
      code: error.code,
    });
    return [];
  }

  return (data ?? []) as PushSubscriptionRow[];
}

async function deactivateSubscription(subscriptionId: string) {
  try {
    const admin = createAdminClient();
    await admin
      .from("push_subscriptions")
      .update({ is_active: false })
      .eq("id", subscriptionId);
  } catch (err) {
    console.error("Failed to deactivate subscription", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

async function notifyUser(input: {
  eventType: NotificationEventType;
  application: ExpenseApplication;
  userId: string;
  badgeRole: "admin" | "applicant";
}) {
  const subscriptions = await getActiveSubscriptions(input.userId);
  if (subscriptions.length === 0) {
    await logDelivery({
      applicationId: input.application.id,
      recipientUserId: input.userId,
      subscriptionId: null,
      eventType: input.eventType,
      status: "skipped",
      errorCode: "no_subscription",
      errorMessage: "No active push subscription",
    });
    return;
  }

  const badgeCount = await getBadgeCountForUser(input.userId, input.badgeRole);
  const payload = buildExpensePushPayload(
    input.eventType,
    input.application,
    badgeCount,
  );

  for (const subscription of subscriptions) {
    const result = await sendWebPush(subscription, payload);

    if (result.ok) {
      await logDelivery({
        applicationId: input.application.id,
        recipientUserId: input.userId,
        subscriptionId: subscription.id,
        eventType: input.eventType,
        status: "sent",
      });
      continue;
    }

    if (result.expired) {
      await deactivateSubscription(subscription.id);
      await logDelivery({
        applicationId: input.application.id,
        recipientUserId: input.userId,
        subscriptionId: subscription.id,
        eventType: input.eventType,
        status: "expired",
        errorCode: result.errorCode ?? "subscription_expired",
        errorMessage: result.errorMessage ?? null,
      });
      continue;
    }

    await logDelivery({
      applicationId: input.application.id,
      recipientUserId: input.userId,
      subscriptionId: subscription.id,
      eventType: input.eventType,
      status: "failed",
      errorCode: result.errorCode ?? "push_failed",
      errorMessage: result.errorMessage ?? null,
    });
  }
}

/**
 * Best-effort Web Push notification after a successful expense workflow step.
 * Never throw — callers must isolate this from core business success.
 */
export async function notifyExpenseEvent(
  eventType: NotificationEventType,
  applicationId: string,
): Promise<void> {
  try {
    const application = await loadApplication(applicationId);
    if (!application) {
      await logDelivery({
        applicationId,
        recipientUserId: null,
        subscriptionId: null,
        eventType,
        status: "skipped",
        errorCode: "application_missing",
        errorMessage: "Application not found for notification",
      });
      return;
    }

    if (eventType === "submitted" || eventType === "resubmitted") {
      const adminIds = await getAdminRecipientIds();
      if (adminIds.length === 0) {
        await logDelivery({
          applicationId,
          recipientUserId: null,
          subscriptionId: null,
          eventType,
          status: "skipped",
          errorCode: "no_recipients",
          errorMessage: "No active admin recipients",
        });
        return;
      }

      for (const userId of adminIds) {
        await notifyUser({
          eventType,
          application,
          userId,
          badgeRole: "admin",
        });
      }
      return;
    }

    // approved / returned → applicant (active only)
    const admin = createAdminClient();
    const { data: applicantProfile } = await admin
      .from("profiles")
      .select("id, is_active")
      .eq("id", application.applicant_id)
      .maybeSingle();

    if (!applicantProfile?.is_active) {
      await logDelivery({
        applicationId,
        recipientUserId: application.applicant_id,
        subscriptionId: null,
        eventType,
        status: "skipped",
        errorCode: "inactive_user",
        errorMessage: "Recipient is inactive",
      });
      return;
    }

    await notifyUser({
      eventType,
      application,
      userId: application.applicant_id,
      badgeRole: "applicant",
    });
  } catch (err) {
    console.error("notifyExpenseEvent failed", {
      eventType,
      applicationId,
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}
