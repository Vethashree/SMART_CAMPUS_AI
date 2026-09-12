import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { SupportRequestProvider } from './features/support/SupportRequestContext';

import LandingPage from './features/support/pages/LandingPage';
import AccessModePage from './features/support/pages/AccessModePage';
import LanguagePage from './features/support/pages/LanguagePage';
import AccessibilityPreferencesPage from './features/support/pages/AccessibilityPreferencesPage';
import RequestPage from './features/support/pages/RequestPage';
import ClassificationPage from './features/support/pages/ClassificationPage';
import RoutingExplanationPage from './features/support/pages/RoutingExplanationPage';
import PrivacyConsentPage from './features/support/pages/PrivacyConsentPage';
import ConfirmationPage from './features/support/pages/ConfirmationPage';

import TrackingPage from './features/tickets/pages/TrackingPage';
import TicketDetailPage from './features/tickets/pages/TicketDetailPage';

import AssistedSupportPage from './features/assisted/pages/AssistedSupportPage';
import StaffDashboardPage from './features/staff/pages/StaffDashboardPage';
import ImpactPage from './features/impact/pages/ImpactPage';

function SupportFlow() {
  return (
    <SupportRequestProvider>
      <Outlet />
    </SupportRequestProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />

          <Route path="/support" element={<SupportFlow />}>
            <Route index element={<Navigate to="access-mode" replace />} />
            <Route path="access-mode" element={<AccessModePage />} />
            <Route path="language" element={<LanguagePage />} />
            <Route path="accessibility" element={<AccessibilityPreferencesPage />} />
            <Route path="request" element={<RequestPage />} />
            <Route path="classification" element={<ClassificationPage />} />
            <Route path="routing" element={<RoutingExplanationPage />} />
            <Route path="privacy" element={<PrivacyConsentPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
          </Route>

          <Route path="/track" element={<TrackingPage />} />
          <Route path="/track/:ticketId" element={<TicketDetailPage />} />

          <Route path="/assisted" element={<AssistedSupportPage />} />
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/impact" element={<ImpactPage />} />

          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
