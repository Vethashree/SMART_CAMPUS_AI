export interface ConsentRecord {
  granted: boolean;
  recipientDepartment: string;
  purpose: string;
  requiredIdentifier: string;
  notCollected: string[];
  consentedAt?: string;
}

export const STANDARD_NOT_COLLECTED = [
  'privacy.notCollected.password',
  'privacy.notCollected.paymentCard',
  'privacy.notCollected.biometric',
  'privacy.notCollected.unrelated',
];
