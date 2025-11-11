import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonIcon,
  IonTextarea,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonRadioGroup,
  IonRadio
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, informationCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';

@Component({
  selector: 'app-capture-thoughts-page',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    IonTextarea,
    IonItem,
    IonCheckbox,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    JourneyProgressHeaderComponent
  ],
  templateUrl: './capture-thoughts-page.component.html',
  styleUrls: ['./capture-thoughts-page.component.scss']
})
export class CaptureThoughtsPageComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  thoughtText = signal('');
  notSureChecked = signal(false);
  isItReal = signal<'REAL' | 'NOT_REAL' | null>(null);
  attemptedSubmit = false;

  hasThoughtText = computed(() => this.thoughtText().trim().length > 0);

  showIsItReal = computed(() => this.hasThoughtText() && !this.notSureChecked());

  showValidationMessage = computed(() => this.attemptedSubmit && this.showIsItReal() && this.isItReal() === null);

  canProceed = computed(() => {
    if (this.notSureChecked()) {
      return true;
    }
    return this.hasThoughtText() && this.isItReal() !== null;
  });

  constructor() {
    addIcons({ close, informationCircleOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    // Clear focus from previous page to prevent aria-hidden warning
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Restore values from journey state if they exist
    const journey = this.journeyState.getCurrentJourney();
    if (journey) {
      if (journey.thought_text) {
        this.thoughtText.set(journey.thought_text);
      }
      if (journey.path_type === 'REAL') {
        this.isItReal.set('REAL');
      } else if (journey.path_type === 'NOT_REAL') {
        this.isItReal.set('NOT_REAL');
      }
    }
  }

  onThoughtInput(event: any): void {
    const value = event.target.value || '';
    this.thoughtText.set(value);

    if (value.trim().length > 0) {
      this.notSureChecked.set(false);
    }
  }

  onNotSureChange(event: any): void {
    const checked = event.detail.checked;
    this.notSureChecked.set(checked);

    if (checked) {
      this.thoughtText.set('');
      this.isItReal.set(null);
    }
  }

  onIsItRealChange(event: any): void {
    this.isItReal.set(event.detail.value);
  }

  clearThoughtText(): void {
    this.thoughtText.set('');
    this.isItReal.set(null);
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.blurActiveElement();
    this.router.navigate(['/journey/checkin']);
  }

  proceed(): void {
    this.attemptedSubmit = true;

    if (!this.canProceed()) return;

    this.blurActiveElement();

    // Update journey state
    if (this.notSureChecked()) {
      // Path C: Emotional
      this.journeyState.updateJourney({
        path_type: 'EMOTIONAL',
        thought_text: null
      });
      this.journeyState.nextStep();
      this.router.navigate(['/journey/emotional-capture']);
    } else if (this.isItReal() === 'REAL') {
      // Path A: Real
      this.journeyState.updateJourney({
        path_type: 'REAL',
        thought_text: this.thoughtText().trim()
      });
      this.journeyState.nextStep();
      this.router.navigate(['/journey/whos-thought']);
    } else if (this.isItReal() === 'NOT_REAL') {
      // Path B: Not Real
      this.journeyState.updateJourney({
        path_type: 'NOT_REAL',
        thought_text: this.thoughtText().trim()
      });
      this.journeyState.nextStep();
      this.router.navigate(['/journey/whos-thought']);
    }
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
