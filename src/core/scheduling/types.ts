export type ScheduleBlockType = 'class' | 'study' | 'break' | 'travel';

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  title: string;
  startMinutes: number;
  endMinutes: number;
  location?: string;
  subject?: string;
  reason?: string;
}
