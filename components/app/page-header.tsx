import { cn } from "@/lib/utils";

export function PageHeader({
  category,
  title,
  description,
  actions,
  className,
}: {
  category?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:gap-4", className)}>
      <div
        className={cn(
          "flex flex-col gap-3",
          "md:flex-row md:items-start md:justify-between",
        )}
      >
        <div className="min-w-0">
          {category ? (
            <p className="craft-mark text-[11px] font-semibold tracking-[0.06em] text-ink-muted">
              {category}
            </p>
          ) : null}
          <h1
            className={cn(
              "font-bold tracking-tight text-ink",
              category ? "mt-1.5" : null,
              "text-[28px] leading-[1.2] md:text-[28px]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-secondary">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 items-center md:mt-1 md:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
