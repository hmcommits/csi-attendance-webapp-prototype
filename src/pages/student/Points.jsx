import { Award, TrendingUp, Sparkles } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../lib/utils';

export default function StudentPoints() {
  const { db, currentUser } = useApp();

  const myLedger = db.pointLedger
    .filter((p) => p.student === currentUser.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = myLedger.reduce((sum, p) => sum + p.points, 0);

  const sorted = [...db.users.filter((u) => u.role === 'student')]
    .map((u) => ({
      user: u,
      total: db.pointLedger.filter((p) => p.student === u.id).reduce((s, p) => s + p.points, 0),
    }))
    .sort((a, b) => b.total - a.total);
  const myRank = sorted.findIndex((s) => s.user.id === currentUser.id) + 1;

  return (
    <Shell title="Points" subtitle="Track your points earned from event participation.">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total points" value={total} icon={Award} tone="warning" />
        <StatCard label="Events contributing" value={myLedger.length} icon={Sparkles} tone="primary" />
        <StatCard label="Leaderboard rank" value={myRank ? `#${myRank}` : '—'} icon={TrendingUp} tone="success" />
      </div>

      <Card>
        <CardHeader title="Points history" subtitle="Every transaction is logged for transparency" />
        {myLedger.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No points yet"
            description="Attend a CSI event and get your attendance confirmed to start earning points."
          />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[13px] font-semibold text-muted border-b border-border">
                  <th className="px-5 py-2.5">Reason</th>
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {myLedger.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-ink">{entry.reason}</td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(entry.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-success">+{entry.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Shell>
  );
}
