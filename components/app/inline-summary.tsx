import { cn } from "@/lib/utils";

export type SummaryItem = {
  label: string;
  value: string;
};

export function InlineSummary({
  items,
  className,
}: {
  items: SummaryItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-0 gap-y-1 text-sm [font-variant-numeric:tabular-nums]",
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-baseline">
          {index > 0 ? (
            <span className="mx-2 text-ink-muted" aria-hidden>
              ｜
            </span>
          ) : null}
          <span className="text-ink-muted">{item.label}</span>
          <span className="ml-1 font-medium text-ink">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
