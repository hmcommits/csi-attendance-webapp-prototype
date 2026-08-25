import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { HOME_BY_ROLE } from './components/layout/navConfig';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Toast from './components/ui/Toast';

import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import StudentDashboard from './pages/student/Dashboard';
import StudentEvents from './pages/student/Events';
import StudentEventDetail from './pages/student/EventDetail';
import StudentEventQR from './pages/student/EventQR';
import StudentPoints from './pages/student/Points';
import StudentHistory from './pages/student/History';

import VolunteerEvents from './pages/volunteer/Events';
import VolunteerEventDetail from './pages/volunteer/EventDetail';
import VolunteerScanner from './pages/volunteer/Scanner';

import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminEventCreate from './pages/admin/EventCreate';
import AdminEventDetail from './pages/admin/EventDetail';
import AdminStudents from './pages/admin/Students';
import AdminVolunteers from './pages/admin/Volunteers';
import AdminReports from './pages/admin/Reports';
import AdminPoints from './pages/admin/Points';

export default function App() {
  const { currentUser } = useApp();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={currentUser ? HOME_BY_ROLE[currentUser.role] : '/login'} replace />}
        />
        <Route path="/login" element={currentUser ? <Navigate to={HOME_BY_ROLE[currentUser.role]} replace /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to={HOME_BY_ROLE[currentUser.role]} replace /> : <Register />} />

        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/events/:eventId" element={<StudentEventDetail />} />
          <Route path="/student/events/:eventId/qr" element={<StudentEventQR />} />
          <Route path="/student/points" element={<StudentPoints />} />
          <Route path="/student/history" element={<StudentHistory />} />
        </Route>

        <Route element={<ProtectedRoute roles={['volunteer']} />}>
          <Route path="/volunteer/events" element={<VolunteerEvents />} />
          <Route path="/volunteer/events/:eventId" element={<VolunteerEventDetail />} />
          <Route path="/volunteer/scanner" element={<VolunteerScanner />} />
          <Route path="/volunteer/scanner/:eventId" element={<VolunteerScanner />} />
        </Route>

        <Route element={<ProtectedRoute roles={['coordinator', 'superadmin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/events/create" element={<AdminEventCreate />} />
          <Route path="/admin/events/:eventId" element={<AdminEventDetail />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/points" element={<AdminPoints />} />
        </Route>

        <Route element={<ProtectedRoute roles={['superadmin']} />}>
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/volunteers" element={<AdminVolunteers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </>
  );
}
