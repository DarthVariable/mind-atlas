import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyCompleteComponent } from './journey-complete.component';

describe('JourneyCompleteComponent', () => {
  let component: JourneyCompleteComponent;
  let fixture: ComponentFixture<JourneyCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneyCompleteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JourneyCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
