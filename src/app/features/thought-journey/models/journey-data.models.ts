import { PathType, Emotion, ActionItem, Transformation, Habit, Reevaluation } from './journey.model';

export interface JourneyDraft {
  id: string;
  created_at: number;
  updated_at: number;
  current_step: number;
  path_type: PathType | null;
  thought_text: string | null;
  situation_text: string | null;
  notes: string | null;
}

export interface CompletedJourney extends JourneyDraft {
  completed_at: number;
  is_draft: false;
  emotions: Emotion[];
  actionItems?: ActionItem[];
  transformation?: Transformation;
  habit?: Habit;
  reevaluation?: Reevaluation;
}

export interface JourneyFilters {
  startDate?: number;
  endDate?: number;
  pathType?: PathType;
  emotionType?: string;
}

export interface DateRange {
  start: number;
  end: number;
}
