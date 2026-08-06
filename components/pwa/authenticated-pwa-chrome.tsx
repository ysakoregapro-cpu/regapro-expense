"use client";

import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AppBadgeSync } from "@/components/pwa/app-badge-sync";
import { PwaInstallHint } from "@/components/pwa/install-hint";

export function AuthenticatedPwaChrome() {
  return (
    <>
      <ServiceWorkerRegister />
      <AppBadgeSync />
      <PwaInstallHint />
    </>
  );
}
