export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  subject: string;
  startMinutes: number; // minutes from midnight, local time
  endMinutes: number;
  location: string;
}

export interface StudyGoal {
  id: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  examInDays: number | null;
  masteryPercent: number; // 0-100, self/derived estimate of current mastery
  recentStudyMinutes: number; // studied in the last 7 days
}

export interface CampusNotice {
  id: string;
  title: string;
  body: string;
  department?: string;
  year?: number;
  courseSubjects?: string[]; // subjects this notice affects, for timetable-relevance matching
  location?: string;
  urgency: 'high' | 'medium' | 'low';
  postedMinutesAgo: number;
  category: 'academic' | 'facility' | 'event' | 'general';
}

export interface CampusEvent {
  id: string;
  title: string;
  type: 'route-closure' | 'room-change' | 'class-cancelled' | 'facility-closure' | 'new-event';
  affectedLocation?: string;
  affectedSubject?: string;
  description: string;
}

export interface LibraryZone {
  id: string;
  name: string;
  quiet: boolean;
  seatsAvailable: number;
  seatsTotal: number;
}

export interface AccessibilityPreferences {
  minimizeWalking: boolean;
  avoidStairs: boolean;
  preferElevator: boolean;
  extraTravelBufferMinutes: number;
  notificationStyle: 'visual' | 'audio' | 'both';
}

export interface StudyPreferences {
  preferQuiet: boolean;
  avoidCrowdedPlaces: boolean;
  preferredSessionMinutes: number;
  preferredStudyStartHour: number; // 0-23, soft preference for when study blocks should start
}

export interface WellbeingPreferences {
  wantsBreakReminders: boolean;
  maxConsecutiveStudyMinutes: number;
}

export interface StudentPreferences {
  accessibility: AccessibilityPreferences;
  study: StudyPreferences;
  wellbeing: WellbeingPreferences;
  dismissedRecommendationTypes: string[]; // e.g. 'cafeteria' after "don't recommend this again"
}

export interface StudentProfile {
  id: string;
  name: string;
  year: number;
  department: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface StudentContext {
  profile: StudentProfile;
  timetable: TimetableSlot[];
  studyGoals: StudyGoal[];
  notices: CampusNotice[];
  events: CampusEvent[];
  library: LibraryZone[];
  preferences: StudentPreferences;
  now: Date;
}

export type RecommendationFactor =
  | 'profile'
  | 'timetable'
  | 'preference'
  | 'campus'
  | 'availability'
  | 'goal'
  | 'accessibility';

export interface RecommendationReason {
  factor: RecommendationFactor;
  text: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: 'study' | 'library' | 'travel' | 'notice' | 'wellness' | 'academic';
  priority: 'high' | 'medium' | 'low';
  score: number;
  action: string;
  timeWindow?: string;
  source: string;
  reasons: RecommendationReason[];
  confidence: number; // 0-1
  dismissible: boolean;
  feedbackSupported: boolean;
}

export type RecommendationFeedbackReason =
  | 'not-relevant'
  | 'too-far'
  | 'too-crowded'
  | 'wrong-timing'
  | 'wrong-type'
  | 'dont-recommend-again';

export interface RecommendationFeedback {
  recommendationId: string;
  category: Recommendation['category'];
  reason: RecommendationFeedbackReason;
  timestamp: string;
}
