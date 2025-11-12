import Dexie, { Table } from 'dexie';

/**
 * IndexedDB interfaces matching SQLite schema
 */
export interface JourneyRecord {
  id: string;
  created_at: number;
  updated_at: number;
  completed_at?: number;
  is_draft: number; // 0 = false, 1 = true (for indexing)
  current_step: number;
  path_type: 'REAL' | 'NOT_REAL' | 'EMOTIONAL' | null;
  thought_text: string | null;
  situation_text: string | null;
  notes?: string | null;
}

export interface EmotionRecord {
  id?: number;
  journey_id: string;
  emotion_type: string;
  intensity: number;
  captured_at_step: number;
}

export interface ActionItemRecord {
  id?: number;
  journey_id: string;
  action_text: string;
  is_completed: boolean;
  created_at: number;
  target_date?: number;
}

export interface TransformationRecord {
  id?: number;
  journey_id: string;
  original_thought: string;
  transformed_thought: string;
  transformation_type: string | null;
}

export interface HabitRecord {
  id?: number;
  journey_id: string;
  habit_description: string;
  reminder_enabled: boolean;
  reminder_time?: string | null;
  frequency?: string | null;
}

export interface ReevaluationRecord {
  id?: number;
  journey_id: string;
  original_belief_rating: number;
  reevaluated_belief_rating: number;
  insights?: string | null;
}

export interface CheckInRecord {
  id?: number;
  timestamp: number;
  concerns: string; // JSON stringified array
  other_text?: string;
  source: string;
}

/**
 * Dexie database class for Mind Atlas IndexedDB
 * Matches SQLite schema structure for web compatibility
 */
export class MindAtlasDB extends Dexie {
  // Tables
  journeys!: Table<JourneyRecord, string>;
  journey_emotions!: Table<EmotionRecord, number>;
  journey_action_items!: Table<ActionItemRecord, number>;
  journey_transformations!: Table<TransformationRecord, number>;
  journey_habits!: Table<HabitRecord, number>;
  journey_reevaluations!: Table<ReevaluationRecord, number>;
  analytics_checkins!: Table<CheckInRecord, number>;

  constructor() {
    super('mindatlas_db');

    // Define schema version 1
    this.version(1).stores({
      journeys: 'id, created_at, updated_at, completed_at, is_draft, path_type',
      journey_emotions: '++id, journey_id',
      journey_action_items: '++id, journey_id',
      journey_transformations: '++id, journey_id',
      journey_habits: '++id, journey_id',
      journey_reevaluations: '++id, journey_id',
      analytics_checkins: '++id, timestamp'
    });
  }
}

// Singleton instance
export const db = new MindAtlasDB();
