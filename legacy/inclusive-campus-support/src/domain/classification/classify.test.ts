import { describe, expect, it } from 'vitest';
import { classifyRequest } from './classify';

describe('classifyRequest', () => {
  it('routes a scholarship payment issue to Scholarship / Finance', () => {
    const result = classifyRequest('I have not received my scholarship amount.');
    expect(result.category).toBe('SCHOLARSHIP_FINANCE');
    expect(result.department).toBe('Student Welfare / Scholarship Office');
    expect(result.requiredInformation).toContain('studentId');
    expect(result.isLocalClassification).toBe(true);
  });

  it('routes an examination hall ticket issue to the Examination Cell with high priority', () => {
    const result = classifyRequest('I did not receive my hall ticket for the exam.');
    expect(result.category).toBe('EXAMINATION');
    expect(result.department).toBe('Examination Cell');
    expect(result.priority).toBe('HIGH');
  });

  it('routes a transport / bus issue to the Transport Office', () => {
    const result = classifyRequest('My bus route number 12 was cancelled today without notice.');
    expect(result.category).toBe('TRANSPORT');
    expect(result.department).toBe('Transport Office');
  });

  it('treats a safety/welfare concern as urgent', () => {
    const result = classifyRequest('I am facing ragging in my hostel and need help urgently.');
    expect(result.category).toBe('STUDENT_WELFARE');
    expect(result.priority).toBe('URGENT');
  });

  it('recognizes Tamil keywords for scholarship requests', () => {
    const result = classifyRequest('எனக்கு உதவித்தொகை இன்னும் வரவில்லை.');
    expect(result.category).toBe('SCHOLARSHIP_FINANCE');
  });

  it('falls back to General Inquiry when nothing matches, rather than guessing', () => {
    const result = classifyRequest('I would like to know about the annual cultural fest schedule.');
    expect(result.category).toBe('GENERAL_INQUIRY');
    expect(result.department).toBe('General Campus Helpdesk');
  });

  it('is deterministic: the same input always produces the same classification', () => {
    const text = 'My library fine seems incorrect, can someone check it?';
    const first = classifyRequest(text);
    const second = classifyRequest(text);
    expect(first).toEqual(second);
  });
});
