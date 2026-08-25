import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ScanLine,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  IdCard,
  Layers,
  Clock3,
} from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { cn, initials, formatTime } from '../../lib/utils';

export default function VolunteerScanner() {
  const { eventId } = useParams();
  const { db, currentUser, verifyScanToken, confirmAttendance, queueOfflineScan, syncOfflineQueue } =
    useApp();

  const assignedEvents = db.events.filter(
    (e) => e.volunteers.includes(currentUser.id) && e.status !== 'closed' && e.status !== 'cancelled',
  );

  const [sessionId, setSessionId] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [phase, setPhase] = useState('idle'); // idle | result
  const [verification, setVerification] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [pickerValue, setPickerValue] = useState('');
  const [recent, setRecent] = useState([]);

  const event = db.events.find((e) => e.id === eventId);

  const [lastEventId, setLastEventId] = useState(eventId);
  if (eventId !== lastEventId) {
    setLastEventId(eventId);
    setSessionId(event?.sessions?.length ? event.sessions[0].id : '');
  }

  const myQueue = db.offlineQueue.filter((q) => q.event === eventId && !q.synced);

  const registrations = useMemo(
    () => db.registrations.filter((r) => r.event === eventId),
    [db.registrations, eventId],
  );

  const attendedRegIds = useMemo(
    () =>
      new Set(
        db.attendance
          .filter((a) => a.event === eventId && (a.session || null) === (sessionId || null))
          .map((a) => a.registration),
      ),
    [db.attendance, eventId, sessionId],
  );

  const pendingRegistrations = registrations.filter((r) => !attendedRegIds.has(r.id));

  if (!eventId) {
    return (
      <Shell title="Scanner" subtitle="Choose an assigned event to begin scanning.">
        {assignedEvents.length === 0 ? (
          <EmptyState icon={ScanLine} title="No active events assigned" description="You have no open events available for scanning." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {assignedEvents.map((e) => (
              <Link
                key={e.id}
                to={`/volunteer/scanner/${e.id}`}
                className="rounded-lg border border-border bg-surface p-5 hover:border-primary hover:bg-primary-soft/40 transition-colors shadow-card"
              >
                <p className="text-sm font-semibold text-ink">{e.title}</p>
                <p className="text-xs text-muted mt-1.5">{e.location}</p>
              </Link>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  if (!event) {
    return (
      <Shell title="Event not found">
        <Button as={Link} to="/volunteer/events" variant="secondary">
          <ArrowLeft className="size-4" /> Back
        </Button>
      </Shell>
    );
  }

  const pushRecent = (entry) => setRecent((r) => [entry, ...r].slice(0, 6));

  const runVerification = (registration) => {
    setErrorMsg('');
    const result = verifyScanToken(registration.qrToken, currentUser.id);
    if (!result.ok) {
      setErrorMsg(result.error);
      setPhase('idle');
      pushRecent({ name: '—', status: 'error', message: result.error, time: new Date().toISOString() });
      return;
    }
    setVerification(result);
    setPhase('result');
  };

  const handleSimulateScan = () => {
    if (pendingRegistrations.length === 0) {
      setErrorMsg('All registered students for this session have been scanned.');
      return;
    }
    runVerification(pendingRegistrations[0]);
  };

  const handlePickStudent = (regId) => {
    const registration = registrations.find((r) => r.id === regId);
    if (registration) runVerification(registration);
    setPickerValue('');
  };

  const handleConfirm = () => {
    if (!verification) return;
    const { registration, student } = verification;

    if (!isOnline) {
      queueOfflineScan(registration.qrToken, event.id, sessionId || null);
      pushRecent({
        name: student.name,
        status: 'queued',
        message: 'Queued offline — will sync when online',
        time: new Date().toISOString(),
      });
      setPhase('idle');
      setVerification(null);
      return;
    }

    const result = confirmAttendance(registration.qrToken, currentUser.id, sessionId || null);
    if (!result.ok) {
      pushRecent({ name: student.name, status: 'error', message: result.error, time: new Date().toISOString() });
      setErrorMsg(result.error);
    } else {
      pushRecent({
        name: student.name,
        status: 'confirmed',
        message: `+${event.points} pts confirmed`,
        time: new Date().toISOString(),
      });
    }
    setPhase('idle');
    setVerification(null);
  };

  const handleReject = () => {
    if (verification) {
      pushRecent({
        name: verification.student.name,
        status: 'rejected',
        message: 'Identity mismatch — rejected',
        time: new Date().toISOString(),
      });
    }
    setPhase('idle');
    setVerification(null);
  };

  return (
    <Shell
      title="Scanner"
      subtitle={event.title}
      actions={
        <Button as={Link} to="/volunteer/events" variant="secondary" size="sm">
          <ArrowLeft className="size-4" /> Back
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div className="flex items-center gap-2">
                <ScanLine className="size-5 text-primary" />
                <h3 className="text-[17px] font-semibold text-ink">Live scanner</h3>
              </div>
              <button
                onClick={() => setIsOnline((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors',
                  isOnline ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
                )}
              >
                {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
                {isOnline ? 'Online' : 'Offline mode'}
              </button>
            </div>

            {event.sessions?.length > 0 && (
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-ink mb-1.5">
                  <Layers className="size-4 text-primary" /> Session
                </label>
                <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                  {event.sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {phase === 'idle' && (
              <>
                <div className="relative rounded-lg bg-ink aspect-video max-h-72 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-6 border-2 border-white/25 rounded-lg" />
                  {['top-4 left-4 border-t-2 border-l-2', 'top-4 right-4 border-t-2 border-r-2', 'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'].map(
                    (pos) => (
                      <div key={pos} className={cn('absolute size-8 border-white rounded-sm', pos)} />
                    ),
                  )}
                  <div className="absolute left-6 right-6 h-0.5 bg-primary/80 shadow-[0_0_12px_2px_rgba(25,18,101,0.8)] animate-[scanline_2.4s_ease-in-out_infinite]" />
                  <p className="text-white/60 text-xs relative">Camera preview — point at student QR</p>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSimulateScan} className="flex-1" size="lg">
                    <ScanLine className="size-4.5" />
                    Simulate next scan
                  </Button>
                  <Select
                    value={pickerValue}
                    onChange={(e) => handlePickStudent(e.target.value)}
                    className="sm:w-56"
                  >
                    <option value="">Or pick a student…</option>
                    {registrations.map((r) => {
                      const student = db.users.find((u) => u.id === r.student);
                      return (
                        <option key={r.id} value={r.id}>
                          {student?.name} · {student?.grNumber}
                        </option>
                      );
                    })}
                  </Select>
                </div>
                {errorMsg && (
                  <p className="text-sm text-error mt-3 flex items-center gap-1.5">
                    <XCircle className="size-4" /> {errorMsg}
                  </p>
                )}
                <p className="text-xs text-muted mt-3">
                  {pendingRegistrations.length} of {registrations.length} students awaiting scan
                  {event.sessions?.length > 0 ? ' for this session' : ''}.
                </p>
              </>
            )}

            {phase === 'result' && verification && (
              <VerificationResult
                verification={verification}
                onConfirm={handleConfirm}
                onReject={handleReject}
                isOnline={isOnline}
              />
            )}
          </Card>

          {!isOnline && (
            <Card>
              <CardHeader
                title="Offline queue"
                subtitle={`${myQueue.length} scan${myQueue.length === 1 ? '' : 's'} waiting to sync`}
                action={
                  <Button size="sm" variant="secondary" disabled={myQueue.length === 0} onClick={() => syncOfflineQueue(currentUser.id)}>
                    <RefreshCw className="size-4" /> Sync now
                  </Button>
                }
              />
              {myQueue.length === 0 ? (
                <p className="text-sm text-muted">No queued scans for this event.</p>
              ) : (
                <div className="space-y-2">
                  {myQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3.5 py-2.5 text-sm">
                      <span className="text-ink font-medium">{item.id}</span>
                      <span className="text-muted text-xs flex items-center gap-1.5">
                        <Clock3 className="size-3.5" /> {formatTime(item.scannedAtLocal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Recent activity" subtitle="This scanning session" />
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Scans will appear here as you confirm them.</p>
          ) : (
            <div className="space-y-2.5">
              {recent.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'flex items-center justify-center size-7 rounded-full shrink-0 mt-0.5',
                      r.status === 'confirmed' && 'bg-success-soft text-success',
                      r.status === 'rejected' && 'bg-error-soft text-error',
                      r.status === 'error' && 'bg-error-soft text-error',
                      r.status === 'queued' && 'bg-warning-soft text-warning',
                    )}
                  >
                    {r.status === 'confirmed' ? (
                      <CheckCircle2 className="size-4" />
                    ) : r.status === 'queued' ? (
                      <WifiOff className="size-3.5" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{r.name}</p>
                    <p className="text-xs text-muted">{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @keyframes scanline {
          0%, 100% { top: 12%; }
          50% { top: 85%; }
        }
      `}</style>
    </Shell>
  );
}

function VerificationResult({ verification, onConfirm, onReject, isOnline }) {
  const { student, event } = verification;
  return (
    <div className="animate-fade-in">
      <div className="rounded-lg border-2 border-primary/15 bg-primary-soft/40 p-5">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
          <IdCard className="size-4" />
          Compare with physical college ID card
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-16 rounded-full bg-primary text-white text-xl font-bold shrink-0">
            {initials(student.name)}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink truncate">{student.name}</p>
            <p className="text-sm text-muted truncate">{event.title}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-primary/10 text-sm">
          <Detail label="GR Number" value={student.grNumber} />
          <Detail label="Roll Number" value={student.rollNumber} />
          <Detail label="Class" value={student.class} />
          <Detail label="Division" value={student.division} />
          <Detail label="Year" value={student.year} />
          <Detail label="Department" value={student.department} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <Button variant="destructive-outline" className="flex-1" size="lg" onClick={onReject}>
          <XCircle className="size-4.5" />
          Doesn't match
        </Button>
        <Button className="flex-1" size="lg" onClick={onConfirm}>
          <CheckCircle2 className="size-4.5" />
          {isOnline ? 'Confirm attendance' : 'Queue offline'}
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-semibold text-ink mt-0.5">{value}</p>
    </div>
  );
}
