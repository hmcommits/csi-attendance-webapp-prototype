import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Award,
  Users,
  Pencil,
  Lock,
  Trash2,
  ShieldCheck,
  Download,
} from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { EventStatusBadge } from '../../components/StatusBadge';
import { Field, Input, Select, Textarea } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, formatDate, formatDateTime, initials } from '../../lib/utils';
import { downloadCsv, buildAttendanceRows } from '../../lib/export';

export default function AdminEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { db, updateEvent, deleteEvent, assignVolunteers, closeEvent, currentUser } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [volunteersOpen, setVolunteersOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const event = db.events.find((e) => e.id === eventId);
  if (!event) {
    return (
      <Shell title="Event not found">
        <Button as={Link} to="/admin/events" variant="secondary">
          <ArrowLeft className="size-4" /> Back
        </Button>
      </Shell>
    );
  }

  const registrations = db.registrations.filter((r) => r.event === eventId);
  const attendanceRecords = db.attendance.filter((a) => a.event === eventId);
  const attendedStudentIds = new Set(attendanceRecords.map((a) => a.student));
  const volunteers = db.users.filter((u) => u.role === 'volunteer');
  const isSuperAdmin = currentUser.role === 'superadmin';

  const handleExport = () => {
    const rows = buildAttendanceRows(event, registrations, attendanceRecords, db.users);
    downloadCsv(`${event.title.replace(/\s+/g, '-').toLowerCase()}-attendance.csv`, rows);
  };

  return (
    <Shell
      title={event.title}
      subtitle="Manage event details, volunteers, and attendance."
      actions={
        <div className="flex gap-2">
          <Button as={Link} to="/admin/events" variant="secondary" size="sm">
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
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
        <StatCard label="Attended" value={attendedStudentIds.size} icon={ShieldCheck} tone="success" />
        <StatCard label="Points per attendee" value={event.points} icon={Award} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Event details" />
            <p className="text-sm text-muted leading-relaxed">{event.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-border text-sm">
              <InfoRow icon={CalendarDays} label="Schedule" value={`${formatDate(event.startDate)} — ${formatDate(event.endDate)}`} />
              <InfoRow icon={MapPin} label="Location" value={event.location} />
              <InfoRow icon={Users} label="Registration" value={event.registrationRequired ? 'Required' : 'Not required'} />
              <InfoRow icon={Users} label="Walk-in" value={event.walkInAllowed ? 'Allowed' : 'Not allowed'} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Attendance"
              subtitle={`${attendanceRecords.length} confirmed records`}
              action={
                <Button size="sm" variant="secondary" onClick={handleExport} disabled={attendanceRecords.length === 0}>
                  <Download className="size-4" /> Export CSV
                </Button>
              }
            />
            {registrations.length === 0 ? (
              <p className="text-sm text-muted">No registrations yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                      <th className="px-5 py-2.5">Student</th>
                      <th className="px-5 py-2.5">GR Number</th>
                      <th className="px-5 py-2.5">Scanned by</th>
                      <th className="px-5 py-2.5">Time</th>
                      <th className="px-5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const student = db.users.find((u) => u.id === reg.student);
                      const record = attendanceRecords.find((a) => a.registration === reg.id);
                      const volunteer = record && db.users.find((u) => u.id === record.scannedBy);
                      return (
                        <tr key={reg.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
                                {initials(student?.name || '?')}
                              </div>
                              <span className="font-medium text-ink">{student?.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted">{student?.grNumber}</td>
                          <td className="px-5 py-3 text-muted">{volunteer?.name || '—'}</td>
                          <td className="px-5 py-3 text-muted">{record ? formatDateTime(record.scannedAt) : '—'}</td>
                          <td className="px-5 py-3">
                            {record ? (
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Assigned volunteers"
              action={
                <Button size="sm" variant="secondary" onClick={() => setVolunteersOpen(true)}>
                  Manage
                </Button>
              }
            />
            {event.volunteers.length === 0 ? (
              <p className="text-sm text-muted">No volunteers assigned.</p>
            ) : (
              <div className="space-y-2.5">
                {event.volunteers.map((id) => {
                  const v = db.users.find((u) => u.id === id);
                  if (!v) return null;
                  return (
                    <div key={id} className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
                        {initials(v.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-ink truncate">{v.name}</p>
                        <p className="text-xs text-muted truncate">{v.grNumber}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Event actions" />
            <div className="space-y-2.5">
              {event.status !== 'closed' && event.status !== 'cancelled' && (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => closeEvent(event.id)}
                >
                  <Lock className="size-4" /> Close event manually
                </Button>
              )}
              {isSuperAdmin && (
                <Button
                  variant="destructive-outline"
                  className="w-full justify-start"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" /> Delete event
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <EditEventModal open={editOpen} onClose={() => setEditOpen(false)} event={event} onSave={updateEvent} />
      <ManageVolunteersModal
        open={volunteersOpen}
        onClose={() => setVolunteersOpen(false)}
        event={event}
        volunteers={volunteers}
        onSave={assignVolunteers}
      />
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this event?"
        subtitle="This will permanently remove the event. Registrations and attendance data will remain orphaned."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteEvent(event.id);
                navigate('/admin/events');
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Are you sure you want to delete "{event.title}"?</p>
      </Modal>
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

function EditEventModal({ open, onClose, event, onSave }) {
  const [form, setForm] = useState(event);

  useEffect(() => {
    if (open) setForm(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.id]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    onSave(event.id, { ...form, points: Number(form.points) });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit event"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="edit-title">
          <Input id="edit-title" value={form.title} onChange={update('title')} />
        </Field>
        <Field label="Description" htmlFor="edit-desc">
          <Textarea id="edit-desc" rows={3} value={form.description} onChange={update('description')} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location" htmlFor="edit-loc">
            <Input id="edit-loc" value={form.location} onChange={update('location')} />
          </Field>
          <Field label="Points" htmlFor="edit-points">
            <Input id="edit-points" type="number" min={0} value={form.points} onChange={update('points')} />
          </Field>
        </div>
        <Field label="Status" htmlFor="edit-status">
          <Select id="edit-status" value={form.status} onChange={update('status')}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

function ManageVolunteersModal({ open, onClose, event, volunteers, onSave }) {
  const [selected, setSelected] = useState(event.volunteers);

  useEffect(() => {
    if (open) setSelected(event.volunteers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event.id]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSave = () => {
    onSave(event.id, selected);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage volunteers"
      subtitle="Only assigned volunteers can scan attendance for this event."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save assignment</Button>
        </>
      }
    >
      <div className="space-y-1">
        {volunteers.map((v) => (
          <label
            key={v.id}
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
          >
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={selected.includes(v.id)}
              onChange={() => toggle(v.id)}
            />
            <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
              {initials(v.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{v.name}</p>
              <p className="text-xs text-muted">{v.grNumber}</p>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
}
