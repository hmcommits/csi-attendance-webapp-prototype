import { History as HistoryIcon, CheckCircle2, Clock3 } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { EVENT_TYPE_LABELS, formatDate, formatDateTime } from '../../lib/utils';
import { useApp } from '../../context/AppContext';

export default function StudentHistory() {
  const { db, currentUser } = useApp();

  const myRegistrations = db.registrations
    .filter((r) => r.student === currentUser.id)
    .map((reg) => {
      const event = db.events.find((e) => e.id === reg.event);
      const attendanceRecords = db.attendance.filter(
        (a) => a.registration === reg.id,
      );
      return { reg, event, attendanceRecords };
    })
    .filter((row) => row.event)
    .sort((a, b) => new Date(b.reg.registeredAt) - new Date(a.reg.registeredAt));

  return (
    <Shell title="Participation history" subtitle="Every event you've registered for and attended.">
      <Card>
        <CardHeader title="Timeline" subtitle={`${myRegistrations.length} registrations`} />
        {myRegistrations.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No history yet"
            description="Once you register for events, your participation timeline will appear here."
          />
        ) : (
          <div className="space-y-3">
            {myRegistrations.map(({ reg, event, attendanceRecords }) => {
              const attended = attendanceRecords.length > 0;
              return (
                <div
                  key={reg.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-md border border-border p-4"
                >
                  <div
                    className={`flex items-center justify-center size-10 rounded-full shrink-0 ${
                      attended ? 'bg-success-soft text-success' : 'bg-slate-100 text-muted'
                    }`}
                  >
                    {attended ? <CheckCircle2 className="size-5" /> : <Clock3 className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink">{event.title}</p>
                      <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Registered {formatDate(reg.registeredAt)}
                      {reg.isWalkIn && ' · Walk-in'}
                    </p>
                    {event.sessions?.length > 0 && (
                      <p className="text-xs text-muted mt-1">
                        {attendanceRecords.length} of {event.sessions.length} sessions attended
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right shrink-0">
                    {attended ? (
                      <>
                        <Badge tone="success" dot>
                          Attended
                        </Badge>
                        <p className="text-xs text-muted mt-1.5">
                          {formatDateTime(attendanceRecords[attendanceRecords.length - 1].scannedAt)}
                        </p>
                      </>
                    ) : (
                      <Badge tone="neutral">Not attended</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Shell>
  );
}
