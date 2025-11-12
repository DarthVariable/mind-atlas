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
  IonInput,
  IonList,
  IonItem,
  IonDatetime,
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, add, bulbOutline, calendarClearOutline, closeCircle } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { ActionItem } from '../../models/journey.model';
import { DismissKeyboardOnEnterDirective } from '../../../../shared/directives';

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
    IonList,
    IonItem,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    JourneyProgressHeaderComponent,
    DismissKeyboardOnEnterDirective
  ],
  templateUrl: './plan-of-action-page.component.html',
  styleUrls: ['./plan-of-action-page.component.scss']
})
export class PlanOfActionPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  constructor() {
    addIcons({ trashOutline, add, bulbOutline, calendarClearOutline, closeCircle });
  }

  actions = signal<{ text: string; targetDate?: string }[]>([{ text: '' }]);
  minDate = new Date().toISOString();

  onActionInput(event: any, index: number): void {
    const value = event.target.value || '';
    this.actions.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], text: value };
      return updated;
    });
  }

  addAction(): void {
    this.actions.update(current => [...current, { text: '' }]);
  }

  onDateTimeChange(event: any, index: number): void {
    const value = event.detail.value;
    this.actions.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], targetDate: value };
      return updated;
    });
  }

  clearDate(index: number): void {
    this.actions.update(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], targetDate: undefined };
      return updated;
    });
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (dateOnly.getTime() === today.getTime()) {
      return `Today at ${timeStr}`;
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${dateStr} at ${timeStr}`;
    }
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
        created_at: Date.now(),
        target_date: action.targetDate ? new Date(action.targetDate).getTime() : undefined
      }));

    this.journeyState.updateJourney({
      actionItems
    });
    this.journeyState.nextStep();
    this.router.navigate(['/journey/reevaluate-emotion']);
  }
}
