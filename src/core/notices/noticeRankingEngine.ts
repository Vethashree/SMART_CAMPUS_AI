import type { CampusNotice, StudentContext } from '../types';

export interface RankedNotice extends CampusNotice {
  relevanceScore: number;
  whyRelevant: string;
}

const URGENCY_SCORE: Record<CampusNotice['urgency'], number> = {
  high: 1,
  medium: 0.6,
  low: 0.3,
};

/**
 * Ranks campus notices for one student instead of showing every notice with
 * equal weight (Phase 15). Scoring is deterministic and explainable: subject
 * and location relevance to today's timetable dominate (a facility notice
 * has no course to match against, but if it's at a location the student is
 * walking into today, that's just as relevant as a subject match), then
 * department/year match, then urgency, then recency.
 */
export function rankNotices(notices: CampusNotice[], context: StudentContext): RankedNotice[] {
  const todaysSubjects = new Set(context.timetable.map((slot) => slot.subject));

  return notices
    .map((notice) => {
      let score = 0;
      const reasons: string[] = [];

      const matchedSubject = notice.courseSubjects?.find((subject) => todaysSubjects.has(subject));
      if (matchedSubject) {
        score += 0.5;
        reasons.push(`you are enrolled in ${matchedSubject}`);
      }

      const matchedClass = notice.location
        ? context.timetable.find((slot) => slot.location.includes(notice.location!))
        : undefined;
      if (matchedClass && !matchedSubject) {
        score += 0.45;
        reasons.push(`it affects ${matchedClass.location}, where you have ${matchedClass.subject} today`);
      }

      if (notice.department && notice.department === context.profile.department) {
        score += 0.2;
        reasons.push(`it's for your department (${notice.department})`);
      }

      if (notice.year && notice.year === context.profile.year) {
        score += 0.1;
        reasons.push(`it's for year ${notice.year}`);
      }

      score += URGENCY_SCORE[notice.urgency] * 0.15;

      const recencyScore = Math.max(0, 1 - notice.postedMinutesAgo / (24 * 60));
      score += recencyScore * 0.05;

      const whyRelevant = reasons.length > 0 ? reasons.join(' and ') : 'general campus update';

      return { ...notice, relevanceScore: Math.round(score * 100) / 100, whyRelevant };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
