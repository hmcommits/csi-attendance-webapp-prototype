import { useMemo, useState } from 'react';
import { Search, KeyRound, Trash2, GraduationCap, CalendarDays, MailCheck } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, formatDate, initials } from '../../lib/utils';

export default function AdminStudents() {
  const { db, deleteUser } = useApp();
  const [query, setQuery] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [eventsTarget, setEventsTarget] = useState(null);

  const students = useMemo(() => {
    return db.users
      .filter((u) => u.role === 'student')
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.grNumber.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [db.users, query]);

  const handleDelete = () => {
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <Shell title="Students" subtitle={`${students.length} approved student account${students.length === 1 ? '' : 's'}.`}>
      <Input
        icon={Search}
        placeholder="Search by name or GR number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs mb-5"
      />

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students found" description="Try a different search." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">GR Number</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
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
                    <td className="px-5 py-3 text-muted">{student.department}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEventsTarget(student)}>
                          <CalendarDays className="size-3.5" /> Events
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setResetTarget(student)}>
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive-outline" onClick={() => setDeleteTarget(student)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ResetPasswordModal student={resetTarget} onClose={() => setResetTarget(null)} />
      <StudentEventsModal student={eventsTarget} db={db} onClose={() => setEventsTarget(null)} />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this student?"
        subtitle="This will permanently remove the account. Registrations and attendance data will remain orphaned."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <span className="font-semibold text-ink">{deleteTarget?.name}</span> (
          {deleteTarget?.grNumber})? This action cannot be undone.
        </p>
      </Modal>
    </Shell>
  );
}

function ResetPasswordModal({ student, onClose }) {
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => setSent(false), 200);
  };

  if (!student) return null;

  return (
    <Modal
      open={!!student}
      onClose={handleClose}
      title="Reset password"
      subtitle={sent ? undefined : `Send a password reset link to ${student.name}`}
      footer={
        sent ? (
          <Button onClick={handleClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => setSent(true)}>
              <KeyRound className="size-4" /> Send reset link
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center size-14 rounded-full bg-success-soft text-success mb-4">
            <MailCheck className="size-7" />
          </div>
          <p className="text-sm font-semibold text-ink">Reset link sent to {student.name}</p>
          <p className="text-sm text-muted mt-1.5">
            Instructions to set a new password were sent to{' '}
            <span className="font-medium text-ink">{student.email || `${student.grNumber}'s registered contact`}</span>.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          {student.name} ({student.grNumber}) will receive a link to set a new password. Their current password
          stays active until they complete the reset.
        </p>
      )}
    </Modal>
  );
}

function StudentEventsModal({ student, db, onClose }) {
  if (!student) return null;

  const rows = db.registrations
    .filter((r) => r.student === student.id)
    .map((reg) => ({
      reg,
      event: db.events.find((e) => e.id === reg.event),
      attended: db.attendance.some((a) => a.registration === reg.id),
    }))
    .filter((row) => row.event)
    .sort((a, b) => new Date(b.reg.registeredAt) - new Date(a.reg.registeredAt));

  return (
    <Modal
      open={!!student}
      onClose={onClose}
      title={`${student.name}'s events`}
      subtitle={`${rows.length} registration${rows.length === 1 ? '' : 's'}`}
      size="lg"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted">This student hasn't registered for any events yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ reg, event, attended }) => (
            <div key={reg.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-ink truncate">{event.title}</p>
                  <Badge tone="primary">{EVENT_TYPE_LABELS[event.type]}</Badge>
                </div>
                <p className="text-xs text-muted mt-1">Registered {formatDate(reg.registeredAt)}</p>
              </div>
              {attended ? (
                <Badge tone="success" dot>
                  Attended
                </Badge>
              ) : (
                <Badge tone="neutral">Registered</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
