import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ScanLine, Users, CheckCircle2, Clock3 } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { EventStatusBadge } from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, formatDate, formatTime, initials } from '../../lib/utils';

export default function VolunteerEventDetail() {
  const { eventId } = useParams();
  const { db } = useApp();

  const event = db.events.find((e) => e.id === eventId);
  if (!event) {
    return (
      <Shell title="Event not found">
        <Button as={Link} to="/volunteer/events" variant="secondary">
          <ArrowLeft className="size-4" /> Back
        </Button>
      </Shell>
    );
  }

  const registrations = db.registrations.filter((r) => r.event === eventId);
  const attendedStudentIds = new Set(
    db.attendance.filter((a) => a.event === eventId).map((a) => a.student),
  );

  return (
    <Shell
      title={event.title}
      subtitle="Scanning context and live roster"
      actions={
        <div className="flex gap-2">
          <Button as={Link} to="/volunteer/events" variant="secondary" size="sm">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button as={Link} to={`/volunteer/scanner/${event.id}`} size="sm">
            <ScanLine className="size-4" /> Start scanning
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
        <EventStatusBadge status={event.status} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Registered" value={registrations.length} icon={Users} tone="primary" />
        <StatCard label="Attended" value={attendedStudentIds.size} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Awaiting scan"
          value={Math.max(registrations.length - attendedStudentIds.size, 0)}
          icon={Clock3}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader
          title="Event details"
          subtitle={`${formatDate(event.startDate)} · ${formatTime(event.startDate)} · ${event.location}`}
        />
        <p className="text-sm text-muted leading-relaxed">{event.description}</p>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Registered students" subtitle={`${registrations.length} total`} />
        {registrations.length === 0 ? (
          <p className="text-sm text-muted">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                  <th className="px-5 py-2.5">Student</th>
                  <th className="px-5 py-2.5">GR Number</th>
                  <th className="px-5 py-2.5">Class</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const student = db.users.find((u) => u.id === reg.student);
                  if (!student) return null;
                  const attended = attendedStudentIds.has(student.id);
                  return (
                    <tr key={reg.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
                            {initials(student.name)}
                          </div>
                          <span className="font-medium text-ink">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">{student.grNumber}</td>
                      <td className="px-5 py-3 text-muted">
                        {student.class} · {student.division}
                      </td>
                      <td className="px-5 py-3">
                        {attended ? (
                          <Badge tone="success" dot>
                            Attended
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Shell>
  );
}
