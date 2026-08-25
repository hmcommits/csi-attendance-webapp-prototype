import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileType, Trophy } from 'lucide-react';
import Shell from '../../components/layout/Shell';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { downloadCsv, buildAttendanceRows } from '../../lib/export';
import { formatDate } from '../../lib/utils';

const FORMATS = [
  { key: 'csv', label: 'CSV', icon: FileText },
  { key: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { key: 'pdf', label: 'PDF', icon: FileType },
];

export default function AdminReports() {
  const { db, notify } = useApp();
  const [eventId, setEventId] = useState(db.events[0]?.id || '');

  const event = db.events.find((e) => e.id === eventId);
  const registrations = event ? db.registrations.filter((r) => r.event === event.id) : [];
  const attendanceRecords = event ? db.attendance.filter((a) => a.event === event.id) : [];

  const handleExport = (format) => {
    if (!event) return;
    if (format !== 'csv') {
      notify(`${format.toUpperCase()} export is simulated in this prototype — downloading CSV instead.`, 'success');
    }
    const rows = buildAttendanceRows(event, registrations, attendanceRecords, db.users);
    downloadCsv(`${event.title.replace(/\s+/g, '-').toLowerCase()}-attendance.csv`, rows);
  };

  const handleLeaderboardExport = () => {
    const rows = db.users
      .filter((u) => u.role === 'student' && u.isApproved)
      .map((u) => ({
        'Student Name': u.name,
        'GR Number': u.grNumber,
        Department: u.department,
        'Total Points': db.pointLedger.filter((p) => p.student === u.id).reduce((s, p) => s + p.points, 0),
      }))
      .sort((a, b) => b['Total Points'] - a['Total Points']);
    downloadCsv('points-leaderboard.csv', rows);
  };

  return (
    <Shell title="Reports" subtitle="Export attendance and participation reports.">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Event attendance report" subtitle="Student identity, scan time, volunteer, and points" />
          <Select value={eventId} onChange={(e) => setEventId(e.target.value)} className="mb-5">
            {db.events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>

          {event && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <SummaryStat label="Registered" value={registrations.length} />
                <SummaryStat label="Attended" value={attendanceRecords.length} />
                <SummaryStat label="Event date" value={formatDate(event.startDate)} small />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {FORMATS.map((f) => (
                  <Button key={f.key} variant="secondary" onClick={() => handleExport(f.key)}>
                    <f.icon className="size-4" /> Export {f.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="Points leaderboard" subtitle="All students ranked by total points" />
          <p className="text-sm text-muted mb-4">
            Download a ranked CSV of every approved student's total points across all events.
          </p>
          <Button className="w-full" onClick={handleLeaderboardExport}>
            <Trophy className="size-4" /> Export leaderboard
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Student participation" subtitle="Export history across all events for a student" />
        <StudentParticipationExport db={db} />
      </Card>
    </Shell>
  );
}

function SummaryStat({ label, value, small }) {
  return (
    <div className="rounded-md bg-slate-50 px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={small ? 'text-sm font-semibold text-ink mt-0.5' : 'text-xl font-bold text-ink mt-0.5'}>{value}</p>
    </div>
  );
}

function StudentParticipationExport({ db }) {
  const [studentId, setStudentId] = useState(db.users.find((u) => u.role === 'student')?.id || '');
  const students = db.users.filter((u) => u.role === 'student');

  const handleExport = () => {
    const student = db.users.find((u) => u.id === studentId);
    if (!student) return;
    const rows = db.registrations
      .filter((r) => r.student === studentId)
      .map((reg) => {
        const event = db.events.find((e) => e.id === reg.event);
        const record = db.attendance.find((a) => a.registration === reg.id);
        return {
          Event: event?.title,
          'Registered At': reg.registeredAt,
          Status: record ? 'Attended' : 'Registered',
          Points: record?.pointsAwarded ?? 0,
        };
      });
    downloadCsv(`${student.grNumber}-participation.csv`, rows);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1">
        <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.grNumber}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleExport} className="sm:w-56">
        <Download className="size-4" /> Export participation
      </Button>
    </div>
  );
}
