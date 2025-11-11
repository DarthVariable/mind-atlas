import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonIcon,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, add, bulbOutline } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { ActionItem } from '../../models/journey.model';

@Component({
  selector: 'app-plan-of-action-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    IonInput,
    JourneyProgressHeaderComponent
  ],
  templateUrl: './plan-of-action-page.component.html',
  styleUrls: ['./plan-of-action-page.component.scss']
})
export class PlanOfActionPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  constructor() {
    addIcons({ trashOutline, add, bulbOutline });
  }

  actions = signal<{ text: string }[]>([{ text: '' }]);

  onActionInput(event: any, index: number): void {
    const value = event.target.value || '';
    this.actions.update(current => {
      const updated = [...current];
      updated[index] = { text: value };
      return updated;
    });
  }

  addAction(): void {
    this.actions.update(current => [...current, { text: '' }]);
  }

  removeAction(index: number): void {
    this.actions.update(current => current.filter((_, i) => i !== index));
  }

  canProceed(): boolean {
    return this.actions().some(action => action.text.trim().length > 0);
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.router.navigate(['/journey/whos-thought']);
  }

  proceed(): void {
    if (!this.canProceed()) return;

    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const actionItems: ActionItem[] = this.actions()
      .filter(action => action.text.trim().length > 0)
      .map(action => ({
        journey_id: journey.id,
        action_text: action.text.trim(),
        is_completed: false,
        created_at: Date.now()
      }));

    this.journeyState.updateJourney({
      actionItems
    });
    this.journeyState.nextStep();
    this.router.navigate(['/journey/reevaluate-emotion']);
  }
}
