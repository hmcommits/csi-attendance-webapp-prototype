import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, LayoutGrid, ShieldCheck } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDate, initials } from '../../lib/utils';

export default function StudentEventQR() {
  const { eventId } = useParams();
  const { db, currentUser } = useApp();

  const event = db.events.find((e) => e.id === eventId);
  const registration = db.registrations.find(
    (r) => r.event === eventId && r.student === currentUser.id,
  );

  return (
    <Shell
      title="My Event QR"
      subtitle={event?.title}
      actions={
        <Button as={Link} to={`/student/events/${eventId}`} variant="secondary" size="sm">
          <ArrowLeft className="size-4" /> Back
        </Button>
      }
    >
      {!event || !registration ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="No QR available"
            description="You need to register for this event before a QR code can be generated."
            action={
              <Button as={Link} to="/student/events" size="sm">
                Browse events
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="max-w-sm mx-auto">
          <div className="rounded-lg border border-border bg-surface shadow-elevated overflow-hidden">
            <div className="bg-primary text-white px-6 py-5 flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-md bg-white/15">
                <LayoutGrid className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">AptiCore</p>
                <p className="text-[11px] text-white/70 leading-tight">Event Attendance Pass</p>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="rounded-md border-2 border-primary/10 p-4 bg-white">
                <QRCodeSVG value={registration.qrToken} size={200} fgColor="#191265" level="M" />
              </div>
              <p className="text-xs text-muted mt-3">Present this QR at the event exit</p>

              <div className="w-full mt-6 pt-5 border-t border-dashed border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-11 rounded-full bg-primary-soft text-primary text-sm font-semibold shrink-0">
                    {initials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted truncate">
                      {currentUser.grNumber} · {currentUser.class}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-[13px]">
                  <div>
                    <p className="text-muted text-xs">Event</p>
                    <p className="font-medium text-ink mt-0.5 truncate">{event.title}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Date</p>
                    <p className="font-medium text-ink mt-0.5">{formatDate(event.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Registration ID</p>
                    <p className="font-medium text-ink mt-0.5 truncate">{registration.id}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Type</p>
                    <p className="font-medium text-ink mt-0.5">
                      {registration.isWalkIn ? 'Walk-in' : 'Pre-registered'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            This QR is unique to you and this event. A volunteer will verify your identity
            against your college ID before confirming attendance.
          </p>
        </div>
      )}
    </Shell>
  );
}
