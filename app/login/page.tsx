import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/app/login-form";
import { AppShell } from "@/components/app/app-shell";
import { BrandMark } from "@/components/app/brand-mark";
import { LoadingState } from "@/components/app/loading-state";
import {
  getCurrentProfile,
  homePathForRole,
} from "@/lib/auth/session";

async function LoginContent() {
  const profile = await getCurrentProfile();
  if (profile?.is_active) {
    redirect(homePathForRole(profile.role));
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 flex flex-col items-center text-center">
        <BrandMark className="mb-3" />
        <p className="text-[18px] font-bold text-ink">レガプロ経費申請</p>
        <p className="mt-1 text-[13px] text-ink-secondary">
          社内経費の申請と承認
        </p>
      </div>
      <div className="border border-line bg-surface px-5 py-5 sm:rounded-lg">
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppShell className="flex min-h-svh items-center justify-center px-4 py-8">
      <Suspense fallback={<LoadingState />}>
        <LoginContent />
      </Suspense>
    </AppShell>
  );
}
