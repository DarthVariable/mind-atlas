import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanOfActionPageComponent } from './plan-of-action-page.component';

describe('PlanOfActionPageComponent', () => {
  let component: PlanOfActionPageComponent;
  let fixture: ComponentFixture<PlanOfActionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanOfActionPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanOfActionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
