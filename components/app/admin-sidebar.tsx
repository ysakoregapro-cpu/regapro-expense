"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const viewAll = searchParams.get("view") === "all";
  const onAdminHome = pathname === "/admin";

  const items = [
    {
      href: "/admin",
      label: "未確認申請",
      active: onAdminHome && !viewAll,
    },
    {
      href: "/admin?view=all",
      label: "全申請",
      active: onAdminHome && viewAll,
    },
  ];

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <p className="text-sm font-semibold text-ink">レガプロ経費申請</p>
        <button
          type="button"
          className="rounded-md p-2 text-ink-secondary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="space-y-1 border-b border-line bg-surface px-2 py-2 lg:hidden">
          {items.map((item) => (
            <SideLink
              key={item.href}
              {...item}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      ) : null}

      <aside className="hidden w-[216px] shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b border-line px-4">
          <p className="text-sm font-semibold text-ink">レガプロ経費申請</p>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <SideLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SideLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm text-ink-secondary hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active &&
          "bg-surface-subtle font-medium text-ink before:absolute before:left-0 before:top-1.5 before:h-[calc(100%-12px)] before:w-[3px] before:rounded-r before:bg-primary",
      )}
    >
      {label}
    </Link>
  );
}
