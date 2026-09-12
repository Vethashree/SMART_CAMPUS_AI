export interface Subject {
  name: string;
  code: string;
  type: 'theory' | 'lab';
  attendance: AttendanceRecord[];
  attendancePercentage: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'holiday' | 'event' | 'future';
  period?: string;
}

export interface Student {
  id: string;
  name: string;
  year: number;
  semester: number;
  department: string;
  college: string;
  location: string;
  subjects: Subject[];
  achievements: Achievement[];
  overallAttendance: number;
  timetable: Timetable;
}

export interface Achievement {
  activity: string;
  position: string;
  event: string;
  date: string;
}

export interface TimeSlot {
  time: string;
  subject: string;
  code: string;
  faculty: string;
  type: 'theory' | 'lab' | 'break';
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface Timetable {
  semester: string;
  department: string;
  room: string;
  college: string;
  location: string;
  academicYear: string;
  schedule: DaySchedule[];
  breaks: {
    morning: string;
    lunch: string;
    afternoon: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface TestMark {
  id: string;
  studentId: string;
  subject: string;
  subjectCode: string;
  testName: string;
  testDate: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  uploadedBy: string;
  uploadDate: string;
}