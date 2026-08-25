import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SEED_ATTENDANCE_KEYS,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_USERS,
} from '../lib/seedData';
import { encodeToken, decodeToken, uid } from '../lib/utils';

const STORAGE_KEY = 'apticore_db_v1';
const SESSION_KEY = 'apticore_session_v1';

function buildSeedDatabase() {
  const users = SEED_USERS.map((u) => ({ ...u, isDemo: true }));
  const events = SEED_EVENTS.map((e) => ({ ...e }));
  const registrations = [];
  const attendance = [];
  const pointLedger = [];

  for (const reg of SEED_REGISTRATIONS) {
    const registeredAt = new Date();
    registeredAt.setDate(registeredAt.getDate() - reg.daysAgo);
    const registration = {
      id: uid('reg'),
      student: reg.student,
      event: reg.event,
      registeredAt: registeredAt.toISOString(),
      isWalkIn: !!reg.isWalkIn,
    };
    registration.qrToken = encodeToken({
      studentId: reg.student,
      eventId: reg.event,
      registrationId: registration.id,
    });
    registrations.push(registration);
  }

  const findReg = (studentId, eventId) =>
    registrations.find((r) => r.student === studentId && r.event === eventId);

  for (const key of SEED_ATTENDANCE_KEYS) {
    const [studentId, eventId, sessionId] = key.split('|');
    const registration = findReg(studentId, eventId);
    if (!registration) continue;
    const event = events.find((e) => e.id === eventId);
    const scannedAt = new Date(registration.registeredAt);
    scannedAt.setHours(scannedAt.getHours() + 2);
    const record = {
      id: uid('att'),
      registration: registration.id,
      student: studentId,
      event: eventId,
      session: sessionId || null,
      scannedBy: event?.volunteers?.[0] || 'u_vol1',
      scannedAt: scannedAt.toISOString(),
      pointsAwarded: event?.points || 0,
      offlineSyncStatus: 'synced',
    };
    attendance.push(record);
    pointLedger.push({
      id: uid('pt'),
      student: studentId,
      event: eventId,
      points: record.pointsAwarded,
      reason: `Attendance — ${event?.title || 'Event'}`,
      createdAt: record.scannedAt,
    });
  }

  return { users, events, registrations, attendance, pointLedger, offlineQueue: [] };
}

