import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { DatabaseService } from './core/services/database.service';
import { JourneyStateService } from './features/thought-journey/services/journey-state.service';
import { JOURNEY_REPOSITORY, ANALYTICS_REPOSITORY } from './core/repositories/repository.tokens';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private platform = inject(Platform);
  private databaseService = inject(DatabaseService);
  private journeyRepository = inject(JOURNEY_REPOSITORY);
  private analyticsRepository = inject(ANALYTICS_REPOSITORY);
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  async ngOnInit(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        await this.initializeStatusBar();
        await this.databaseService.initializeDatabase();
      } else {
        await this.journeyRepository.initialize();
        await this.analyticsRepository.initialize();
      }
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
    }
  }

  private async initializeStatusBar(): Promise<void> {
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.error('❌ Failed to initialize status bar:', error);
    }
  }

  private async showDraftPrompt(journey: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Continue Your Journey?',
      message: 'You have an unfinished thought journey. Would you like to continue where you left off?',
      buttons: [
        {
          text: 'Start Fresh',
          role: 'cancel',
          handler: async () => {
            await this.journeyState.cancelJourney();
          }
        },
        {
          text: 'Continue',
          handler: async () => {
            const route = this.getRouteForStep(journey.current_step, journey.path_type);
            await this.router.navigate([route]);
            console.log(`📍 Resuming journey at step ${journey.current_step}: ${route}`);
          }
        }
      ]
    });

    await alert.present();
  }

  private getRouteForStep(step: number, pathType: string | null): string {
    // Step 0: Checkin (all paths)
    if (step === 0) return '/journey/checkin';

    // Step 1: Capture Thoughts (all paths)
    if (step === 1) return '/journey/capture-thoughts';

    // Path C (Not Sure)
    if (pathType === 'EMOTIONAL') {
      if (step === 2) return '/journey/emotional-capture';
      if (step === 3) return '/journey/emotional-context';
      return '/journey/complete';
    }

    // Path A & B share step 2
    if (step === 2) return '/journey/whos-thought';

    // Path A (Real Thoughts)
    if (pathType === 'REAL') {
      if (step === 3) return '/journey/plan-of-action';
      if (step === 4) return '/journey/reevaluate-emotion';
      return '/journey/complete';
    }

    // Path B (Not Real Thoughts)
    if (pathType === 'NOT_REAL') {
      if (step === 3) return '/journey/transform-thought';
      if (step === 4) return '/journey/habit';
      return '/journey/complete';
    }

    // Default fallback
    return '/journey/checkin';
  }
}
