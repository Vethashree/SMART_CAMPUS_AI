import { Student, Subject, Achievement, Timetable } from '../types/Student';

interface AttendanceDayRecord {
  date: string;
  status: 'present' | 'absent' | 'holiday' | 'event' | 'future';
  period?: string;
}

// Generate sample attendance data
const generateAttendanceData = (_subjectCode: string): AttendanceDayRecord[] => {
  const records: AttendanceDayRecord[] = [];
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1); // Start from 2 months ago
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    if (date > today) {
      records.push({
        date: date.toISOString().split('T')[0],
        status: 'future'
      });
    } else if (date.getDay() === 0) { // Sunday
      records.push({
        date: date.toISOString().split('T')[0],
        status: 'holiday'
      });
    } else {
      const rand = Math.random();
      let status: AttendanceDayRecord['status'];
      if (rand < 0.05) status = 'event'; // 5% events
      else if (rand < 0.15) status = 'absent'; // 10% absent
      else if (rand < 0.20) status = 'holiday'; // 5% holidays
      else status = 'present'; // 80% present
      
      records.push({
        date: date.toISOString().split('T')[0],
        status,
        period: `Period ${Math.floor(Math.random() * 6) + 1}`
      });
    }
  }
  
  return records;
};

const calculateAttendancePercentage = (records: AttendanceDayRecord[]): number => {
  const validRecords = records.filter(r => r.status !== 'future' && r.status !== 'holiday');
  const presentRecords = validRecords.filter(r => r.status === 'present' || r.status === 'event');
  return validRecords.length > 0 ? Math.round((presentRecords.length / validRecords.length) * 100) : 0;
};

// Kirishipathi's subjects
const subjects: Subject[] = [
  // Theory Subjects
  {
    name: 'DISCRETE MATHEMATICS',
    code: 'MA3354',
    type: 'theory',
    attendance: generateAttendanceData('MA3354'),
    attendancePercentage: 0
  },
  {
    name: 'DATA STRUCTURES',
    code: 'CS3301',
    type: 'theory',
    attendance: generateAttendanceData('CS3301'),
    attendancePercentage: 0
  },
  {
    name: 'FOUNDATION DATA SCIENCE',
    code: 'CS3352',
    type: 'theory',
    attendance: generateAttendanceData('CS3352'),
    attendancePercentage: 0
  },
  {
    name: 'DPCO',
    code: 'CS3351',
    type: 'theory',
    attendance: generateAttendanceData('CS3351'),
    attendancePercentage: 0
  },
  {
    name: 'OBJECT ORIENTED PROGRAMMING',
    code: 'CS3391',
    type: 'theory',
    attendance: generateAttendanceData('CS3391'),
    attendancePercentage: 0
  },
  // Lab Subjects
  {
    name: 'Data Structures Laboratory',
    code: 'CS3311',
    type: 'lab',
    attendance: generateAttendanceData('CS3311'),
    attendancePercentage: 0
  },
  {
    name: 'Object Oriented Programming Laboratory',
    code: 'CS3381',
    type: 'lab',
    attendance: generateAttendanceData('CS3381'),
    attendancePercentage: 0
  },
  {
    name: 'Data Science Laboratory',
    code: 'CS3361',
    type: 'lab',
    attendance: generateAttendanceData('CS3361'),
    attendancePercentage: 0
  },
  {
    name: 'Professional Development',
    code: 'GE3361',
    type: 'lab',
    attendance: generateAttendanceData('GE3361'),
    attendancePercentage: 0
  }
];

// Calculate attendance percentages
subjects.forEach(subject => {
  subject.attendancePercentage = calculateAttendancePercentage(subject.attendance);
});

const achievements: Achievement[] = [
  {
    activity: 'Chess Competition',
    position: '3rd Place',
    event: 'College Chess Zone Championship',
    date: '2024-10-15'
  }
];

