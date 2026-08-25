import { useMemo, useState } from 'react';
import { Search, Trophy, Award, Download } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';
import { useApp } from '../../context/AppContext';
import { cn, initials } from '../../lib/utils';
import { downloadCsv } from '../../lib/export';

export default function AdminPoints() {
  const { db } = useApp();
  const [query, setQuery] = useState('');

  const ranked = useMemo(() => {
    return db.users
      .filter((u) => u.role === 'student' && u.isApproved)
      .map((u) => ({
        user: u,
        total: db.pointLedger.filter((p) => p.student === u.id).reduce((s, p) => s + p.points, 0),
        events: new Set(db.attendance.filter((a) => a.student === u.id).map((a) => a.event)).size,
      }))
      .sort((a, b) => b.total - a.total)
      .filter((row) => row.user.name.toLowerCase().includes(query.toLowerCase()));
  }, [db.users, db.pointLedger, db.attendance, query]);

  const totalPoints = db.pointLedger.reduce((s, p) => s + p.points, 0);
  const topScorer = ranked[0];

  const handleExport = () => {
    downloadCsv(
      'points-leaderboard.csv',
      ranked.map((row, i) => ({
        Rank: i + 1,
        Student: row.user.name,
        'GR Number': row.user.grNumber,
        'Total Points': row.total,
        'Events Attended': row.events,
      })),
    );
  };

  return (
    <Shell
      title="Points & Leaderboard"
      subtitle="Cumulative points awarded across all events."
      actions={
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <Download className="size-4" /> Export
        </Button>
      }
    >
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total points issued" value={totalPoints} icon={Award} tone="warning" />
        <StatCard label="Students on leaderboard" value={ranked.length} icon={Trophy} tone="primary" />
        <StatCard label="Top scorer" value={topScorer ? topScorer.user.name.split(' ')[0] : '—'} icon={Trophy} tone="success" />
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <Input icon={Search} placeholder="Search students..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Events attended</th>
                <th className="px-5 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, i) => (
                <tr key={row.user.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center size-7 rounded-full text-xs font-bold',
                        i === 0 && 'bg-warning-soft text-warning',
                        i === 1 && 'bg-slate-200 text-muted',
                        i === 2 && 'bg-orange-100 text-orange-700',
                        i > 2 && 'text-muted',
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary-soft text-primary text-xs font-semibold shrink-0">
                        {initials(row.user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{row.user.name}</p>
                        <p className="text-xs text-muted">{row.user.grNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{row.user.department}</td>
                  <td className="px-5 py-3 text-muted">{row.events}</td>
                  <td className="px-5 py-3 text-right font-bold text-ink">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Shell>
  );
}
