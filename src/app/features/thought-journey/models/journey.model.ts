export type PathType = 'REAL' | 'NOT_REAL' | 'EMOTIONAL';

export type ThoughtOrigin = 'ME' | 'PARENT' | 'FAMILY' | 'SCHOOL' | 'AUTHORITY' | 'RELATIONSHIPS' | 'OTHER';

export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface JourneyState {
  id: string;
  created_at: number;
  updated_at: number;
  is_draft: boolean;
  current_step: number;
  path_type: PathType | null;
  thought_text: string | null;
  thought_origin: ThoughtOrigin | null;
  situation_text: string | null;
  notes: string | null;
  emotions: Emotion[];
  actionItems?: ActionItem[];
  transformation?: Transformation;
  habit?: Habit;
  reevaluation?: Reevaluation;
}

export interface Emotion {
  id?: number;
  journey_id: string;
  emotion_type: string;
  intensity: number;
  captured_at_step: number;
}

export interface ActionItem {
  id?: number;
  journey_id: string;
  action_text: string;
  is_completed: boolean;
  created_at: number;
  completed_at?: number;
  target_date?: number;
}

export interface Transformation {
  id?: number;
  journey_id: string;
  original_thought: string;
  transformed_thought: string;
  transformation_type: string | null;
}

export interface Habit {
  id?: number;
  journey_id: string;
  habit_description: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  frequency: HabitFrequency;
}

export interface Reevaluation {
  id?: number;
  journey_id: string;
  original_belief_rating: number;
  reevaluated_belief_rating: number;
  insights: string | null;
}

export interface JourneyProgress {
  currentStep: number;
  totalSteps: number;
  pathType: PathType | null;
}
