import { Suspense } from "react";

import { AdminHeader } from "@/components/app/admin-header";
import { AdminSidebar } from "@/components/app/admin-sidebar";
import { AppShell } from "@/components/app/app-shell";
import { LoadingState } from "@/components/app/loading-state";
import { requireAdmin } from "@/lib/auth/session";

async function AdminFrame({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <AppShell>
      <div className="flex min-h-svh flex-col lg:flex-row">
        <Suspense fallback={<LoadingState className="p-4" />}>
          <AdminSidebar />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader profile={profile} />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 lg:px-5">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <AppShell className="flex min-h-svh items-center justify-center">
          <LoadingState />
        </AppShell>
      }
    >
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}
