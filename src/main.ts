// Must be imported first to make all event listeners passive by default
import 'default-passive-events';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, arrowUpOutline } from 'ionicons/icons';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { REPOSITORY_PROVIDERS } from './app/core/repositories/repository.providers';

// Register icons globally
addIcons({ informationCircleOutline, arrowUpOutline });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'ios'
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    ...REPOSITORY_PROVIDERS,
  ],
});
