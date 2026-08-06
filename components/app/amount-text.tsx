import { formatYenNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AmountText({
  amount,
  className,
  strong = false,
}: {
  amount: number;
  className?: string;
  strong?: boolean;
}) {
  return (
    <span
      className={cn(
        "amount-cell inline-block whitespace-nowrap [font-variant-numeric:tabular-nums]",
        strong ? "font-semibold text-ink" : "font-medium text-ink",
        className,
      )}
    >
      {formatYenNumber(amount)}
      <span className="yen-unit">円</span>
    </span>
  );
}
