import { Injectable } from '@angular/core';

export interface CheckInConcern {
  id: number;
  value: string;
  label: string;
  isOther?: boolean;
  otherText?: string;
}

export interface CheckInData {
  id?: number;
  timestamp: number;
  concerns: string[];
  other_text?: string;
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  readonly CONCERN_OPTIONS: CheckInConcern[] = [
    { id: 0, value: 'anxiety', label: 'Anxiety or worry' },
    { id: 1, value: 'low_mood', label: 'Low mood or sadness' },
    { id: 2, value: 'stress', label: 'Stress management' },
    { id: 3, value: 'relationships', label: 'Relationship challenges' },
    { id: 4, value: 'work', label: 'Work or career concerns' },
    { id: 5, value: 'confidence', label: 'Self-doubt or confidence' },
    { id: 6, value: 'physical_health', label: 'Physical health' },
    { id: 7, value: 'financial', label: 'Financial stress' },
    { id: 8, value: 'personal_growth', label: 'Personal growth' },
    { id: 9, value: 'life_transitions', label: 'Life transitions' },
    { id: 10, value: 'other', label: 'Other', isOther: true }
  ];

  /**
   * Track a check-in event (aggregate data for analytics)
   * @param concerns - Array of concern values selected by user
   * @param otherText - Text entered for "Other" option
   * @param source - Where the check-in was initiated from
   */
  async trackCheckIn(concerns: string[], otherText: string | null = null, source: string = 'journey'): Promise<void> {
    try {
      const checkInData: CheckInData = {
        timestamp: Date.now(),
        concerns,
        other_text: otherText || undefined,
        source
      };

      console.log('Saving check-in to localStorage:', checkInData);
      this.saveCheckInLocal(checkInData);
      console.log('Check-in saved to localStorage successfully');

      // TODO: Send to external analytics service when implemented
      // await this.sendToExternalAnalytics(checkInData);

      console.log('Check-in tracked:', checkInData);
    } catch (error) {
      console.error('Error tracking check-in:', error);
      throw error; // Re-throw to let caller know it failed
    }
  }

  private saveCheckInLocal(data: CheckInData): void {
    // Get existing check-ins from localStorage
    const existingCheckIns = this.getCheckInsFromLocalStorage();

    // Add new check-in
    existingCheckIns.push(data);

    // Save back to localStorage
    localStorage.setItem('mindatlas_checkins', JSON.stringify(existingCheckIns));
  }

  private getCheckInsFromLocalStorage(): CheckInData[] {
    const stored = localStorage.getItem('mindatlas_checkins');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get check-in analytics for a date range
   * @param startDate - Start timestamp
   * @param endDate - End timestamp
   */
  async getCheckInAnalytics(startDate: number, endDate: number): Promise<CheckInData[]> {
    const allCheckIns = this.getCheckInsFromLocalStorage();
    return allCheckIns.filter(checkIn =>
      checkIn.timestamp >= startDate && checkIn.timestamp <= endDate
    );
  }

  async getConcernStatistics(): Promise<Map<string, number>> {
    const results = this.getCheckInsFromLocalStorage();

    const stats = new Map<string, number>();

    this.CONCERN_OPTIONS.forEach(option => {
      stats.set(option.value, 0);
    });

    results.forEach(checkIn => {
      checkIn.concerns.forEach(concern => {
        stats.set(concern, (stats.get(concern) || 0) + 1);
      });
    });

    return stats;
  }

  /**
   * TODO: Send data to external analytics service
   * Implement when analytics provider is chosen (Firebase, Amplitude, etc.)
   * Example implementation for Firebase Analytics:
   * private async sendToExternalAnalytics(data: CheckInData): Promise<void> {
   *   await this.firebaseAnalytics.logEvent('check_in', {
   *     concerns: data.concerns.join(','),
   *     has_other: !!data.other_text,
   *     source: data.source,
   *     timestamp: data.timestamp
   *   });
   * }
   */
}
