import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhosThoughtPageComponent } from './whos-thought-page.component';

describe('WhosThoughtPageComponent', () => {
  let component: WhosThoughtPageComponent;
  let fixture: ComponentFixture<WhosThoughtPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhosThoughtPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WhosThoughtPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
