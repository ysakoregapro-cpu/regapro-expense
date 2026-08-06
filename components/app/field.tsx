import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-1.5 text-[13px] font-semibold text-ink"
      >
        {label}
        {required ? (
          <span className="text-[10px] font-medium text-ink-muted">必須</span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="text-[12px] leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="text-[13px] text-destructive" role="alert">
      {message}
    </p>
  );
}

export function FormSection({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-line pb-6 last:border-b-0 last:pb-0">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold tabular-nums text-ink-muted">
            {index}.
          </span>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        </div>
        {description ? (
          <p className="mt-1 pl-5 text-[12px] text-ink-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
