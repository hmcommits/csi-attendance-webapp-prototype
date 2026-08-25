import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, ShieldCheck } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Field, Input, Select } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { initials } from '../../lib/utils';

const EMPTY_FORM = {
  name: '',
  grNumber: '',
  password: '',
  rollNumber: '',
  class: '',
  division: '',
  year: '',
  department: '',
  email: '',
  phone: '',
  role: 'volunteer',
};

export default function AdminVolunteers() {
  const { db, createUser, deleteUser } = useApp();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const staff = useMemo(
    () =>
      db.users
        .filter((u) => u.role === 'volunteer' || u.role === 'coordinator')
        .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)),
    [db.users, query],
  );

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const result = createUser(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(EMPTY_FORM);
    setCreateOpen(false);
  };

  return (
    <Shell
      title="Volunteers & Coordinators"
      subtitle="Manage staff accounts who scan attendance and manage events."
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Add staff
        </Button>
      }
    >
      <Input icon={Search} placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs mb-5" />

      {staff.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No staff members found" description="Add a volunteer or coordinator to get started." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((person) => {
            const assignedEvents = db.events.filter((e) => e.volunteers.includes(person.id));
            return (
              <Card key={person.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-11 rounded-full bg-primary-soft text-primary text-sm font-semibold shrink-0">
                      {initials(person.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{person.name}</p>
                      <p className="text-xs text-muted">{person.grNumber}</p>
                    </div>
                  </div>
                  <Badge tone={person.role === 'coordinator' ? 'primary' : 'success'}>
                    {person.role === 'coordinator' ? 'Coordinator' : 'Volunteer'}
                  </Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-border text-[13px] text-muted space-y-1.5">
                  <p>{person.department}</p>
                  <p>{person.email}</p>
                  {person.role === 'volunteer' && <p>{assignedEvents.length} assigned event(s)</p>}
                </div>
                <Button variant="destructive-outline" size="sm" className="w-full mt-4" onClick={() => deleteUser(person.id)}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add staff member"
        subtitle="Create a volunteer or coordinator account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create account</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Role" htmlFor="staff-role" required>
            <Select id="staff-role" value={form.role} onChange={update('role')}>
              <option value="volunteer">Volunteer</option>
              <option value="coordinator">Event Coordinator</option>
            </Select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" htmlFor="staff-name" required>
              <Input id="staff-name" required value={form.name} onChange={update('name')} />
            </Field>
            <Field label="GR Number" htmlFor="staff-gr" required>
              <Input id="staff-gr" required value={form.grNumber} onChange={update('grNumber')} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Department" htmlFor="staff-dept" required>
              <Input id="staff-dept" required value={form.department} onChange={update('department')} />
            </Field>
            <Field label="Email" htmlFor="staff-email">
              <Input id="staff-email" type="email" value={form.email} onChange={update('email')} />
            </Field>
          </div>
          <Field label="Temporary password" htmlFor="staff-password" required error={error}>
            <Input id="staff-password" required value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </Field>
        </form>
      </Modal>
    </Shell>
  );
}
