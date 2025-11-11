import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonRadioGroup,
  IonItem,
  IonRadio,
  IonIcon, IonLabel } from '@ionic/angular/standalone';
import { JourneyStateService } from '../../services/journey-state.service';
import { JourneyProgressHeaderComponent } from '../journey-progress-header/journey-progress-header.component';
import { ThoughtOrigin } from '../../models/journey.model';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-whos-thought-page',
  standalone: true,
  imports: [IonLabel, IonIcon, 
    CommonModule,
    FormsModule,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonRadioGroup,
    IonItem,
    IonRadio,
    JourneyProgressHeaderComponent
  ],
  templateUrl: './whos-thought-page.component.html',
  styleUrls: ['./whos-thought-page.component.scss']
})
export class WhosThoughtPageComponent implements OnInit {
  private journeyState = inject(JourneyStateService);
  private router = inject(Router);

  selectedOrigin = signal<ThoughtOrigin | null>(null);

  origins = [
    {
      value: 'ME' as ThoughtOrigin,
      label: 'Me',
      description: 'This is my own thought'
    },
    {
      value: 'PARENT' as ThoughtOrigin,
      label: 'Mom/Father',
      description: 'I heard this from my parents'
    },
    {
      value: 'FAMILY' as ThoughtOrigin,
      label: 'Family/Growing up',
      description: 'This comes from my family or childhood'
    },
    {
      value: 'SCHOOL' as ThoughtOrigin,
      label: 'School/Teacher',
      description: 'I learned this at school or from teachers'
    },
    {
      value: 'AUTHORITY' as ThoughtOrigin,
      label: 'Figure of authority',
      description: 'Someone in a position of power told me'
    },
    {
      value: 'RELATIONSHIPS' as ThoughtOrigin,
      label: 'Relationships',
      description: 'This comes from past/current relationships'
    },
    {
      value: 'OTHER' as ThoughtOrigin,
      label: 'Others',
      description: 'Someone else or society in general'
    }
  ];
  constructor() {
    addIcons({ informationCircleOutline });
  }

  ngOnInit(): void {
    this.blurActiveElement();
  }

  onOriginChange(event: any): void {
    this.selectedOrigin.set(event.detail.value);
  }

  goBack(): void {
    this.journeyState.previousStep();
    this.router.navigate(['/journey/capture-thoughts']);
  }

  proceed(): void {
    const origin = this.selectedOrigin();
    if (!origin) return;

    this.journeyState.updateJourney({
      thought_origin: origin
    });
    this.journeyState.nextStep();
    this.blurActiveElement();

    const journey = this.journeyState.getCurrentJourney();
    if (journey?.path_type === 'REAL') {
      this.router.navigate(['/journey/plan-of-action']);
    } else if (journey?.path_type === 'NOT_REAL') {
      this.router.navigate(['/journey/transform-thought']);
    }
  }

  private blurActiveElement(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
