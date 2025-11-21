import { Component, OnInit, signal, inject } from '@angular/core';
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
  IonSpinner,
  IonCheckbox
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../thought-journey/services/journey.service';
import { CompletedJourney } from '../thought-journey/models/journey-data.models';
import { ActionItem } from '../thought-journey/models/journey.model';

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
    IonSpinner,
    IonCheckbox
  ]
})
export class JourneyDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private journeyService = inject(JourneyService);

  journey = signal<CompletedJourney | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

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

  formatTargetDate(timestamp: number | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  async toggleActionCompletion(actionItem: ActionItem) {
    const journey = this.journey();
    if (!journey || !journey.actionItems || !actionItem.id) return;

    // Store original state for rollback on error
    const originalJourney = journey;

    // Update the action item locally (optimistic update)
    const updatedActionItems = journey.actionItems.map(item => {
      if (item.id === actionItem.id) {
        return {
          ...item,
          is_completed: !item.is_completed,
          completed_at: !item.is_completed ? Date.now() : undefined
        };
      }
      return item;
    });

    // Update the journey with new action items
    const updatedJourney = {
      ...journey,
      actionItems: updatedActionItems,
      updated_at: Date.now()
    };

    // Update UI immediately for better UX (optimistic update)
    this.journey.set(updatedJourney);

    try {
      // Persist to database
      await this.journeyService.updateActionItem(
        journey.id,
        actionItem.id,
        {
          is_completed: !actionItem.is_completed,
          completed_at: !actionItem.is_completed ? Date.now() : undefined
        }
      );
      console.log('✅ Action item completion status persisted to database');
    } catch (error) {
      console.error('❌ Failed to update action item:', error);
      // Rollback UI to original state on error
      this.journey.set(originalJourney);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/history']);
  }
}
