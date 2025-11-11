import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'journey',
    loadChildren: () => import('./features/thought-journey/thought-journey.routes').then((m) => m.THOUGHT_JOURNEY_ROUTES),
  },
];
