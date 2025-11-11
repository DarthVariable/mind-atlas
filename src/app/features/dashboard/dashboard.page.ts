import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon],
})
export class DashboardPage {
  constructor(private router: Router) {
    addIcons({ add });
  }

  startThoughtJourney(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.router.navigate(['/journey/checkin']);
  }
}
