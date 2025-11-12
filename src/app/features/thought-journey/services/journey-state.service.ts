import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { JourneyService } from './journey.service';
import { JourneyState, PathType, JourneyProgress } from '../models/journey.model';
import { JourneyDraft } from '../models/journey-data.models';
import { v4 as uuidv4 } from 'uuid';

const DRAFT_KEY = 'journey_draft';

@Injectable({
  providedIn: 'root'
})
export class JourneyStateService {
  private journeyService = inject(JourneyService);
  private router = inject(Router);

  // State signals
  private currentJourney = signal<JourneyState | null>(null);
  private currentStep = signal<number>(0);

  // Computed signals
  readonly isJourneyActive = computed(() => this.currentJourney() !== null);
  readonly progress = computed((): JourneyProgress | null => {
    const journey = this.currentJourney();
    const step = this.currentStep();

    if (!journey) return null;

    // Determine total steps based on path type
    // Note: Step 1 (Check-in) and Step 2 (Capture Thoughts) happen before path is chosen
    let totalSteps = 4; // Default before path chosen

    if (journey.path_type === 'REAL' || journey.path_type === 'NOT_REAL') {
      // Path A/B: Check-in → Capture Thoughts → Emotional Capture → Emotional Context → Who's Thought → Plan/Transform → Reevaluate/Habit → Complete
      totalSteps = 8;
    } else if (journey.path_type === 'EMOTIONAL') {
      // Path C: Check-in → Capture Thoughts → Emotional Capture → Emotional Context → Complete
      totalSteps = 4;
    }

    return {
      currentStep: step,
      totalSteps,
      pathType: journey.path_type
    };
  });

  readonly progressPercentage = computed(() => {
    const prog = this.progress();
    if (!prog || prog.totalSteps === 0) return 0;
    return Math.round((prog.currentStep / prog.totalSteps) * 100);
  });

  // ==================== JOURNEY LIFECYCLE ====================

  startJourney(): string {
    const journeyId = uuidv4();
    const journey: JourneyState = {
      id: journeyId,
      created_at: Date.now(),
      updated_at: Date.now(),
      is_draft: true,
      current_step: 1,
      path_type: null,
      thought_text: null,
      thought_origin: null,
      situation_text: null,
      notes: null,
      emotions: []
    };

    this.currentJourney.set(journey);
    this.currentStep.set(1);

    console.log('Journey started:', journeyId);
    return journeyId;
  }

  async loadDraft(draft: JourneyDraft): Promise<void> {
    const journey: JourneyState = {
      id: draft.id,
      created_at: draft.created_at,
      updated_at: draft.updated_at,
      is_draft: true,
      current_step: draft.current_step,
      path_type: draft.path_type,
      thought_text: draft.thought_text,
      thought_origin: null,
      situation_text: draft.situation_text,
      notes: draft.notes,
      emotions: []
    };

    this.currentJourney.set(journey);
    this.currentStep.set(draft.current_step);

    console.log('Draft loaded from database:', draft.id);
  }

