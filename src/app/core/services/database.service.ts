import { Injectable, inject, signal } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SqliteService } from './sqlite.service';
import { DBSQLiteValues } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqliteService = inject(SqliteService);
  private dbName = 'mindatlas.db';
  private dbVersion = 6;
  private db = signal<SQLiteDBConnection | null>(null);
  private isReady = signal<boolean>(false);

  /**
   * Check if database is ready for operations
   */
  public isDatabaseReady(): boolean {
    return this.isReady();
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Initialize SQLite plugin
      const initialized = await this.sqliteService.initializePlugin();
      if (!initialized) {
        throw new Error('SQLite plugin not initialized');
      }

      // Register upgrade statements BEFORE opening the database
      await this.registerUpgradeStatements();

      // Open database (this will automatically apply upgrade statements)
      await this.openDatabase();

      this.isReady.set(true);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async registerUpgradeStatements(): Promise<void> {
    try {
      const upgradeStatements = [
        {
          toVersion: 1,
          statements: this.getSchemaV1Statements()
        },
        {
          toVersion: 2,
          statements: this.getSchemaV2Statements()
        },
        {
          toVersion: 3,
          statements: this.getSchemaV3Statements()
        },
        {
          toVersion: 4,
          statements: this.getSchemaV4Statements()
        },
        {
          toVersion: 5,
          statements: this.getSchemaV5Statements()
        },
        {
          toVersion: 6,
          statements: this.getSchemaV6Statements()
        }
      ];

      await this.sqliteService.addUpgradeStatement(this.dbName, upgradeStatements);

      console.log('Upgrade statements registered');
    } catch (error) {
      console.error('Error registering upgrade statements:', error);
      throw error;
    }
  }

  async openDatabase(): Promise<void> {
    try {
      // Use the new openDatabase method that handles connection lifecycle
      const db = await this.sqliteService.openDatabase(
        this.dbName,
        false, // not encrypted
        'no-encryption',
        this.dbVersion,
        false // not readonly
      );

      if (!db) {
        throw new Error('Failed to open database');
      }

      // Execute PRAGMA statements AFTER database is opened
      await this.configurePragmas(db);

      this.db.set(db);
      console.log('Database opened successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }

  private async configurePragmas(db: SQLiteDBConnection): Promise<void> {
    try {
      // Execute PRAGMA statements using query() - PRAGMAs return results
      // Foreign keys must be enabled for referential integrity
      await db.query('PRAGMA foreign_keys = ON;');
      console.log('PRAGMA statements configured successfully');
    } catch (error) {
      console.error('Error configuring PRAGMA statements:', error);
      throw error;
    }
  }

  private getSchemaV1Statements(): string[] {
    return [
      // Create journeys table
      `CREATE TABLE IF NOT EXISTS journeys (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER,
        is_draft INTEGER DEFAULT 1,
        current_step INTEGER DEFAULT 0,
        path_type TEXT CHECK(path_type IN ('REAL', 'NOT_REAL', 'EMOTIONAL')),
        thought_text TEXT,
        situation_text TEXT,
        notes TEXT
      );`,

      // Create journey_emotions table
      `CREATE TABLE IF NOT EXISTS journey_emotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journey_id TEXT NOT NULL,
        emotion_type TEXT NOT NULL,
        intensity INTEGER CHECK(intensity >= 1 AND intensity <= 5),
        captured_at_step INTEGER NOT NULL,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );`,

      // Create journey_action_items table
      `CREATE TABLE IF NOT EXISTS journey_action_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journey_id TEXT NOT NULL,
        action_text TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        completed_at INTEGER,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );`,

      // Create journey_transformations table
      `CREATE TABLE IF NOT EXISTS journey_transformations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journey_id TEXT NOT NULL,
        original_thought TEXT NOT NULL,
        transformed_thought TEXT NOT NULL,
        transformation_type TEXT,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );`,

      // Create journey_habits table
      `CREATE TABLE IF NOT EXISTS journey_habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journey_id TEXT NOT NULL,
        habit_description TEXT NOT NULL,
        reminder_enabled INTEGER DEFAULT 0,
        reminder_time TEXT,
        frequency TEXT CHECK(frequency IN ('DAILY', 'WEEKLY', 'CUSTOM')),
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );`,

      // Create journey_reevaluations table
      `CREATE TABLE IF NOT EXISTS journey_reevaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        journey_id TEXT NOT NULL,
        original_belief_rating INTEGER CHECK(original_belief_rating >= 1 AND original_belief_rating <= 10),
        reevaluated_belief_rating INTEGER CHECK(reevaluated_belief_rating >= 1 AND reevaluated_belief_rating <= 10),
        insights TEXT,
        FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
      );`,

      // Create indexes for performance
      'CREATE INDEX IF NOT EXISTS idx_journeys_draft ON journeys(is_draft, updated_at);',
      'CREATE INDEX IF NOT EXISTS idx_journeys_completed ON journeys(is_draft, completed_at);',
      'CREATE INDEX IF NOT EXISTS idx_emotions_journey ON journey_emotions(journey_id);',
      'CREATE INDEX IF NOT EXISTS idx_actions_journey ON journey_action_items(journey_id);'
    ];
  }

  private getSchemaV2Statements(): string[] {
    return [
      // Create analytics_checkins table for aggregate check-in data
      `CREATE TABLE IF NOT EXISTS analytics_checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        concerns TEXT NOT NULL,
        other_text TEXT,
        source TEXT NOT NULL
      );`,

      // Create index for performance on timestamp queries
      'CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON analytics_checkins(timestamp);'
    ];
  }

  private getSchemaV3Statements(): string[] {
    return [
      // Add target_date column to journey_action_items table
      'ALTER TABLE journey_action_items ADD COLUMN target_date INTEGER;'
    ];
  }

  private getSchemaV4Statements(): string[] {
    return [
      // Add sentiment column to journeys table
      `ALTER TABLE journeys ADD COLUMN sentiment TEXT CHECK(sentiment IN ('positive', 'negative', 'neutral'));`
    ];
  }

  private getSchemaV5Statements(): string[] {
    return [
      // V5: Update reevaluation ratings to use 0-10 scale (already correct in V1 schema)
      // This migration is a no-op since V1 schema already has correct constraints
      // Kept for version tracking consistency with architecture document
    ];
  }

  private getSchemaV6Statements(): string[] {
    return [
      // V6: Drop the sentiment constraint to allow 'mixed' value
      // SQLite doesn't support ALTER TABLE DROP CONSTRAINT, so we need to:
      // 1. Create new table with updated constraint
      // 2. Copy data
      // 3. Drop old table
      // 4. Rename new table

      // Create new journeys table with updated sentiment constraint
      `CREATE TABLE IF NOT EXISTS journeys_new (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER,
        is_draft INTEGER DEFAULT 1,
        current_step INTEGER DEFAULT 0,
        path_type TEXT CHECK(path_type IN ('REAL', 'NOT_REAL', 'EMOTIONAL')),
        sentiment TEXT CHECK(sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
        thought_text TEXT,
        situation_text TEXT,
        notes TEXT
      );`,

      // Copy data from old table to new table
      `INSERT INTO journeys_new SELECT * FROM journeys;`,

      // Drop old table
      `DROP TABLE journeys;`,

      // Rename new table to journeys
      `ALTER TABLE journeys_new RENAME TO journeys;`,

      // Recreate indexes
      'CREATE INDEX IF NOT EXISTS idx_journeys_draft ON journeys(is_draft, updated_at);',
      'CREATE INDEX IF NOT EXISTS idx_journeys_completed ON journeys(is_draft, completed_at);'
    ];
  }

  async closeDatabase(): Promise<void> {
    try {
      const db = this.db();
      if (db) {
        await db.close();
        await this.sqliteService.closeConnection(this.dbName);
        this.db.set(null);
        this.isReady.set(false);
        console.log('Database closed successfully');
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

  async executeQuery<T>(sql: string, values?: any[]): Promise<T[]> {
    try {
      const db = this.db();
      if (!db) {
        throw new Error('Database not initialized');
      }

      const result = await db.query(sql, values) as DBSQLiteValues;
      return (result.values as T[]) || [];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async executeNonQuery(sql: string, values?: any[]): Promise<void> {
    try {
      const db = this.db();
      if (!db) {
        throw new Error('Database not initialized');
      }

      await db.run(sql, values);
    } catch (error) {
      console.error('Error executing non-query:', error);
      throw error;
    }
  }

  async executeBatch(statements: { statement: string; values?: any[] }[]): Promise<void> {
    try {
      const db = this.db();
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Convert to the format expected by executeSet
      const setStatements = statements.map(stmt => ({
        statement: stmt.statement,
        values: stmt.values || []
      }));

      await db.executeSet(setStatements);
    } catch (error) {
      console.error('Error executing batch:', error);
      throw error;
    }
  }

  getIsReady() {
    return this.isReady();
  }
}
