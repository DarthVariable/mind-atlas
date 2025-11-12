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
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, informationCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { DismissKeyboardOnEnterDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-emotional-context-page',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    IonTextarea,
    IonNote,
    JourneyProgressHeaderComponent,
    DismissKeyboardOnEnterDirective
  ],
  templateUrl: './emotional-context-page.component.html',
  styleUrls: ['./emotional-context-page.component.scss']
})
export class EmotionalContextPageComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  situationText = signal('');

  hasSituationText = computed(() => this.situationText().trim().length > 0);

  canProceed = computed(() => this.situationText().trim().length >= 20);

  constructor() {
    addIcons({ close, informationCircleOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    this.blurActiveElement();
  }

  onSituationInput(event: any): void {
    const value = event.target.value || '';
    this.situationText.set(value);
  }

  clearSituationText(): void {
    this.situationText.set('');
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.blurActiveElement();
    this.router.navigate(['/journey/emotional-capture']);
  }

  async proceed(): Promise<void> {
    if (this.situationText().trim().length < 20) return;

    this.journeyState.updateJourney({
      situation_text: this.situationText().trim()
    });

    await this.journeyState.nextStep();
    this.blurActiveElement();

    // Check path type to determine next route
    const journey = this.journeyState.getCurrentJourney();
    if (journey?.path_type === 'REAL' || journey?.path_type === 'NOT_REAL') {
      // Paths A & B: continue to whos-thought
      await this.router.navigate(['/journey/whos-thought']);
    } else {
      // Path C (EMOTIONAL): go to complete
      await this.router.navigate(['/journey/complete']);
    }
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
