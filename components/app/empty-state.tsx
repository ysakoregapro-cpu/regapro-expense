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
    <div className={cn("px-4 py-8 text-center", className)}>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-[13px] text-ink-secondary">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4 h-10" size="compact">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
