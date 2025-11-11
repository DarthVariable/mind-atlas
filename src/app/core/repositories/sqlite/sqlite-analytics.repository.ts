import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { IAnalyticsRepository } from '../../interfaces/analytics-repository.interface';
import { CheckInData } from '../../services/analytics.service';

/**
 * SQLite implementation of Analytics Repository for native platforms (iOS/Android)
 */
@Injectable({
  providedIn: 'root'
})
export class SqliteAnalyticsRepository implements IAnalyticsRepository {
  private databaseService = inject(DatabaseService);
  private ready = signal<boolean>(false);

  async initialize(): Promise<void> {
    // Database is initialized by DatabaseService in AppComponent
    // Just wait for it to be ready
    this.ready.set(this.databaseService.isDatabaseReady());
  }

  isReady(): boolean {
    return this.ready();
  }

  // ==================== CHECK-IN OPERATIONS ====================

  async saveCheckIn(data: CheckInData): Promise<void> {
    const sql = `
      INSERT INTO analytics_checkins (timestamp, concerns, other_text, source)
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      data.timestamp,
      JSON.stringify(data.concerns),
      data.other_text || null,
      data.source
    ];

    await this.databaseService.executeNonQuery(sql, values);
  }

  async getCheckInAnalytics(startDate: number, endDate: number): Promise<CheckInData[]> {
    const sql = `
      SELECT id, timestamp, concerns, other_text, source
      FROM analytics_checkins
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `;

    const results = await this.databaseService.executeQuery<{
      id: number;
      timestamp: number;
      concerns: string;
      other_text: string | null;
      source: string;
    }>(sql, [startDate, endDate]);

    return results.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      concerns: JSON.parse(row.concerns),
      other_text: row.other_text || undefined,
      source: row.source
    }));
  }

  async getAllCheckIns(): Promise<CheckInData[]> {
    const sql = `
      SELECT id, timestamp, concerns, other_text, source
      FROM analytics_checkins
      ORDER BY timestamp DESC
    `;

    const results = await this.databaseService.executeQuery<{
      id: number;
      timestamp: number;
      concerns: string;
      other_text: string | null;
      source: string;
    }>(sql);

    return results.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      concerns: JSON.parse(row.concerns),
      other_text: row.other_text || undefined,
      source: row.source
    }));
  }
}
