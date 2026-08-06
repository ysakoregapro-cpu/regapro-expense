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
    <p
      className={cn(
        "text-sm text-ink-secondary [font-variant-numeric:tabular-nums]",
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 ? (
            <span className="mx-2 text-ink-muted" aria-hidden>
              ｜
            </span>
          ) : null}
          <span className="text-ink-muted">{item.label}</span>{" "}
          <span className="font-medium text-ink">{item.value}</span>
        </span>
      ))}
    </p>
  );
}
