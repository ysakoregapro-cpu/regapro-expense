import { cn } from "@/lib/utils";

export function LoadingState({
  label = "読み込み中…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-ink-secondary", className)} role="status">
      {label}
    </p>
  );
}
