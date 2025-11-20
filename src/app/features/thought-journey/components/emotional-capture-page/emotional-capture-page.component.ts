import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonRange,
  IonLabel
} from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { Emotion } from '../../models/journey.model';

@Component({
  selector: 'app-emotional-capture-page',
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
    JourneyProgressHeaderComponent
  ],
  templateUrl: './emotional-capture-page.component.html',
  styleUrls: ['./emotional-capture-page.component.scss']
})
export class EmotionalCapturePageComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  selectedEmotions = signal<string[]>([]);
  intensity = 3;

  // Emotion lists by sentiment
  private negativeEmotions = [
    { name: 'Anxiety', icon: '😰' },
    { name: 'Sad', icon: '😢' },
    { name: 'Fear', icon: '😨' },
    { name: 'Anger', icon: '😠' },
    { name: 'Disgust', icon: '🤢' },
    { name: 'Shame', icon: '😳' },
    { name: 'Guilt', icon: '😔' },
    { name: 'Confused', icon: '😕' },
    { name: 'Overwhelmed', icon: '😵' },
    { name: 'Hopeless', icon: '😞' }
  ];

  private positiveEmotions = [
    { name: 'Joy', icon: '😊' },
    { name: 'Gratitude', icon: '🙏' },
    { name: 'Hope', icon: '🌟' },
    { name: 'Pride', icon: '😌' },
    { name: 'Calm', icon: '😌' },
    { name: 'Excitement', icon: '🤩' },
    { name: 'Love', icon: '❤️' },
    { name: 'Content', icon: '😊' },
    { name: 'Confident', icon: '💪' },
    { name: 'Inspired', icon: '💡' }
  ];

  private neutralEmotions = [
    { name: 'Curious', icon: '🤔' },
    { name: 'Reflective', icon: '🧐' },
    { name: 'Calm', icon: '😌' },
    { name: 'Neutral', icon: '😐' },
    { name: 'Confused', icon: '😕' },
    { name: 'Surprised', icon: '😮' },
    { name: 'Thoughtful', icon: '💭' },
    { name: 'Interested', icon: '🤨' }
  ];

  emotionsList: Array<{ name: string; icon: string }> = [];

  ngOnInit(): void {
    this.blurActiveElement();
    this.loadEmotionsForSentiment();
  }

  private loadEmotionsForSentiment(): void {
    const journey = this.journeyState.getCurrentJourney();
    const sentiment = journey?.sentiment || 'neutral';

    // Filter emotions based on journey sentiment
    if (sentiment === 'positive') {
      this.emotionsList = this.positiveEmotions;
    } else if (sentiment === 'negative') {
      this.emotionsList = this.negativeEmotions;
    } else {
      this.emotionsList = this.neutralEmotions;
    }
  }

  isSelected(emotion: string): boolean {
    return this.selectedEmotions().includes(emotion);
  }

  toggleEmotion(emotion: string): void {
    this.selectedEmotions.update(current => {
      if (current.includes(emotion)) {
        return current.filter(e => e !== emotion);
      } else {
        return [...current, emotion];
      }
    });
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.blurActiveElement();
    this.router.navigate(['/journey/capture-thoughts']);
  }

  proceed(): void {
    if (this.selectedEmotions().length === 0) return;

    const journey = this.journeyState.getCurrentJourney();
    if (!journey) return;

    const emotions: Emotion[] = this.selectedEmotions().map(emotionType => ({
      journey_id: journey.id,
      emotion_type: emotionType,
      intensity: this.intensity,
      captured_at_step: journey.current_step
    }));

    this.journeyState.updateJourney({ emotions });
    this.journeyState.nextStep();
    this.blurActiveElement();

    // Route based on path type
    if (journey.path_type === 'EMOTIONAL') {
      // EMOTIONAL path: continue to emotional-context
      this.router.navigate(['/journey/emotional-context']);
    } else {
      // REAL and NOT_REAL paths: skip emotional-context, go directly to whos-thought
      this.router.navigate(['/journey/whos-thought']);
    }
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
