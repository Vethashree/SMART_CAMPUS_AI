import { useSession } from '../context/SessionContext';
import SmartAttendance from '../components/SmartAttendance';
import AITimetable from '../components/AITimetable';
import TestMarks from '../components/TestMarks';
import SmartSecurity from '../components/SmartSecurity';
import CareerPrediction from '../components/CareerPrediction';
import CGPACalculator from '../components/CGPACalculator';

export function AttendancePage() {
  const { currentUser } = useSession();
  return <SmartAttendance currentUser={currentUser} />;
}

export function TimetablePage() {
  const { currentUser } = useSession();
  return <AITimetable currentUser={currentUser} />;
}

export function TestMarksPage() {
  const { currentUser } = useSession();
  return <TestMarks currentUser={currentUser} />;
}

export function SecurityPage() {
  const { currentUser } = useSession();
  return <SmartSecurity currentUser={currentUser} />;
}

export function CareerPredictionPage() {
  const { currentUser } = useSession();
  return <CareerPrediction currentUser={currentUser} />;
}

export function CGPAPage() {
  const { currentUser } = useSession();
  return <CGPACalculator currentUser={currentUser} />;
}