// Timetable data for Kirishipathi
const timetable: Timetable = {
  semester: "III Sem (CSE)",
  department: "Dept. of CSE",
  room: "Rm 206",
  college: "Kingston Engg College",
  location: "Vellore-59",
  academicYear: "Odd Sem 2025-26",
  breaks: {
    morning: "10:00–10:20",
    lunch: "12:05–12:55",
    afternoon: "14:35–14:50"
  },
  schedule: [
    {
      day: "Monday",
      slots: [
        { time: "09:00–10:00", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "10:00–10:20", subject: "Morning Break", code: "", faculty: "", type: "break" },
        { time: "10:20–11:15", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "11:15–12:05", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "12:05–12:55", subject: "Lunch Break", code: "", faculty: "", type: "break" },
        { time: "12:55–13:45", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "13:45–14:35", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "14:35–14:50", subject: "Afternoon Break", code: "", faculty: "", type: "break" },
        { time: "14:50–15:40", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" },
        { time: "15:40–16:30", subject: "Data Structures", code: "DS", faculty: "Mrs. M. Samundeeshwari", type: "theory" }
      ]
    },
    {
      day: "Tuesday",
      slots: [
        { time: "09:00–10:00", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" },
        { time: "10:00–10:20", subject: "Morning Break", code: "", faculty: "", type: "break" },
        { time: "10:20–11:15", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" },
        { time: "11:15–12:05", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" },
        { time: "12:05–12:55", subject: "Lunch Break", code: "", faculty: "", type: "break" },
        { time: "12:55–13:45", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" },
        { time: "13:45–14:35", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" },
        { time: "14:35–14:50", subject: "Afternoon Break", code: "", faculty: "", type: "break" },
        { time: "14:50–16:30", subject: "Foundation Data Science", code: "FDS", faculty: "Mr. C. Chinima", type: "theory" }
      ]
    },
    {
      day: "Wednesday",
      slots: [
        { time: "09:00–10:00", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" },
        { time: "10:00–10:20", subject: "Morning Break", code: "", faculty: "", type: "break" },
        { time: "10:20–11:15", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" },
        { time: "11:15–12:05", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" },
        { time: "12:05–12:55", subject: "Lunch Break", code: "", faculty: "", type: "break" },
        { time: "12:55–13:45", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" },
        { time: "13:45–14:35", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" },
        { time: "14:35–14:50", subject: "Afternoon Break", code: "", faculty: "", type: "break" },
        { time: "14:50–16:30", subject: "Digital Principles & Comp Org", code: "DPCO", faculty: "Mr. G. Sathish Kumar", type: "theory" }
      ]
    },
    {
      day: "Thursday",
      slots: [
        { time: "09:00–10:00", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" },
        { time: "10:00–10:20", subject: "Morning Break", code: "", faculty: "", type: "break" },
        { time: "10:20–11:15", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" },
        { time: "11:15–12:05", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" },
        { time: "12:05–12:55", subject: "Lunch Break", code: "", faculty: "", type: "break" },
        { time: "12:55–13:45", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" },
        { time: "13:45–14:35", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" },
        { time: "14:35–14:50", subject: "Afternoon Break", code: "", faculty: "", type: "break" },
        { time: "14:50–16:30", subject: "Object Oriented Programming", code: "OOPS", faculty: "Mr. S. Balaji (HOD)", type: "theory" }
      ]
    },
    {
      day: "Friday",
      slots: [
        { time: "09:00–10:00", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" },
        { time: "10:00–10:20", subject: "Morning Break", code: "", faculty: "", type: "break" },
        { time: "10:20–11:15", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" },
        { time: "11:15–12:05", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" },
        { time: "12:05–12:55", subject: "Lunch Break", code: "", faculty: "", type: "break" },
        { time: "12:55–13:45", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" },
        { time: "13:45–14:35", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" },
        { time: "14:35–14:50", subject: "Afternoon Break", code: "", faculty: "", type: "break" },
        { time: "14:50–16:30", subject: "Discrete Mathematics", code: "DM", faculty: "Mrs. Kanchana", type: "theory" }
      ]
    }
  ]
};

// Test marks data
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

export const testMarks: TestMark[] = [
  {
    id: 'TM001',
    studentId: 'ST2024001',
    subject: 'Data Structures',
    subjectCode: 'DS',
    testName: 'Unit Test 1',
    testDate: '2024-12-15',
    maxMarks: 50,
    obtainedMarks: 42,
    grade: 'A',
    uploadedBy: 'Mrs. M. Samundeeshwari',
    uploadDate: '2024-12-16'
  },
  {
    id: 'TM002',
    studentId: 'ST2024001',
    subject: 'Foundation Data Science',
    subjectCode: 'FDS',
    testName: 'Unit Test 1',
    testDate: '2024-12-14',
    maxMarks: 50,
    obtainedMarks: 38,
    grade: 'B+',
    uploadedBy: 'Mr. C. Chinima',
    uploadDate: '2024-12-15'
  },
  {
    id: 'TM003',
    studentId: 'ST2024001',
    subject: 'Digital Principles & Comp Org',
    subjectCode: 'DPCO',
    testName: 'Unit Test 1',
    testDate: '2024-12-13',
    maxMarks: 50,
    obtainedMarks: 45,
    grade: 'A+',
    uploadedBy: 'Mr. G. Sathish Kumar',
    uploadDate: '2024-12-14'
  }
];

export const getTestMarks = (studentId: string): TestMark[] => {
  return testMarks.filter(mark => mark.studentId === studentId);
};

export const kirishipathiData: Student = {
  id: 'ST2024001',
  name: 'Kirishipathi',
  year: 2,
  semester: 3,
  department: 'BE.CSE',
  college: 'Kingston Engineering College',
  location: 'Katpadi',
  subjects,
  achievements,
  overallAttendance: Math.round(subjects.reduce((acc, sub) => acc + sub.attendancePercentage, 0) / subjects.length),
  timetable
};

export const getStudentData = (studentId: string): Student | null => {
  if (studentId === 'ST2024001') {
    return kirishipathiData;
  }
  return null;
};