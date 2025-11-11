import { Provider } from '@angular/core';
import { Platform } from '@ionic/angular';
import { JOURNEY_REPOSITORY, ANALYTICS_REPOSITORY } from './repository.tokens';
import { SqliteJourneyRepository } from './sqlite/sqlite-journey.repository';
import { SqliteAnalyticsRepository } from './sqlite/sqlite-analytics.repository';
import { IndexedDBJourneyRepository } from './indexeddb/indexeddb-journey.repository';
import { IndexedDBAnalyticsRepository } from './indexeddb/indexeddb-analytics.repository';

/**
 * Factory function to provide the correct Journey Repository based on platform
 */
export function journeyRepositoryFactory(platform: Platform) {
  if (platform.is('capacitor')) {
    return new SqliteJourneyRepository();
  } else {
    return new IndexedDBJourneyRepository();
  }
}

/**
 * Factory function to provide the correct Analytics Repository based on platform
 */
export function analyticsRepositoryFactory(platform: Platform) {
  if (platform.is('capacitor')) {
    return new SqliteAnalyticsRepository();
  } else {
    return new IndexedDBAnalyticsRepository();
  }
}

/**
 * Providers for repository pattern with platform detection
 * Add these to app.config.ts providers array
 */
export const REPOSITORY_PROVIDERS: Provider[] = [
  {
    provide: JOURNEY_REPOSITORY,
    useFactory: journeyRepositoryFactory,
    deps: [Platform]
  },
  {
    provide: ANALYTICS_REPOSITORY,
    useFactory: analyticsRepositoryFactory,
    deps: [Platform]
  }
];
