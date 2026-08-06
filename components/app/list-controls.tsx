import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@/lib/types/database";
import { statusLabel } from "@/lib/format";

const FILTERS: Array<{ value: "" | ExpenseStatus; label: string }> = [
  { value: "", label: "すべて" },
  { value: "pending", label: statusLabel("pending") },
  { value: "approved", label: statusLabel("approved") },
  { value: "returned", label: statusLabel("returned") },
];

export function StatusFilterTabs({
  basePath,
  current,
  extraQuery,
}: {
  basePath: string;
  current: "" | ExpenseStatus;
  extraQuery?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line">
      {FILTERS.map((filter) => {
        const params = new URLSearchParams(extraQuery ?? {});
        if (filter.value) params.set("status", filter.value);
        else params.delete("status");
        params.delete("page");
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;
        const active = current === filter.value;

        return (
          <Link
            key={filter.label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative -mb-px px-3 py-2 text-[13px] text-ink-secondary transition-colors duration-ui hover:text-ink",
              active &&
                "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:bg-primary",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}

export function PaginationNav({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-surface-subtle hover:text-ink",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        前へ
      </Link>
      <p className="text-[12px] tabular-nums text-ink-muted">
        {page} / {totalPages}
      </p>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "rounded-md px-3 py-2 text-[13px] text-ink-secondary hover:bg-surface-subtle hover:text-ink",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        次へ
      </Link>
    </div>
  );
}
