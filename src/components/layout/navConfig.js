import {
  LayoutDashboard,
  CalendarDays,
  Award,
  History,
  Users,
  ShieldCheck,
  FileBarChart,
  Trophy,
  ScanLine,
} from 'lucide-react';

export const NAV_BY_ROLE = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/events', label: 'Events', icon: CalendarDays },
    { to: '/student/points', label: 'Points', icon: Award },
    { to: '/student/history', label: 'History', icon: History },
  ],
  volunteer: [
    { to: '/volunteer/events', label: 'Assigned Events', icon: CalendarDays },
    { to: '/volunteer/scanner', label: 'Scanner', icon: ScanLine },
  ],
  coordinator: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/events', label: 'Events', icon: CalendarDays },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
    { to: '/admin/points', label: 'Points & Leaderboard', icon: Trophy },
  ],
  superadmin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/events', label: 'Events', icon: CalendarDays },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/volunteers', label: 'Volunteers', icon: ShieldCheck },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
    { to: '/admin/points', label: 'Points & Leaderboard', icon: Trophy },
  ],
};

export const ROLE_LABELS = {
  student: 'Student',
  volunteer: 'Volunteer',
  coordinator: 'Event Coordinator',
  superadmin: 'Super Admin',
};

export const HOME_BY_ROLE = {
  student: '/student/dashboard',
  volunteer: '/volunteer/events',
  coordinator: '/admin/dashboard',
  superadmin: '/admin/dashboard',
};
