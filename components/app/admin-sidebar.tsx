"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Inbox, Menu, X } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/app/brand-mark";
import { NotificationSettings } from "@/components/pwa/notification-settings";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/format";
import type { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const viewAll = searchParams.get("view") === "all";
  const onAdminHome = pathname === "/admin";

  const items = [
    {
      href: "/admin",
      label: "未確認申請",
      icon: Inbox,
      active: onAdminHome && !viewAll,
    },
    {
      href: "/admin?view=all",
      label: "全申請",
      icon: ClipboardList,
      active: onAdminHome && viewAll,
    },
  ];

  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <BrandMark size="sm" />
          <p className="text-[15px] font-bold text-ink">レガプロ経費申請</p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-secondary hover:bg-surface-subtle active:bg-surface-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-b border-line bg-surface px-2 py-2 lg:hidden">
          <nav className="space-y-1">
            {items.map((item) => (
              <SideLink
                key={item.href}
                {...item}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
          <UserBlock profile={profile} className="mt-3 border-t border-line pt-3" />
        </div>
      ) : null}

      <aside className="hidden w-[220px] shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
          <BrandMark />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-ink">
              レガプロ経費申請
            </p>
            <p className="text-[11px] text-ink-muted">承認管理</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {items.map((item) => (
            <SideLink key={item.href} {...item} />
          ))}
        </nav>
        <UserBlock
          profile={profile}
          className="border-t border-line p-3"
        />
      </aside>
    </>
  );
}

function SideLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex h-10 items-center gap-2.5 rounded-md px-3 text-[13px] text-ink-secondary transition-colors duration-ui hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active &&
            "bg-primary-soft font-semibold text-ink before:absolute before:left-0 before:top-1.5 before:h-[calc(100%-12px)] before:w-[3px] before:rounded-r before:bg-primary",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      {label}
    </Link>
  );
}

function UserBlock({
  profile,
  className,
}: {
  profile: Profile;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <NotificationSettings />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink">
            {profile.display_name}
          </p>
          <p className="text-[11px] text-ink-muted">{roleLabel(profile.role)}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm" className="shrink-0">
            ログアウト
          </Button>
        </form>
      </div>
    </div>
  );
}
