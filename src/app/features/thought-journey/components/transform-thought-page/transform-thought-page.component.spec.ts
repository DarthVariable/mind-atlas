import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformThoughtPageComponent } from './transform-thought-page.component';

describe('TransformThoughtPageComponent', () => {
  let component: TransformThoughtPageComponent;
  let fixture: ComponentFixture<TransformThoughtPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransformThoughtPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransformThoughtPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
