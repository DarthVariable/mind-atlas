import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonProgressBar
} from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyCancelButtonComponent } from '../journey-cancel-button/journey-cancel-button.component';

@Component({
  selector: 'app-journey-progress-header',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonProgressBar,
    JourneyCancelButtonComponent
  ],
  templateUrl: './journey-progress-header.component.html',
  styleUrls: ['./journey-progress-header.component.scss']
})
export class JourneyProgressHeaderComponent {
  private journeyState = inject(JourneyStateService);

  progress = computed(() => this.journeyState.getProgress());
  progressPercentage = computed(() => this.journeyState.getProgressPercentage());
}
