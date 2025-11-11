import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReevaluateEmotionPageComponent } from './reevaluate-emotion-page.component';

describe('ReevaluateEmotionPageComponent', () => {
  let component: ReevaluateEmotionPageComponent;
  let fixture: ComponentFixture<ReevaluateEmotionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReevaluateEmotionPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReevaluateEmotionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
