import { Link } from 'react-router-dom';
import { Users, CalendarDays, Award, ScanLine, ArrowRight, Plus } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { EventStatusBadge } from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatDateTime, initials } from '../../lib/utils';

export default function AdminDashboard() {
  const { db } = useApp();

  const totalStudents = db.users.filter((u) => u.role === 'student' && u.isApproved).length;
  const totalEvents = db.events.length;
  const totalPoints = db.pointLedger.reduce((sum, p) => sum + p.points, 0);
  const today = new Date().toDateString();
  const todayAttendance = db.attendance.filter((a) => new Date(a.scannedAt).toDateString() === today).length;

  const recentScans = [...db.attendance]
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
    .slice(0, 6);

  const ongoingEvents = db.events.filter((e) => e.status === 'ongoing' || e.status === 'upcoming').slice(0, 5);

  return (
    <Shell
      title="Admin dashboard"
      subtitle="Live overview of CSI events and attendance."
      actions={
        <Button as={Link} to="/admin/events/create" size="sm">
          <Plus className="size-4" /> New event
        </Button>
      }
    >
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total students" value={totalStudents} icon={Users} tone="primary" />
        <StatCard label="Total events" value={totalEvents} icon={CalendarDays} tone="success" />
        <StatCard label="Today's attendance" value={todayAttendance} icon={ScanLine} tone="warning" />
        <StatCard label="Total points issued" value={totalPoints} icon={Award} tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Event attendance progress"
            subtitle="Upcoming and ongoing events"
            action={
              <Link to="/admin/events" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                All events <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {ongoingEvents.length === 0 ? (
            <p className="text-sm text-muted">No upcoming or ongoing events.</p>
          ) : (
            <div className="space-y-4">
              {ongoingEvents.map((event) => {
                const registered = db.registrations.filter((r) => r.event === event.id).length;
                const attended = new Set(
                  db.attendance.filter((a) => a.event === event.id).map((a) => a.student),
                ).size;
                const pct = registered ? Math.round((attended / registered) * 100) : 0;
                return (
                  <Link key={event.id} to={`/admin/events/${event.id}`} className="block group">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <p className="text-sm font-medium text-ink group-hover:text-primary transition-colors truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <EventStatusBadge status={event.status} />
                        <span className="text-xs text-muted">{attended}/{registered}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-pill bg-slate-100 overflow-hidden">
                      <div className="h-full bg-primary rounded-pill transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent scans" subtitle="Live from volunteers" />
          {recentScans.length === 0 ? (
            <p className="text-sm text-muted">No scans recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {recentScans.map((record) => {
                const student = db.users.find((u) => u.id === record.student);
                const event = db.events.find((e) => e.id === record.event);
                return (
                  <div key={record.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
                      {initials(student?.name || '?')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink truncate">{student?.name}</p>
                      <p className="text-xs text-muted truncate">{event?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge tone="success">+{record.pointsAwarded}</Badge>
                      <p className="text-[11px] text-muted mt-1">{formatDateTime(record.scannedAt).split(', ')[1]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
