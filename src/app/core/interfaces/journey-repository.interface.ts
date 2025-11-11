import { JourneyState } from '../../features/thought-journey/models/journey.model';
import { JourneyDraft, CompletedJourney, JourneyFilters } from '../../features/thought-journey/models/journey-data.models';

/**
 * Repository interface for Journey data operations.
 * Abstracts storage implementation (SQLite for native, IndexedDB for web)
 */
export interface IJourneyRepository {
  // ==================== INITIALIZATION ====================
  /**
   * Initialize the repository (setup database/storage)
   */
  initialize(): Promise<void>;

  /**
   * Check if the repository is ready for operations
   */
  isReady(): boolean;

  // ==================== DRAFT OPERATIONS ====================
  /**
   * Save or update a journey draft
   */
  saveDraft(journey: JourneyState): Promise<void>;

  /**
   * Get all draft journeys ordered by update time
   */
  getDrafts(): Promise<JourneyDraft[]>;

  /**
   * Get the most recently updated draft
   */
  getLatestDraft(): Promise<JourneyDraft | null>;

  /**
   * Delete a specific draft by ID
   */
  deleteDraft(journeyId: string): Promise<void>;

  // ==================== COMPLETED JOURNEY OPERATIONS ====================
  /**
   * Save a completed journey with all related data
   */
  saveCompleted(journey: JourneyState): Promise<void>;

  /**
   * Get completed journeys with optional filters and pagination
   */
  getCompletedJourneys(limit: number, offset: number, filters?: JourneyFilters): Promise<CompletedJourney[]>;

  /**
   * Get a specific completed journey by ID
   */
  getJourneyById(id: string): Promise<CompletedJourney | null>;

  /**
   * Delete a journey (draft or completed)
   */
  deleteJourney(journeyId: string): Promise<void>;

  /**
   * Delete all completed journeys
   */
  deleteAllJourneys(): Promise<void>;
}
