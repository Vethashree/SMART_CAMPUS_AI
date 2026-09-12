import { Routes, Route } from 'react-router-dom';
import CampusShell from './layouts/CampusShell';
import DashboardPage from './pages/DashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyTrackerPage from './pages/StudyTrackerPage';
import SmartLibraryPage from './pages/SmartLibraryPage';
import CampusNoticesPage from './pages/CampusNoticesPage';
import OptimizeSchedulePage from './pages/OptimizeSchedulePage';
import PreferencesPage from './pages/PreferencesPage';
import {
  AttendancePage,
  CareerPredictionPage,
  CGPAPage,
  SecurityPage,
  TestMarksPage,
  TimetablePage,
} from './pages/ExistingModulePages';
import PersonaRoutes from './persona/PersonaRoutes';

function App() {
  return (
    <Routes>
      <Route element={<CampusShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assistant" element={<AIAssistantPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/timetable/optimize" element={<OptimizeSchedulePage />} />
        <Route path="/test-marks" element={<TestMarksPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/career-prediction" element={<CareerPredictionPage />} />
        <Route path="/cgpa-calculator" element={<CGPAPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/study" element={<StudyTrackerPage />} />
        <Route path="/library" element={<SmartLibraryPage />} />
        <Route path="/notices" element={<CampusNoticesPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Route>
      <Route path="/persona/*" element={<PersonaRoutes />} />
    </Routes>
  );
}

export default App;
