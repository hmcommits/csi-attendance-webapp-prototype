import { Link } from 'react-router-dom';
import { CalendarCheck, Award, Ticket, ArrowRight, QrCode } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';

export default function StudentDashboard() {
  const { db, currentUser } = useApp();

  const myRegistrations = db.registrations.filter((r) => r.student === currentUser.id);
  const myEventIds = new Set(myRegistrations.map((r) => r.event));
  const myAttendance = db.attendance.filter((a) => a.student === currentUser.id);
  const totalPoints = db.pointLedger
    .filter((p) => p.student === currentUser.id)
    .reduce((sum, p) => sum + p.points, 0);

  const upcomingEvents = db.events
    .filter((e) => (e.status === 'upcoming' || e.status === 'ongoing') && !myEventIds.has(e.id))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  const myUpcoming = db.events
    .filter((e) => myEventIds.has(e.id) && (e.status === 'upcoming' || e.status === 'ongoing'))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <Shell title={`Welcome, ${currentUser.name.split(' ')[0]}`} subtitle="Here's what's happening with your CSI participation.">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Registered events" value={myRegistrations.length} icon={Ticket} tone="primary" />
        <StatCard label="Events attended" value={myAttendance.length} icon={CalendarCheck} tone="success" />
        <StatCard label="Total points" value={totalPoints} icon={Award} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Your registered events"
              subtitle="Upcoming and ongoing events you're signed up for"
              action={
                <Link to="/student/events" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  Browse all <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            {myUpcoming.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No upcoming registrations"
                description="Browse events and register to see them here."
                action={
                  <Button as={Link} to="/student/events" size="sm">
                    Browse events
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {myUpcoming.map((event) => (
                  <Link
                    key={event.id}
                    to={`/student/events/${event.id}`}
                    className="flex items-center justify-between gap-4 rounded-md border border-border p-4 hover:border-primary hover:bg-primary-soft/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{event.title}</p>
                      <p className="text-xs text-muted mt-1">{formatDate(event.startDate)} · {event.location}</p>
                    </div>
                    <Button as="span" variant="secondary" size="sm" className="shrink-0">
                      <QrCode className="size-4" />
                      QR
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader title="Discover events" subtitle="New opportunities to earn points" />
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted">No new events right now. Check back soon.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/student/events/${event.id}`}
                  className="block rounded-md border border-border p-3.5 hover:border-primary hover:bg-primary-soft/40 transition-colors"
                >
                  <p className="text-sm font-semibold text-ink">{event.title}</p>
                  <p className="text-xs text-muted mt-1">{formatDate(event.startDate)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
