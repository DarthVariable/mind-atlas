import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../thought-journey/services/journey.service';
import { CompletedJourney } from '../thought-journey/models/journey-data.models';

@Component({
  selector: 'app-journey-detail',
  templateUrl: 'journey-detail.page.html',
  styleUrls: ['journey-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner
  ]
})
export class JourneyDetailPage implements OnInit {
  journey = signal<CompletedJourney | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private journeyService: JourneyService
  ) {}

  async ngOnInit() {
    const journeyId = this.route.snapshot.paramMap.get('id');

    if (!journeyId) {
      console.error('❌ No journey ID provided');
      this.error.set('Journey not found');
      this.loading.set(false);
      return;
    }

    await this.loadJourney(journeyId);
  }

  async loadJourney(id: string) {
    try {
      this.loading.set(true);
      console.log('📖 Loading journey details:', id);

      const journey = await this.journeyService.getJourneyById(id);

      if (!journey) {
        console.error('❌ Journey not found:', id);
        this.error.set('Journey not found');
      } else {
        this.journey.set(journey);
        console.log('✅ Journey loaded:', journey);
      }
    } catch (error) {
      console.error('❌ Error loading journey:', error);
      this.error.set('Failed to load journey');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  getPathTypeLabel(pathType: string | null): string {
    switch (pathType) {
      case 'REAL': return 'Real Thought';
      case 'NOT_REAL': return 'Not Real Thought';
      case 'EMOTIONAL': return 'Emotional';
      default: return 'Unknown';
    }
  }

  getPathTypeColor(pathType: string | null): string {
    switch (pathType) {
      case 'REAL': return 'primary';
      case 'NOT_REAL': return 'success';
      case 'EMOTIONAL': return 'warning';
      default: return 'medium';
    }
  }

  goBack() {
    this.router.navigate(['/tabs/history']);
  }
}
