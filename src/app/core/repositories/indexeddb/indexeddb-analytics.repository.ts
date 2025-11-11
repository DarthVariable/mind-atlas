import { Injectable, signal } from '@angular/core';
import { IAnalyticsRepository } from '../../interfaces/analytics-repository.interface';
import { CheckInData } from '../../services/analytics.service';
import { db } from './mindatlas-db';

/**
 * IndexedDB implementation of Analytics Repository for web platform
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDBAnalyticsRepository implements IAnalyticsRepository {
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

  // ==================== CHECK-IN OPERATIONS ====================

  async saveCheckIn(data: CheckInData): Promise<void> {
    await db.analytics_checkins.add({
      timestamp: data.timestamp,
      concerns: JSON.stringify(data.concerns),
      other_text: data.other_text,
      source: data.source
    });
  }

  async getCheckInAnalytics(startDate: number, endDate: number): Promise<CheckInData[]> {
    const records = await db.analytics_checkins
      .where('timestamp')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('timestamp');

    return records.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      concerns: JSON.parse(row.concerns),
      other_text: row.other_text,
      source: row.source
    }));
  }

  async getAllCheckIns(): Promise<CheckInData[]> {
    const records = await db.analytics_checkins
      .reverse()
      .sortBy('timestamp');

    return records.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      concerns: JSON.parse(row.concerns),
      other_text: row.other_text,
      source: row.source
    }));
  }
}
