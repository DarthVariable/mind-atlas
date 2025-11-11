import { Injectable, inject } from '@angular/core';
import { IJourneyRepository } from '../../../core/interfaces/journey-repository.interface';
import { JOURNEY_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { JourneyState } from '../models/journey.model';
import { JourneyDraft, CompletedJourney, JourneyFilters } from '../models/journey-data.models';

@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  private repository = inject(JOURNEY_REPOSITORY);

  // ==================== DRAFT OPERATIONS ====================

  async saveDraft(journey: JourneyState): Promise<void> {
    return this.repository.saveDraft(journey);
  }

  async getDrafts(): Promise<JourneyDraft[]> {
    return this.repository.getDrafts();
  }

  async getLatestDraft(): Promise<JourneyDraft | null> {
    return this.repository.getLatestDraft();
  }

  async deleteDraft(journeyId: string): Promise<void> {
    return this.repository.deleteDraft(journeyId);
  }

  // ==================== COMPLETED JOURNEY OPERATIONS ====================

  async saveCompleted(journey: JourneyState): Promise<void> {
    return this.repository.saveCompleted(journey);
  }

  async getCompletedJourneys(limit: number = 20, offset: number = 0, filters?: JourneyFilters): Promise<CompletedJourney[]> {
    return this.repository.getCompletedJourneys(limit, offset, filters);
  }

  async getJourneyById(id: string): Promise<CompletedJourney | null> {
    return this.repository.getJourneyById(id);
  }

  async deleteJourney(journeyId: string): Promise<void> {
    return this.repository.deleteJourney(journeyId);
  }

  async deleteAllJourneys(): Promise<void> {
    return this.repository.deleteAllJourneys();
  }
}
