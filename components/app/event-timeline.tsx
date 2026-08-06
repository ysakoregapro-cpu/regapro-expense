import {
  eventTypeLabel,
  formatDateTime,
  statusLabel,
} from "@/lib/format";
import type { ExpenseEvent } from "@/lib/types/database";

export function EventTimeline({ events }: { events: ExpenseEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">操作履歴はまだありません。</p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="border-l-2 border-line pl-3 text-sm"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-medium text-ink">
              {eventTypeLabel(event.event_type)}
            </span>
            <span className="text-xs text-ink-muted">
              {formatDateTime(event.created_at)}
            </span>
          </div>
          {event.from_status || event.to_status ? (
            <p className="mt-0.5 text-xs text-ink-secondary">
              {event.from_status ? statusLabel(event.from_status) : "—"} →{" "}
              {event.to_status ? statusLabel(event.to_status) : "—"}
            </p>
          ) : null}
          {event.note ? (
            <p className="mt-1 whitespace-pre-wrap text-ink-secondary">
              {event.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
