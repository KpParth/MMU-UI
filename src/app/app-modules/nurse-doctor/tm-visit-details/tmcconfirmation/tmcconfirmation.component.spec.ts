import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TmcconfirmationComponent } from './tmcconfirmation.component';

describe('TmcconfirmationComponent', () => {
  let component: TmcconfirmationComponent;
  let fixture: ComponentFixture<TmcconfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TmcconfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TmcconfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
