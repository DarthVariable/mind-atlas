import { Routes } from '@angular/router';

export const THOUGHT_JOURNEY_ROUTES: Routes = [
  {
    path: 'checkin',
    loadComponent: () =>
      import('./components/checkin-page/checkin-page.component').then(m => m.CheckinPageComponent)
  },
  {
    path: 'capture-thoughts',
    loadComponent: () =>
      import('./components/capture-thoughts-page/capture-thoughts-page.component').then(m => m.CaptureThoughtsPageComponent)
  },
  {
    path: 'whos-thought',
    loadComponent: () =>
      import('./components/whos-thought-page/whos-thought-page.component').then(m => m.WhosThoughtPageComponent)
  },
  {
    path: 'plan-of-action',
    loadComponent: () =>
      import('./components/plan-of-action-page/plan-of-action-page.component').then(m => m.PlanOfActionPageComponent)
  },
  {
    path: 'reevaluate-emotion',
    loadComponent: () =>
      import('./components/reevaluate-emotion-page/reevaluate-emotion-page.component').then(m => m.ReevaluateEmotionPageComponent)
  },
  {
    path: 'transform-thought',
    loadComponent: () =>
      import('./components/transform-thought-page/transform-thought-page.component').then(m => m.TransformThoughtPageComponent)
  },
  {
    path: 'habit',
    loadComponent: () =>
      import('./components/habit-page/habit-page.component').then(m => m.HabitPageComponent)
  },
  {
    path: 'emotional-capture',
    loadComponent: () =>
      import('./components/emotional-capture-page/emotional-capture-page.component').then(m => m.EmotionalCapturePageComponent)
  },
  {
    path: 'emotional-context',
    loadComponent: () =>
      import('./components/emotional-context-page/emotional-context-page.component').then(m => m.EmotionalContextPageComponent)
  },
  {
    path: 'complete',
    loadComponent: () =>
      import('./components/journey-complete/journey-complete.component').then(m => m.JourneyCompleteComponent)
  },
  {
    path: '',
    redirectTo: 'checkin',
    pathMatch: 'full'
  }
];
