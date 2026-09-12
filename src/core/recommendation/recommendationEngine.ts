import type { StudentContext } from '../types';
import { recommendLibraryZone } from '../library/libraryRecommendation';
import { rankNotices } from '../notices/noticeRankingEngine';
import { allocateStudyTime, scoreGoal } from '../study/studyAllocationEngine';
import { findFreeGaps, formatMinutes, minutesSinceMidnight } from '../time';
import { rankCandidates } from './rankingEngine';
import type { RecommendationCandidate } from './types';

const MIN_STUDY_GAP_MINUTES = 25;
const TRAVEL_BASE_BUFFER_MINUTES = 10;

function buildStudyCandidate(context: StudentContext): RecommendationCandidate | null {
  const nowMinutes = minutesSinceMidnight(context.now);
  const gaps = findFreeGaps(context.timetable).filter(
    (gap) => gap.endMinutes > nowMinutes && gap.durationMinutes >= MIN_STUDY_GAP_MINUTES
  );
  const gap = gaps[0];
  if (!gap) return null;

  const topGoal = [...context.studyGoals].sort((a, b) => scoreGoal(b) - scoreGoal(a))[0];
  if (!topGoal) return null;

  const sessionMinutes = Math.min(
    context.preferences.study.preferredSessionMinutes,
    gap.durationMinutes
  );
  const startMinutes = Math.max(gap.startMinutes, nowMinutes);
  const endMinutes = startMinutes + sessionMinutes;

  const libraryPick = recommendLibraryZone(context.library, context.preferences);

  const reasons: RecommendationCandidate['reasons'] = [
    {
      factor: 'timetable',
      text: `you have a ${gap.durationMinutes}-minute free period before ${
        gap.followingSlot ? gap.followingSlot.subject : 'the end of the day'
      }`,
    },
    { factor: 'goal', text: `${topGoal.subject} is one of your active study goals` },
  ];
  if (libraryPick) {
    reasons.push(...libraryPick.reasons.map((text) => ({ factor: 'preference' as const, text })));
  }

  return {
    id: 'study-session',
    title: libraryPick ? `Quiet Study Session: ${topGoal.subject}` : `Study Session: ${topGoal.subject}`,
    category: 'study',
    action: libraryPick ? `Open ${libraryPick.zone.name}` : 'Start Session',
    timeWindow: `${formatMinutes(startMinutes)} - ${formatMinutes(endMinutes)}`,
    source: libraryPick ? libraryPick.zone.name : 'Self-study',
    reasons,
    dismissible: true,
    feedbackSupported: true,
    factors: {
      relevance: 0.9,
      urgency: Math.min(1, scoreGoal(topGoal) + 0.1),
      preferenceMatch: libraryPick && context.preferences.study.preferQuiet && libraryPick.zone.quiet ? 0.9 : 0.5,
      timeFit: Math.min(1, gap.durationMinutes / 60),
      accessibilityFit: context.preferences.accessibility.minimizeWalking ? 0.7 : 0.6,
      availability: libraryPick ? libraryPick.zone.seatsAvailable / libraryPick.zone.seatsTotal : 0.4,
      academicGoal: scoreGoal(topGoal),
    },
  };
}

