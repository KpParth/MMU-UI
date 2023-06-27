import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelHistoryComponent } from './travel-history.component';

describe('TravelHistoryComponent', () => {
  let component: TravelHistoryComponent;
  let fixture: ComponentFixture<TravelHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
