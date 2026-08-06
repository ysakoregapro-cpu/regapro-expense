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
      ? "border-l-[3px] border-l-status-returned-fg bg-status-returned/40"
      : tone === "error"
        ? "border-l-[3px] border-l-destructive bg-destructive-soft"
        : "border-l-[3px] border-l-primary bg-surface-subtle";

  return (
    <div
      className={cn(
        "rounded-md border border-line px-3 py-2.5 text-sm text-ink",
        toneClass,
        className,
      )}
      role="status"
    >
      {title ? <p className="mb-0.5 text-[13px] font-medium">{title}</p> : null}
      <div className="break-words text-[13px] leading-relaxed text-ink-secondary whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}
