"use server";

import { redirect } from "next/navigation";

import { getAuthUserId, homePathForRole } from "@/lib/auth/session";
import { normalizeLoginId } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/expense";

const GENERIC_LOGIN_ERROR = "ログインIDまたはパスワードが違います。";

export type LoginState = {
  error?: string;
};

export type LogoutResult = {
  ok: boolean;
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    loginId: formData.get("loginId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const loginId = normalizeLoginId(parsed.data.loginId);
  const password = parsed.data.password;

  try {
    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, role, is_active")
      .eq("login_id", loginId)
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      if (profileError) {
        console.error("Login profile lookup failed", {
          code: profileError.code,
        });
      }
      return { error: GENERIC_LOGIN_ERROR };
    }

    const { data: authUserData, error: authUserError } =
      await admin.auth.admin.getUserById(profile.id);

    const email = authUserData?.user?.email;
    if (authUserError || !email) {
      console.error("Login auth user lookup failed", {
        code: authUserError?.message,
      });
      return { error: GENERIC_LOGIN_ERROR };
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Login sign-in failed", { code: signInError.code });
      return { error: GENERIC_LOGIN_ERROR };
    }

    const { error: touchError } = await admin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (touchError) {
      console.error("last_login_at update failed", {
        code: touchError.code,
        userId: profile.id,
      });
    }

    redirect(homePathForRole(profile.role));
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("Login unexpected error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { error: GENERIC_LOGIN_ERROR };
  }
}

/**
 * Clears the current-device Auth session (local scope) and auth cookies.
 * Optionally deactivates this device's push_subscriptions row first.
 * Does not call PushSubscription.unsubscribe() and does not change
 * Notification.permission. Other devices' sessions are kept.
 * Caller must navigate with window.location.replace('/login').
 */
export async function logoutAction(input?: {
  endpoint?: string | null;
}): Promise<LogoutResult> {
  try {
    // 1. Deactivate this device's Web Push row (best-effort; never block logout).
    const endpoint = input?.endpoint?.trim();
    if (endpoint && endpoint.startsWith("https://")) {
      try {
        const userId = await getAuthUserId();
        if (userId) {
          const supabaseForPush = await createClient();
          const { error: pushError } = await supabaseForPush
            .from("push_subscriptions")
            .update({ is_active: false })
            .eq("user_id", userId)
            .eq("endpoint", endpoint);

          if (pushError) {
            console.error("Logout push deactivate failed", {
              code: pushError.code,
            });
          }
        }
      } catch {
        console.error("Logout push deactivate exception");
      }
    }

    // 2. Sign out local session only (other devices stay signed in).
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error("Logout signOut failed", { message: error.message });
      return { ok: false, error: "ログアウトに失敗しました。" };
    }

    // 3. Ensure auth cookies are cleared even if signOut partially fails.
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      for (const cookie of cookieStore.getAll()) {
        if (cookie.name.startsWith("sb-")) {
          cookieStore.set(cookie.name, "", {
            path: "/",
            maxAge: 0,
          });
        }
      }
    } catch (cookieErr) {
      console.error("Logout cookie clear failed", {
        message:
          cookieErr instanceof Error ? cookieErr.message : "unknown",
      });
    }

    return { ok: true };
  } catch (err) {
    console.error("Logout unexpected error", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, error: "ログアウトに失敗しました。" };
  }
}