  /**
   * Load draft from Preferences (localStorage/native storage)
   */
  async loadDraftFromPreferences(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: DRAFT_KEY });

      if (value) {
        const journey: JourneyState = JSON.parse(value);
        this.currentJourney.set(journey);
        this.currentStep.set(journey.current_step);

        console.log('✅ Draft loaded from Preferences:', {
          id: journey.id,
          step: journey.current_step,
          pathType: journey.path_type,
          thoughtText: journey.thought_text,
          situationText: journey.situation_text,
          emotionsCount: journey.emotions?.length || 0
        });

        return true;
      }

      console.log('ℹ️ No draft found in Preferences');
      return false;
    } catch (error) {
      console.error('❌ Error loading draft from Preferences:', error);
      return false;
    }
  }

  /**
   * Save current journey to Preferences (localStorage/native storage)
   */
  private async saveDraftToPreferences(): Promise<void> {
    const journey = this.currentJourney();

    if (!journey) {
      console.warn('⚠️ No journey to save to Preferences');
      return;
    }

    try {
      await Preferences.set({
        key: DRAFT_KEY,
        value: JSON.stringify(journey)
      });

      console.log('💾 Draft saved to Preferences:', {
        id: journey.id,
        step: journey.current_step,
        pathType: journey.path_type,
        thoughtText: journey.thought_text,
        situationText: journey.situation_text,
        emotionsCount: journey.emotions?.length || 0,
        actionItemsCount: journey.actionItems?.length || 0,
        hasTransformation: !!journey.transformation,
        hasHabit: !!journey.habit,
        hasReevaluation: !!journey.reevaluation
      });
    } catch (error) {
      console.error('❌ Error saving draft to Preferences:', error);
    }
  }

  /**
   * Clear draft from Preferences
   */
  private async clearDraftFromPreferences(): Promise<void> {
    try {
      await Preferences.remove({ key: DRAFT_KEY });
      console.log('🗑️ Draft cleared from Preferences');
    } catch (error) {
      console.error('❌ Error clearing draft from Preferences:', error);
    }
  }

  updateJourney(updates: Partial<JourneyState>): void {
    const current = this.currentJourney();
    if (!current) {
      console.warn('No active journey to update');
      return;
    }

    const updated: JourneyState = {
      ...current,
      ...updates,
      updated_at: Date.now()
    };

    this.currentJourney.set(updated);
  }

  setPathType(pathType: PathType): void {
    this.updateJourney({ path_type: pathType });
  }

  async nextStep(): Promise<void> {
    const current = this.currentStep();
    const newStep = current + 1;
    this.currentStep.set(newStep);
    this.updateJourney({ current_step: newStep });

    console.log(`➡️ Moving to step ${newStep}`);
    await this.saveDraftToPreferences();
  }

  async previousStep(): Promise<void> {
    const current = this.currentStep();
    if (current > 1) {
      const newStep = current - 1;
      this.currentStep.set(newStep);
      this.updateJourney({ current_step: newStep });

      console.log(`⬅️ Moving back to step ${newStep}`);
      await this.saveDraftToPreferences();
    }
  }

  async completeJourney(): Promise<void> {
    const journey = this.currentJourney();
    if (!journey) {
      throw new Error('No active journey to complete');
    }

    console.log('🏁 Completing journey and saving to database...', {
      id: journey.id,
      pathType: journey.path_type,
      thoughtText: journey.thought_text,
      emotionsCount: journey.emotions?.length || 0,
      actionItemsCount: journey.actionItems?.length || 0,
      hasTransformation: !!journey.transformation,
      hasHabit: !!journey.habit,
      hasReevaluation: !!journey.reevaluation
    });

    try {
      // Save completed journey to database (IndexedDB on web, SQLite on native)
      await this.journeyService.saveCompleted(journey);
      console.log('✅ Journey saved to database successfully');

      // Clear draft from Preferences
      await this.clearDraftFromPreferences();

      // Clear in-memory state
      this.clearJourney();
    } catch (error) {
      console.error('❌ Error completing journey:', error);
      throw error;
    }
  }

  clearJourney(): void {
    this.currentJourney.set(null);
    this.currentStep.set(0);
    console.log('🧹 Journey cleared from memory');
  }

  async cancelJourney(): Promise<void> {
    const journey = this.currentJourney();
    if (journey) {
      console.log('🚫 Cancelling journey:', journey.id);

      // Clear from Preferences
      await this.clearDraftFromPreferences();

      // Clear in-memory state
      this.clearJourney();

      console.log('✅ Journey cancelled and draft cleared');
    }
  }

  // ==================== GETTERS ====================

  getCurrentJourney(): JourneyState | null {
    return this.currentJourney();
  }

  getCurrentStep(): number {
    return this.currentStep();
  }

  getProgress(): JourneyProgress | null {
    return this.progress();
  }

  getProgressPercentage(): number {
    return this.progressPercentage();
  }
}
