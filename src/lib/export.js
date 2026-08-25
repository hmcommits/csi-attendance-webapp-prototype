export function buildAttendanceRows(event, registrations, attendanceRecords, users) {
  return registrations.map((reg) => {
    const student = users.find((u) => u.id === reg.student);
    const record = attendanceRecords.find((a) => a.registration === reg.id);
    const volunteer = record && users.find((u) => u.id === record.scannedBy);
    return {
      'Student Name': student?.name || '',
      'GR Number': student?.grNumber || '',
      'Roll Number': student?.rollNumber || '',
      Class: student?.class || '',
      Department: student?.department || '',
      Event: event.title,
      'Registered At': reg.registeredAt,
      Status: record ? 'Attended' : 'Registered',
      'Scanned By': volunteer?.name || '',
      'Scanned At': record?.scannedAt || '',
      'Points Awarded': record?.pointsAwarded ?? 0,
    };
  });
}

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
