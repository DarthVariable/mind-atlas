import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonRange,
  IonLabel,
  IonIcon,
  IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { Reevaluation } from '../../models/journey.model';
import { DismissKeyboardOnEnterDirective } from '../../../../shared/directives';

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
    IonRange,
    IonLabel,
    IonIcon,
    IonTextarea,
    JourneyProgressHeaderComponent,
    DismissKeyboardOnEnterDirective
  ],
  templateUrl: './reevaluate-emotion-page.component.html',
  styleUrls: ['./reevaluate-emotion-page.component.scss']
})
export class ReevaluateEmotionPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  originalBeliefRating = signal<number>(5);
  currentBeliefRating = signal<number>(5);
  insights = signal('');

  hasInsightsText = computed(() => this.insights().trim().length > 0);
  beliefChangeAmount = computed(() => this.currentBeliefRating() - this.originalBeliefRating());
  beliefChangeDirection = computed(() => {
    const change = this.beliefChangeAmount();
    if (change > 0) return 'improved';
    if (change < 0) return 'worsened';
    return 'unchanged';
  });

  // Expose Math.abs to template
  Math = Math;

  constructor() {
    addIcons({ close });
  }

  onOriginalRatingChange(event: any): void {
    this.originalBeliefRating.set(event.detail.value);
  }

  onCurrentRatingChange(event: any): void {
    this.currentBeliefRating.set(event.detail.value);
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
    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const reevaluation: Reevaluation = {
      journey_id: journey.id,
      original_belief_rating: this.originalBeliefRating(),
      reevaluated_belief_rating: this.currentBeliefRating(),
      insights: this.insights().trim() || null
    };

    this.journeyState.updateJourney({ reevaluation });
    await this.journeyState.nextStep();
    await this.router.navigate(['/journey/complete']);
  }
}
