import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { IJourneyRepository } from '../../interfaces/journey-repository.interface';
import { JourneyState, Emotion, ActionItem, Transformation, Habit, Reevaluation } from '../../../features/thought-journey/models/journey.model';
import { JourneyDraft, CompletedJourney, JourneyFilters } from '../../../features/thought-journey/models/journey-data.models';

/**
 * SQLite implementation of Journey Repository for native platforms (iOS/Android)
 */
@Injectable({
  providedIn: 'root'
})
export class SqliteJourneyRepository implements IJourneyRepository {
  private db = inject(DatabaseService);
  private ready = signal<boolean>(false);

  async initialize(): Promise<void> {
    // Database is initialized by DatabaseService in AppComponent
    // Just wait for it to be ready
    this.ready.set(this.db.isDatabaseReady());
  }

  isReady(): boolean {
    return this.ready();
  }

  // ==================== DRAFT OPERATIONS ====================

  async saveDraft(journey: JourneyState): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO journeys
      (id, created_at, updated_at, is_draft, current_step, path_type, thought_text, situation_text, notes)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
    `;

    await this.db.executeNonQuery(sql, [
      journey.id,
      journey.created_at,
      Date.now(),
      journey.current_step,
      journey.path_type,
      journey.thought_text,
      journey.situation_text,
      journey.notes
    ]);
  }

  async getDrafts(): Promise<JourneyDraft[]> {
    const sql = `
      SELECT * FROM journeys
      WHERE is_draft = 1
      ORDER BY updated_at DESC
    `;

    return await this.db.executeQuery<JourneyDraft>(sql);
  }

  async getLatestDraft(): Promise<JourneyDraft | null> {
    const sql = `
      SELECT * FROM journeys
      WHERE is_draft = 1
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    const results = await this.db.executeQuery<JourneyDraft>(sql);
    return results.length > 0 ? results[0] : null;
  }

  async deleteDraft(journeyId: string): Promise<void> {
    const sql = `DELETE FROM journeys WHERE id = ? AND is_draft = 1`;
    await this.db.executeNonQuery(sql, [journeyId]);
  }

  // ==================== COMPLETED JOURNEY OPERATIONS ====================

  async saveCompleted(journey: JourneyState): Promise<void> {
    const statements = [];
    const now = Date.now();

    // 1. Insert or replace main journey record (handles case where draft was never saved to DB)
    statements.push({
      statement: `
        INSERT OR REPLACE INTO journeys
        (id, created_at, updated_at, completed_at, is_draft, current_step, path_type, thought_text, situation_text, notes)
        VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
      `,
      values: [
        journey.id,
        journey.created_at,
        now,
        now,
        journey.current_step,
        journey.path_type,
        journey.thought_text,
        journey.situation_text,
        journey.notes
      ]
    });

    // 2. Save emotions
    if (journey.emotions && journey.emotions.length > 0) {
      for (const emotion of journey.emotions) {
        statements.push({
          statement: `
            INSERT INTO journey_emotions (journey_id, emotion_type, intensity, captured_at_step)
            VALUES (?, ?, ?, ?)
          `,
          values: [journey.id, emotion.emotion_type, emotion.intensity, emotion.captured_at_step]
        });
      }
    }

    // 3. Save action items (Path A)
    if (journey.actionItems && journey.actionItems.length > 0) {
      for (const action of journey.actionItems) {
        statements.push({
          statement: `
            INSERT INTO journey_action_items (journey_id, action_text, is_completed, created_at, target_date)
            VALUES (?, ?, ?, ?, ?)
          `,
          values: [journey.id, action.action_text, action.is_completed ? 1 : 0, action.created_at, action.target_date || null]
        });
      }
    }

    // 4. Save transformation (Path B)
    if (journey.transformation) {
      statements.push({
        statement: `
          INSERT INTO journey_transformations (journey_id, original_thought, transformed_thought, transformation_type)
          VALUES (?, ?, ?, ?)
        `,
        values: [
          journey.id,
          journey.transformation.original_thought,
          journey.transformation.transformed_thought,
          journey.transformation.transformation_type
        ]
      });
    }

    // 5. Save habit (Path B)
    if (journey.habit) {
      statements.push({
        statement: `
          INSERT INTO journey_habits (journey_id, habit_description, reminder_enabled, reminder_time, frequency)
          VALUES (?, ?, ?, ?, ?)
        `,
        values: [
          journey.id,
          journey.habit.habit_description,
          journey.habit.reminder_enabled ? 1 : 0,
          journey.habit.reminder_time,
          journey.habit.frequency
        ]
      });
    }

    // 6. Save reevaluation (Path A)
    if (journey.reevaluation) {
      statements.push({
        statement: `
          INSERT INTO journey_reevaluations (journey_id, original_belief_rating, reevaluated_belief_rating, insights)
          VALUES (?, ?, ?, ?)
        `,
        values: [
          journey.id,
          journey.reevaluation.original_belief_rating,
          journey.reevaluation.reevaluated_belief_rating,
          journey.reevaluation.insights
        ]
      });
    }

    // Execute all in transaction
    await this.db.executeBatch(statements);
  }

  async getCompletedJourneys(limit: number = 20, offset: number = 0, filters?: JourneyFilters): Promise<CompletedJourney[]> {
    let sql = `
      SELECT * FROM journeys
      WHERE is_draft = 0
    `;

    const values: any[] = [];

    if (filters) {
      if (filters.startDate) {
        sql += ` AND completed_at >= ?`;
        values.push(filters.startDate);
      }
      if (filters.endDate) {
        sql += ` AND completed_at <= ?`;
        values.push(filters.endDate);
      }
      if (filters.pathType) {
        sql += ` AND path_type = ?`;
        values.push(filters.pathType);
      }
    }

    sql += ` ORDER BY completed_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const journeys = await this.db.executeQuery<any>(sql, values);

    // Load related data for each journey
    const completedJourneys: CompletedJourney[] = [];
    for (const journey of journeys) {
      const emotions = await this.getJourneyEmotions(journey.id);
      const completedJourney: CompletedJourney = {
        ...journey,
        is_draft: false,
        emotions
      };

      if (journey.path_type === 'REAL') {
        completedJourney.actionItems = await this.getJourneyActionItems(journey.id);
        completedJourney.reevaluation = await this.getJourneyReevaluation(journey.id);
      } else if (journey.path_type === 'NOT_REAL') {
        completedJourney.transformation = await this.getJourneyTransformation(journey.id);
        completedJourney.habit = await this.getJourneyHabit(journey.id);
      }

      completedJourneys.push(completedJourney);
    }

    return completedJourneys;
  }

  async getJourneyById(id: string): Promise<CompletedJourney | null> {
    const sql = `SELECT * FROM journeys WHERE id = ? AND is_draft = 0`;
    const results = await this.db.executeQuery<any>(sql, [id]);

    if (results.length === 0) {
      return null;
    }

    const journey = results[0];
    const emotions = await this.getJourneyEmotions(id);

    const completedJourney: CompletedJourney = {
      ...journey,
      is_draft: false,
      emotions
    };

    if (journey.path_type === 'REAL') {
      completedJourney.actionItems = await this.getJourneyActionItems(id);
      completedJourney.reevaluation = await this.getJourneyReevaluation(id);
    } else if (journey.path_type === 'NOT_REAL') {
      completedJourney.transformation = await this.getJourneyTransformation(id);
      completedJourney.habit = await this.getJourneyHabit(id);
    }

    return completedJourney;
  }

  async deleteJourney(journeyId: string): Promise<void> {
    const sql = `DELETE FROM journeys WHERE id = ?`;
    await this.db.executeNonQuery(sql, [journeyId]);
  }

  async deleteAllJourneys(): Promise<void> {
    const sql = `DELETE FROM journeys WHERE is_draft = 0`;
    await this.db.executeNonQuery(sql, []);
    console.log('[SQLite] All completed journeys deleted');
  }

  // ==================== HELPER METHODS ====================

  private async getJourneyEmotions(journeyId: string): Promise<Emotion[]> {
    const sql = `SELECT * FROM journey_emotions WHERE journey_id = ?`;
    return await this.db.executeQuery<Emotion>(sql, [journeyId]);
  }

  private async getJourneyActionItems(journeyId: string): Promise<ActionItem[]> {
    const sql = `SELECT * FROM journey_action_items WHERE journey_id = ?`;
    const items = await this.db.executeQuery<any>(sql, [journeyId]);
    return items.map(item => ({
      ...item,
      is_completed: item.is_completed === 1
    }));
  }

  private async getJourneyTransformation(journeyId: string): Promise<Transformation | undefined> {
    const sql = `SELECT * FROM journey_transformations WHERE journey_id = ? LIMIT 1`;
    const results = await this.db.executeQuery<Transformation>(sql, [journeyId]);
    return results.length > 0 ? results[0] : undefined;
  }

  private async getJourneyHabit(journeyId: string): Promise<Habit | undefined> {
    const sql = `SELECT * FROM journey_habits WHERE journey_id = ? LIMIT 1`;
    const results = await this.db.executeQuery<any>(sql, [journeyId]);
    if (results.length > 0) {
      const habit = results[0];
      return {
        ...habit,
        reminder_enabled: habit.reminder_enabled === 1
      };
    }
    return undefined;
  }

  private async getJourneyReevaluation(journeyId: string): Promise<Reevaluation | undefined> {
    const sql = `SELECT * FROM journey_reevaluations WHERE journey_id = ? LIMIT 1`;
    const results = await this.db.executeQuery<Reevaluation>(sql, [journeyId]);
    return results.length > 0 ? results[0] : undefined;
  }
}
