import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JourneyDetailPage } from './journey-detail.page';

describe('JourneyDetailPage', () => {
  let component: JourneyDetailPage;
  let fixture: ComponentFixture<JourneyDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
