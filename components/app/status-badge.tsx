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
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
