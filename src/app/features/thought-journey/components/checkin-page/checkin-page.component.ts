import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonCheckbox,
  IonInput,
  IonFooter,
  IonButton
} from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import {
  AnalyticsService,
  CheckInConcern,
} from '../../../../core/services/analytics.service';
import { JourneyCancelButtonComponent } from '../journey-cancel-button/journey-cancel-button.component';
import { DismissKeyboardOnEnterDirective } from '../../../../shared/directives';

const IonicImports = [
  CommonModule,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonCheckbox,
  IonInput,
  IonFooter,
  IonButton,
];
@Component({
  selector: 'app-checkin-page',
  standalone: true,
  imports: [IonicImports, JourneyCancelButtonComponent, DismissKeyboardOnEnterDirective],
  templateUrl: './checkin-page.component.html',
  styleUrls: ['./checkin-page.component.scss'],
})
export class CheckinPageComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private analytics = inject(AnalyticsService);
  private router = inject(Router);

  selectedConcerns = signal<string[]>([]);
  otherText = '';

  concerns: CheckInConcern[] = this.analytics.CONCERN_OPTIONS;

  ngOnInit(): void {
    // Clear focus from any previously focused element to prevent aria-hidden warning
    // This happens when navigating from a tab where a button had focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  toggleConcern(value: string): void {
    const current = this.selectedConcerns();
    if (current.includes(value)) {
      this.selectedConcerns.set(current.filter((c) => c !== value));
      if (value === 'other') {
        this.otherText = '';
      }
    } else {
      this.selectedConcerns.set([...current, value]);
    }
  }

  onOtherTextInput(event: any): void {
    this.otherText = event.target.value || '';
  }

  async startJourney(): Promise<void> {
    const concerns = this.selectedConcerns();
    if (concerns.length === 0) return;

    try {
      await this.analytics.trackCheckIn(
        concerns,
        concerns.includes('other') ? this.otherText : null,
        'journey'
      );
      console.log('Check-in data tracked successfully');
    } catch (error) {
      console.error('Failed to track check-in:', error);
    }

    // Start journey at step 1 (check-in), then advance to step 2 (capture-thoughts)
    this.journeyState.startJourney();
    await this.journeyState.nextStep();
    this.router.navigate(['/journey/capture-thoughts']);
  }
}
