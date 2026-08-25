import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarX } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import EventCard from '../../components/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, cn } from '../../lib/utils';

const STATUS_FILTERS = ['all', 'upcoming', 'ongoing', 'closed'];

export default function StudentEvents() {
  const { db, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const myRegisteredEventIds = useMemo(
    () => new Set(db.registrations.filter((r) => r.student === currentUser.id).map((r) => r.event)),
    [db.registrations, currentUser.id],
  );

  const filtered = useMemo(() => {
    return db.events
      .filter((e) => (status === 'all' ? true : e.status === status))
      .filter((e) => (type === 'all' ? true : e.type === type))
      .filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [db.events, status, type, query]);

  return (
    <Shell title="Events" subtitle="Browse and register for upcoming CSI events.">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          icon={Search}
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-48">
          <option value="all">All types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <div className="flex gap-1.5 bg-slate-100 rounded-sm p-1 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-sm text-[13px] font-medium capitalize whitespace-nowrap transition-colors',
                status === s ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarX} title="No events found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              badge={
                myRegisteredEventIds.has(event.id) && (
                  <Badge tone="success" dot>
                    Registered
                  </Badge>
                )
              }
              footer={
                <Button as={Link} to={`/student/events/${event.id}`} variant="secondary" className="w-full">
                  View details
                </Button>
              }
            />
          ))}
        </div>
      )}
    </Shell>
  );
}
