import { AmountText } from "@/components/app/amount-text";
import { cn } from "@/lib/utils";

export function OpsSummaryBar({
  pending,
  resubmit,
  monthApprovedAmount,
  className,
}: {
  pending: number;
  resubmit: number;
  monthApprovedAmount: number;
  className?: string;
}) {
  return (
    <section className={cn("ledger-panel", className)}>
      <div className="grid grid-cols-3 divide-x divide-line">
        <OpsCell label="未確認" value={`${pending}`} unit="件" />
        <OpsCell label="再申請" value={`${resubmit}`} unit="件" />
        <OpsCell
          label="今月承認額"
          valueNode={
            <AmountText
              amount={monthApprovedAmount}
              strong
              className="text-[15px] sm:text-[18px]"
            />
          }
        />
      </div>
    </section>
  );
}

function OpsCell({
  label,
  value,
  unit,
  valueNode,
}: {
  label: string;
  value?: string;
  unit?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="min-h-[68px] px-2.5 py-2.5 sm:px-4 sm:py-3">
      <p className="text-[11px] font-medium text-ink-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-0.5">
        {valueNode ? (
          valueNode
        ) : (
          <>
            <span className="text-[20px] font-bold tabular-nums text-ink">
              {value}
            </span>
            {unit ? (
              <span className="text-[11px] text-ink-muted">{unit}</span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
