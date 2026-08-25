import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, UserPlus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Input';

const YEARS = ['FE', 'SE', 'TE', 'BE'];
const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecom',
  'Mechanical Engineering',
  'Civil Engineering',
];

export default function Register() {
  const { registerStudent } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    grNumber: '',
    rollNumber: '',
    class: '',
    division: '',
    year: 'FE',
    department: DEPARTMENTS[0],
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = registerStudent(form);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    }, 400);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-success-soft text-success mb-5">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-ink">Registration submitted</h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Your account is pending administrator approval. You'll be able to sign in with your
            GR number and password once approved.
          </p>
          <Button className="w-full mt-6" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background py-10">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="flex items-center justify-center size-9 rounded-md bg-primary text-white">
            <LayoutGrid className="size-5" />
          </div>
          <span className="text-lg font-bold text-ink">Attendance Webapp</span>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-ink">Create your student account</h2>
          <p className="text-sm text-muted mt-1.5">
            Self-registration requires administrator approval before you can sign in.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" htmlFor="name" required>
                <Input id="name" required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
              </Field>
              <Field label="GR Number" htmlFor="grNumber" required>
                <Input id="grNumber" required value={form.grNumber} onChange={update('grNumber')} placeholder="23CO099" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Roll number" htmlFor="rollNumber" required>
                <Input id="rollNumber" required value={form.rollNumber} onChange={update('rollNumber')} placeholder="45" />
              </Field>
              <Field label="Class" htmlFor="class" required>
                <Input id="class" required value={form.class} onChange={update('class')} placeholder="TE-COMPS" />
              </Field>
              <Field label="Division" htmlFor="division" required>
                <Input id="division" required value={form.division} onChange={update('division')} placeholder="A" />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Year" htmlFor="year" required>
                <Select id="year" value={form.year} onChange={update('year')}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Department" htmlFor="department" required>
                <Select id="department" value={form.department} onChange={update('department')}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" htmlFor="email" hint="Optional">
                <Input id="email" type="email" value={form.email} onChange={update('email')} placeholder="jane@dmce.ac.in" />
              </Field>
              <Field label="Phone" htmlFor="phone" hint="Optional">
                <Input id="phone" value={form.phone} onChange={update('phone')} placeholder="98765 43210" />
              </Field>
            </div>

            <Field label="Password" htmlFor="password" required error={error}>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update('password')}
                placeholder="At least 6 characters"
              />
            </Field>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <UserPlus className="size-4" />
              Submit registration
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
