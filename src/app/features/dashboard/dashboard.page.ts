import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { JourneyStateService } from '../thought-journey/services/journey-state.service';
import { PathType } from '../thought-journey/models/journey.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon],
})
export class DashboardPage implements OnInit {
  private router = inject(Router);
  private journeyState = inject(JourneyStateService);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({ add });
  }

  async ngOnInit() {
    // Check for draft on dashboard load
    await this.checkForDraft();
  }

  /**
   * Check if there's a draft journey and prompt user to resume
   */
  private async checkForDraft(): Promise<void> {
    const hasDraft = await this.journeyState.loadDraftFromPreferences();

    if (hasDraft) {
      await this.showDraftRecoveryAlert();
    }
  }

  /**
   * Show alert prompting user to resume or discard draft
   */
  private async showDraftRecoveryAlert(): Promise<void> {
    const journey = this.journeyState.getCurrentJourney();

    if (!journey) {
      console.warn('Draft loaded but no journey in state');
      return;
    }

    const updatedDate = new Date(journey.updated_at);
    const formattedDate = updatedDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    const alert = await this.alertController.create({
      header: 'Resume Journey?',
      message: `You have an unfinished journey from ${formattedDate}. Would you like to continue where you left off?`,
      buttons: [
        {
          text: 'Discard',
          role: 'destructive',
          handler: async () => {
            await this.discardDraft();
          }
        },
        {
          text: 'Resume',
          role: 'confirm',
          handler: () => {
            this.resumeDraft();
          }
        }
      ],
      backdropDismiss: false // Require user decision
    });

    await alert.present();
  }

  /**
   * Resume draft journey by navigating to appropriate step
   */
  private resumeDraft(): void {
    const journey = this.journeyState.getCurrentJourney();

    if (!journey) {
      console.error('No journey to resume');
      return;
    }

    const routePath = this.getRouteForStep(journey.current_step, journey.path_type);

    console.log(`Resuming journey at step ${journey.current_step}: ${routePath}`);
    this.router.navigate([routePath]);
  }

  /**
   * Discard draft journey
   */
  private async discardDraft(): Promise<void> {
    await this.journeyState.cancelJourney();
    console.log('Draft journey discarded');
  }

  /**
   * Map journey step + path type to route
   */
  private getRouteForStep(step: number, pathType: PathType | null): string {
    // Step 1: Check-in
    if (step === 1) return '/journey/checkin';

    // Step 2: Capture thoughts
    if (step === 2) return '/journey/capture-thoughts';

    // Step 3: Emotional capture
    if (step === 3) return '/journey/emotional-capture';

    // Steps 4+ depend on path type
    if (pathType === 'EMOTIONAL') {
      if (step === 4) return '/journey/emotional-context';
      if (step === 5) return '/journey/complete';
    } else if (pathType === 'NOT_REAL') {
      if (step === 4) return '/journey/whos-thought';
      if (step === 5) return '/journey/transform-thought';
      if (step === 6) return '/journey/habit-formation';
      if (step === 7) return '/journey/complete';
    } else if (pathType === 'REAL') {
      if (step === 4) return '/journey/whos-thought';
      if (step === 5) return '/journey/plan-of-action';
      if (step === 6) return '/journey/reevaluate-emotion';
      if (step === 7) return '/journey/complete';
    }

    // Fallback to checkin if step/path combination not recognized
    console.warn(`Unknown step/path combination: step=${step}, path=${pathType}`);
    return '/journey/checkin';
  }

  async startThoughtJourney(): Promise<void> {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Check if there's already an active journey
    const currentJourney = this.journeyState.getCurrentJourney();

    if (currentJourney && currentJourney.is_draft) {
      // Prompt to overwrite existing draft
      await this.confirmOverwriteDraft();
    } else {
      // No existing draft, start new journey
      this.router.navigate(['/journey/checkin']);
    }
  }

  /**
   * Confirm overwriting an existing draft before starting new journey
   */
  private async confirmOverwriteDraft(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Start New Journey?',
      message: 'Starting a new journey will discard your current unfinished journey. Continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Start New',
          role: 'confirm',
          handler: async () => {
            await this.journeyState.cancelJourney();
            this.router.navigate(['/journey/checkin']);
          }
        }
      ]
    });

    await alert.present();
  }
}
