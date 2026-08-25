export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return `${date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function encodeToken(payload) {
  const json = JSON.stringify({ ...payload, iat: Date.now() });
  if (typeof window === 'undefined') return json;
  return window.btoa(unescape(encodeURIComponent(json)));
}

export function decodeToken(token) {
  try {
    const json = decodeURIComponent(escape(window.atob(token)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const EVENT_TYPE_LABELS = {
  seminar: 'Seminar',
  workshop: 'Workshop',
  contest: 'Contest',
  multiday: 'Multi-day',
  debriefing: 'Debriefing',
};

export const EVENT_STATUS_LABELS = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  closed: 'Closed',
  cancelled: 'Cancelled',
};
