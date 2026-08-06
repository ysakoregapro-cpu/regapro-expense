import { Suspense } from "react";
import { redirect } from "next/navigation";

import {
  getCurrentProfile,
  homePathForRole,
} from "@/lib/auth/session";
import { LoadingState } from "@/components/app/loading-state";
import { AppShell } from "@/components/app/app-shell";

async function HomeRedirect(): Promise<React.ReactNode> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    redirect("/login");
  }
  redirect(homePathForRole(profile.role));
}

export default function HomePage() {
  return (
    <AppShell className="flex min-h-svh items-center justify-center">
      <Suspense fallback={<LoadingState />}>
        <HomeRedirect />
      </Suspense>
    </AppShell>
  );
}
