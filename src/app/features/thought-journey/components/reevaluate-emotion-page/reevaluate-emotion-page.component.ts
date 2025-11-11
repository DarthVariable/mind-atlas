import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonRadioGroup,
  IonItem,
  IonRadio,
  IonIcon,
  IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, remove, close } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { Reevaluation } from '../../models/journey.model';

@Component({
  selector: 'app-reevaluate-emotion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonRadioGroup,
    IonItem,
    IonRadio,
    IonIcon,
    IonTextarea,
    JourneyProgressHeaderComponent
  ],
  templateUrl: './reevaluate-emotion-page.component.html',
  styleUrls: ['./reevaluate-emotion-page.component.scss']
})
export class ReevaluateEmotionPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  feeling = signal<'better' | 'same' | null>(null);
  insights = signal('');

  hasInsightsText = computed(() => this.insights().trim().length > 0);

  constructor() {
    addIcons({ trendingUp, remove, close });
  }

  onFeelingChange(event: any): void {
    this.feeling.set(event.detail.value);
  }

  onInsightsInput(event: any): void {
    const value = event.target.value || '';
    this.insights.set(value);
  }

  clearInsights(): void {
    this.insights.set('');
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.router.navigate(['/journey/plan-of-action']);
  }

  async proceed(): Promise<void> {
    const feelingValue = this.feeling();
    if (!feelingValue) return;

    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const reevaluation: Reevaluation = {
      journey_id: journey.id,
      original_belief_rating: 5,
      reevaluated_belief_rating: feelingValue === 'better' ? 7 : 5,
      insights: this.insights().trim() || null
    };

    this.journeyState.updateJourney({ reevaluation });
    await this.journeyState.nextStep();
    await this.router.navigate(['/journey/complete']);
  }
}
