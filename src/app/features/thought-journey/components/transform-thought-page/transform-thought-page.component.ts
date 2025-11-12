import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonIcon,
  IonTextarea,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  close,
  informationCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { Transformation } from '../../models/journey.model';
import { DismissKeyboardOnEnterDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-transform-thought-page',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    IonTextarea,
    JourneyProgressHeaderComponent,
    DismissKeyboardOnEnterDirective,
  ],
  templateUrl: './transform-thought-page.component.html',
  styleUrls: ['./transform-thought-page.component.scss'],
})
export class TransformThoughtPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  transformedThought = signal('');

  originalThought = computed(() => {
    const journey = this.journeyState.getCurrentJourney();
    return journey?.thought_text || '';
  });

  hasTransformedText = computed(
    () => this.transformedThought().trim().length > 0
  );

  canProceed = computed(() => {
    return this.transformedThought().trim().length >= 10;
  });

  constructor() {
    addIcons({ close, informationCircleOutline, alertCircleOutline });
  }

  onThoughtInput(event: any): void {
    const value = event.target.value || '';
    this.transformedThought.set(value);
  }

  clearTransformedThought(): void {
    this.transformedThought.set('');
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.blurActiveElement();
    this.router.navigate(['/journey/whos-thought']);
  }

  proceed(): void {
    if (!this.canProceed()) return;

    this.blurActiveElement();

    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const transformation: Transformation = {
      journey_id: journey.id,
      original_thought: journey.thought_text || '',
      transformed_thought: this.transformedThought().trim(),
      transformation_type: 'REFRAME',
    };

    this.journeyState.updateJourney({ transformation });
    this.journeyState.nextStep();
    this.router.navigate(['/journey/habit']);
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
