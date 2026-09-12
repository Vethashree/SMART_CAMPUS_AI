export type RequestCategory =
  | 'SCHOLARSHIP_FINANCE'
  | 'HOSTEL_ACCOMMODATION'
  | 'TRANSPORT'
  | 'EXAMINATION'
  | 'ATTENDANCE'
  | 'LIBRARY'
  | 'CERTIFICATES'
  | 'IT_SUPPORT'
  | 'PLACEMENT'
  | 'STUDENT_WELFARE'
  | 'ACCESSIBILITY_SUPPORT'
  | 'GENERAL_INQUIRY';

export interface RequestClassification {
  category: RequestCategory;
  department: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  requiredInformation: string[];
  estimatedResponseTime: string;
  reason: string;
  /** Always true for the deterministic rule-based engine; false once an ML/LLM classifier is wired in. */
  isLocalClassification: boolean;
}
