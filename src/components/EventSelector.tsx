import { EventConfig } from "@/config/events";

interface EventSelectorProps {
  events: EventConfig[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function EventSelector({
  events,
  selectedId,
  onChange,
}: EventSelectorProps) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <label
        htmlFor="event-selector"
        className="text-sm font-semibold text-brand-gray-dark"
      >
        Evento:
      </label>
      <select
        id="event-selector"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-brand-gray-med/50 bg-white px-4 py-2 text-sm font-medium text-brand-text shadow-sm outline-none transition-colors hover:border-brand-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
      >
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.label}
          </option>
        ))}
      </select>
    </div>
  );
}
