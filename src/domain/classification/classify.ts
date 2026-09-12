import type { RequestCategory, RequestClassification } from './RequestClassification';

interface ClassificationRule {
  category: RequestCategory;
  department: string;
  keywords: string[];
  priority: RequestClassification['priority'];
  requiredInformation: string[];
  estimatedResponseTime: string;
  reason: string;
}

/**
 * Deterministic, rule-based keyword matching. This intentionally does NOT call any AI
 * model — it is a transparent, explainable local classifier so every routing decision
 * can be shown to the student in plain language. See domain/classification/RequestClassification.ts
 * for the `isLocalClassification` flag that a future ML/LLM classifier would flip.
 */
const RULES: ClassificationRule[] = [
  {
    category: 'SCHOLARSHIP_FINANCE',
    department: 'Student Welfare / Scholarship Office',
    keywords: [
      'scholarship', 'stipend', 'fee waiver', 'fee refund', 'financial aid',
      'payment not received', 'amount not received', 'tuition fee',
      'கல்வி உதவித்தொகை', 'உதவித்தொகை', 'கட்டணம்',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request mentions a scholarship or fee payment issue, so it is being routed to the department responsible for scholarship and financial queries.',
  },
  {
    category: 'HOSTEL_ACCOMMODATION',
    department: 'Hostel Administration',
    keywords: [
      'hostel', 'room allotment', 'roommate', 'mess food', 'accommodation', 'warden',
      'விடுதி', 'அறை ஒதுக்கீடு',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId', 'hostelBlock'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request is about hostel or accommodation, so it is being routed to Hostel Administration.',
  },
  {
    category: 'TRANSPORT',
    department: 'Transport Office',
    keywords: [
      'bus', 'transport', 'bus pass', 'bus route', 'shuttle', 'van route',
      'பேருந்து', 'போக்குவரத்து',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId', 'route'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request concerns campus transport, so it is being routed to the Transport Office.',
  },
  {
    category: 'EXAMINATION',
    department: 'Examination Cell',
    keywords: [
      'exam', 'examination', 'hall ticket', 'revaluation', 'result', 'marksheet',
      'grade', 'supplementary exam', 'seat number',
      'தேர்வு', 'மதிப்பெண்',
    ],
    priority: 'HIGH',
    requiredInformation: ['studentId', 'examRegisterNumber'],
    estimatedResponseTime: '1 working day',
    reason: 'Your request is related to examinations, so it is being routed to the Examination Cell.',
  },
  {
    category: 'ATTENDANCE',
    department: 'Academic Office',
    keywords: [
      'attendance', 'condonation', 'medical leave', 'shortage of attendance',
      'வருகை',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId', 'courseCode'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request is about attendance records, so it is being routed to the Academic Office.',
  },
  {
    category: 'LIBRARY',
    department: 'Library Services',
    keywords: [
      'library', 'book', 'library fine', 'library card', 'e-book access',
      'நூலகம்',
    ],
    priority: 'LOW',
    requiredInformation: ['studentId'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request is about library services, so it is being routed to Library Services.',
  },
  {
    category: 'CERTIFICATES',
    department: 'Registrar / Certificates Office',
    keywords: [
      'certificate', 'bonafide', 'transfer certificate', 'transcript', 'degree certificate',
      'சான்றிதழ்',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId', 'certificateType'],
    estimatedResponseTime: '3 working days',
    reason: 'Your request is for an academic certificate or document, so it is being routed to the Registrar / Certificates Office.',
  },
  {
    category: 'IT_SUPPORT',
    department: 'Campus IT Helpdesk',
    keywords: [
      'login', 'password', 'portal not working', 'wifi', 'internet', 'app crash',
      'website error', 'account locked',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId', 'deviceOrSystem'],
    estimatedResponseTime: '1 working day',
    reason: 'Your request describes a technical issue, so it is being routed to the Campus IT Helpdesk.',
  },
  {
    category: 'PLACEMENT',
    department: 'Placement Cell',
    keywords: [
      'placement', 'internship', 'interview', 'company visit', 'resume', 'job offer',
      'வேலைவாய்ப்பு',
    ],
    priority: 'NORMAL',
    requiredInformation: ['studentId'],
    estimatedResponseTime: '2 working days',
    reason: 'Your request is related to placements or internships, so it is being routed to the Placement Cell.',
  },
  {
    category: 'ACCESSIBILITY_SUPPORT',
    department: 'Accessibility & Disability Support Office',
    keywords: [
      'accessibility', 'ramp', 'wheelchair', 'assistive device', 'sign language interpreter',
      'screen reader issue', 'braille',
    ],
    priority: 'HIGH',
    requiredInformation: ['studentId'],
    estimatedResponseTime: '1 working day',
    reason: 'Your request concerns accessibility support, so it is being routed to the Accessibility & Disability Support Office.',
  },
  {
    category: 'STUDENT_WELFARE',
    department: 'Student Welfare Office',
    keywords: [
      'harassment', 'ragging', 'safety', 'mental health', 'counselling', 'counseling',
      'emergency', 'welfare', 'grievance',
    ],
    priority: 'URGENT',
    requiredInformation: ['studentId'],
    estimatedResponseTime: 'Same working day',
    reason: 'Your request describes a welfare or safety concern, so it is being routed urgently to the Student Welfare Office.',
  },
];

const FALLBACK: RequestClassification = {
  category: 'GENERAL_INQUIRY',
  department: 'General Campus Helpdesk',
  priority: 'NORMAL',
  requiredInformation: ['studentId'],
  estimatedResponseTime: '2 working days',
  reason: 'We could not confidently match your request to a specific department, so it is being routed to the General Campus Helpdesk for triage.',
  isLocalClassification: true,
};

const PRIORITY_RANK: Record<RequestClassification['priority'], number> = {
  URGENT: 3,
  HIGH: 2,
  NORMAL: 1,
  LOW: 0,
};

/**
 * Some requests match more than one rule's keywords (e.g. "ragging in my hostel"
 * matches both HOSTEL_ACCOMMODATION's "hostel" and STUDENT_WELFARE's "ragging").
 * Rather than silently taking whichever rule happens to appear first in the list,
 * every matching rule is collected and the most urgent one wins — a safety issue
 * should never be quietly filed as routine hostel maintenance.
 */
export function classifyRequest(requestText: string): RequestClassification {
  const normalized = requestText.toLowerCase();

  const matches = RULES.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );

  if (matches.length === 0) {
    return { ...FALLBACK };
  }

  const best = matches.reduce((top, candidate) =>
    PRIORITY_RANK[candidate.priority] > PRIORITY_RANK[top.priority] ? candidate : top,
  );

  return {
    category: best.category,
    department: best.department,
    priority: best.priority,
    requiredInformation: best.requiredInformation,
    estimatedResponseTime: best.estimatedResponseTime,
    reason: best.reason,
    isLocalClassification: true,
  };
}
