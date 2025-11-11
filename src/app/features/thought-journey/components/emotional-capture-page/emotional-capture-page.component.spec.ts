import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmotionalCapturePageComponent } from './emotional-capture-page.component';

describe('EmotionalCapturePageComponent', () => {
  let component: EmotionalCapturePageComponent;
  let fixture: ComponentFixture<EmotionalCapturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmotionalCapturePageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmotionalCapturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
