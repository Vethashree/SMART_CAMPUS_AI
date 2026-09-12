import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import RegisterNumberAuth from './pages/RegisterNumberAuth';
import StudentRegistration from './pages/StudentRegistration';
import Game from './pages/Game';
import InstituteLogin from './pages/InstituteLogin';
import InstituteDashboard from './pages/InstituteDashboard';
import AdminSetup from './pages/AdminSetup';
import { ProtectedRoute } from './hooks/useAuthGuard';

/**
 * Persona Health's routes, namespaced under /persona so they sit alongside
 * Smart Campus Core rather than replacing it (Phase 30 of the SERA build
 * brief). Each page manages its own auth/registration gating exactly like
 * the original app did; StudentRegistration and the institute dashboard are
 * additionally wrapped here since they must never render without a session.
 */
export default function PersonaRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/register-number" element={<RegisterNumberAuth />} />
      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <StudentRegistration />
          </ProtectedRoute>
        }
      />
      <Route path="/game" element={<Game />} />
      <Route path="/institute-login" element={<InstituteLogin />} />
      <Route path="/institute-dashboard" element={<InstituteDashboard />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route path="*" element={<Navigate to="/persona" replace />} />
    </Routes>
  );
}
