import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyProgressHeaderComponent } from './journey-progress-header.component';

describe('JourneyProgressHeaderComponent', () => {
  let component: JourneyProgressHeaderComponent;
  let fixture: ComponentFixture<JourneyProgressHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneyProgressHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JourneyProgressHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
