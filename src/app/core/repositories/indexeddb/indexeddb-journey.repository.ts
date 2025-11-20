import { Injectable, signal } from '@angular/core';
import { IJourneyRepository } from '../../interfaces/journey-repository.interface';
import { JourneyState, Emotion, ActionItem, Transformation, Habit, Reevaluation } from '../../../features/thought-journey/models/journey.model';
import { JourneyDraft, CompletedJourney, JourneyFilters } from '../../../features/thought-journey/models/journey-data.models';
import { db } from './mindatlas-db';

/**
 * IndexedDB implementation of Journey Repository for web platform
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDBJourneyRepository implements IJourneyRepository {
  private ready = signal<boolean>(false);

  async initialize(): Promise<void> {
    try {
      await db.open();
      this.ready.set(true);
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.ready();
  }

  // ==================== DRAFT OPERATIONS ====================

  async saveDraft(journey: JourneyState): Promise<void> {
    await db.journeys.put({
      id: journey.id,
      created_at: journey.created_at,
      updated_at: Date.now(),
      is_draft: 1, // Convert boolean to number for indexing
      current_step: journey.current_step,
      path_type: journey.path_type,
      sentiment: journey.sentiment,
      thought_text: journey.thought_text,
      situation_text: journey.situation_text,
      notes: journey.notes
    });
  }

  async getDrafts(): Promise<JourneyDraft[]> {
    const drafts = await db.journeys
      .where('is_draft')
      .equals(1)
      .reverse()
      .sortBy('updated_at');

    // Convert is_draft back to boolean for API compatibility
    return drafts.map(d => ({ ...d, is_draft: true })) as JourneyDraft[];
  }

  async getLatestDraft(): Promise<JourneyDraft | null> {
    const drafts = await db.journeys
      .where('is_draft')
      .equals(1)
      .reverse()
      .sortBy('updated_at');

    return drafts.length > 0 ? ({ ...drafts[0], is_draft: true } as JourneyDraft) : null;
  }

  async deleteDraft(journeyId: string): Promise<void> {
    const journey = await db.journeys.get(journeyId);
    if (journey && journey.is_draft === 1) {
      await db.journeys.delete(journeyId);
    }
  }

  // ==================== COMPLETED JOURNEY OPERATIONS ====================

  async saveCompleted(journey: JourneyState): Promise<void> {
    // Use Dexie transaction for atomicity
    await db.transaction('rw', [
      db.journeys,
      db.journey_emotions,
      db.journey_action_items,
      db.journey_transformations,
      db.journey_habits,
      db.journey_reevaluations
    ], async () => {
      // 1. Save/update main journey record (use put to create or update)
      await db.journeys.put({
        id: journey.id,
        created_at: journey.created_at,
        updated_at: Date.now(),
        completed_at: Date.now(),
        is_draft: 0, // Convert boolean to number
        current_step: journey.current_step,
        path_type: journey.path_type,
        sentiment: journey.sentiment,
        thought_text: journey.thought_text,
        situation_text: journey.situation_text,
        notes: journey.notes
      });

      // 2. Save emotions
      if (journey.emotions && journey.emotions.length > 0) {
        for (const emotion of journey.emotions) {
          await db.journey_emotions.add({
            journey_id: journey.id,
            emotion_type: emotion.emotion_type,
            intensity: emotion.intensity,
            captured_at_step: emotion.captured_at_step
          });
        }
      }

      // 3. Save action items (Path A)
      if (journey.actionItems && journey.actionItems.length > 0) {
        for (const action of journey.actionItems) {
          await db.journey_action_items.add({
            journey_id: journey.id,
            action_text: action.action_text,
            is_completed: action.is_completed,
            created_at: action.created_at,
            target_date: action.target_date
          });
        }
      }

      // 4. Save transformation (Path B)
      if (journey.transformation) {
        await db.journey_transformations.add({
          journey_id: journey.id,
          original_thought: journey.transformation.original_thought,
          transformed_thought: journey.transformation.transformed_thought,
          transformation_type: journey.transformation.transformation_type
        });
      }

      // 5. Save habit (Path B)
      if (journey.habit) {
        await db.journey_habits.add({
          journey_id: journey.id,
          habit_description: journey.habit.habit_description,
          reminder_enabled: journey.habit.reminder_enabled,
          reminder_time: journey.habit.reminder_time,
          frequency: journey.habit.frequency
        });
      }

      // 6. Save reevaluation (Path A)
      if (journey.reevaluation) {
        await db.journey_reevaluations.add({
          journey_id: journey.id,
          original_belief_rating: journey.reevaluation.original_belief_rating,
          reevaluated_belief_rating: journey.reevaluation.reevaluated_belief_rating,
          insights: journey.reevaluation.insights
        });
      }
    });

    console.log('[IndexedDB] Journey saved to database:', journey.id);
  }

  async getCompletedJourneys(limit: number = 20, offset: number = 0, filters?: JourneyFilters): Promise<CompletedJourney[]> {
    let query = db.journeys.where('is_draft').equals(0);

    // Apply filters
    if (filters) {
      const allJourneys = await query.toArray();
      let filtered = allJourneys;

      if (filters.startDate) {
        filtered = filtered.filter(j => (j.completed_at || 0) >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(j => (j.completed_at || 0) <= filters.endDate!);
      }
      if (filters.pathType) {
        filtered = filtered.filter(j => j.path_type === filters.pathType);
      }

      // Sort by completed_at DESC
      filtered.sort((a, b) => (b.completed_at || 0) - (a.completed_at || 0));

      // Apply pagination
      const paginated = filtered.slice(offset, offset + limit);

      // Load related data
      return await this.loadRelatedData(paginated);
    }

    // No filters - use Dexie sorting and pagination
    const journeys = await query
      .reverse()
      .sortBy('completed_at');

    const paginated = journeys.slice(offset, offset + limit);
    const completed = await this.loadRelatedData(paginated);
    return completed;
  }

  async getJourneyById(id: string): Promise<CompletedJourney | null> {
    const journey = await db.journeys.get(id);

    if (!journey || journey.is_draft === 1) {
      return null;
    }

    const completedJourneys = await this.loadRelatedData([journey]);
    return completedJourneys.length > 0 ? completedJourneys[0] : null;
  }

  async deleteJourney(journeyId: string): Promise<void> {
    // Delete journey and all related records
    await db.transaction('rw', [
      db.journeys,
      db.journey_emotions,
      db.journey_action_items,
      db.journey_transformations,
      db.journey_habits,
      db.journey_reevaluations
    ], async () => {
      await db.journeys.delete(journeyId);
      await db.journey_emotions.where('journey_id').equals(journeyId).delete();
      await db.journey_action_items.where('journey_id').equals(journeyId).delete();
      await db.journey_transformations.where('journey_id').equals(journeyId).delete();
      await db.journey_habits.where('journey_id').equals(journeyId).delete();
      await db.journey_reevaluations.where('journey_id').equals(journeyId).delete();
    });
  }

  async deleteAllJourneys(): Promise<void> {
    // Delete all completed journeys and their related records
    await db.transaction('rw', [
      db.journeys,
      db.journey_emotions,
      db.journey_action_items,
      db.journey_transformations,
      db.journey_habits,
      db.journey_reevaluations
    ], async () => {
      // Get all completed journey IDs
      const completedJourneys = await db.journeys.where('is_draft').equals(0).toArray();
      const journeyIds = completedJourneys.map(j => j.id);

      // Delete all related records for these journeys
      for (const journeyId of journeyIds) {
        await db.journey_emotions.where('journey_id').equals(journeyId).delete();
        await db.journey_action_items.where('journey_id').equals(journeyId).delete();
        await db.journey_transformations.where('journey_id').equals(journeyId).delete();
        await db.journey_habits.where('journey_id').equals(journeyId).delete();
        await db.journey_reevaluations.where('journey_id').equals(journeyId).delete();
      }

      // Finally, delete all completed journeys
      await db.journeys.where('is_draft').equals(0).delete();
    });

    console.log('[IndexedDB] All completed journeys deleted');
  }

  // ==================== HELPER METHODS ====================

  private async loadRelatedData(journeys: any[]): Promise<CompletedJourney[]> {
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

  private async getJourneyEmotions(journeyId: string): Promise<Emotion[]> {
    const emotions = await db.journey_emotions
      .where('journey_id')
      .equals(journeyId)
      .toArray();

    // Map to Emotion type (types are compatible)
    return emotions.map(e => ({
      id: e.id,
      journey_id: e.journey_id,
      emotion_type: e.emotion_type,
      intensity: e.intensity,
      captured_at_step: e.captured_at_step
    }));
  }

  private async getJourneyActionItems(journeyId: string): Promise<ActionItem[]> {
    const items = await db.journey_action_items
      .where('journey_id')
      .equals(journeyId)
      .toArray();

    return items as ActionItem[];
  }

  private async getJourneyTransformation(journeyId: string): Promise<Transformation | undefined> {
    const transformations = await db.journey_transformations
      .where('journey_id')
      .equals(journeyId)
      .limit(1)
      .toArray();

    return transformations.length > 0 ? (transformations[0] as Transformation) : undefined;
  }

  private async getJourneyHabit(journeyId: string): Promise<Habit | undefined> {
    const habits = await db.journey_habits
      .where('journey_id')
      .equals(journeyId)
      .limit(1)
      .toArray();

    return habits.length > 0 ? (habits[0] as Habit) : undefined;
  }

  private async getJourneyReevaluation(journeyId: string): Promise<Reevaluation | undefined> {
    const reevaluations = await db.journey_reevaluations
      .where('journey_id')
      .equals(journeyId)
      .limit(1)
      .toArray();

    return reevaluations.length > 0 ? (reevaluations[0] as Reevaluation) : undefined;
  }
}
