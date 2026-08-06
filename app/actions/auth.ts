"use server";

import { redirect } from "next/navigation";

import { homePathForRole } from "@/lib/auth/session";
import { normalizeLoginId } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/expense";

const GENERIC_LOGIN_ERROR = "ログインIDまたはパスワードが違います。";

export type LoginState = {
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

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
