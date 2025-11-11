import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonNote, IonSpinner, IonRefresher, IonRefresherContent, IonButtons, IonButton, IonIcon, IonItemSliding, IonItemOptions, IonItemOption, AlertController, ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { JourneyService } from '../thought-journey/services/journey.service';
import { CompletedJourney } from '../thought-journey/models/journey-data.models';
import { addIcons } from 'ionicons';
import { trashOutline, trash } from 'ionicons/icons';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class HistoryPage implements OnInit {
  journeys = signal<CompletedJourney[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private router: Router,
    private journeyService: JourneyService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ trashOutline, trash });
  }

  async ngOnInit() {
    await this.loadJourneys();
  }

  async loadJourneys() {
    try {
      this.loading.set(true);

      const completedJourneys = await this.journeyService.getCompletedJourneys(20, 0);

      this.journeys.set(completedJourneys);
      console.log(`Loaded ${completedJourneys.length} completed journeys`, completedJourneys);

    } catch (error) {
      console.error('❌ Error loading journeys:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async handleRefresh(event: any) {
    await this.loadJourneys();
    event.target.complete();
  }

  viewJourney(journey: CompletedJourney): void {
    this.router.navigate(['/tabs/journey', journey.id]);
  }

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp).toLocaleDateString('en-US', {
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

  async deleteJourney(journey: CompletedJourney, slidingItem?: IonItemSliding): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Journey',
      message: 'Are you sure you want to delete this journey? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            slidingItem?.close();
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.journeyService.deleteJourney(journey.id);

              // Remove from local list
              const currentJourneys = this.journeys();
              this.journeys.set(currentJourneys.filter(j => j.id !== journey.id));

              // Show success toast
              const toast = await this.toastController.create({
                message: 'Journey deleted successfully',
                duration: 2000,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();

              slidingItem?.close();
            } catch (error) {
              console.error('Error deleting journey:', error);

              // Show error toast
              const toast = await this.toastController.create({
                message: 'Failed to delete journey',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAllJourneys(): Promise<void> {
    const count = this.journeys().length;

    if (count === 0) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete All Journeys',
      message: `Are you sure you want to delete all ${count} journey${count > 1 ? 's' : ''}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete All',
          role: 'destructive',
          handler: async () => {
            try {
              this.loading.set(true);
              await this.journeyService.deleteAllJourneys();

              // Clear local list
              this.journeys.set([]);

              // Show success toast
              const toast = await this.toastController.create({
                message: `All ${count} journey${count > 1 ? 's' : ''} deleted successfully`,
                duration: 2000,
                position: 'bottom',
                color: 'success'
              });
              await toast.present();

            } catch (error) {
              console.error('Error deleting all journeys:', error);

              // Show error toast
              const toast = await this.toastController.create({
                message: 'Failed to delete journeys',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
              });
              await toast.present();

              // Reload journeys to show correct state
              await this.loadJourneys();
            } finally {
              this.loading.set(false);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
