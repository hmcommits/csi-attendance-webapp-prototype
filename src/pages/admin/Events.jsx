import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, CalendarX, Users, Award } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EventStatusBadge } from '../../components/StatusBadge';
import { Input, Select } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, cn, formatDate } from '../../lib/utils';

const STATUS_FILTERS = ['all', 'upcoming', 'ongoing', 'closed', 'cancelled'];

export default function AdminEvents() {
  const { db } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    return db.events
      .filter((e) => (status === 'all' ? true : e.status === status))
      .filter((e) => (type === 'all' ? true : e.type === type))
      .filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [db.events, status, type, query]);

  return (
    <Shell
      title="Events"
      subtitle="Manage CSI events, sessions, and volunteer assignments."
      actions={
        <Button as={Link} to="/admin/events/create" size="sm">
          <Plus className="size-4" /> New event
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input icon={Search} placeholder="Search events..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
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
        <EmptyState icon={CalendarX} title="No events found" description="Try adjusting your filters, or create a new event." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => {
                  const registered = db.registrations.filter((r) => r.event === event.id).length;
                  return (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      className="border-b border-border last:border-0 hover:bg-slate-50/70 cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/events/${event.id}`} className="font-medium text-ink hover:text-primary">
                          {event.title}
                        </Link>
                        <p className="text-xs text-muted mt-0.5 truncate max-w-xs">{event.location}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{formatDate(event.startDate)}</td>
                      <td className="px-5 py-3.5 text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" /> {registered}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="size-3.5" /> {event.points}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <EventStatusBadge status={event.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Shell>
  );
}
