import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  LogIn,
  KeyRound,
  IdCard,
  ShieldCheck,
  ScanLine,
  GraduationCap,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HOME_BY_ROLE } from '../components/layout/navConfig';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Field, Input } from '../components/ui/Input';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', grNumber: 'ADMIN001', password: 'admin123', icon: ShieldCheck },
  { role: 'Coordinator', grNumber: 'COORD001', password: 'coord123', icon: IdCard },
  { role: 'Volunteer', grNumber: 'VOL001', password: 'vol123', icon: ScanLine },
  { role: 'Student', grNumber: '22CO045', password: 'student123', icon: GraduationCap },
];

export default function Login() {
  const { db, login, setNewPassword } = useApp();
  const navigate = useNavigate();
  const [grNumber, setGrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotStage, setForgotStage] = useState(null);
  const [forgotUser, setForgotUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(grNumber, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(HOME_BY_ROLE[result.user.role], { replace: true });
    }, 350);
  };

  const fillDemo = (account) => {
    setGrNumber(account.grNumber);
    setPassword(account.password);
    setError('');
  };

  const handleForgotClick = () => {
    const trimmed = grNumber.trim();
    if (!trimmed) {
      setForgotStage('no-gr');
      return;
    }
    const user = db.users.find((u) => u.grNumber.toLowerCase() === trimmed.toLowerCase());
    if (!user) {
      setForgotStage('not-found');
      return;
    }
    setForgotUser(user);
    setForgotStage(user.resetPasswordAvailable ? 'form' : 'locked');
  };

  const closeForgot = () => {
    setForgotStage(null);
    setForgotUser(null);
  };

  const handlePasswordReset = (newPassword) => {
    setNewPassword(forgotUser.id, newPassword);
    setForgotStage('done');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex items-center justify-center size-9 rounded-md bg-white/15">
            <LayoutGrid className="size-5" />
          </div>
          <span className="text-lg font-bold">Attendance Webapp</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Attendance that verifies itself.
          </h1>
          <p className="mt-4 text-white/70 text-[15px] leading-relaxed">
            Static per-student QR codes, volunteer identity verification, and live
            reporting — built for CSI event registration and anti-proxy attendance.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'QR scan + physical ID cross-check',
              'Live dashboards and instant exports',
              'Offline-ready volunteer scanning',
            ].map((line) => (
              <div key={line} className="flex items-center gap-3 text-sm text-white/85">
                <span className="size-1.5 rounded-full bg-white/60" />
                {line}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          Frontend prototype · no backend connected · demo data only
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="flex items-center justify-center size-9 rounded-md bg-primary text-white">
              <LayoutGrid className="size-5" />
            </div>
            <span className="text-lg font-bold text-ink">Attendance Webapp</span>
          </div>

          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="text-sm text-muted mt-1.5">Sign in with your GR number to continue.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <Field label="GR Number" htmlFor="grNumber" required>
              <Input
                id="grNumber"
                icon={IdCard}
                placeholder="e.g. 22CO045"
                value={grNumber}
                onChange={(e) => setGrNumber(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <div>
              <Field label="Password" htmlFor="password" required error={error}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={KeyRound}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-muted hover:text-ink transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                />
              </Field>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={handleForgotClick}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <LogIn className="size-4" />
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            New student?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
              Quick demo access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.grNumber}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="flex items-center gap-2 rounded-sm border border-border px-3 py-2.5 text-left hover:border-primary hover:bg-primary-soft transition-colors"
                >
                  <account.icon className="size-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-ink truncate">{account.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        stage={forgotStage}
        user={forgotUser}
        onClose={closeForgot}
        onSubmit={handlePasswordReset}
      />
    </div>
  );
}

function ForgotPasswordModal({ stage, user, onClose, onSubmit }) {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');

  if (!stage) return null;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPw1('');
      setPw2('');
      setFormError('');
      setShowPw(false);
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw1.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (pw1 !== pw2) {
      setFormError('Passwords do not match.');
      return;
    }
    setFormError('');
    onSubmit(pw1);
  };

  if (stage === 'no-gr' || stage === 'not-found') {
    return (
      <Modal
        open
        onClose={handleClose}
        title="Forgot password"
        footer={<Button onClick={handleClose}>Got it</Button>}
      >
        <p className="text-sm text-muted">
          {stage === 'no-gr'
            ? "Enter your GR number above, then click \"Forgot password?\" again."
            : 'No account found with that GR number.'}
        </p>
      </Modal>
    );
  }

  if (stage === 'locked') {
    return (
      <Modal
        open
        onClose={handleClose}
        title="Forgot password"
        footer={<Button onClick={handleClose}>Got it</Button>}
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="flex items-center justify-center size-14 rounded-full bg-warning-soft text-warning mb-4">
            <ShieldAlert className="size-7" />
          </div>
          <p className="text-sm font-semibold text-ink">Password reset isn't available yet</p>
          <p className="text-sm text-muted mt-1.5">
            Please contact your administrator to unlock the reset screen for {user?.name}'s account.
          </p>
        </div>
      </Modal>
    );
  }

  if (stage === 'done') {
    return (
      <Modal
        open
        onClose={handleClose}
        title="Password updated"
        footer={<Button onClick={handleClose}>Back to sign in</Button>}
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="flex items-center justify-center size-14 rounded-full bg-success-soft text-success mb-4">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="text-sm font-semibold text-ink">Your password has been updated</p>
          <p className="text-sm text-muted mt-1.5">You can now sign in with your new password.</p>
        </div>
      </Modal>
    );
  }

  // stage === 'form'
  return (
    <Modal
      open
      onClose={handleClose}
      title="Reset your password"
      subtitle={`${user?.name} · ${user?.grNumber}`}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <KeyRound className="size-4" /> Set new password
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New password" htmlFor="pw1" required>
          <Input
            id="pw1"
            type={showPw ? 'text' : 'password'}
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            placeholder="At least 6 characters"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-muted hover:text-ink transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw2" required error={formError}>
          <Input
            id="pw2"
            type={showPw ? 'text' : 'password'}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Re-enter password"
          />
        </Field>
      </form>
    </Modal>
  );
}
