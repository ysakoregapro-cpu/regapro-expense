"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function AdminViewTabs({
  viewAll,
  pendingCount,
  allCount,
}: {
  viewAll: boolean;
  pendingCount: number;
  allCount: number;
}) {
  const router = useRouter();

  const go = (href: string) => {
    router.push(href);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 border-b border-line">
      <TabButton
        active={!viewAll}
        onClick={() => go("/admin")}
      >
        未確認
        <span className="ml-1.5 tabular-nums text-ink-muted">
          {pendingCount}
        </span>
      </TabButton>
      <TabButton
        active={viewAll}
        onClick={() => go("/admin?view=all")}
      >
        すべて
        <span className="ml-1.5 tabular-nums text-ink-muted">{allCount}</span>
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative -mb-px px-3 py-2 text-[13px] text-ink-secondary transition-colors duration-ui hover:text-ink",
        active &&
          "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-primary",
      )}
    >
      {children}
    </button>
  );
}

/** Optional Link fallback for no-JS contexts */
export function AdminTabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative -mb-px px-3 py-2 text-[13px] text-ink-secondary transition-colors duration-ui hover:text-ink",
        active &&
          "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-primary",
      )}
    >
      {children}
    </Link>
  );
}
