import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote
} from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import { PathType } from '../../models/journey.model';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  listOutline,
  chevronForwardOutline,
  bulbOutline,
  swapHorizontalOutline,
  arrowDown,
  repeatOutline,
  notificationsOutline,
  heartOutline,
  thermometerOutline,
  documentTextOutline,
  bookOutline,
  addCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-journey-complete',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonNote
  ],
  templateUrl: './journey-complete.component.html',
  styleUrls: ['./journey-complete.component.scss'],
})
export class JourneyCompleteComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  pathType = signal<PathType | null>(null);
  actionItems = signal<string[]>([]);
  originalThought = signal<string>('');
  transformedThought = signal<string>('');
  habitDescription = signal<string>('');
  habitReminder = signal<boolean>(false);
  habitFrequency = signal<string>('');
  emotions = signal<string[]>([]);
  emotionIntensity = signal<number>(3);
  situationText = signal<string>('');

  hasActionItems = computed(() => this.actionItems().length > 0);
  hasTransformation = computed(
    () =>
      this.originalThought().length > 0 && this.transformedThought().length > 0
  );
  hasHabit = computed(() => this.habitDescription().length > 0);
  hasEmotions = computed(() => this.emotions().length > 0);
  hasSituation = computed(() => this.situationText().length > 0);

  ngOnInit(): void {
    const journey = this.journeyState.getCurrentJourney();
    if (!journey) {
      this.router.navigate(['/']);
      return;
    }

    this.pathType.set(journey.path_type);
    console.log("🚀 ~ JourneyCompleteComponent ~ ngOnInit ~ this.pathType:", this.pathType)

    // Load path-specific data
    if (journey.path_type === 'REAL') {
      if (journey.actionItems) {
        this.actionItems.set(
          journey.actionItems.map((item) => item.action_text)
        );
      }
    } else if (journey.path_type === 'NOT_REAL') {
      if (journey.transformation) {
        this.originalThought.set(journey.transformation.original_thought);
        this.transformedThought.set(journey.transformation.transformed_thought);
      }
      if (journey.habit) {
        this.habitDescription.set(journey.habit.habit_description);
        this.habitReminder.set(journey.habit.reminder_enabled);
        this.habitFrequency.set(this.formatFrequency(journey.habit.frequency));
      }
    } else if (journey.path_type === 'EMOTIONAL') {
      if (journey.emotions) {
        this.emotions.set(journey.emotions.map((e) => e.emotion_type));
        if (journey.emotions.length > 0) {
          this.emotionIntensity.set(journey.emotions[0].intensity);
        }
      }
      if (journey.situation_text) {
        this.situationText.set(journey.situation_text);
      }
    }

    // Complete the journey and save to database
    // Note: We do this asynchronously and don't await it so the UI renders immediately
    this.journeyState.completeJourney().catch((error) => {
      console.error('Failed to complete journey:', error);
    });
  }

  constructor() {
    addIcons({
      checkmarkCircle,
      listOutline,
      chevronForwardOutline,
      bulbOutline,
      swapHorizontalOutline,
      arrowDown,
      repeatOutline,
      notificationsOutline,
      heartOutline,
      thermometerOutline,
      documentTextOutline,
      bookOutline,
      addCircleOutline,
    });
  }

  getSubtitle(): string {
    const path = this.pathType();
    if (path === 'REAL') {
      return "You've created a plan to address your real thought";
    } else if (path === 'NOT_REAL') {
      return "You've transformed a distorted thought into a healthier one";
    } else if (path === 'EMOTIONAL') {
      return "You've acknowledged and explored your emotions";
    }
    return "You've completed your thought journey";
  }

  formatFrequency(frequency: string): string {
    switch (frequency) {
      case 'DAILY':
        return 'daily';
      case 'WEEKLY':
        return 'weekly';
      case 'CUSTOM':
        return 'custom schedule';
      default:
        return frequency.toLowerCase();
    }
  }

  goToJournal(): void {
    this.blurActiveElement();
    this.router.navigate(['/tabs/history']);
  }

  startNewJourney(): void {
    this.blurActiveElement();
    // Start a fresh journey, clearing any previous data
    this.journeyState.startJourney();
    this.router.navigate(['/journey/checkin']);
  }

  goHome(): void {
    this.blurActiveElement();
    this.router.navigate(['/tabs/dashboard']);
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