function buildTravelCandidate(context: StudentContext): RecommendationCandidate | null {
  const nowMinutes = minutesSinceMidnight(context.now);
  // Scan every remaining class today, not just the very next one — a 2pm
  // disruption is worth surfacing at 11am even if a 12pm class is unaffected.
  const upcoming = [...context.timetable]
    .filter((slot) => slot.startMinutes >= nowMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  let nextSlot: (typeof upcoming)[number] | undefined;
  let disruption: StudentContext['events'][number] | undefined;
  for (const slot of upcoming) {
    const match = context.events.find(
      (event) =>
        event.type === 'route-closure' && event.affectedLocation && slot.location.includes(event.affectedLocation)
    );
    if (match) {
      nextSlot = slot;
      disruption = match;
      break;
    }
  }
  if (!nextSlot || !disruption) return null;

  const extraBuffer = context.preferences.accessibility.extraTravelBufferMinutes;
  const detourPenalty = context.preferences.accessibility.avoidStairs ? 5 : 0;
  const leaveByMinutes = nextSlot.startMinutes - (TRAVEL_BASE_BUFFER_MINUTES + extraBuffer + detourPenalty);

  return {
    id: `travel-${nextSlot.id}`,
    title: `Leave for ${nextSlot.subject} class`,
    category: 'travel',
    action: 'View Route',
    timeWindow: formatMinutes(Math.max(nowMinutes, leaveByMinutes)),
    source: 'Campus route advisory',
    reasons: [
      { factor: 'timetable', text: `your ${nextSlot.subject} class starts at ${formatMinutes(nextSlot.startMinutes)}` },
      { factor: 'campus', text: disruption.description },
    ],
    dismissible: true,
    feedbackSupported: true,
    factors: {
      relevance: 0.95,
      urgency: 0.9,
      preferenceMatch: 0.5,
      timeFit: 0.8,
      accessibilityFit: extraBuffer > 0 || detourPenalty > 0 ? 0.9 : 0.6,
      availability: 0.7,
      academicGoal: 0.2,
    },
  };
}

function buildReviewCandidate(
  context: StudentContext,
  excludeGoalId: string | null
): RecommendationCandidate | null {
  const candidates = context.studyGoals
    .filter((goal) => goal.id !== excludeGoalId)
    .filter((goal) => goal.examInDays !== null && goal.examInDays <= 14 && goal.masteryPercent < 80)
    .sort((a, b) => scoreGoal(b) - scoreGoal(a));

  const goal = candidates[0];
  if (!goal) return null;

  const [allocation] = allocateStudyTime([goal], context.preferences.study.preferredSessionMinutes);
  if (!allocation) return null;

  const eveningStart = 18 * 60;
  const eveningEnd = eveningStart + allocation.minutes;

  return {
    id: `review-${goal.id}`,
    title: `Review ${goal.subject}`,
    category: 'academic',
    action: 'Start Session',
    timeWindow: `${formatMinutes(eveningStart)} - ${formatMinutes(eveningEnd)}`,
    source: 'Study allocation engine',
    reasons: [
      { factor: 'goal', text: 'upcoming assessment' },
      { factor: 'goal', text: allocation.reason.replace(/\.$/, '') },
    ],
    dismissible: true,
    feedbackSupported: true,
    factors: {
      relevance: 0.7,
      urgency: goal.examInDays !== null ? Math.max(0, 1 - goal.examInDays / 14) : 0.3,
      preferenceMatch: 0.5,
      timeFit: 0.6,
      accessibilityFit: 0.6,
      availability: 0.8,
      academicGoal: allocation.priorityScore,
    },
  };
}

function buildNoticeCandidate(context: StudentContext, usedNoticeText: string[]): RecommendationCandidate | null {
  const ranked = rankNotices(context.notices, context).filter(
    (notice) => notice.relevanceScore >= 0.5 && !usedNoticeText.some((used) => notice.body.includes(used))
  );
  const top = ranked[0];
  if (!top) return null;

  return {
    id: `notice-${top.id}`,
    title: top.title,
    category: 'notice',
    action: 'View Notice',
    source: 'Campus notices',
    reasons: [{ factor: 'campus', text: `relevant because ${top.whyRelevant}` }],
    dismissible: true,
    feedbackSupported: true,
    factors: {
      relevance: top.relevanceScore,
      urgency: top.urgency === 'high' ? 0.9 : top.urgency === 'medium' ? 0.5 : 0.2,
      preferenceMatch: 0.4,
      timeFit: 0.3,
      accessibilityFit: 0.4,
      availability: 0.5,
      academicGoal: top.courseSubjects && top.courseSubjects.length > 0 ? 0.6 : 0.2,
    },
  };
}

/**
 * Generates and ranks "Next Best Actions" for a student (Phases 7-9). Every
 * recommendation carries structured, human-readable reasons — there is no
 * step here that asks an LLM "what should this student do?"; ranking is pure
 * scoring over the factors above.
 */
export function generateRecommendations(context: StudentContext, limit = 3) {
  const studyCandidate = buildStudyCandidate(context);
  const travelCandidate = buildTravelCandidate(context);
  const reviewCandidate = buildReviewCandidate(
    context,
    studyCandidate ? context.studyGoals.find((g) => studyCandidate.title.includes(g.subject))?.id ?? null : null
  );
  const usedNoticeText = travelCandidate ? [travelCandidate.reasons[1]?.text ?? ''] : [];
  const noticeCandidate = buildNoticeCandidate(context, usedNoticeText);

  const candidates = [studyCandidate, travelCandidate, reviewCandidate, noticeCandidate].filter(
    (c): c is RecommendationCandidate => c !== null
  );

  return rankCandidates(candidates, context.preferences.dismissedRecommendationTypes).slice(0, limit);
}
