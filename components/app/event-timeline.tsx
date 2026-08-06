import {
  eventTypeLabel,
  formatDateTime,
  statusLabel,
} from "@/lib/format";
import type { ExpenseEvent } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function EventTimeline({ events }: { events: ExpenseEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-[13px] text-ink-secondary">操作履歴はまだありません。</p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-line pl-4">
      {events.map((event, index) => (
        <li key={event.id} className="relative pb-4 last:pb-0">
          <span
            className={cn(
              "absolute -left-[19px] top-1.5 h-2 w-2 rounded-full border-2 border-surface",
              index === events.length - 1
                ? "bg-craft"
                : "bg-line-strong",
            )}
            aria-hidden
          />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-semibold text-ink">
              {eventTypeLabel(event.event_type)}
            </span>
            <span className="text-[11px] text-ink-muted">
              {formatDateTime(event.created_at)}
            </span>
          </div>
          {event.from_status || event.to_status ? (
            <p className="mt-0.5 text-[11px] text-ink-secondary">
              {event.from_status ? statusLabel(event.from_status) : "—"}
              <span className="mx-1 text-ink-muted">→</span>
              {event.to_status ? statusLabel(event.to_status) : "—"}
            </p>
          ) : null}
          {event.note ? (
            <p className="mt-1.5 whitespace-pre-wrap break-words rounded-md bg-surface-subtle px-2.5 py-1.5 text-[12px] leading-relaxed text-ink-secondary">
              {event.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
