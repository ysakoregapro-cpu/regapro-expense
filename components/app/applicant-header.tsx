"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/app/brand-mark";
import { NotificationSettings } from "@/components/pwa/notification-settings";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/format";
import type { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function ApplicantHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/app", label: "申請一覧", exact: true },
    { href: "/app/new", label: "新規申請", exact: false },
  ];

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

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] text-ink-secondary transition-colors duration-ui hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active &&
                    "font-semibold text-ink after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[2px] after:bg-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-3 border-l border-line pl-3 md:flex">
            <NotificationSettings className="max-w-[220px]" />
            <div className="text-right">
              <p className="text-[13px] font-medium leading-tight text-ink">
                {profile.display_name}
              </p>
              <p className="text-[11px] text-ink-muted">
                {roleLabel(profile.role)}
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                ログアウト
              </Button>
            </form>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-secondary transition-colors duration-ui hover:bg-surface-subtle hover:text-ink active:bg-surface-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-ink hover:bg-surface-subtle"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-line pt-3">
            <NotificationSettings />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {profile.display_name}
              </p>
              <p className="text-xs text-ink-muted">{roleLabel(profile.role)}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}
