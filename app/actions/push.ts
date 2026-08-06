"use server";

import {
  getAuthUserId,
  getCurrentProfile,
  isAdminRole,
} from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PushActionResult = {
  ok: boolean;
  error?: string;
};

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}): Promise<PushActionResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { ok: false, error: "ログインが必要です。" };
  }

  const endpoint = input.endpoint?.trim();
  const p256dh = input.p256dh?.trim();
  const auth = input.auth?.trim();

  if (!endpoint || !p256dh || !auth || !endpoint.startsWith("https://")) {
    return { ok: false, error: "通知の登録に失敗しました。" };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("endpoint", endpoint)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        p256dh,
        auth_key: auth,
        user_agent: input.userAgent ?? null,
        is_active: true,
        last_seen_at: now,
      })
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (error) {
      console.error("push subscription update failed", { code: error.code });
      return { ok: false, error: "通知の登録に失敗しました。" };
    }
    return { ok: true };
  }

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: userId,
    endpoint,
    p256dh,
    auth_key: auth,
    user_agent: input.userAgent ?? null,
    is_active: true,
    last_seen_at: now,
  });

  if (!error) {
    return { ok: true };
  }

  // Endpoint may already belong to another account on this device (unique).
  // Reassign via admin using the authenticated session user only.
  if (error.code === "23505") {
    try {
      const admin = createAdminClient();
      const { error: adminError } = await admin
        .from("push_subscriptions")
        .update({
          user_id: userId,
          p256dh,
          auth_key: auth,
          user_agent: input.userAgent ?? null,
          is_active: true,
          last_seen_at: now,
        })
        .eq("endpoint", endpoint);

      if (adminError) {
        console.error("push subscription reassign failed", {
          code: adminError.code,
        });
        return { ok: false, error: "通知の登録に失敗しました。" };
      }
      return { ok: true };
    } catch (err) {
      console.error("push subscription reassign exception", {
        message: err instanceof Error ? err.message : "unknown",
      });
      return { ok: false, error: "通知の登録に失敗しました。" };
    }
  }

  console.error("push subscription insert failed", { code: error.code });
  return { ok: false, error: "通知の登録に失敗しました。" };
}

export async function deactivatePushSubscription(input: {
  endpoint: string;
}): Promise<PushActionResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { ok: false, error: "ログインが必要です。" };
  }

  const endpoint = input.endpoint?.trim();
  if (!endpoint) {
    return { ok: false, error: "通知の解除に失敗しました。" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("endpoint", endpoint);

  if (error) {
    console.error("push subscription deactivate failed", { code: error.code });
    return { ok: false, error: "通知の解除に失敗しました。" };
  }

  return { ok: true };
}

export async function getActionBadgeCount(): Promise<number> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active) return 0;

    const supabase = await createClient();

    if (isAdminRole(profile.role)) {
      const { count, error } = await supabase
        .from("expense_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) return 0;
      return count ?? 0;
    }

    const { count, error } = await supabase
      .from("expense_applications")
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", profile.id)
      .eq("status", "returned");
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
