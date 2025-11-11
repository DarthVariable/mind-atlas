import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureThoughtsPageComponent } from './capture-thoughts-page.component';

describe('CaptureThoughtsPageComponent', () => {
  let component: CaptureThoughtsPageComponent;
  let fixture: ComponentFixture<CaptureThoughtsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptureThoughtsPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureThoughtsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
