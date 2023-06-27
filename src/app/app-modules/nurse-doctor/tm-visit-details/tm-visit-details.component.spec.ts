import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmVisitDetailsComponent } from './tm-visit-details.component';

describe('TmVisitDetailsComponent', () => {
  let component: TmVisitDetailsComponent;
  let fixture: ComponentFixture<TmVisitDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmVisitDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmVisitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
