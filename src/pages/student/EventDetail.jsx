import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Award,
  Clock,
  QrCode,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EventStatusBadge } from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, formatDate, formatDateTime } from '../../lib/utils';

export default function StudentEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { db, currentUser, registerForEvent } = useApp();
  const [registering, setRegistering] = useState(false);

  const event = db.events.find((e) => e.id === eventId);
  const registration = db.registrations.find(
    (r) => r.event === eventId && r.student === currentUser.id,
  );
  const myAttendance = db.attendance.filter(
    (a) => a.event === eventId && a.student === currentUser.id,
  );

  if (!event) {
    return (
      <Shell title="Event not found">
        <Button as={Link} to="/student/events" variant="secondary">
          <ArrowLeft className="size-4" /> Back to events
        </Button>
      </Shell>
    );
  }

  const canRegister =
    !registration && event.status !== 'closed' && event.status !== 'cancelled';
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);

  const handleRegister = () => {
    setRegistering(true);
    setTimeout(() => {
      const result = registerForEvent(currentUser.id, event.id);
      setRegistering(false);
      if (result.ok) navigate(`/student/events/${event.id}/qr`);
    }, 350);
  };

  return (
    <Shell
      title={event.title}
      subtitle="Event details and registration"
      actions={
        <Button as={Link} to="/student/events" variant="secondary" size="sm">
          <ArrowLeft className="size-4" /> Back
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
              <EventStatusBadge status={event.status} />
              {registration && (
                <Badge tone="success" dot>
                  You're registered
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-ink">{event.title}</h2>
            <p className="text-sm text-muted mt-3 leading-relaxed">{event.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <InfoRow icon={CalendarDays} label="Date" value={formatDate(event.startDate)} />
              <InfoRow
                icon={Clock}
                label="Time"
                value={`${formatDateTime(event.startDate).split(', ')[1]} onwards`}
              />
              <InfoRow icon={MapPin} label="Location" value={event.location} />
              <InfoRow icon={Award} label="Points on attendance" value={`${event.points} pts`} />
              <InfoRow
                icon={Users}
                label="Registration"
                value={event.walkInAllowed ? 'Open + walk-in allowed' : 'Pre-registration only'}
              />
              <InfoRow
                icon={Clock}
                label="Registration deadline"
                value={formatDate(event.registrationDeadline)}
              />
            </div>
          </Card>

          {event.sessions?.length > 0 && (
            <Card>
              <CardHeader title="Sessions" subtitle="One registration covers every session below" />
              <div className="space-y-2.5">
                {event.sessions.map((session) => {
                  const attended = myAttendance.some((a) => a.session === session.id);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="size-4 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-ink">{session.label}</p>
                          <p className="text-xs text-muted mt-0.5">{formatDate(session.date)}</p>
                        </div>
                      </div>
                      {attended ? (
                        <Badge tone="success" dot>
                          Attended
                        </Badge>
                      ) : (
                        <Badge tone="neutral">Not yet</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader title="Your status" />
            {registration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-md bg-success-soft px-4 py-3">
                  <CheckCircle2 className="size-5 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-success">Registered</p>
                    <p className="text-xs text-success/80 mt-0.5">
                      on {formatDate(registration.registeredAt)}
                    </p>
                  </div>
                </div>
                <Button as={Link} to={`/student/events/${event.id}/qr`} className="w-full">
                  <QrCode className="size-4" />
                  View my QR code
                </Button>
                {myAttendance.length > 0 && (
                  <p className="text-xs text-center text-muted">
                    Attendance confirmed {myAttendance.length} time
                    {myAttendance.length > 1 ? 's' : ''} for this event.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  {event.status === 'closed' || event.status === 'cancelled'
                    ? `Registration is ${event.status} for this event.`
                    : deadlinePassed
                      ? 'The registration deadline has passed.'
                      : 'Register now to receive your event QR code.'}
                </p>
                <Button
                  className="w-full"
                  disabled={!canRegister || deadlinePassed}
                  loading={registering}
                  onClick={handleRegister}
                >
                  Register for event
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center size-9 rounded-md bg-primary-soft text-primary shrink-0">
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}