function loadDatabase() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseed
  }
  const seeded = buildSeedDatabase();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [db, setDb] = useState(loadDatabase);
  const [session, setSession] = useState(loadSession);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone, key: uid('toast') });
  }, []);

  const currentUser = useMemo(
    () => (session ? db.users.find((u) => u.id === session.userId) : null),
    [session, db.users],
  );

  // ---------- Auth ----------
  const login = useCallback(
    (grNumber, password) => {
      const user = db.users.find(
        (u) => u.grNumber.toLowerCase() === grNumber.trim().toLowerCase(),
      );
      if (!user) return { ok: false, error: 'No account found with that GR number.' };
      if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
      if (user.role === 'student' && !user.isApproved) {
        return {
          ok: false,
          error: 'Your account is pending administrator approval.',
        };
      }
      setSession({ userId: user.id });
      return { ok: true, user };
    },
    [db.users],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const registerStudent = useCallback(
    (payload) => {
      const exists = db.users.some(
        (u) => u.grNumber.toLowerCase() === payload.grNumber.trim().toLowerCase(),
      );
      if (exists) return { ok: false, error: 'A user with this GR number already exists.' };
      const user = {
        id: uid('u'),
        role: 'student',
        createdAt: new Date().toISOString(),
        ...payload,
        isApproved: true,
      };
      setDb((prev) => ({ ...prev, users: [...prev.users, user] }));
      return { ok: true, user };
    },
    [db.users],
  );

  const requestPasswordReset = useCallback(
    (userId) => {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, resetPasswordAvailable: true } : u,
        ),
      }));
      notify('Password reset access enabled.');
    },
    [notify],
  );

  const setNewPassword = useCallback(
    (userId, newPassword) => {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, password: newPassword, resetPasswordAvailable: false } : u,
        ),
      }));
      notify('Password updated.');
    },
    [notify],
  );

  const createUser = useCallback(
    (payload) => {
      const exists = db.users.some(
        (u) => u.grNumber.toLowerCase() === payload.grNumber.trim().toLowerCase(),
      );
      if (exists) return { ok: false, error: 'A user with this GR number already exists.' };
      const user = {
        id: uid('u'),
        isApproved: true,
        createdAt: new Date().toISOString(),
        ...payload,
      };
      setDb((prev) => ({ ...prev, users: [...prev.users, user] }));
      notify(`${payload.role === 'volunteer' ? 'Volunteer' : 'Coordinator'} created.`);
      return { ok: true, user };
    },
    [db.users, notify],
  );

  const updateUser = useCallback((userId, patch) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }));
    notify('User updated.');
  }, [notify]);

  const deleteUser = useCallback((userId) => {
    setDb((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== userId) }));
    notify('User removed.', 'error');
  }, [notify]);

  // ---------- Events ----------
  const createEvent = useCallback(
    (payload) => {
      const event = {
        id: uid('e'),
        status: 'upcoming',
        volunteers: [],
        sessions: [],
        createdAt: new Date().toISOString(),
        ...payload,
      };
      setDb((prev) => ({ ...prev, events: [...prev.events, event] }));
      notify('Event created.');
      return event;
    },
    [notify],
  );

  const updateEvent = useCallback((eventId, patch) => {
    setDb((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === eventId ? { ...e, ...patch } : e)),
    }));
    notify('Event updated.');
  }, [notify]);

  const deleteEvent = useCallback((eventId) => {
    setDb((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== eventId) }));
    notify('Event deleted.', 'error');
  }, [notify]);

  const assignVolunteers = useCallback(
    (eventId, volunteerIds) => {
      setDb((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId ? { ...e, volunteers: volunteerIds } : e,
        ),
      }));
      notify('Volunteers assigned.');
    },
    [notify],
  );

  const closeEvent = useCallback(
    (eventId) => {
      setDb((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === eventId ? { ...e, status: 'closed' } : e)),
      }));
      notify('Event closed.');
    },
    [notify],
  );

  // ---------- Registration ----------
  const registerForEvent = useCallback(
    (studentId, eventId, opts = {}) => {
      const event = db.events.find((e) => e.id === eventId);
      if (!event) return { ok: false, error: 'Event not found.' };
      if (event.status === 'closed' || event.status === 'cancelled') {
        return { ok: false, error: 'Registration is closed for this event.' };
      }
      const already = db.registrations.some(
        (r) => r.student === studentId && r.event === eventId,
      );
      if (already) return { ok: false, error: 'You are already registered for this event.' };
      if (opts.isWalkIn && !event.walkInAllowed) {
        return { ok: false, error: 'Walk-in registration is not enabled for this event.' };
      }

      const registration = {
        id: uid('reg'),
        student: studentId,
        event: eventId,
        registeredAt: new Date().toISOString(),
        isWalkIn: !!opts.isWalkIn,
      };
      registration.qrToken = encodeToken({
        studentId,
        eventId,
        registrationId: registration.id,
      });
      setDb((prev) => ({ ...prev, registrations: [...prev.registrations, registration] }));
      notify('Registered for event.');
      return { ok: true, registration };
    },
    [db.events, db.registrations, notify],
  );

  // ---------- Scanning ----------
  const verifyScanToken = useCallback(
    (token, volunteerId) => {
      const payload = decodeToken(token);
      if (!payload) return { ok: false, error: 'Malformed or unreadable QR token.' };

      const registration = db.registrations.find((r) => r.id === payload.registrationId);
      if (!registration) return { ok: false, error: 'Registration not found for this token.' };

      const student = db.users.find((u) => u.id === registration.student);
      const event = db.events.find((e) => e.id === registration.event);
      if (!student || !event) return { ok: false, error: 'Student or event no longer exists.' };

      if (event.status === 'closed' || event.status === 'cancelled') {
        return { ok: false, error: `Event is ${event.status}. Attendance cannot be recorded.` };
      }

      const volunteer = db.users.find((u) => u.id === volunteerId);
      if (volunteer?.role === 'volunteer' && !event.volunteers.includes(volunteerId)) {
        return { ok: false, error: 'You are not assigned to this event.' };
      }

      return { ok: true, student, event, registration };
    },
    [db.registrations, db.users, db.events],
  );

  const confirmAttendance = useCallback(
    (token, volunteerId, sessionId = null) => {
      const verification = verifyScanToken(token, volunteerId);
      if (!verification.ok) return verification;
      const { student, event, registration } = verification;

      const duplicate = db.attendance.some(
        (a) => a.registration === registration.id && (a.session || null) === (sessionId || null),
      );
      if (duplicate) {
        return { ok: false, error: 'Attendance already confirmed for this session.', duplicate: true };
      }

      const record = {
        id: uid('att'),
        registration: registration.id,
        student: student.id,
        event: event.id,
        session: sessionId,
        scannedBy: volunteerId,
        scannedAt: new Date().toISOString(),
        pointsAwarded: event.points,
        offlineSyncStatus: 'synced',
      };
      const ledgerEntry = {
        id: uid('pt'),
        student: student.id,
        event: event.id,
        points: event.points,
        reason: `Attendance — ${event.title}`,
        createdAt: record.scannedAt,
      };

      setDb((prev) => ({
        ...prev,
        attendance: [...prev.attendance, record],
        pointLedger: [...prev.pointLedger, ledgerEntry],
      }));
      notify(`Attendance confirmed for ${student.name}. +${event.points} pts`);
      return { ok: true, record };
    },
    [db.attendance, notify, verifyScanToken],
  );

  const queueOfflineScan = useCallback((token, eventId, sessionId = null) => {
    const item = {
      id: uid('off'),
      token,
      event: eventId,
      session: sessionId,
      scannedAtLocal: new Date().toISOString(),
      synced: false,
      attempts: 0,
    };
    setDb((prev) => ({ ...prev, offlineQueue: [...prev.offlineQueue, item] }));
    return item;
  }, []);

  const syncOfflineQueue = useCallback(
    (volunteerId) => {
      let syncedCount = 0;
      let failedCount = 0;
      setDb((prev) => {
        const nextAttendance = [...prev.attendance];
        const nextLedger = [...prev.pointLedger];
        const nextQueue = prev.offlineQueue.map((item) => {
          if (item.synced) return item;
          const payload = decodeToken(item.token);
          const registration = prev.registrations.find((r) => r.id === payload?.registrationId);
          const student = registration && prev.users.find((u) => u.id === registration.student);
          const event = registration && prev.events.find((e) => e.id === registration.event);
          const duplicate =
            registration &&
            nextAttendance.some(
              (a) =>
                a.registration === registration.id &&
                (a.session || null) === (item.session || null),
            );
          if (!registration || !student || !event || duplicate) {
            failedCount += 1;
            return { ...item, attempts: item.attempts + 1, lastError: 'Could not sync record.' };
          }
          nextAttendance.push({
            id: uid('att'),
            registration: registration.id,
            student: student.id,
            event: event.id,
            session: item.session,
            scannedBy: volunteerId,
            scannedAt: new Date().toISOString(),
            pointsAwarded: event.points,
            offlineSyncStatus: 'synced',
          });
          nextLedger.push({
            id: uid('pt'),
            student: student.id,
            event: event.id,
            points: event.points,
            reason: `Attendance — ${event.title} (offline sync)`,
            createdAt: new Date().toISOString(),
          });
          syncedCount += 1;
          return { ...item, synced: true };
        });
        return { ...prev, attendance: nextAttendance, pointLedger: nextLedger, offlineQueue: nextQueue };
      });
      notify(`Synced ${syncedCount} scan${syncedCount === 1 ? '' : 's'}${failedCount ? `, ${failedCount} failed` : ''}.`);
    },
    [notify],
  );

  const value = useMemo(
    () => ({
      db,
      session,
      currentUser,
      toast,
      clearToast: () => setToast(null),
      notify,
      login,
      logout,
      registerStudent,
      requestPasswordReset,
      setNewPassword,
      createUser,
      updateUser,
      deleteUser,
      createEvent,
      updateEvent,
      deleteEvent,
      assignVolunteers,
      closeEvent,
      registerForEvent,
      verifyScanToken,
      confirmAttendance,
      queueOfflineScan,
      syncOfflineQueue,
    }),
    [
      db,
      session,
      currentUser,
      toast,
      notify,
      login,
      logout,
      registerStudent,
      requestPasswordReset,
      setNewPassword,
      createUser,
      updateUser,
      deleteUser,
      createEvent,
      updateEvent,
      deleteEvent,
      assignVolunteers,
      closeEvent,
      registerForEvent,
      verifyScanToken,
      confirmAttendance,
      queueOfflineScan,
      syncOfflineQueue,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
