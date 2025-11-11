import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonLabel,
  IonCheckbox
} from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { Habit, HabitFrequency } from '../../models/journey.model';

@Component({
  selector: 'app-habit-page',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonRadioGroup,
    IonItem,
    IonRadio,
    IonIcon,
    IonLabel,
    IonCheckbox,
    JourneyProgressHeaderComponent
  ],
  templateUrl: './habit-page.component.html',
  styleUrls: ['./habit-page.component.scss']
})
export class HabitPageComponent {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  frequency = signal<HabitFrequency | null>('DAILY');
  reminderEnabled = signal(false);

  onFrequencyChange(event: any): void {
    this.frequency.set(event.detail.value);
  }

  onReminderChange(event: any): void {
    this.reminderEnabled.set(event.detail.checked);
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.router.navigate(['/journey/transform-thought']);
  }

  async proceed(): Promise<void> {
    if (!this.frequency()) return;

    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const habit: Habit = {
      journey_id: journey.id,
      habit_description: journey.transformation?.transformed_thought || 'Practice new thought',
      reminder_enabled: this.reminderEnabled(),
      reminder_time: this.reminderEnabled() ? '09:00' : null,
      frequency: this.frequency()!
    };

    this.journeyState.updateJourney({ habit });
    await this.journeyState.nextStep();
    await this.router.navigate(['/journey/complete']);
  }
}
