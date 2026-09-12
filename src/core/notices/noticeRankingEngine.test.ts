import { describe, expect, it } from 'vitest';
import { rankNotices } from './noticeRankingEngine';
import { buildStudentContext } from '../context/buildStudentContext';
import type { CampusNotice } from '../types';

const timetableSubjectNotice: CampusNotice = {
  id: 'relevant',
  title: 'Networks classroom moved',
  body: 'Moved to Block B',
  courseSubjects: ['Networks'],
  urgency: 'high',
  postedMinutesAgo: 10,
  category: 'academic',
};

const generalNotice: CampusNotice = {
  id: 'general',
  title: 'Cultural fest',
  body: 'Register now',
  urgency: 'low',
  postedMinutesAgo: 500,
  category: 'general',
};

const facilityNotice: CampusNotice = {
  id: 'facility',
  title: 'Block B east entrance closed',
  body: 'Use the north entrance instead.',
  location: 'Block B',
  urgency: 'high',
  postedMinutesAgo: 20,
  category: 'facility',
};

describe('rankNotices', () => {
  it('ranks a notice matching an enrolled subject above an unrelated general notice', () => {
    const context = buildStudentContext();
    const ranked = rankNotices([generalNotice, timetableSubjectNotice], context);
    expect(ranked[0].id).toBe('relevant');
    expect(ranked[0].whyRelevant).toContain('Networks');
  });

  it('ranks a facility notice as important when its location matches a class on the timetable', () => {
    const context = buildStudentContext();
    const ranked = rankNotices([generalNotice, facilityNotice], context);
    const facility = ranked.find((n) => n.id === 'facility')!;
    expect(facility.relevanceScore).toBeGreaterThanOrEqual(0.5);
    expect(facility.whyRelevant).toContain('Networks');
  });
});
