import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-line bg-surface px-4 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4" size="default">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
