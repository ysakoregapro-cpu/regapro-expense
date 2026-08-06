import { Suspense } from "react";

import { ApplicantHeader } from "@/components/app/applicant-header";
import { AppShell } from "@/components/app/app-shell";
import { LoadingState } from "@/components/app/loading-state";
import { requireApplicant } from "@/lib/auth/session";

async function ApplicantFrame({ children }: { children: React.ReactNode }) {
  const profile = await requireApplicant();

  return (
    <AppShell>
      <ApplicantHeader profile={profile} />
      <main className="mx-auto w-full max-w-[1080px] px-4 py-4 md:px-6 md:py-5">{children}</main>
    </AppShell>
  );
}

export default function ApplicantLayout({
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
      <ApplicantFrame>{children}</ApplicantFrame>
    </Suspense>
  );
}
