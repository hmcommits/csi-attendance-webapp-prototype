import { useMemo, useState } from 'react';
import { Search, UserCheck, KeyRound, Trash2, GraduationCap } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ApprovalBadge } from '../../components/StatusBadge';
import { Field, Input } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { cn, initials } from '../../lib/utils';

const FILTERS = ['all', 'pending', 'approved'];

export default function AdminStudents() {
  const { db, approveStudent, deleteUser, resetPassword } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const students = useMemo(() => {
    return db.users
      .filter((u) => u.role === 'student')
      .filter((u) => (filter === 'pending' ? !u.isApproved : filter === 'approved' ? u.isApproved : true))
      .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.grNumber.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => Number(a.isApproved) - Number(b.isApproved));
  }, [db.users, filter, query]);

  const pendingCount = db.users.filter((u) => u.role === 'student' && !u.isApproved).length;

  const openReset = (student) => {
    setResetTarget(student);
    setNewPassword('');
  };

  const handleReset = () => {
    if (!newPassword) return;
    resetPassword(resetTarget.id, newPassword);
    setResetTarget(null);
  };

  return (
    <Shell title="Students" subtitle={`${pendingCount} account${pendingCount === 1 ? '' : 's'} pending approval.`}>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input icon={Search} placeholder="Search by name or GR number..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
        <div className="flex gap-1.5 bg-slate-100 rounded-sm p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-sm text-[13px] font-medium capitalize transition-colors',
                filter === f ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students found" description="Try a different search or filter." />
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
                  <th className="px-5 py-3">Status</th>
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
                      <ApprovalBadge approved={student.isApproved} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {!student.isApproved && (
                          <Button size="sm" variant="secondary" onClick={() => approveStudent(student.id)}>
                            <UserCheck className="size-3.5" /> Approve
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openReset(student)}>
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive-outline" onClick={() => deleteUser(student.id)}>
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

      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title="Reset password"
        subtitle={resetTarget ? `Set a new password for ${resetTarget.name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleReset} disabled={!newPassword}>
              Reset password
            </Button>
          </>
        }
      >
        <Field label="New password" htmlFor="newPassword" required>
          <Input id="newPassword" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter a new password" />
        </Field>
      </Modal>
    </Shell>
  );
}
