import { CheckInData } from '../services/analytics.service';

/**
 * Repository interface for Analytics data operations.
 * Abstracts storage implementation (SQLite for native, IndexedDB for web)
 */
export interface IAnalyticsRepository {
  // ==================== INITIALIZATION ====================
  /**
   * Initialize the repository (setup database/storage)
   */
  initialize(): Promise<void>;

  /**
   * Check if the repository is ready for operations
   */
  isReady(): boolean;

  // ==================== CHECK-IN OPERATIONS ====================
  /**
   * Save a check-in record to local storage
   */
  saveCheckIn(data: CheckInData): Promise<void>;

  /**
   * Get check-in records within a date range
   */
  getCheckInAnalytics(startDate: number, endDate: number): Promise<CheckInData[]>;

  /**
   * Get all check-in records for concern statistics
   */
  getAllCheckIns(): Promise<CheckInData[]>;
}
