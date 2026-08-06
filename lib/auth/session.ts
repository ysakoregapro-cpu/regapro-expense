import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types/database";

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return data.claims.sub as string;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, login_id, display_name, role, is_active, last_login_at, created_at, updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to load profile", { userId, code: error?.code });
    return null;
  }

  return data as Profile;
}

export function isAdminRole(role: AppRole): boolean {
  return role === "admin" || role === "system_admin";
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    redirect("/login");
  }
  return profile;
}

export async function requireApplicant(): Promise<Profile> {
  const profile = await requireProfile();
  if (isAdminRole(profile.role)) {
    redirect("/admin");
  }
  if (profile.role !== "applicant") {
    redirect("/login");
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (!isAdminRole(profile.role)) {
    redirect("/app");
  }
  return profile;
}

export function homePathForRole(role: AppRole): string {
  return isAdminRole(role) ? "/admin" : "/app";
}
