export interface DatabaseConfig {
  name: string;
  version: number;
  encrypted: boolean;
  mode: string;
}

export interface UpgradeStatement {
  toVersion: number;
  statements: string[];
}

export interface QueryResult<T> {
  values?: T[];
}

export interface DBSQLiteValues {
  values?: any[];
}
