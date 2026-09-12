import type {
  CampusEvent,
  CampusNotice,
  LibraryZone,
  StudentPreferences,
  StudentProfile,
  StudyGoal,
  TimetableSlot,
} from '../core/types';

// Demo/seed scenario for SERA (Phase 36 of the SERA build brief): a 3rd-year CSE
// student with DSA/AI as active goals, a quiet-study + minimize-walking preference,
// a timetable with a free period, and live campus notices/events to react to.
// This is demo data, not a fake backend response — the recommendation, ranking,
// scheduling and repair engines that consume it are real deterministic logic.

export const DEMO_PROFILE: StudentProfile = {
  id: 'CSE2023047',
  name: 'Guest',
  year: 3,
  department: 'CSE',
  role: 'student',
};

export const DEMO_TIMETABLE: TimetableSlot[] = [
  { id: 't1', day: 'Mon', subject: 'DBMS', startMinutes: 9 * 60, endMinutes: 10 * 60, location: 'Block A 101' },
  // 10:00-11:00 free
  { id: 't2', day: 'Mon', subject: 'AI', startMinutes: 12 * 60, endMinutes: 13 * 60, location: 'Block A 204' },
  { id: 't3', day: 'Mon', subject: 'Networks', startMinutes: 14 * 60, endMinutes: 15 * 60, location: 'Block B 204' },
];

export const DEMO_STUDY_GOALS: StudyGoal[] = [
  { id: 'g1', subject: 'DSA', priority: 'high', examInDays: 4, masteryPercent: 45, recentStudyMinutes: 90 },
  { id: 'g2', subject: 'AI', priority: 'high', examInDays: 10, masteryPercent: 65, recentStudyMinutes: 120 },
  { id: 'g3', subject: 'DBMS', priority: 'medium', examInDays: 14, masteryPercent: 78, recentStudyMinutes: 60 },
  { id: 'g4', subject: 'Networks', priority: 'low', examInDays: 21, masteryPercent: 70, recentStudyMinutes: 20 },
];

export const DEMO_NOTICES: CampusNotice[] = [
  {
    id: 'n1',
    title: 'Networks classroom moved to Block B 204',
    body: 'Today\'s Networks lecture has been relocated from Block A to Block B, Room 204.',
    department: 'CSE',
    year: 3,
    courseSubjects: ['Networks'],
    location: 'Block B 204',
    urgency: 'high',
    postedMinutesAgo: 40,
    category: 'academic',
  },
  {
    id: 'n2',
    title: 'AI Workshop this afternoon',
    body: 'A hands-on AI workshop is running in the Innovation Lab from 5:30 PM. Open to CSE and AI students.',
    department: 'CSE',
    year: 3,
    courseSubjects: ['AI'],
    location: 'Innovation Lab',
    urgency: 'medium',
    postedMinutesAgo: 90,
    category: 'event',
  },
  {
    id: 'n3',
    title: 'Block B east entrance closed for maintenance',
    body: 'The east entrance of Block B is closed until further notice. Use the north entrance instead.',
    location: 'Block B',
    urgency: 'high',
    postedMinutesAgo: 20,
    category: 'facility',
  },
  {
    id: 'n4',
    title: 'Annual cultural fest — registrations open',
    body: 'Register for the annual cultural fest. Open to all departments and years.',
    urgency: 'low',
    postedMinutesAgo: 300,
    category: 'general',
  },
];

export const DEMO_EVENTS: CampusEvent[] = [
  {
    id: 'e1',
    title: 'Block B east entrance closed',
    type: 'route-closure',
    affectedLocation: 'Block B',
    description: 'The east entrance of Block B is closed for maintenance; use the north entrance.',
  },
];

export const DEMO_LIBRARY: LibraryZone[] = [
  { id: 'l1', name: 'Central Library Quiet Zone', quiet: true, seatsAvailable: 18, seatsTotal: 40 },
  { id: 'l2', name: 'Central Library Group Study', quiet: false, seatsAvailable: 4, seatsTotal: 20 },
  { id: 'l3', name: 'Block A Reading Room', quiet: true, seatsAvailable: 2, seatsTotal: 25 },
];

export const DEFAULT_PREFERENCES: StudentPreferences = {
  accessibility: {
    minimizeWalking: true,
    avoidStairs: false,
    preferElevator: false,
    extraTravelBufferMinutes: 0,
    notificationStyle: 'visual',
  },
  study: {
    preferQuiet: true,
    avoidCrowdedPlaces: false,
    preferredSessionMinutes: 45,
    preferredStudyStartHour: 16,
  },
  wellbeing: {
    wantsBreakReminders: true,
    maxConsecutiveStudyMinutes: 90,
  },
  dismissedRecommendationTypes: [],
};
