import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";
import type { ExpenseStatus } from "@/lib/types/database";

const styles: Record<ExpenseStatus, string> = {
  pending: "bg-status-pending text-status-pending-fg",
  approved: "bg-status-approved text-status-approved-fg",
  returned: "bg-status-returned text-status-returned-fg",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ExpenseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded px-1.5 py-px text-[11px] font-semibold leading-5 tracking-wide",
        styles[status],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
