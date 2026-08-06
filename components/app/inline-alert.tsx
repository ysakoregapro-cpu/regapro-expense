import { cn } from "@/lib/utils";

export function InlineAlert({
  title,
  children,
  tone = "returned",
  className,
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "returned" | "info" | "error";
  className?: string;
}) {
  const toneClass =
    tone === "returned"
      ? "border-l-[3px] border-l-status-returned-fg bg-status-returned/60"
      : tone === "error"
        ? "border-l-[3px] border-l-destructive bg-destructive-soft"
        : "border-l-[3px] border-l-primary bg-surface-subtle";

  return (
    <div
      className={cn(
        "rounded-lg border border-line px-4 py-3 text-sm text-ink",
        toneClass,
        className,
      )}
      role="status"
    >
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <div className="text-ink-secondary whitespace-pre-wrap">{children}</div>
    </div>
  );
}
