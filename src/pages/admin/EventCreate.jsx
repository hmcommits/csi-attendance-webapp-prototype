import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CalendarPlus } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { EVENT_TYPE_LABELS, uid } from '../../lib/utils';

function toLocalInput(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AdminEventCreate() {
  const { createEvent, currentUser } = useApp();
  const navigate = useNavigate();

  const now = new Date();
  now.setHours(now.getHours() + 24);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'seminar',
    location: '',
    points: 10,
    registrationRequired: true,
    walkInAllowed: true,
    startDate: toLocalInput(now),
    endDate: toLocalInput(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
    registrationDeadline: toLocalInput(now),
  });
  const [sessions, setSessions] = useState([]);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addSession = () => {
    setSessions((s) => [...s, { id: uid('sess'), label: `Day ${s.length + 1}`, date: form.startDate }]);
  };

  const updateSession = (id, patch) => {
    setSessions((s) => s.map((session) => (session.id === id ? { ...session, ...patch } : session)));
  };

  const removeSession = (id) => setSessions((s) => s.filter((session) => session.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    const event = createEvent({
      ...form,
      points: Number(form.points),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      createdBy: currentUser.id,
      sessions: form.type === 'multiday' ? sessions.map((s) => ({ ...s, date: new Date(s.date).toISOString() })) : [],
    });
    navigate(`/admin/events/${event.id}`);
  };

  return (
    <Shell
      title="Create event"
      subtitle="Set up a new CSI event for registration and attendance."
      actions={
        <Button as={Link} to="/admin/events" variant="secondary" size="sm">
          <ArrowLeft className="size-4" /> Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Basic details" />
          <div className="space-y-4">
            <Field label="Event title" htmlFor="title" required>
              <Input id="title" required value={form.title} onChange={update('title')} placeholder="e.g. AI in Practice — Guest Talk" />
            </Field>
            <Field label="Description" htmlFor="description" required>
              <Textarea id="description" required rows={4} value={form.description} onChange={update('description')} placeholder="What is this event about?" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Event type" htmlFor="type" required>
                <Select id="type" value={form.type} onChange={update('type')}>
                  {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Location" htmlFor="location" required>
                <Input id="location" required value={form.location} onChange={update('location')} placeholder="Seminar Hall I" />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Schedule" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Start" htmlFor="startDate" required>
              <Input id="startDate" type="datetime-local" required value={form.startDate} onChange={update('startDate')} />
            </Field>
            <Field label="End" htmlFor="endDate" required>
              <Input id="endDate" type="datetime-local" required value={form.endDate} onChange={update('endDate')} />
            </Field>
            <Field label="Registration deadline" htmlFor="registrationDeadline" required>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                required
                value={form.registrationDeadline}
                onChange={update('registrationDeadline')}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Registration & points" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Points on confirmed attendance" htmlFor="points" required>
              <Input id="points" type="number" min={0} required value={form.points} onChange={update('points')} />
            </Field>
            <div className="flex flex-col gap-3 justify-center">
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <input type="checkbox" checked={form.registrationRequired} onChange={update('registrationRequired')} className="size-4 accent-primary" />
                Registration required
              </label>
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <input type="checkbox" checked={form.walkInAllowed} onChange={update('walkInAllowed')} className="size-4 accent-primary" />
                Allow walk-in registration
              </label>
            </div>
          </div>
        </Card>

        {form.type === 'multiday' && (
          <Card>
            <CardHeader
              title="Sessions"
              subtitle="One registration will cover attendance across all sessions"
              action={
                <Button type="button" size="sm" variant="secondary" onClick={addSession}>
                  <Plus className="size-4" /> Add session
                </Button>
              }
            />
            {sessions.length === 0 ? (
              <p className="text-sm text-muted">No sessions added yet.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-end gap-3">
                    <div className="flex-1">
                      <Field label="Label">
                        <Input value={session.label} onChange={(e) => updateSession(session.id, { label: e.target.value })} />
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field label="Date & time">
                        <Input
                          type="datetime-local"
                          value={session.date}
                          onChange={(e) => updateSession(session.id, { date: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Button type="button" variant="destructive-outline" size="md" onClick={() => removeSession(session.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button as={Link} to="/admin/events" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">
            <CalendarPlus className="size-4" />
            Create event
          </Button>
        </div>
      </form>
    </Shell>
  );
}
