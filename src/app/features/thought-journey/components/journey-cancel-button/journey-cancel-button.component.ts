import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { JourneyStateService } from '../../services/journey-state.service';

@Component({
  selector: 'app-journey-cancel-button',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './journey-cancel-button.component.html',
  styleUrls: ['./journey-cancel-button.component.scss'],
})
export class JourneyCancelButtonComponent {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private journeyState = inject(JourneyStateService);

  constructor() {
    addIcons({ closeOutline });
  }

  async onCancel(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancel Journey?',
      message: 'Are you sure you want to cancel this entry? Your progress will be lost.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: async () => {
            await this.journeyState.cancelJourney();
            this.router.navigate(['/tabs/dashboard']);
          },
        },
      ],
    });

    await alert.present();
  }
}
