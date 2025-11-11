import { Injectable, signal } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, capSQLiteUpgradeOptions } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private isInitialized = signal<boolean>(false);
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializePlugin(): Promise<boolean> {
    try {
      if (this.isInitialized()) {
        return true;
      }

      // Check if running on native platform
      if (this.platform.is('capacitor')) {
        // Initialize the SQLite plugin
        this.isInitialized.set(true);
        console.log('SQLite plugin initialized');
        return true;
      } else {
        console.warn('SQLite is only available on native platforms');
        return false;
      }
    } catch (error) {
      console.error('Error initializing SQLite plugin:', error);
      return false;
    }
  }

  async addUpgradeStatement(database: string, upgrade: any[]): Promise<void> {
    try {
      await this.sqlite.addUpgradeStatement(database, upgrade);
      console.log(`Upgrade statements added for database: ${database}`);
    } catch (error) {
      console.error('Error adding upgrade statement:', error);
      throw error;
    }
  }

  async openDatabase(
    database: string,
    encrypted: boolean,
    mode: string,
    version: number,
    readonly?: boolean
  ): Promise<SQLiteDBConnection | null> {
    try {
      // Check if connection exists
      const isConnection = await this.isConnection(database, readonly);

      let db: SQLiteDBConnection;

      if (isConnection) {
        // Retrieve existing connection
        db = await this.sqlite.retrieveConnection(database, readonly ?? false);
      } else {
        // Create new connection
        db = await this.sqlite.createConnection(
          database,
          encrypted,
          mode,
          version,
          readonly ?? false
        );
      }

      // Open the database - this will apply upgrade statements if registered
      await db.open();

      return db;
    } catch (error) {
      console.error('Error opening database:', error);
      return null;
    }
  }

  async createConnection(
    database: string,
    encrypted: boolean,
    mode: string,
    version: number,
    readonly?: boolean
  ): Promise<SQLiteDBConnection | null> {
    try {
      const db = await this.sqlite.createConnection(
        database,
        encrypted,
        mode,
        version,
        readonly ?? false
      );
      return db;
    } catch (error) {
      console.error('Error creating connection:', error);
      return null;
    }
  }

  async retrieveConnection(database: string, readonly?: boolean): Promise<SQLiteDBConnection | null> {
    try {
      const db = await this.sqlite.retrieveConnection(database, readonly ?? false);
      return db;
    } catch (error) {
      console.error('Error retrieving connection:', error);
      return null;
    }
  }

  async closeConnection(database: string, readonly?: boolean): Promise<void> {
    try {
      await this.sqlite.closeConnection(database, readonly ?? false);
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }

  async isConnection(database: string, readonly?: boolean): Promise<boolean> {
    try {
      const result = await this.sqlite.isConnection(database, readonly ?? false);
      return result.result || false;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  getIsInitialized() {
    return this.isInitialized();
  }
}
