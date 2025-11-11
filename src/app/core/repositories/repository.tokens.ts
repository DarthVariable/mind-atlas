import { InjectionToken } from '@angular/core';
import { IJourneyRepository } from '../interfaces/journey-repository.interface';
import { IAnalyticsRepository } from '../interfaces/analytics-repository.interface';

/**
 * Injection tokens for repository interfaces
 * Allows Angular DI to provide the correct implementation based on platform
 */
export const JOURNEY_REPOSITORY = new InjectionToken<IJourneyRepository>('JourneyRepository');
export const ANALYTICS_REPOSITORY = new InjectionToken<IAnalyticsRepository>('AnalyticsRepository');
