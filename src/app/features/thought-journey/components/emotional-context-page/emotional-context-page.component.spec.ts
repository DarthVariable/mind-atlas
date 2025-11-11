import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmotionalContextPageComponent } from './emotional-context-page.component';

describe('EmotionalContextPageComponent', () => {
  let component: EmotionalContextPageComponent;
  let fixture: ComponentFixture<EmotionalContextPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmotionalContextPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmotionalContextPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
