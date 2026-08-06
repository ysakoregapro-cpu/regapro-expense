"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandMark } from "@/components/app/brand-mark";
import { LogoutButton } from "@/components/app/logout-button";
import { NotificationSettings } from "@/components/pwa/notification-settings";
import { roleLabel } from "@/lib/format";
import type { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "ホーム", match: "exact" as const },
  { href: "/app/new", label: "新規申請", match: "prefix" as const },
  {
    href: "/app/applications",
    label: "全申請",
    match: "applications" as const,
  },
  { href: "/app/history", label: "申請履歴", match: "prefix" as const },
];

function isActive(pathname: string, link: (typeof links)[number]) {
  if (link.match === "exact") return pathname === link.href;
  if (link.match === "applications") {
    return pathname === "/app/applications";
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function ApplicantHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between gap-3 px-4 lg:h-14">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold leading-none text-ink">
              レガプロ経費申請
            </p>
            <p className="mt-0.5 hidden text-[11px] text-ink-muted sm:block">
              {roleLabel(profile.role)}
            </p>
          </div>
        </div>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="申請者メニュー"
        >
          {links.map((link) => {
            const active = isActive(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-[13px] text-ink-secondary transition-colors duration-ui hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active &&
                    "font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-[13px] after:h-[2px] after:bg-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-3 border-l border-line pl-3 md:flex">
            <div className="hidden xl:block">
              <NotificationSettings className="max-w-[220px]" />
            </div>
            <div className="text-right">
              <p className="text-[13px] font-medium leading-tight text-ink">
                {profile.display_name}
              </p>
              <p className="text-[11px] text-ink-muted">
                {roleLabel(profile.role)}
              </p>
            </div>
            <LogoutButton />
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-secondary transition-colors duration-ui hover:bg-surface-subtle hover:text-ink active:bg-surface-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="申請者メニュー">
            {links.map((link) => {
              const active = isActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm text-ink hover:bg-surface-subtle",
                    active && "bg-primary-soft font-semibold",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-line pt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              通知設定
            </p>
            <NotificationSettings />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {profile.display_name}
              </p>
              <p className="text-xs text-ink-muted">{roleLabel(profile.role)}</p>
            </div>
            <LogoutButton onBeforeLogout={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
