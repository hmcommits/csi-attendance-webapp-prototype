import { CalendarDays, MapPin, Award, Layers } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { EventStatusBadge } from './StatusBadge';
import { EVENT_TYPE_LABELS, formatDate, formatTime } from '../lib/utils';

export default function EventCard({ event, footer, badge }) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
        <EventStatusBadge status={event.status} />
      </div>

      <h3 className="text-[17px] font-semibold text-ink mt-3 leading-snug">{event.title}</h3>
      <p className="text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>

      <div className="mt-4 space-y-2 text-[13px] text-muted">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-primary" />
          <span>
            {formatDate(event.startDate)}
            {event.endDate && event.endDate.slice(0, 10) !== event.startDate.slice(0, 10)
              ? ` — ${formatDate(event.endDate)}`
              : ` · ${formatTime(event.startDate)}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="truncate">{event.location}</span>
        </div>
        {event.sessions?.length > 0 && (
          <div className="flex items-center gap-2">
            <Layers className="size-4 shrink-0 text-primary" />
            <span>{event.sessions.length} sessions</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-warning">
          <Award className="size-4" />
          {event.points} pts
        </span>
        {badge}
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </Card>
  );
}
