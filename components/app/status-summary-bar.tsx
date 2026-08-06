import { cn } from "@/lib/utils";

export function StatusSummaryBar({
  returned,
  pending,
  approved,
  className,
}: {
  returned: number;
  pending: number;
  approved: number;
  className?: string;
}) {
  const emphasizeReturned = returned > 0;

  return (
    <section className={cn("ledger-panel overflow-hidden", className)}>
      <div className="border-b border-line px-4 py-2">
        <h2 className="text-[13px] font-semibold text-ink">申請状況</h2>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line">
        <SummaryCell
          label="要対応"
          value={returned}
          emphasize={emphasizeReturned}
          tone={emphasizeReturned ? "returned" : "default"}
        />
        <SummaryCell label="確認待ち" value={pending} />
        <SummaryCell label="承認済み" value={approved} />
      </div>
    </section>
  );
}

function SummaryCell({
  label,
  value,
  emphasize = false,
  tone = "default",
}: {
  label: string;
  value: number;
  emphasize?: boolean;
  tone?: "default" | "returned";
}) {
  return (
    <div
      className={cn(
        "min-h-[72px] px-3 py-2.5 sm:px-4",
        tone === "returned" && "bg-status-returned/45",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-medium",
          tone === "returned" ? "text-status-returned-fg" : "text-ink-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[22px] font-bold leading-none tabular-nums",
          emphasize ? "text-status-returned-fg" : "text-ink",
          value === 0 && !emphasize && "text-ink-secondary",
        )}
      >
        {value}
        <span className="ml-0.5 text-[11px] font-medium text-ink-muted">
          件
        </span>
      </p>
    </div>
  );
}
